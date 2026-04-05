import pool from '../config/database.js';

// Helper function to generate unique invoice ID
const generateInvoiceId = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let invoiceId;
    let exists = true;

    while (exists) {
        let randomPart = '';
        for (let i = 0; i < 6; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        invoiceId = 'INVC' + randomPart;

        const result = await pool.query('SELECT id FROM invoices WHERE invoice_id = $1', [invoiceId]);
        exists = result.rows.length > 0;
    }

    return invoiceId;
};

// Create new invoice
export const createInvoice = async (req, res) => {
    const client = await pool.connect();
    try {
        const { customer_id, items } = req.body;

        // Validation
        if (!customer_id || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing customer_id or items' });
        }

        await client.query('BEGIN');

        // Fetch customer details
        const customerResult = await client.query('SELECT * FROM customers WHERE id = $1', [customer_id]);
        if (customerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const customer = customerResult.rows[0];
        let subtotal = 0;

        // Calculate subtotal
        for (const item of items) {
            const itemResult = await client.query('SELECT customer_selling_price FROM items WHERE id = $1', [item.item_id]);
            if (itemResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: `Item ${item.item_id} not found` });
            }
            const price = itemResult.rows[0].customer_selling_price;
            subtotal += price * item.quantity;
        }

        // Calculate GST
        const gstPercentage = customer.is_gst_registered ? 0 : 18;
        const gstAmount = gstPercentage > 0 ? Math.round((subtotal * gstPercentage) / 100 * 100) / 100 : 0;
        const totalAmount = subtotal + gstAmount;

        // Generate unique invoice ID
        const invoiceId = await generateInvoiceId();

        // Create invoice
        const invoiceResult = await client.query(
            `INSERT INTO invoices (invoice_id, customer_id, subtotal, gst_amount, gst_percentage, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [invoiceId, customer_id, subtotal, gstAmount, gstPercentage, totalAmount, 'Generated']
        );

        const invoice = invoiceResult.rows[0];

        // Create invoice items
        for (const item of items) {
            const itemResult = await client.query('SELECT customer_selling_price FROM items WHERE id = $1', [item.item_id]);
            const price = itemResult.rows[0].customer_selling_price;
            const lineTotal = price * item.quantity;

            await client.query(
                `INSERT INTO invoice_items (invoice_id, item_id, quantity, unit_price, line_total)
                 VALUES ($1, $2, $3, $4, $5)`,
                [invoice.id, item.item_id, item.quantity, price, lineTotal]
            );
        }

        await client.query('COMMIT');

        // Fetch complete invoice with items
        const completeInvoice = await pool.query(
            `SELECT i.*, c.customer_name, c.is_gst_registered
             FROM invoices i
             JOIN customers c ON i.customer_id = c.id
             WHERE i.id = $1`,
            [invoice.id]
        );

        const invoiceItems = await pool.query(
            `SELECT ii.*, it.item_name
             FROM invoice_items ii
             JOIN items it ON ii.item_id = it.id
             WHERE ii.invoice_id = $1`,
            [invoice.id]
        );

        res.status(201).json({
            success: true,
            data: {
                ...completeInvoice.rows[0],
                items: invoiceItems.rows
            },
            message: 'Invoice created successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating invoice' });
    } finally {
        client.release();
    }
};

// Fetch all invoices
export const getAllInvoices = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*, c.customer_name, c.is_gst_registered
             FROM invoices i
             JOIN customers c ON i.customer_id = c.id
             ORDER BY i.created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching invoices' });
    }
};

// Fetch invoices by customer ID
export const getInvoicesByCustomer = async (req, res) => {
    const { customerId } = req.params;
    try {
        const result = await pool.query(
            `SELECT i.*, c.customer_name, c.is_gst_registered
             FROM invoices i
             JOIN customers c ON i.customer_id = c.id
             WHERE i.customer_id = $1
             ORDER BY i.created_at DESC`,
            [customerId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching customer invoices' });
    }
};

// Fetch single invoice by ID
export const getInvoiceById = async (req, res) => {
    const { invoiceId } = req.params;
    try {
        const invoiceResult = await pool.query(
            `SELECT i.*, c.customer_name, c.is_gst_registered, c.customer_address
             FROM invoices i
             JOIN customers c ON i.customer_id = c.id
             WHERE i.invoice_id = $1 OR i.id = $2`,
            [invoiceId, invoiceId]
        );

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        const itemsResult = await pool.query(
            `SELECT ii.*, it.item_name
             FROM invoice_items ii
             JOIN items it ON ii.item_id = it.id
             WHERE ii.invoice_id = $1`,
            [invoice.id]
        );

        res.json({
            success: true,
            data: {
                ...invoice,
                items: itemsResult.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching invoice' });
    }
};

// Search invoices by invoice ID
export const searchInvoiceById = async (req, res) => {
    const { query } = req.query;
    try {
        const result = await pool.query(
            `SELECT i.*, c.customer_name
             FROM invoices i
             JOIN customers c ON i.customer_id = c.id
             WHERE i.invoice_id ILIKE $1
             ORDER BY i.created_at DESC`,
            [`%${query}%`]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error searching invoices' });
    }
};

// Get recent invoices (for dashboard)
export const getRecentInvoices = async (req, res) => {
    const limit = req.query.limit || 10;
    try {
        const result = await pool.query(
            `SELECT i.*, c.customer_name
             FROM invoices i
             JOIN customers c ON i.customer_id = c.id
             ORDER BY i.created_at DESC
             LIMIT $1`,
            [limit]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching recent invoices' });
    }
};

// Get invoice details with items
export const getInvoiceDetails = async (req, res) => {
    const { invoiceId } = req.params;
    try {
        const invoiceResult = await pool.query(
            `SELECT i.*, c.customer_name, c.customer_address, c.customer_gst_number, c.is_gst_registered
             FROM invoices i
             JOIN customers c ON i.customer_id = c.id
             WHERE i.invoice_id = $1`,
            [invoiceId]
        );

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        const itemsResult = await pool.query(
            `SELECT ii.*, it.item_name
             FROM invoice_items ii
             JOIN items it ON ii.item_id = it.id
             WHERE ii.invoice_id = $1`,
            [invoice.id]
        );

        res.json({
            success: true,
            data: {
                invoice,
                items: itemsResult.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching invoice details' });
    }
};
