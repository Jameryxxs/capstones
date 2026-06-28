import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        contact_number: '',
        business_name: '',
        requested_role: 'retailer',
        appointment_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleApply = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('applications/', formData);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Application submission failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '40px 20px',
                background: '#f8fafc'
            }}>
                <Card style={{ width: '100%', maxWidth: '600px', padding: '50px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--success-green)', marginBottom: '20px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.8rem', margin: '0 0 15px', fontWeight: '800' }}>APPLICATION SUBMITTED</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px' }}>
                        Your application for a <strong>{formData.requested_role.toUpperCase()}</strong> account has been successfully sent to the Port Administration.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', marginBottom: '30px', textAlign: 'left' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary-navy)' }}>NEXT STEPS:</h4>
                        <ol style={{ margin: '0', paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.8' }}>
                            <li>Visit the Port Administration Office on <strong>{formData.appointment_date}</strong>.</li>
                            <li>Bring your valid IDs and necessary port permits.</li>
                            <li>Upon verification, the Admin will approve your account and provide your login credentials.</li>
                        </ol>
                    </div>
                    <Link to="/login" className="btn-primary" style={{ display: 'inline-block', padding: '12px 30px', textDecoration: 'none', fontWeight: '800' }}>
                        RETURN TO LOGIN
                    </Link>
                </Card>
            </div>
        );
    }

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
                    <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.8rem', margin: '0 0 10px', fontWeight: '800' }}>ACCOUNT APPLICATION</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Apply for Official Access to the Fish Port System</p>
                </div>

                <form onSubmit={handleApply}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>FULL NAME</label>
                        <input 
                            type="text" 
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            required
                        />
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
                                value={formData.contact_number}
                                onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>BUSINESS / BOAT NAME</label>
                            <input 
                                type="text" 
                                placeholder="Optional"
                                value={formData.business_name}
                                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>REQUESTED ROLE</label>
                            <select 
                                value={formData.requested_role}
                                onChange={(e) => setFormData({...formData, requested_role: e.target.value})}
                                style={{ width: '100%', padding: '12px' }}
                            >
                                <option value="retailer">Port Retailer / Trader</option>
                                <option value="supplier">Port Supplier / Vessel Owner</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>PREFERRED APPOINTMENT DATE</label>
                        <input 
                            type="date" 
                            value={formData.appointment_date}
                            onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.75rem', marginBottom: '20px', fontWeight: '800', textAlign: 'center' }}>{error.toUpperCase()}</p>}

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ width: '100%', padding: '16px', fontSize: '0.9rem', fontWeight: '800' }}
                    >
                        {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                    </button>

                    <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ALREADY HAVE AN ACCOUNT? <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}>Login Here</Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Register;
