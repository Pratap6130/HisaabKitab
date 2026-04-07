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
        fetchInitialData();  }, []);

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

    const totalRevenue = recentInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    return (
        <div className="hk-dashboard">
            <div className="hk-dashboard-header">
                <h1 className="hk-dashboard-title">Dashboard</h1>
                <p className="hk-dashboard-subtitle">Overview of your business activity</p>
            </div>

            <div className="hk-stat-cards">
                <div className="hk-stat-card">
                    <div className="hk-stat-card-icon blue">📄</div>
                    <h3>{recentInvoices.length}</h3>
                    <p>Recent Invoices</p>
                </div>
                <div className="hk-stat-card">
                    <div className="hk-stat-card-icon green">👥</div>
                    <h3>{customers.length}</h3>
                    <p>Active Customers</p>
                </div>
                <div className="hk-stat-card">
                    <div className="hk-stat-card-icon amber">💰</div>
                    <h3>₹{totalRevenue.toFixed(0)}</h3>
                    <p>Recent Revenue</p>
                </div>
                <div className="hk-stat-card">
                    <div className="hk-stat-card-icon purple">📈</div>
                    <h3>{recentInvoices.length > 0 ? '₹' + (totalRevenue / recentInvoices.length).toFixed(0) : '₹0'}</h3>
                    <p>Avg. Invoice Value</p>
                </div>
            </div>

            <div className="hk-tabs">
                <button
                    className={`hk-tab ${activeTab === 'recent' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('recent'); setSelectedInvoice(null); }}
                >
                    Recent Invoices
                </button>
                <button
                    className={`hk-tab ${activeTab === 'customer' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('customer'); setSelectedInvoice(null); }}
                >
                    Customer Invoices
                </button>
                <button
                    className={`hk-tab ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('search'); setSelectedInvoice(null); }}
                >
                    Search Invoice
                </button>
            </div>

            {activeTab === 'recent' && (
                <div className="hk-tab-panel">
                    <h2 className="hk-section-title">Recently Generated Invoices</h2>
                    <p className="hk-section-subtitle">Showing latest 10 invoices</p>
                    <InvoiceTable invoices={recentInvoices} loading={loading} onViewInvoice={handleViewInvoice} />
                </div>
            )}

            {activeTab === 'customer' && (
                <div className="hk-tab-panel">
                    <h2 className="hk-section-title">Customer Invoices</h2>
                    <div className="hk-search-group">
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
                        <p className="hk-empty">Select a customer to view their invoices</p>
                    )}
                </div>
            )}

            {activeTab === 'search' && (
                <div className="hk-tab-panel">
                    <h2 className="hk-section-title">Search Invoice</h2>
                    <div className="hk-search-group">
                        <label>Invoice ID</label>
                        <input
                            type="text"
                            placeholder="Enter invoice ID (e.g., INVC224830)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchInvoice()}
                        />
                    </div>
                    <button className="hk-btn-search" onClick={handleSearchInvoice} disabled={loading || !searchQuery.trim()}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>

                    {searchResults.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <InvoiceTable invoices={searchResults} loading={loading} onViewInvoice={handleViewInvoice} />
                        </div>
                    )}

                    {searchQuery && searchResults.length === 0 && !loading && (
                        <p className="hk-empty">No invoices found</p>
                    )}
                </div>
            )}

            {selectedInvoice && (
                <div className="hk-invoice-modal-backdrop" onClick={closeInvoiceView}>
                    <div className="hk-invoice-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="hk-invoice-modal-header">
                            <h2>Invoice Details</h2>
                            <button className="hk-close-btn" onClick={closeInvoiceView}>×</button>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#4F46E5', marginBottom: '14px', letterSpacing: '-0.01em', fontFamily: 'Poppins, sans-serif' }}>
                                {selectedInvoice.invoice.invoice_id}
                            </h3>
                            <p className="hk-invoice-detail-row"><strong>Customer</strong> {selectedInvoice.invoice.customer_name}</p>
                            <p className="hk-invoice-detail-row"><strong>Address</strong> {selectedInvoice.invoice.customer_address}</p>
                            <p className="hk-invoice-detail-row"><strong>Date</strong> {new Date(selectedInvoice.invoice.invoice_date).toLocaleDateString()}</p>

                            <div className="hk-table-wrap" style={{ marginTop: '20px' }}>
                                <table className="hk-data-table">
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
                                                <td className="hk-cell-strong">₹{parseFloat(item.line_total).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="hk-invoice-summary-box">
                                <p><strong>Subtotal</strong> ₹{parseFloat(selectedInvoice.invoice.subtotal).toFixed(2)}</p>
                                <p><strong>GST ({selectedInvoice.invoice.gst_percentage}%)</strong> ₹{parseFloat(selectedInvoice.invoice.gst_amount).toFixed(2)}</p>
                                <div className="hk-invoice-grand-total">
                                    Total: ₹{parseFloat(selectedInvoice.invoice.total_amount).toFixed(2)}
                                </div>
                            </div>

                            <div className="hk-btn-row">
                                <button className="hk-btn-print" onClick={() => window.print()}>Print</button>
                                <button className="hk-btn-close" onClick={closeInvoiceView}>Close</button>
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
        return <p className="hk-empty">No invoices found</p>;
    }

    return (
        <div className="hk-table-wrap">
            <table className="hk-data-table">
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
                            <td className="hk-cell-strong">{invoice.invoice_id}</td>
                            <td>{invoice.customer_name}</td>
                            <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                            <td>₹{parseFloat(invoice.subtotal).toFixed(2)}</td>
                            <td>₹{parseFloat(invoice.gst_amount).toFixed(2)}</td>
                            <td className="hk-cell-strong">₹{parseFloat(invoice.total_amount).toFixed(2)}</td>
                            <td><span className={`hk-badge hk-badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                            <td>
                                <button className="hk-btn-view" onClick={() => onViewInvoice(invoice.invoice_id)}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;
