import pool from '../config/database.js';

// PAN format: ABCDE1234F where 4th char indicates holder type.
const PAN_REGEX = /^[A-Z]{3}[PCHFATG][A-Z]\d{4}[A-Z]$/;
// GST format: 15 chars (e.g. 27ABCDE1234F1Z5)
const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

const normalizePan = (pan) => (pan || '').trim().toUpperCase();
const normalizeGst = (gst) => (gst || '').trim().toUpperCase();

const isValidPan = (pan) => PAN_REGEX.test(normalizePan(pan));
const isValidGst = (gst) => GST_REGEX.test(normalizeGst(gst));

const validateTaxInputs = ({ customer_pan_card, customer_gst_number, is_gst_registered }) => {
    if (!isValidPan(customer_pan_card)) {
        return 'Please enter correct GST or PAN number.';
    }

    const hasGstNumber = Boolean((customer_gst_number || '').trim());
    if (hasGstNumber && !isValidGst(customer_gst_number)) {
        return 'Please enter correct GST or PAN number.';
    }

    if (is_gst_registered && !hasGstNumber) {
        return 'Please enter correct GST or PAN number.';
    }

    return null;
};

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

    const taxError = validateTaxInputs({ customer_pan_card, customer_gst_number, is_gst_registered });
    if (taxError) {
        return res.status(400).json({ success: false, message: taxError });
    }

    const normalizedPan = normalizePan(customer_pan_card);
    const normalizedGst = normalizeGst(customer_gst_number) || null;
    const normalizedGstRegistered = normalizedGst ? true : Boolean(is_gst_registered);

    try {
        const result = await pool.query(
            `INSERT INTO customers (customer_name, customer_address, customer_pan_card, customer_gst_number, is_gst_registered, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [customer_name, customer_address, normalizedPan, normalizedGst, normalizedGstRegistered, status || 'Active']
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

    const taxError = validateTaxInputs({ customer_pan_card, customer_gst_number, is_gst_registered });
    if (taxError) {
        return res.status(400).json({ success: false, message: taxError });
    }

    const normalizedPan = normalizePan(customer_pan_card);
    const normalizedGst = normalizeGst(customer_gst_number) || null;
    const normalizedGstRegistered = normalizedGst ? true : Boolean(is_gst_registered);

    try {
        const result = await pool.query(
            `UPDATE customers 
             SET customer_name = $1, customer_address = $2, customer_pan_card = $3, 
                 customer_gst_number = $4, is_gst_registered = $5, status = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
            [customer_name, customer_address, normalizedPan, normalizedGst, normalizedGstRegistered, status, id]
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
            'DELETE FROM customers WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: result.rows[0], message: 'Customer deleted permanently' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting customer' });
    }
};
