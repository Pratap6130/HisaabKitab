import React from 'react';

const StatusPill = ({ status }) => {
    const isActive = status === 'Active';

    return (
        <span className={`hk-state-pill ${isActive ? 'is-active' : 'is-inactive'}`}>
            {status}
        </span>
    );
};

export default StatusPill;
