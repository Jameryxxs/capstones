import React from 'react';

const LoadingSpinner = ({ size = '40px', color = 'var(--secondary-blue)' }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{
            width: size,
            height: size,
            border: `4px solid rgba(0, 0, 0, 0.1)`,
            borderLeftColor: color,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export default LoadingSpinner;

