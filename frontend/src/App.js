import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerMaster from './components/Master/CustomerMaster';
import ItemMaster from './components/Master/ItemMaster';
import BillingModule from './components/Billing/BillingModule';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/index.css';

function App() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <div className="sidebar">
                <h2>LogiEdge</h2>
                <nav>
                    <Link to="/" className={`nav-item ${isActive('/')}`}>
                        Dashboard
                    </Link>
                    <Link to="/billing" className={`nav-item ${isActive('/billing')}`}>
                        Billing
                    </Link>
                    <Link to="/customers" className={`nav-item ${isActive('/customers')}`}>
                        Customers
                    </Link>
                    <Link to="/items" className={`nav-item ${isActive('/items')}`}>
                        Items
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="header">
                    <h1>LogiEdge Billing Dashboard</h1>
                </div>

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/billing" element={<BillingModule />} />
                    <Route path="/customers" element={<CustomerMaster />} />
                    <Route path="/items" element={<ItemMaster />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
