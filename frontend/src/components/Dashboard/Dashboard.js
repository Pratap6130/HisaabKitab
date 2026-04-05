import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/index.css';

const Dashboard = () => {
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [customerInvoices, setCustomerInvoices] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');


    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [recentRes, customersRes] = await Promise.all([
                api.getRecentInvoices(10),
                api.getActiveCustomers()
            ]);

            if (recentRes.data.success) setRecentInvoices(recentRes.data.data);
            if (customersRes.data.success) setCustomers(customersRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchInvoice = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const response = await api.searchInvoices(searchQuery);
            if (response.data.success) {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error('Error searching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSelect = async (customerId) => {
        setSelectedCustomerId(customerId);
        if (!customerId) {
            setCustomerInvoices([]);
            return;
        }

        try {
            setLoading(true);
            const response = await api.getInvoicesByCustomer(customerId);
            if (response.data.success) {
                setCustomerInvoices(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching customer invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async (invoiceId) => {
        try {
            setLoading(true);
            const response = await api.getInvoiceDetails(invoiceId);
            if (response.data.success) {
                setSelectedInvoice(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching invoice details:', error);
        } finally {
            setLoading(false);
        }
    };

    const closeInvoiceView = () => {
        setSelectedInvoice(null);
    };

    const getInvoicesToDisplay = () => {
        if (activeTab === 'recent') return recentInvoices;
        if (activeTab === 'customer') return customerInvoices;
        if (activeTab === 'search') return searchResults;
        return [];
    };

    const invoices = getInvoicesToDisplay();

    return (
        <div className="card">
            <h1 style={{ marginBottom: '30px' }}>Dashboard</h1>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
                <button
                    className={`btn ${activeTab === 'recent' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('recent'); setSelectedInvoice(null); }}
                    style={{ borderBottom: activeTab === 'recent' ? '3px solid #3498db' : 'none', borderRadius: '0' }}
                >
                    Recent Invoices
                </button>
                <button
                    className={`btn ${activeTab === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('customer'); setSelectedInvoice(null); }}
                    style={{ borderBottom: activeTab === 'customer' ? '3px solid #3498db' : 'none', borderRadius: '0' }}
                >
                    Customer Invoices
                </button>
                <button
                    className={`btn ${activeTab === 'search' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('search'); setSelectedInvoice(null); }}
                    style={{ borderBottom: activeTab === 'search' ? '3px solid #3498db' : 'none', borderRadius: '0' }}
                >
                    Search Invoice
                </button>
            </div>

            {/* Recent Invoices Tab */}
            {activeTab === 'recent' && (
                <div>
                    <h2>Recently Generated Invoices</h2>
                    <p style={{ color: '#7f8c8d', marginBottom: '15px' }}>Showing latest 10 invoices</p>
                    <InvoiceTable invoices={recentInvoices} loading={loading} onViewInvoice={handleViewInvoice} />
                </div>
            )}

            {/* Customer Invoices Tab */}
            {activeTab === 'customer' && (
                <div>
                    <h2>Customer Invoices</h2>
                    <div className="form-group" style={{ marginBottom: '20px', maxWidth: '500px' }}>
                        <label>Select Customer</label>
                        <select value={selectedCustomerId} onChange={(e) => handleCustomerSelect(e.target.value)}>
                            <option value="">Choose a customer...</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.customer_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCustomerId && (
                        <InvoiceTable invoices={customerInvoices} loading={loading} onViewInvoice={handleViewInvoice} />
                    )}

                    {!selectedCustomerId && (
                        <p style={{ color: '#7f8c8d', textAlign: 'center', marginTop: '30px' }}>Select a customer to view their invoices</p>
                    )}
                </div>
            )}

            {/* Search Invoice Tab */}
            {activeTab === 'search' && (
                <div>
                    <h2>Search Invoice</h2>
                    <div className="form-group" style={{ marginBottom: '20px', maxWidth: '500px' }}>
                        <label>Invoice ID</label>
                        <input
                            type="text"
                            placeholder="Enter invoice ID (e.g., INVC224830)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchInvoice()}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleSearchInvoice} disabled={loading || !searchQuery.trim()}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>

                    {searchResults.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <InvoiceTable invoices={searchResults} loading={loading} onViewInvoice={handleViewInvoice} />
                        </div>
                    )}

                    {searchQuery && searchResults.length === 0 && !loading && (
                        <p style={{ color: '#7f8c8d', textAlign: 'center', marginTop: '30px' }}>No invoices found</p>
                    )}
                </div>
            )}

            {/* Invoice Details Modal */}
            {selectedInvoice && (
                <div className="modal show" onClick={closeInvoiceView}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeInvoiceView} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>×</button>
                        <h2>Invoice Details</h2>

                        <div style={{ marginTop: '20px' }}>
                            <h3>{selectedInvoice.invoice.invoice_id}</h3>
                            <p><strong>Customer:</strong> {selectedInvoice.invoice.customer_name}</p>
                            <p><strong>Address:</strong> {selectedInvoice.invoice.customer_address}</p>
                            <p><strong>Date:</strong> {new Date(selectedInvoice.invoice.invoice_date).toLocaleDateString()}</p>

                            <h4 style={{ marginTop: '20px' }}>Items</h4>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.item_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                                            <td>₹{parseFloat(item.line_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                                <p><strong>Subtotal:</strong> ₹{parseFloat(selectedInvoice.invoice.subtotal).toFixed(2)}</p>
                                <p><strong>GST ({selectedInvoice.invoice.gst_percentage}%):</strong> ₹{parseFloat(selectedInvoice.invoice.gst_amount).toFixed(2)}</p>
                                <h3 style={{ marginTop: '10px', color: '#2c3e50' }}>Total: ₹{parseFloat(selectedInvoice.invoice.total_amount).toFixed(2)}</h3>
                            </div>

                            <div className="btn-group" style={{ marginTop: '15px' }}>
                                <button className="btn btn-success" onClick={() => window.print()}>Print</button>
                                <button className="btn btn-secondary" onClick={closeInvoiceView}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InvoiceTable = ({ invoices, loading, onViewInvoice }) => {
    if (loading) {
        return <div className="loading">Loading invoices</div>;
    }

    if (invoices.length === 0) {
        return <p style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>No invoices found</p>;
    }

    return (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Invoice ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Subtotal</th>
                        <th>GST</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
                        <tr key={invoice.id}>
                            <td><strong>{invoice.invoice_id}</strong></td>
                            <td>{invoice.customer_name}</td>
                            <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                            <td>₹{parseFloat(invoice.subtotal).toFixed(2)}</td>
                            <td>₹{parseFloat(invoice.gst_amount).toFixed(2)}</td>
                            <td><strong>₹{parseFloat(invoice.total_amount).toFixed(2)}</strong></td>
                            <td><span className={`badge badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                            <td>
                                <button className="btn btn-primary" onClick={() => onViewInvoice(invoice.invoice_id)}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;




