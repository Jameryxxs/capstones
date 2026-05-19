import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'retailer',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://127.0.0.1:8000/api/auth/register/', formData);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Username or email might already exist.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '90vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.8rem', margin: '0 0 10px' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the Lucena Fish Port digital network</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label>First Name</label>
                            <input 
                                type="text" 
                                placeholder="John"
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label>Last Name</label>
                            <input 
                                type="text" 
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                        <div>
                            <label>Username</label>
                            <input 
                                type="text" 
                                placeholder="johndoe123"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label>Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label>Account Role</label>
                        <select 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="retailer">Port Retailer / Trader</option>
                            <option value="staff">Administrative Staff</option>
                        </select>
                    </div>

                    {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '20px', fontWeight: '500' }}>{error}</p>}

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Register Account'}
                    </button>

                    <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Register;
