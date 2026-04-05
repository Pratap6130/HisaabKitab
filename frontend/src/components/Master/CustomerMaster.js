import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/index.css';

const CustomerMaster = () => {
    const [customers, setCustomers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_address: '',
        customer_pan_card: '',
        customer_gst_number: '',
        is_gst_registered: false,
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
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (editingId) {
                await api.updateCustomer(editingId, formData);
                setMessage({ type: 'success', text: 'Customer updated successfully' });
            } else {
                await api.createCustomer(formData);
                setMessage({ type: 'success', text: 'Customer created successfully' });
            }

            setFormData({
                customer_name: '',
                customer_address: '',
                customer_pan_card: '',
                customer_gst_number: '',
                is_gst_registered: false,
                status: 'Active'
            });
            setEditingId(null);
            setShowForm(false);
            fetchCustomers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving customer' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customer) => {
        setFormData(customer);
        setEditingId(customer.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                setLoading(true);
                await api.deleteCustomer(id);
                setMessage({ type: 'success', text: 'Customer deleted successfully' });
                fetchCustomers();
            } catch (error) {
                setMessage({ type: 'error', text: 'Error deleting customer' });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            customer_name: '',
            customer_address: '',
            customer_pan_card: '',
            customer_gst_number: '',
            is_gst_registered: false,
            status: 'Active'
        });
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Customer Master</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Customer'}
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
                    <h3>{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Customer Name *</label>
                            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>PAN Card *</label>
                            <input type="text" name="customer_pan_card" value={formData.customer_pan_card} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Customer Address *</label>
                        <textarea name="customer_address" value={formData.customer_address} onChange={handleInputChange} required rows="3"></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>GST Number</label>
                            <input type="text" name="customer_gst_number" value={formData.customer_gst_number} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>
                                <input type="checkbox" name="is_gst_registered" checked={formData.is_gst_registered} onChange={handleInputChange} />
                                {' '}GST Registered
                            </label>
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

            {loading && !showForm && <div className="loading">Loading customers</div>}

            {!loading && customers.length > 0 && (
                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Address</th>
                                <th>PAN Card</th>
                                <th>GST Number</th>
                                <th>GST Registered</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.customer_name}</td>
                                    <td>{customer.customer_address}</td>
                                    <td>{customer.customer_pan_card}</td>
                                    <td>{customer.customer_gst_number || '-'}</td>
                                    <td>{customer.is_gst_registered ? 'Yes' : 'No'}</td>
                                    <td><span className={`badge badge-${customer.status.toLowerCase()}`}>{customer.status}</span></td>
                                    <td>
                                        <button className="btn btn-primary" onClick={() => handleEdit(customer)} style={{ marginRight: '5px' }}>Edit</button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(customer.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && customers.length === 0 && (
                <p style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>No customers found</p>
            )}
        </div>
    );
};

export default CustomerMaster;
