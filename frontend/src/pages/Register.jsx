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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Card style={{ width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#1a2a6c' }}>Create Account</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Username</label>
                        <input type="text" name="username" value={userData.username} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email</label>
                        <input type="email" name="email" value={userData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Password</label>
                        <input type="password" name="password" value={userData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Role</label>
                        <select name="role" value={userData.role} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
                            <option value="retailer">Retailer</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <button disabled={loading} style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Registering...' : 'Register Account'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </Card>
        </div>
    );
};

export default Register;
