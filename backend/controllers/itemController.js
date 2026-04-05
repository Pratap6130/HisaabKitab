import pool from '../config/database.js';

// Fetch all items (active)
export const getAllItems = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM items WHERE status = $1 ORDER BY item_name ASC',
            ['Active']
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching items' });
    }
};

// Fetch all items (including inactive)
export const getAllItemsWithInactive = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM items ORDER BY item_name ASC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching items' });
    }
};

// Fetch single item by ID
export const getItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching item' });
    }
};

// Create new item
export const createItem = async (req, res) => {
    const { item_name, customer_selling_price, status } = req.body;

    // Validation
    if (!item_name || !customer_selling_price) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO items (item_name, customer_selling_price, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [item_name, customer_selling_price, status || 'Active']
        );
        res.status(201).json({ success: true, data: result.rows[0], message: 'Item created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating item' });
    }
};

// Update item
export const updateItem = async (req, res) => {
    const { id } = req.params;
    const { item_name, customer_selling_price, status } = req.body;

    try {
        const result = await pool.query(
            `UPDATE items 
             SET item_name = $1, customer_selling_price = $2, status = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [item_name, customer_selling_price, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: result.rows[0], message: 'Item updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating item' });
    }
};

// Delete item (soft delete - update status)
export const deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            ['In-Active', id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: result.rows[0], message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting item' });
    }
};
