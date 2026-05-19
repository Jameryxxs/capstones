import React from 'react';

const Card = ({ title, children, style, interactive }) => {
  return (
    <div 
      className={interactive ? 'interactive-card' : ''}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '25px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-light)',
        height: 'fit-content',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {title && (
        <h3 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '1rem', 
          fontWeight: '700', 
          color: 'var(--primary-navy)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '2px solid var(--bg-main)',
          paddingBottom: '10px'
        }}>
          {title}
        </h3>
      )}
      <div style={{ width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
