import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api, { authApi, retailerApi, getUserRole } from '../api';
import { db } from '../db';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
    const [user, setUser] = useState({ first_name: '', last_name: '', email: '', username: '' });
    const [retailer, setRetailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [syncStats, setSyncStats] = useState({ prices: 0, deliveries: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const role = getUserRole();

    const fetchData = async () => {
        try {
            const userRes = await authApi.getMe();
            setUser(userRes.data);
            
            if (role === 'retailer') {
                const retailerRes = await retailerApi.getMe();
                setRetailer(retailerRes.data);
            }

            const pCount = await db.pendingPrices.count();
            const dCount = await db.pendingDeliveries.count();
            setSyncStats({ prices: pCount, deliveries: dCount });

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        fetchData();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleUserUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await authApi.updateMe({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            });
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile.");
        } finally {
            setUpdating(false);
        }
    };

    const handleRetailerUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await retailerApi.updateMe({
                business_name: retailer.business_name,
                contact_number: retailer.contact_number,
                address: retailer.address
            });
            alert("Business profile updated!");
        } catch (err) {
            alert("Failed to update business profile.");
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            alert("New passwords do not match!");
            return;
        }
        setUpdating(true);
        try {
            await authApi.changePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            alert("Password changed successfully!");
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to change password.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: isMobile ? '1.5rem' : '2.2rem', letterSpacing: '2px' }}>
                    CONTROL CENTER // <span style={{ color: 'var(--accent-cyan)' }}>SETTINGS</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Personal Profile & System Configurations
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>
                
                {/* 1. PERSONAL PROFILE */}
                <Card title="USER IDENTITY PROFILE">
                    <form onSubmit={handleUserUpdate} style={{ padding: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>FIRST NAME</label>
                                <input 
                                    type="text" value={user.first_name} 
                                    onChange={e => setUser({...user, first_name: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>LAST NAME</label>
                                <input 
                                    type="text" value={user.last_name} 
                                    onChange={e => setUser({...user, last_name: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>EMAIL ADDRESS</label>
                            <input 
                                type="email" value={user.email} 
                                onChange={e => setUser({...user, email: e.target.value})}
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                            />
                        </div>
                        <button 
                            type="submit" disabled={updating}
                            style={{ 
                                width: '100%', padding: '12px', background: 'var(--accent-cyan)', color: 'var(--bg-main)', 
                                border: 'none', fontWeight: '800', cursor: 'pointer', borderRadius: '4px' 
                            }}
                        >
                            {updating ? 'SYNCING...' : 'UPDATE_PROFILE'}
                        </button>
                    </form>
                </Card>

                {/* 2. RETAILER BUSINESS PROFILE */}
                {role === 'retailer' && retailer && (
                    <Card title="BUSINESS OPERATIONS PROFILE">
                        <form onSubmit={handleRetailerUpdate} style={{ padding: '10px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>BUSINESS NAME</label>
                                <input 
                                    type="text" value={retailer.business_name} 
                                    onChange={e => setRetailer({...retailer, business_name: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>STALL NUMBER</label>
                                    <input type="text" value={retailer.stall_number} readOnly style={{ background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>CONTACT #</label>
                                    <input 
                                        type="text" value={retailer.contact_number} 
                                        onChange={e => setRetailer({...retailer, contact_number: e.target.value})}
                                        style={{ background: 'rgba(255,255,255,0.05)' }}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" disabled={updating}
                                style={{ 
                                    width: '100%', padding: '12px', background: 'transparent', color: 'var(--accent-cyan)', 
                                    border: '1px solid var(--accent-cyan)', fontWeight: '800', cursor: 'pointer', borderRadius: '4px' 
                                }}
                            >
                                {updating ? 'SYNCING...' : 'UPDATE_BUSINESS_INFO'}
                            </button>
                        </form>
                    </Card>
                )}

                {/* 3. SECURITY & ACCESS */}
                <Card title="SECURITY ENCRYPTION ACCESS">
                    <form onSubmit={handlePasswordChange} style={{ padding: '10px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>CURRENT PASSWORD</label>
                            <input 
                                type="password" value={passwordData.old_password} 
                                onChange={e => setPasswordData({...passwordData, old_password: e.target.value})}
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>NEW PASSWORD</label>
                                <input 
                                    type="password" value={passwordData.new_password} 
                                    onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>CONFIRM</label>
                                <input 
                                    type="password" value={passwordData.confirm_password} 
                                    onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" disabled={updating}
                            style={{ 
                                width: '100%', padding: '12px', background: 'transparent', color: 'var(--fail-red)', 
                                border: '1px solid var(--fail-red)', fontWeight: '800', cursor: 'pointer', borderRadius: '4px' 
                            }}
                        >
                            RE-ENCRYPT PASSWORD
                        </button>
                    </form>
                </Card>

                {/* 4. SYSTEM DIAGNOSTICS */}
                <Card title="SYSTEM DIAGNOSTICS STORAGE">
                    <div style={{ padding: '10px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>LOCAL CACHE SYNC STATUS</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                <span>PENDING PRICE LOGS</span>
                                <span style={{ color: syncStats.prices > 0 ? 'var(--fail-red)' : 'var(--success-green)' }}>{syncStats.prices}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span>PENDING DELIVERY LOGS</span>
                                <span style={{ color: syncStats.deliveries > 0 ? 'var(--fail-red)' : 'var(--success-green)' }}>{syncStats.deliveries}</span>
                            </div>
                            
                            {/* PROGRESS BAR MOCK */}
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '15px', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: syncStats.prices + syncStats.deliveries > 0 ? '40%' : '100%', height: '100%', background: syncStats.prices + syncStats.deliveries > 0 ? 'var(--safety-orange)' : 'var(--success-green)' }} />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '4px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>APPLICATION METRICS</h4>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>VERSION: 2.1.0-PRODUCTION</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>PROTOCOL: WEBSOCKET_SECURE_READY</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>STORAGE_ENGINE: INDEXED_DB_DEXIE</p>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Settings;

