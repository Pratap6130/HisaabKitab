import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/index.css';

const ItemMaster = () => {
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        item_name: '',
        customer_selling_price: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.getAllItems();
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fetching items' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'customer_selling_price' ? parseFloat(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (editingId) {
                await api.updateItem(editingId, formData);
                setMessage({ type: 'success', text: 'Item updated successfully' });
            } else {
                await api.createItem(formData);
                setMessage({ type: 'success', text: 'Item created successfully' });
            }

            setFormData({ item_name: '', customer_selling_price: '', status: 'Active' });
            setEditingId(null);
            setShowForm(false);
            fetchItems();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving item' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                setLoading(true);
                await api.deleteItem(id);
                setMessage({ type: 'success', text: 'Item deleted successfully' });
                fetchItems();
            } catch (error) {
                setMessage({ type: 'error', text: 'Error deleting item' });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ item_name: '', customer_selling_price: '', status: 'Active' });
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Item Master</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Item'}
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="card" style={{ marginTop: '20px', backgroundColor: '#f9f9f9' }}>
                    <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Item Name *</label>
                            <input type="text" name="item_name" value={formData.item_name} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Customer Selling Price *</label>
                            <input type="number" step="0.01" name="customer_selling_price" value={formData.customer_selling_price} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange}>
                            <option value="Active">Active</option>
                            <option value="In-Active">In-Active</option>
                        </select>
                    </div>
                    <div className="btn-group">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            )}

            {loading && !showForm && <div className="loading">Loading items</div>}

            {!loading && items.length > 0 && (
                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Selling Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.item_name}</td>
                                    <td>₹{parseFloat(item.customer_selling_price).toFixed(2)}</td>
                                    <td><span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span></td>
                                    <td>
                                        <button className="btn btn-primary" onClick={() => handleEdit(item)} style={{ marginRight: '5px' }}>Edit</button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && items.length === 0 && (
                <p style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>No items found</p>
            )}
        </div>
    );
};

export default ItemMaster;
