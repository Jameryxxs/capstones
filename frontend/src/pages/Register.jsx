import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { authApi } from '../api';

const Register = () => {
    const [userData, setUserData] = useState({ username: '', password: '', email: '', role: 'staff' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authApi.register(userData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '20px' }}>
            <Card style={{ width: '100%', maxWidth: '380px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#1a2a6c', marginBottom: '25px', fontSize: '1.6rem' }}>Create Account</h2>
                
                {error && <p style={{ color: '#dc3545', textAlign: 'center', background: '#f8d7da', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={userData.username} 
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
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={userData.email} 
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
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={userData.password} 
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
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Account Role</label>
                        <select 
                            name="role" 
                            value={userData.role} 
                            onChange={handleChange} 
                            style={{ 
                                width: '100%', 
                                padding: '10px 12px', 
                                marginTop: '5px', 
                                borderRadius: '6px', 
                                border: '1px solid #ddd',
                                boxSizing: 'border-box',
                                background: '#fff' 
                            }}
                        >
                            <option value="retailer">Retailer</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <button 
                        disabled={loading} 
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            background: '#28a745', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Registering...' : 'Register Account'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>
                    Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                </p>
            </Card>
        </div>
    );
};

export default Register;
