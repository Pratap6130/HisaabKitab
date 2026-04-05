import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/index.css';

const MasterHome = () => {
    return (
        <section className="hk-page-shell">
            <h2 className="hk-page-title">Master</h2>
            <div className="hk-master-cards">
                <Link to="/master/customers" className="hk-master-card">
                    <h3>Customer</h3>
                    <p>Read or Create customer data</p>
                </Link>
                <Link to="/master/items" className="hk-master-card">
                    <h3>Items</h3>
                    <p>Read or Create items data</p>
                </Link>
            </div>
        </section>
    );
};

export default MasterHome;
