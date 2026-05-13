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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Card style={{ width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h1 style={{ textAlign: 'center', color: '#1a2a6c', marginBottom: '10px' }}>FishLodger</h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Sign in to Lucena Fish Port MS</p>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Username</label>
                        <input type="text" name="username" value={credentials.username} onChange={handleChange} required style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Enter your username" />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Password</label>
                        <input type="password" name="password" value={credentials.password} onChange={handleChange} required style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Enter your password" />
                    </div>
                    <button disabled={loading} style={{ width: '100%', padding: '14px', background: '#1a2a6c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                        {loading ? 'Logging in...' : 'Login to System'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here</Link>
                </p>
            </Card>
        </div>
    );
};

export default Login;
