import pool from '../config/database.js';

// Fetch all customers (active)
export const getAllCustomers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM customers WHERE status = $1 ORDER BY customer_name ASC',
            ['Active']
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching customers' });
    }
};

// Fetch all customers (including inactive)
export const getAllCustomersWithInactive = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM customers ORDER BY customer_name ASC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching customers' });
    }
};

// Fetch single customer by ID
export const getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching customer' });
    }
};

// Create new customer
export const createCustomer = async (req, res) => {
    const { customer_name, customer_address, customer_pan_card, customer_gst_number, is_gst_registered, status } = req.body;
    
    // Validation
    if (!customer_name || !customer_address || !customer_pan_card) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO customers (customer_name, customer_address, customer_pan_card, customer_gst_number, is_gst_registered, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [customer_name, customer_address, customer_pan_card, customer_gst_number || null, is_gst_registered || false, status || 'Active']
        );
        res.status(201).json({ success: true, data: result.rows[0], message: 'Customer created successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ success: false, message: 'PAN Card or GST Number already exists' });
        }
        res.status(500).json({ success: false, message: 'Error creating customer' });
    }
};

// Update customer
export const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { customer_name, customer_address, customer_pan_card, customer_gst_number, is_gst_registered, status } = req.body;

    try {
        const result = await pool.query(
            `UPDATE customers 
             SET customer_name = $1, customer_address = $2, customer_pan_card = $3, 
                 customer_gst_number = $4, is_gst_registered = $5, status = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
            [customer_name, customer_address, customer_pan_card, customer_gst_number || null, is_gst_registered || false, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: result.rows[0], message: 'Customer updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating customer' });
    }
};

// Delete customer (soft delete - update status)
export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE customers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            ['In-Active', id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: result.rows[0], message: 'Customer deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting customer' });
    }
};
