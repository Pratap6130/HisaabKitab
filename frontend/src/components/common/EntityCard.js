import React from 'react';
import StatusPill from './StatusPill';

const EntityCard = ({ title, status, onClick, children }) => {
    return (
        <article className="hk-entity-card" onClick={onClick}>
            <h3>{title}</h3>
            {children || <StatusPill status={status} />}
        </article>
    );
};

export default EntityCard;
