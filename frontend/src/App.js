import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import CustomerMaster from './components/Master/CustomerMaster';
import ItemMaster from './components/Master/ItemMaster';
import MasterHome from './components/Master/MasterHome';
import BillingModule from './components/Billing/BillingModule';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/index.css';

function App() {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const isActive = (path) => {
        if (path === '/master') {
            return location.pathname.startsWith('/master') ? 'active' : '';
        }
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className="hk-app-shell">
            <div className="hk-topbar" />

            <div className="hk-layout">
                <aside className={`hk-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="hk-sidebar-brand">
                        <h1 className="hk-brand-full">HisaabKitab</h1>
                        <span className="hk-brand-short">HK</span>
                        <p className="hk-brand-sub">Business Management</p>
                    </div>
                    <nav>
                        <Link to="/" className={`hk-nav-item ${isActive('/')}`}>
                            <span className="hk-nav-icon">📊</span>
                            <span className="hk-nav-label">Dashboard</span>
                        </Link>
                        <Link to="/master" className={`hk-nav-item ${isActive('/master')}`}>
                            <span className="hk-nav-icon">📋</span>
                            <span className="hk-nav-label">Master</span>
                        </Link>
                        <Link to="/billing" className={`hk-nav-item ${isActive('/billing')}`}>
                            <span className="hk-nav-icon">🧾</span>
                            <span className="hk-nav-label">Billing</span>
                        </Link>
                    </nav>
                    <button
                        className="hk-sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <span className="hk-toggle-icon">{sidebarCollapsed ? '»' : '«'}</span>
                    </button>
                </aside>

                <main className="hk-main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/master" element={<MasterHome />} />
                        <Route path="/master/customers" element={<CustomerMaster />} />
                        <Route path="/master/items" element={<ItemMaster />} />
                        <Route path="/billing" element={<BillingModule />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;
