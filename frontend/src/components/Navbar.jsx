import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{ 
            height: '60px', 
            background: '#fff', 
            borderBottom: '1px solid #eee', 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0 20px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        }}>
            <h2 style={{ margin: 0, color: '#007bff' }}>FishLodger</h2>
            <div style={{ marginLeft: 'auto' }}>
                <Link to="/login" style={{ marginRight: '15px', textDecoration: 'none', color: '#666' }}>Login</Link>
                <Link to="/register" style={{ textDecoration: 'none', color: '#fff', background: '#007bff', padding: '8px 16px', borderRadius: '4px' }}>Register</Link>
            </div>
        </nav>
    );
};

export default Navbar;
