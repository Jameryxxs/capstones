import React from 'react';

const Card = ({ title, children, style, contentStyle, interactive }) => {
  return (
    <div 
      className={interactive ? 'interactive-card' : ''}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)',
        padding: '24px',
        boxShadow: 'var(--shadow-command)',
        border: '1px solid var(--border-industrial)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {/* Decorative Corner Element */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '12px',
        height: '12px',
        borderRight: '2px solid var(--accent-cyan)',
        borderTop: '2px solid var(--accent-cyan)',
        opacity: 0.4
      }}></div>

      {title && (
        <h3 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '0.8rem', 
          fontWeight: '700', 
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          borderLeft: '3px solid var(--accent-cyan)',
          paddingLeft: '12px',
          flexShrink: 0
        }}>
          {title}
        </h3>
      )}
      <div style={{ width: '100%', flex: 1, minHeight: 0, ...contentStyle }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
