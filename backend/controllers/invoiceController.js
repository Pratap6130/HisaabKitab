import pool from '../config/database.js';
import {
    validateInvoicePayload,
    generateInvoiceId,
    calculateInvoiceTotals,
    buildInvoiceItemRows
} from '../services/invoiceService.js';

// Create new invoice
export const createInvoice = async (req, res) => {
    const client = await pool.connect();
    try {
        const { customer_id, items } = req.body;
        validateInvoicePayload(customer_id, items);

        await client.query('BEGIN');

        // Fetch customer details
        const customerResult = await client.query('SELECT * FROM customers WHERE id = $1', [customer_id]);
        if (customerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const customer = customerResult.rows[0];
        const totals = await calculateInvoiceTotals(client, customer, items);

        // Generate unique invoice ID
        const invoiceId = await generateInvoiceId(client);

        // Create invoice
        const invoiceResult = await client.query(
            `INSERT INTO invoices (invoice_id, customer_id, subtotal, gst_amount, gst_percentage, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                invoiceId,
                customer_id,
                totals.subtotal,
                totals.gstAmount,
                totals.gstPercentage,
                totals.totalAmount,
                'Generated'
            ]
        );

        const invoice = invoiceResult.rows[0];

        // Create invoice items
        const invoiceItemRows = buildInvoiceItemRows(invoice.id, items, totals.priceByItemId);
        for (const row of invoiceItemRows) {

            await client.query(
                `INSERT INTO invoice_items (invoice_id, item_id, quantity, unit_price, line_total)
                 VALUES ($1, $2, $3, $4, $5)`,
                [row.invoiceId, row.itemId, row.quantity, row.unitPrice, row.lineTotal]
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
        if (error.status) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
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
