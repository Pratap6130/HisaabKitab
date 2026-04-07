import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/index.css';

const MasterHome = () => {
    return (
        <section className="hk-page-shell">
            <h2 className="hk-page-title">Master</h2>
            <p className="hk-page-subtitle">Manage your customers and items</p>
            <div className="hk-master-cards">
                <Link to="/master/customers" className="hk-master-card">
                    <div className="hk-master-card-icon customers">👥</div>
                    <h3>Customers</h3>
                    <p>Create, view, and manage your customer records</p>
                </Link>
                <Link to="/master/items" className="hk-master-card">
                    <div className="hk-master-card-icon items">📦</div>
                    <h3>Items</h3>
                    <p>Create, view, and manage your product catalog</p>
                </Link>
            </div>
        </section>
    );
};

export default MasterHome;
