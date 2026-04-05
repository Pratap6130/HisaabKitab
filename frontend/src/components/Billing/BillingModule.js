import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/index.css';

const BillingModule = () => {
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [createdInvoice, setCreatedInvoice] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [customersRes, itemsRes] = await Promise.all([
                api.getActiveCustomers(),
                api.getActiveItems()
            ]);

            if (customersRes.data.success) setCustomers(customersRes.data.data);
            if (itemsRes.data.success) setItems(itemsRes.data.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error loading data' });
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSelect = (customerId) => {
        const customer = customers.find(c => c.id === parseInt(customerId));
        setSelectedCustomer(customer);
        setSelectedItems([]);
        setCreatedInvoice(null);
    };

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { item_id: '', quantity: 1 }]);
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...selectedItems];
        updated[index] = { ...updated[index], [field]: field === 'quantity' ? parseInt(value) : parseInt(value) };
        setSelectedItems(updated);
    };

    const handleRemoveItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        let subtotal = 0;
        selectedItems.forEach(item => {
            const itemData = items.find(i => i.id === item.item_id);
            if (itemData) {
                subtotal += itemData.customer_selling_price * item.quantity;
            }
        });

        const gstPercentage = selectedCustomer?.is_gst_registered ? 0 : 18;
        const gstAmount = gstPercentage > 0 ? Math.round((subtotal * gstPercentage) / 100 * 100) / 100 : 0;
        const total = subtotal + gstAmount;

        return { subtotal, gstAmount, gstPercentage, total };
    };

    const handleCreateInvoice = async () => {
        if (!selectedCustomer) {
            setMessage({ type: 'error', text: 'Please select a customer' });
            return;
        }

        if (selectedItems.length === 0 || selectedItems.some(i => !i.item_id || i.quantity === 0)) {
            setMessage({ type: 'error', text: 'Please add at least one item with quantity' });
            return;
        }

        try {
            setLoading(true);
            const response = await api.createInvoice({
                customer_id: selectedCustomer.id,
                items: selectedItems
            });

            if (response.data.success) {
                setCreatedInvoice(response.data.data);
                setMessage({ type: 'success', text: 'Invoice created successfully!' });
                setSelectedItems([]);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error creating invoice' });
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();

    return (
        <div className="card">
            <h2>Create Invoice</h2>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
            )}

            {!createdInvoice && (
                <>
                    <div className="form-group">
                        <label>Select Customer *</label>
                        <select value={selectedCustomer?.id || ''} onChange={(e) => handleCustomerSelect(e.target.value)}>
                            <option value="">Choose a customer...</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.customer_name} {customer.is_gst_registered ? '(GST Reg)' : '(Non-GST)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCustomer && (
                        <div className="card" style={{ backgroundColor: '#f9f9f9', marginTop: '20px' }}>
                            <h3>Selected Customer Details</h3>
                            <p><strong>Name:</strong> {selectedCustomer.customer_name}</p>
                            <p><strong>Address:</strong> {selectedCustomer.customer_address}</p>
                            <p><strong>GST Status:</strong> {selectedCustomer.is_gst_registered ? 'Registered (0% GST)' : 'Not Registered (18% GST)'}</p>

                            <h3 style={{ marginTop: '20px' }}>Add Items</h3>
                            <div style={{ marginTop: '15px' }}>
                                {selectedItems.map((selectedItem, index) => (
                                    <div key={index} className="form-row" style={{ marginBottom: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '5px', border: '1px solid #ddd' }}>
                                        <div className="form-group">
                                            <label>Item</label>
                                            <select value={selectedItem.item_id} onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}>
                                                <option value="">Choose item...</option>
                                                {items.map(item => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.item_name} (₹{parseFloat(item.customer_selling_price).toFixed(2)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Quantity</label>
                                            <input type="number" min="1" value={selectedItem.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="button" className="btn btn-danger" onClick={() => handleRemoveItem(index)}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="btn btn-secondary" onClick={handleAddItem}>+ Add Another Item</button>

                            {selectedItems.length > 0 && (
                                <div className="card" style={{ marginTop: '20px', backgroundColor: '#f0f0f0' }}>
                                    <h3>Bill Summary</h3>
                                    <table style={{ width: '100%', marginTop: '10px' }}>
                                        <tbody>
                                            <tr>
                                                <td><strong>Subtotal:</strong></td>
                                                <td style={{ textAlign: 'right' }}>₹{totals.subtotal.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>GST ({totals.gstPercentage}%):</strong></td>
                                                <td style={{ textAlign: 'right' }}>₹{totals.gstAmount.toFixed(2)}</td>
                                            </tr>
                                            <tr style={{ borderTop: '2px solid #2c3e50' }}>
                                                <td><strong style={{ fontSize: '16px' }}>Total Amount:</strong></td>
                                                <td style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>₹{totals.total.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <button type="button" className="btn btn-success" onClick={handleCreateInvoice} disabled={loading} style={{ marginTop: '15px', width: '100%' }}>
                                        {loading ? 'Creating Invoice...' : 'Generate Invoice'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {createdInvoice && (
                <div className="card" style={{ backgroundColor: '#d4edda', borderLeft: '4px solid #27ae60', marginTop: '20px' }}>
                    <h3 style={{ color: '#155724' }}>✓ Invoice Created Successfully</h3>
                    <p><strong>Invoice ID:</strong> {createdInvoice.invoice_id}</p>
                    <p><strong>Customer:</strong> {createdInvoice.customer_name}</p>
                    <p><strong>Subtotal:</strong> ₹{parseFloat(createdInvoice.subtotal).toFixed(2)}</p>
                    <p><strong>GST ({createdInvoice.gst_percentage}%):</strong> ₹{parseFloat(createdInvoice.gst_amount).toFixed(2)}</p>
                    <h3 style={{ color: '#155724', marginTop: '10px' }}>Total: ₹{parseFloat(createdInvoice.total_amount).toFixed(2)}</h3>

                    <div className="btn-group" style={{ marginTop: '15px' }}>
                        <button type="button" className="btn btn-success" onClick={() => window.print()}>Print Invoice</button>
                        <button type="button" className="btn btn-secondary" onClick={() => { setCreatedInvoice(null); setSelectedCustomer(null); setSelectedItems([]); setMessage({ type: '', text: '' }); }}>Create New Invoice</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingModule;
