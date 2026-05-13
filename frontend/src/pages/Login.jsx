import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const Login = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
        <Card style={{ width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h1 style={{ textAlign: 'center', color: '#1a2a6c', marginBottom: '10px' }}>FishLodger</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Sign in to Lucena Fish Port MS</p>
            <form>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Username</label>
                    <input type="text" style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Enter your username" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Password</label>
                    <input type="password" style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Enter your password" />
                </div>
                <button style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: '#1a2a6c', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                }}>Login to System</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here</Link>
            </p>
        </Card>
    </div>
);

export default Login;
