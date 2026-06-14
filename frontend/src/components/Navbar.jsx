import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getUserRole, retailerApi } from '../api';

const Navbar = ({ onToggleSidebar, isMobile, isAuthPage }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [profileName, setProfileName] = useState('');
    const navigate = useNavigate();

    const getStatusText = () => {
        const role = getUserRole();
        if (!role) return 'SYSTEM_ONLINE';
        
        const roleMap = {
            'admin': 'SYSTEM ONLINE',
            'retailer': profileName ? `${profileName.toUpperCase()} ONLINE` : 'RETAILER ONLINE',
            'supplier': profileName ? `${profileName.toUpperCase()} ONLINE` : 'SUPPLIER ONLINE',
            'guest': 'CONSUMER ONLINE',
            'staff': 'STAFF ONLINE'
        };
        
        return roleMap[role] || 'SYSTEM_ONLINE';
    };

    const fetchProfile = async () => {
        const role = getUserRole();
        if (role === 'retailer' || role === 'supplier') {
            try {
                const res = await retailerApi.getMe();
                setProfileName(res.data.business_name);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        }
    };

    const fetchNotifications = () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        api.get('notifications/')
        .then(res => {
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotifications(sorted);
            const unread = sorted.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        })
        .catch(err => console.error("Notification error:", err));
    };

    useEffect(() => {
        fetchNotifications();
        fetchProfile();
        
        // WebSocket for Real-time Notifications
        let socket;
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const wsUrl = `${protocol}://${window.location.hostname}:8000/ws/updates/`;
            socket = new WebSocket(wsUrl);

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'BULLETIN_UPDATE' || data.type === 'WEATHER_ALERT' || data.type === 'SYSTEM_ALERT') {
                    fetchNotifications(); // Refresh list immediately when admin posts
                }
            };
        } catch (wsErr) {
            console.error("WS Notification Error:", wsErr);
        }

        const interval = setInterval(fetchNotifications, 30000);
        return () => {
            clearInterval(interval);
            if (socket) socket.close();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
        window.location.reload();
    };

    const markAsRead = async (id) => {
        // Optimistic UI update
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await api.patch(`notifications/${id}/`, { is_read: true });
            // Re-fetch to ensure sync with server
            fetchNotifications();
        } catch (err) {
            console.error("Error marking notification as read:", err);
            // Revert on error
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.is_read);
        if (unread.length === 0) return;

        // Optimistic UI update
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            await Promise.all(unread.map(n => api.patch(`notifications/${n.id}/`, { is_read: true })));
            fetchNotifications();
        } catch (err) {
            console.error("Error marking all as read:", err);
            fetchNotifications();
        }
    };

    return (
        <nav style={{ 
            height: '60px', 
            background: 'var(--bg-sidebar)', 
            borderBottom: '1px solid var(--border-industrial)', 
            display: 'flex', 
            alignItems: 'center', 
            padding: isMobile ? '0 15px' : '0 30px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: 'var(--shadow-command)'
        }}>
            {/* Hamburger Menu for Mobile/Tablet */}
            {isMobile && !isAuthPage && (
                <button 
                    onClick={onToggleSidebar}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        cursor: 'pointer',
                        marginRight: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            )}

            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <h2 style={{ 
                    margin: 0, 
                    color: 'var(--text-main)', 
                    fontSize: isMobile ? '1.1rem' : '1.3rem', 
                    letterSpacing: '2px',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                }}>
                    Fish<span style={{ color: 'var(--accent-cyan)' }}>Lodger</span>
                </h2>
            </Link>
            
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
                {!isAuthPage && (
                    <div style={{ position: 'relative' }}>
                        <div 
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ cursor: 'pointer', opacity: showDropdown ? 1 : 0.8, transition: '0.3s' }}
                        >
                            <span style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', color: 'var(--accent-cyan)' }}>🔔</span>
                            {unreadCount > 0 && (
                                <span style={{ 
                                    position: 'absolute', 
                                    top: '-5px', 
                                    right: '-5px', 
                                    background: 'var(--fail-red)', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.6rem',
                                    fontWeight: '900',
                                    border: '2px solid var(--bg-sidebar)'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {showDropdown && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '45px', 
                                right: isMobile ? '-15px' : '0', 
                                width: isMobile ? '280px' : '350px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-industrial)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                zIndex: 1001,
                                maxHeight: '450px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ padding: '15px', borderBottom: '1px solid var(--border-industrial)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>SYSTEM_NOTIFICATIONS</h4>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={markAllAsRead}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.65rem', cursor: 'pointer', textTransform: 'uppercase', fontWeight: '700' }}
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            NO_RECENT_NOTIFICATIONS
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => markAsRead(notif.id)}
                                                style={{ 
                                                    padding: '15px', 
                                                    borderBottom: '1px solid var(--border-industrial)', 
                                                    background: notif.is_read ? 'transparent' : 'rgba(100, 255, 218, 0.03)',
                                                    cursor: 'pointer',
                                                    borderLeft: notif.is_read ? 'none' : '3px solid var(--accent-cyan)',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <div style={{ fontWeight: '800', fontSize: '0.75rem', color: notif.is_read ? 'var(--text-muted)' : 'var(--text-main)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {!notif.is_read && (
                                                        <span style={{ 
                                                            width: '6px', 
                                                            height: '6px', 
                                                            borderRadius: '50%', 
                                                            background: 'var(--fail-red)', 
                                                            display: 'inline-block',
                                                            flexShrink: 0
                                                        }} />
                                                    )}
                                                    {notif.title}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                                    {notif.message}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: 'rgba(100, 255, 218, 0.5)', marginTop: '8px', textAlign: 'right' }}>
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!localStorage.getItem('access_token') ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Login</Link>
                        <Link to="/register" style={{ 
                            textDecoration: 'none', 
                            color: 'var(--primary-navy)', 
                            background: 'var(--accent-cyan)', 
                            padding: isMobile ? '6px 12px' : '8px 16px', 
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>Register</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem', fontWeight: '800', display: isMobile ? 'none' : 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {getStatusText()}
                        </div>
                        <button 
                            onClick={handleLogout}
                            style={{
                                padding: '6px 12px',
                                background: 'rgba(255, 71, 87, 0.1)',
                                color: 'var(--fail-red)',
                                border: '1px solid var(--fail-red)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.65rem',
                                fontWeight: '900',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            LOGOUT
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
