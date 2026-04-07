import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EntityCard from '../common/EntityCard';
import StatusPill from '../common/StatusPill';
import { getSubtotal, getBillingPreview } from '../../utils/billing';
import '../../styles/index.css';

const BillingModule = () => {
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [billItems, setBillItems] = useState([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showItemsModal, setShowItemsModal] = useState(false);
    const [modalQuantities, setModalQuantities] = useState({});
    const [createdInvoice, setCreatedInvoice] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [customersRes, itemsRes] = await Promise.all([
                api.getAllCustomers(),
                api.getAllItems()
            ]);

            if (customersRes.data.success) setCustomers(customersRes.data.data);
            if (itemsRes.data.success) setItems(itemsRes.data.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error loading data' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setShowCustomerModal(false);
        setBillItems([]);
        setModalQuantities({});
        setCreatedInvoice(null);
        setMessage({ type: '', text: '' });
    };

    const incrementQty = (itemId) => {
        setBillItems((prev) =>
            prev.map((row) =>
                row.item_id === itemId
                    ? { ...row, quantity: row.quantity + 1 }
                    : row
            )
        );
    };

    const decrementQty = (itemId) => {
        setBillItems((prev) =>
            prev.map((row) =>
                row.item_id === itemId
                    ? { ...row, quantity: Math.max(1, row.quantity - 1) }
                    : row
            )
        );
    };

    const updateModalQty = (itemId, delta) => {
        setModalQuantities((prev) => {
            const current = prev[itemId] || 0;
            return { ...prev, [itemId]: Math.max(0, current + delta) };
        });
    };

    const openItemsModal = () => {
        if (!selectedCustomer) {
            setShowCustomerModal(true);
            return;
        }
        const seed = {};
        billItems.forEach((row) => {
            seed[row.item_id] = row.quantity;
        });
        setModalQuantities(seed);
        setShowItemsModal(true);
    };

    const applySelectedItems = () => {
        const rows = Object.entries(modalQuantities)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const found = items.find((item) => item.id === Number(id));
                return {
                    item_id: Number(id),
                    item_name: found.item_name,
                    unit_price: Number(found.customer_selling_price),
                    status: found.status,
                    quantity: qty
                };
            });

        setBillItems(rows);
        setShowItemsModal(false);
    };

    const handleCreateInvoice = async () => {
        if (!selectedCustomer) {
            setMessage({ type: 'error', text: 'Please select a customer' });
            return;
        }

        if (billItems.length === 0) {
            setMessage({ type: 'error', text: 'Please add at least one item' });
            return;
        }

        try {
            setLoading(true);
            const response = await api.createInvoice({
                customer_id: selectedCustomer.id,
                items: billItems.map((row) => ({
                    item_id: row.item_id,
                    quantity: row.quantity
                }))
            });

            if (response.data.success) {
                setCreatedInvoice(response.data.data);
                setMessage({ type: '', text: '' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error creating invoice' });
        } finally {
            setLoading(false);
        }
    };

    const clearDraft = () => {
        setSelectedCustomer(null);
        setBillItems([]);
        setShowCustomerModal(false);
        setShowItemsModal(false);
        setModalQuantities({});
        setCreatedInvoice(null);
        setMessage({ type: '', text: '' });
    };

    const total = getSubtotal(billItems);
    const gstPreview = getBillingPreview(billItems, selectedCustomer);

    return (
        <section className="hk-page-shell">
            <h2 className="hk-page-title" style={{ textTransform: 'none' }}>Billing</h2>
            <p className="hk-page-subtitle">Create and manage invoices</p>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                </div>
            )}

            {!createdInvoice && (
                <div className="hk-billing-board">
                    <section className="hk-billing-panel">
                        <header>Customer Details</header>
                        <div className="hk-billing-body">
                            {!selectedCustomer && (
                                <button className="hk-add-btn" onClick={() => setShowCustomerModal(true)}>+ Select Customer</button>
                            )}
                            {selectedCustomer && (
                                <div className="hk-customer-lines">
                                    <p><span>Name</span> : {selectedCustomer.customer_name}</p>
                                    <p><span>Address</span> : {selectedCustomer.customer_address}</p>
                                    <p><span>Pan Card</span> : {selectedCustomer.customer_pan_card}</p>
                                    <p><span>GST Num</span> : {selectedCustomer.customer_gst_number || '-'}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="hk-billing-panel">
                        <header>Items</header>
                        <div className="hk-billing-body">
                            {billItems.length === 0 && (
                                <button className="hk-add-btn" onClick={openItemsModal}>+ Add Items</button>
                            )}

                            {billItems.length > 0 && (
                                <div className="hk-bill-table-wrap">
                                    <table className="hk-bill-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billItems.map((row) => (
                                                <tr key={row.item_id}>
                                                    <td>{row.item_name}</td>
                                                    <td>
                                                        <div className="hk-qty-inline">
                                                            <button onClick={() => incrementQty(row.item_id)} type="button">+</button>
                                                            <span>{row.quantity}</span>
                                                            <button onClick={() => decrementQty(row.item_id)} type="button">−</button>
                                                        </div>
                                                    </td>
                                                    <td>{(row.unit_price * row.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr className="hk-total-row">
                                                <td />
                                                <td>Total</td>
                                                <td>{total.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    {billItems.length > 0 && (
                        <>
                            <section className="hk-billing-panel">
                                <header>Bill Summary (Preview)</header>
                                <div className="hk-billing-body" style={{ justifyContent: 'flex-start' }}>
                                    <div className="hk-customer-lines">
                                        <p><span>Subtotal</span> : {gstPreview.subtotal.toFixed(2)}</p>
                                        <p><span>GST</span> : {gstPreview.gstPercentage}%</p>
                                        <p><span>GST Amount</span> : {gstPreview.gstAmount.toFixed(2)}</p>
                                        <p><span>Total</span> : {gstPreview.grandTotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            </section>

                            <div className="hk-form-actions" style={{ justifyContent: 'flex-end' }}>
                                <button type="button" className="hk-btn-cancel" onClick={clearDraft}>Cancel</button>
                                <button type="button" className="hk-btn-create" onClick={handleCreateInvoice} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Invoice'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {createdInvoice && (
                <div className="hk-billing-board">
                    <section className="hk-billing-panel">
                        <header>
                            Customer Details
                            <strong className="hk-invoice-id">Invoice ID: {createdInvoice.invoice_id}</strong>
                        </header>
                        <div className="hk-billing-body">
                            <div className="hk-customer-lines">
                                <p><span>Name</span> : {createdInvoice.customer_name}</p>
                                <p><span>Address</span> : {selectedCustomer?.customer_address}</p>
                                <p><span>Pan Card</span> : {selectedCustomer?.customer_pan_card}</p>
                                <p><span>GST Num</span> : {selectedCustomer?.customer_gst_number || '-'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="hk-billing-panel">
                        <header>Items</header>
                        <div className="hk-billing-body">
                            <table className="hk-bill-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createdInvoice.items.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.item_name}</td>
                                            <td>{row.quantity}</td>
                                            <td>{Number(row.line_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="hk-total-row">
                                        <td />
                                        <td>Total</td>
                                        <td>{Number(createdInvoice.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {showCustomerModal && (
                <div className="hk-modal-backdrop" onClick={() => setShowCustomerModal(false)}>
                    <div className="hk-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="hk-modal-head">
                            <h3>Select Customer</h3>
                            <button type="button" className="hk-btn-cancel" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                        </div>
                        <div className="hk-entity-grid">
                            {customers.map((customer) => (
                                <EntityCard
                                    key={customer.id}
                                    title={customer.customer_name}
                                    status={customer.status}
                                    onClick={() => handleSelectCustomer(customer)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showItemsModal && (
                <div className="hk-modal-backdrop" onClick={() => setShowItemsModal(false)}>
                    <div className="hk-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="hk-modal-head">
                            <h3>Select Items</h3>
                        </div>
                        <div className="hk-entity-grid">
                            {items.map((item) => {
                                const qty = modalQuantities[item.id] || 0;
                                const isInactive = item.status !== 'Active';
                                return (
                                    <EntityCard key={item.id} title={item.item_name} status={item.status}>
                                        {isInactive ? (
                                            <StatusPill status="In-Active" />
                                        ) : qty > 0 ? (
                                            <div className="hk-qty-inline">
                                                <button onClick={() => updateModalQty(item.id, 1)} type="button">+</button>
                                                <span>{qty}</span>
                                                <button onClick={() => updateModalQty(item.id, -1)} type="button">−</button>
                                            </div>
                                        ) : (
                                            <button className="hk-inline-add" type="button" onClick={() => updateModalQty(item.id, 1)}>ADD</button>
                                        )}
                                    </EntityCard>
                                );
                            })}
                        </div>

                        <div className="hk-form-actions" style={{ justifyContent: 'flex-end' }}>
                            <button type="button" className="hk-btn-cancel" onClick={() => setShowItemsModal(false)}>Cancel</button>
                            <button type="button" className="hk-btn-create" onClick={applySelectedItems}>Add Items</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default BillingModule;
