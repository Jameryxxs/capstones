import React from 'react';

const Card = ({ title, children, style }) => (
    <div style={{ 
        background: '#fff', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        ...style 
    }}>
        {title && <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>{title}</h3>}
        {children}
    </div>
);

export default Card;
