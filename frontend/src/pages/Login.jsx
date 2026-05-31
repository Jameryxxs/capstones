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

    // Check for expired session parameter
    const queryParams = new URLSearchParams(window.location.search);
    const isExpired = queryParams.get('expired') === 'true';

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
            <Card style={{ width: '100%', maxWidth: '420px', padding: '40px', borderTop: '4px solid var(--accent-cyan)' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: '0 0 10px', letterSpacing: '2px' }}>SYSTEM_LOGIN</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Authorized Personnel Access Only
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    {isExpired && (
                        <div style={{ 
                            padding: '10px', 
                            background: 'rgba(243, 156, 18, 0.1)', 
                            border: '1px solid var(--safety-orange)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--safety-orange)', 
                            fontSize: '0.75rem', 
                            marginBottom: '20px', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            textAlign: 'center'
                        }}>
                            SESSION_EXPIRED: PLEASE_REAUTHENTICATE
                        </div>
                    )}
                    <div style={{ marginBottom: '20px' }}>
                        <label>USER_IDENTIFIER</label>
                        <input 
                            type="text" 
                            placeholder="Enter username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label>SECURITY_KEY</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '10px', 
                            background: 'rgba(255, 77, 77, 0.1)', 
                            border: '1px solid var(--danger-red)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--danger-red)', 
                            fontSize: '0.75rem', 
                            marginBottom: '20px', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            ERROR: {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }}
                    >
                        {loading ? 'ESTABLISHING_UPLINK...' : 'INITIATE_SESSION'}
                    </button>

                    <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        NEW_USER? <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}>Register_Identity</Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;
