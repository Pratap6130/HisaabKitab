import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SectionHeader from '../common/SectionHeader';
import EntityCard from '../common/EntityCard';
import StatusPill from '../common/StatusPill';
import '../../styles/index.css';

const ItemMaster = () => {
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
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
            const response = await api.getActiveItems();
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

            await api.createItem(formData);
            setMessage({ type: 'success', text: 'Item created successfully' });

            setFormData({ item_name: '', customer_selling_price: '', status: 'Active' });
            setShowForm(false);
            fetchItems();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving item' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ item_name: '', customer_selling_price: '', status: 'Active' });
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Delete this item?')) {
            return;
        }

        try {
            setLoading(true);
            await api.deleteItem(id);
            setMessage({ type: 'success', text: 'Item deleted successfully' });
            fetchItems();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error deleting item' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="hk-page-shell">
            {!showForm && (
                <>
                    <SectionHeader title="Items" onAdd={() => setShowForm(true)} />

                    {loading && <div className="loading">Loading items</div>}

                    {!loading && (
                        <div className="hk-entity-grid">
                            {items.map((item) => (
                                <EntityCard
                                    key={item.id}
                                    title={item.item_name}
                                    status={item.status}
                                >
                                    <div className="hk-card-actions">
                                        <StatusPill status={item.status} />
                                        <button
                                            type="button"
                                            className="hk-delete-btn"
                                            onClick={() => handleDeleteItem(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </EntityCard>
                            ))}
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <div className="hk-form-shell">
                    <h2 className="hk-form-title">Add New Item</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="hk-form-grid hk-form-grid-item">
                            <div className="hk-input-group">
                                <label>Item Name</label>
                                <input type="text" name="item_name" value={formData.item_name} onChange={handleInputChange} required />
                            </div>
                            <div className="hk-input-group">
                                <label>Customer Selling Price</label>
                                <input type="number" step="0.01" min="0" name="customer_selling_price" value={formData.customer_selling_price} onChange={handleInputChange} required />
                            </div>
                            <div className="hk-input-group">
                                <label>Customer Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="In-Active">In-Active</option>
                                </select>
                            </div>
                        </div>

                        <div className="hk-form-actions">
                            <button type="button" className="hk-btn-cancel" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="hk-btn-create" disabled={loading}>
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ marginTop: '16px' }}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>x</button>
                </div>
            )}
        </section>
    );
};

export default ItemMaster;
