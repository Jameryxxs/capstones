import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        role: 'staff' // Forced role
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await api.get('users/');
            // Filter only staff users
            const filteredStaff = res.data.filter(user => user.role === 'staff');
            setStaffList(filteredStaff);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateUsername = () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const prefix = formData.first_name ? formData.first_name.toLowerCase().substring(0, 3) : 'stf';
        setFormData({ ...formData, username: `${prefix}${randomNum}` });
    };

    const handleGeneratePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            await api.post('users/', formData);
            setSuccessMessage(`Successfully created staff account for ${formData.first_name} ${formData.last_name}!`);
            setFormData({
                username: '', password: '', first_name: '', last_name: '', phone_number: '', email: '', role: 'staff'
            });
            setShowForm(false);
            fetchStaff(); // Refresh the list
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                // Format error messages
                const messages = Object.entries(err.response.data)
                    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
                    .join(' | ');
                setError(messages);
            } else {
                setError('Failed to create staff account. Please check your connection.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-light)',
        borderRadius: '6px',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontSize: '0.9rem'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: 'var(--text-muted)',
        marginBottom: '5px'
    };

    if (loading && staffList.length === 0) return <div style={{ padding: '20px' }}>Loading staff records...</div>;

    return (
        <div className="page-fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', color: 'var(--primary-navy)' }}>Staff Management</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage internal port administration employee accounts.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className="btn-primary" 
                    style={{ padding: '10px 20px', fontWeight: 'bold' }}
                >
                    {showForm ? 'Cancel Creation' : '+ Create Staff Account'}
                </button>
            </div>

            {successMessage && (
                <div style={{ padding: '15px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-green)', color: 'var(--success-green)', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {successMessage}
                </div>
            )}

            {showForm && (
                <Card style={{ marginBottom: '30px', borderTop: '4px solid var(--accent-cyan)' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-navy)' }}>New Staff Profile</h3>
                    
                    {error && (
                        <div style={{ padding: '10px 15px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-red)', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>FIRST NAME</label>
                                <input type="text" style={inputStyle} value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                            </div>
                            <div>
                                <label style={labelStyle}>LAST NAME</label>
                                <input type="text" style={inputStyle} value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>EMAIL ADDRESS</label>
                                <input type="email" style={inputStyle} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div>
                                <label style={labelStyle}>PHONE NUMBER</label>
                                <input type="text" style={inputStyle} value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={labelStyle}>SYSTEM USERNAME</label>
                                    <button type="button" onClick={handleGenerateUsername} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}>Generate</button>
                                </div>
                                <input type="text" style={{...inputStyle, fontWeight: 'bold'}} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={labelStyle}>TEMPORARY PASSWORD</label>
                                    <button type="button" onClick={handleGeneratePassword} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}>Generate</button>
                                </div>
                                <input type="text" style={{...inputStyle, fontWeight: 'bold'}} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '12px 24px', fontWeight: 'bold', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-navy)' }}>Active Staff Roster ({staffList.length})</h3>
                    
                    {staffList.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No staff members found in the system.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map(staff => (
                                        <tr key={staff.id}>
                                            <td style={{ fontWeight: '600', color: 'var(--primary-navy)' }}>{staff.first_name} {staff.last_name}</td>
                                            <td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>@{staff.username}</td>
                                            <td>{staff.email}</td>
                                            <td>{staff.phone_number || 'N/A'}</td>
                                            <td>
                                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--secondary-blue)' }}>
                                                    {staff.role.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default StaffManagement;
