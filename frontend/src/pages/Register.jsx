import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';

const Register = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'retailer',
        first_name: '',
        last_name: '',
        phone_number: '',
        stall_number: location.state?.stall_number || '',
        business_name: '',
        address: ''
    });
    const [availableStalls, setAvailableStalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (formData.role === 'retailer') {
            api.get('retailers/available_stalls/')
                .then(res => {
                    setAvailableStalls(res.data);
                    // If a stall was passed in state, ensure it's actually available
                    if (location.state?.stall_number && !res.data.includes(location.state.stall_number)) {
                        console.warn("Requested stall is not available");
                    }
                })
                .catch(err => console.error("Error fetching stalls", err));
        }
    }, [formData.role, location.state]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.role === 'retailer') {
            if (!formData.stall_number) {
                setError('Please select a stall number.');
                return;
            }
            if (!formData.business_name) {
                setError('Please provide a business name.');
                return;
            }
        }
        setLoading(true);
        setError('');
        try {
            await api.post('auth/register/', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || 'Registration failed. Username or email might already exist.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 20px',
            background: '#f8fafc'
        }}>
            <Card style={{ width: '100%', maxWidth: '700px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.8rem', margin: '0 0 10px', fontWeight: '800' }}>CREATE IDENTITY</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Join the Lucena Fish Port Digital Ecosystem</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>FIRST NAME</label>
                            <input 
                                type="text" 
                                placeholder="John"
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>LAST NAME</label>
                            <input 
                                type="text" 
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>EMAIL ADDRESS</label>
                            <input 
                                type="email" 
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>CONTACT NUMBER</label>
                            <input 
                                type="text" 
                                placeholder="09XX-XXX-XXXX"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>USERNAME</label>
                            <input 
                                type="text" 
                                placeholder="johndoe123"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>PASSWORD</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>ACCOUNT ROLE</label>
                        <select 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            style={{ width: '100%', padding: '12px' }}
                        >
                            <option value="guest">Guest / Consumer (View Only)</option>
                            <option value="retailer">Port Retailer / Trader</option>
                            <option value="supplier">Port Supplier / Vessel Owner</option>
                        </select>
                    </div>

                    {formData.role === 'retailer' && (
                        <div style={{ 
                            background: '#f1f5f9', 
                            padding: '25px', 
                            borderRadius: '12px', 
                            marginBottom: '30px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary-navy)' }}>RETAILER STALL INFORMATION</h4>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', marginBottom: '5px', display: 'block' }}>BUSINESS NAME</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Maria's Fresh Fish"
                                        value={formData.business_name}
                                        onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                                        required={formData.role === 'retailer'}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', marginBottom: '5px', display: 'block' }}>CHOOSE STALL UNIT</label>
                                    <select 
                                        value={formData.stall_number}
                                        onChange={(e) => setFormData({...formData, stall_number: e.target.value})}
                                        required={formData.role === 'retailer'}
                                        style={{ width: '100%', padding: '12px' }}
                                    >
                                        <option value="">-- SELECT UNIT --</option>
                                        {availableStalls.map(stall => (
                                            <option key={stall} value={stall}>{stall}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', marginBottom: '5px', display: 'block' }}>BUSINESS ADDRESS</label>
                                <textarea 
                                    placeholder="Enter complete stall or business address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>
                    )}

                    {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.75rem', marginBottom: '20px', fontWeight: '800', textAlign: 'center' }}>{error.toUpperCase()}</p>}

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ width: '100%', padding: '16px', fontSize: '0.9rem', fontWeight: '800' }}
                    >
                        {loading ? 'SYNCHRONIZING DATA...' : 'INITIATE REGISTRATION'}
                    </button>

                    <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ALREADY REGISTERED? <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}>Login To Session</Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Register;

