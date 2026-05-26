import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('auth/login/', { username, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            navigate('/dashboard');
            window.location.reload(); 
        } catch (err) {
            setError('Invalid credentials. Please check your username and password.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.8rem', margin: '0 0 10px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Access the FishLodger port management system</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Username</label>
                        <input 
                            type="text" 
                            placeholder="Enter your username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '20px', fontWeight: '500' }}>{error}</p>}

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;
