import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const Settings = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>Account Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your personal profile and system preferences</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '25px' }}>
                <Card title="Profile Information">
                    <div style={{ padding: '10px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Full Name</label>
                            <input type="text" value="Administrator" readOnly />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Email Address</label>
                            <input type="email" value="admin@lucenafishport.gov.ph" readOnly />
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }}>Update Profile</button>
                    </div>
                </Card>

                <Card title="System Preferences">
                    <div style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px', color: 'var(--primary-navy)' }}>Notifications</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive alerts for price spikes</p>
                            </div>
                            <input type="checkbox" defaultChecked style={{ width: '40px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px', color: 'var(--primary-navy)' }}>High-Density View</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Show more data in tables</p>
                            </div>
                            <input type="checkbox" style={{ width: '40px' }} />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', background: 'var(--primary-navy)' }}>Save Preferences</button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
