import React from 'react';

const SectionHeader = ({ title, onAdd, addLabel = '+ Add' }) => {
    return (
        <div className="hk-section-head">
            <h2 className="hk-page-title">{title}</h2>
            {onAdd && (
                <button className="hk-add-btn" onClick={onAdd}>
                    {addLabel}
                </button>
            )}
        </div>
    );
};

export default SectionHeader;
