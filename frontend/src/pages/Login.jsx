import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { authApi } from '../api';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authApi.login(credentials);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Card style={{ width: '90%', maxWidth: '360px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h1 style={{ textAlign: 'center', color: '#1a2a6c', marginBottom: '10px', fontSize: '1.8rem' }}>FishLodger</h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>Sign in to Lucena Fish Port MS</p>
                
                {error && <p style={{ color: '#dc3545', textAlign: 'center', background: '#f8d7da', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333' }}>Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={credentials.username} 
                            onChange={handleChange} 
                            required 
                            style={{ 
                                width: '100%', 
                                padding: '10px 12px', 
                                marginTop: '5px', 
                                borderRadius: '6px', 
                                border: '1px solid #ddd',
                                boxSizing: 'border-box' 
                            }} 
                            placeholder="Enter your username" 
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333' }}>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={credentials.password} 
                            onChange={handleChange} 
                            required 
                            style={{ 
                                width: '100%', 
                                padding: '10px 12px', 
                                marginTop: '5px', 
                                borderRadius: '6px', 
                                border: '1px solid #ddd',
                                boxSizing: 'border-box' 
                            }} 
                            placeholder="Enter your password" 
                        />
                    </div>
                    <button 
                        disabled={loading} 
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            background: '#1a2a6c', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '1rem', 
                            fontWeight: 'bold',
                            transition: 'background 0.3s'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login to System'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
                </p>
            </Card>
        </div>
    );
};

export default Login;
