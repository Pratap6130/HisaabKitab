import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SectionHeader from '../common/SectionHeader';
import EntityCard from '../common/EntityCard';
import StatusPill from '../common/StatusPill';
import '../../styles/index.css';

const CustomerMaster = () => {
    const [customers, setCustomers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_address: '',
        customer_pan_card: '',
        customer_gst_number: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllCustomers();
            if (response.data.success) {
                setCustomers(response.data.data);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fetching customers' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                ...formData,
                customer_gst_number: formData.customer_gst_number || null,
                is_gst_registered: Boolean(formData.customer_gst_number?.trim())
            };

            await api.createCustomer(payload);
            setMessage({ type: 'success', text: 'Customer created successfully' });

            setFormData({
                customer_name: '',
                customer_address: '',
                customer_pan_card: '',
                customer_gst_number: '',
                status: 'Active'
            });
            setShowForm(false);
            fetchCustomers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving customer' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({
            customer_name: '',
            customer_address: '',
            customer_pan_card: '',
            customer_gst_number: '',
            status: 'Active'
        });
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm('Delete this customer?')) {
            return;
        }

        try {
            setLoading(true);
            await api.deleteCustomer(id);
            setMessage({ type: 'success', text: 'Customer deleted successfully' });
            fetchCustomers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error deleting customer' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="hk-page-shell">
            {!showForm && (
                <>
                    <SectionHeader title="Customers" onAdd={() => setShowForm(true)} />

                    {loading && <div className="loading">Loading customers</div>}

                    {!loading && (
                        <div className="hk-entity-grid">
                            {customers.map((customer) => (
                                <EntityCard
                                    key={customer.id}
                                    title={customer.customer_name}
                                    status={customer.status}
                                >
                                    <div className="hk-card-actions">
                                        <StatusPill status={customer.status} />
                                        <button
                                            type="button"
                                            className="hk-delete-btn"
                                            onClick={() => handleDeleteCustomer(customer.id)}
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
                    <h2 className="hk-form-title">Add New Customer</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="hk-form-grid">
                            <div className="hk-input-group">
                                <label>Customer Name</label>
                                <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} required />
                            </div>
                            <div className="hk-input-group">
                                <label>Customer Address</label>
                                <input type="text" name="customer_address" value={formData.customer_address} onChange={handleInputChange} required />
                            </div>
                            <div className="hk-input-group">
                                <label>Customer Pan Card Number</label>
                                <input type="text" name="customer_pan_card" value={formData.customer_pan_card} onChange={handleInputChange} required />
                            </div>
                            <div className="hk-input-group">
                                <label>Customer GST Number</label>
                                <input type="text" name="customer_gst_number" value={formData.customer_gst_number} onChange={handleInputChange} />
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

export default CustomerMaster;
