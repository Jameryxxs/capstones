import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Navbar = ({ onToggleSidebar, isMobile, isAuthPage }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            api.get('notifications/')
            .then(res => {
                const unread = res.data.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            })
            .catch(err => console.error("Notification error:", err));
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav style={{ 
            height: '60px', 
            background: 'var(--bg-card)', 
            borderBottom: '1px solid var(--border-light)', 
            display: 'flex', 
            alignItems: 'center', 
            padding: isMobile ? '0 15px' : '0 30px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: 'var(--shadow-sm)'
        }}>
            {/* Hamburger Menu for Mobile/Tablet */}
            {isMobile && !isAuthPage && (
                <button 
                    onClick={onToggleSidebar}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-navy)',
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
                <h2 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.1rem' : '1.4rem', letterSpacing: '-0.5px' }}>
                    Fish<span style={{ color: 'var(--secondary-blue)' }}>Lodger</span>
                </h2>
            </Link>
            
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
                {!isAuthPage && (
                    <div style={{ position: 'relative', cursor: 'pointer', opacity: 0.8 }}>
                        <span style={{ fontSize: isMobile ? '1.1rem' : '1.4rem' }}>🔔</span>
                        {unreadCount > 0 && (
                            <span style={{ 
                                position: 'absolute', 
                                top: '-5px', 
                                right: '-5px', 
                                background: 'var(--danger-red)', 
                                color: 'white', 
                                borderRadius: '50%', 
                                padding: '2px 4px', 
                                fontSize: '0.6rem',
                                fontWeight: 'bold'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                )}

                {!localStorage.getItem('access_token') ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Login</Link>
                        <Link to="/register" style={{ 
                            textDecoration: 'none', 
                            color: '#fff', 
                            background: 'var(--secondary-blue)', 
                            padding: isMobile ? '6px 12px' : '10px 20px', 
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                        }}>Register</Link>
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '500', display: isMobile ? 'none' : 'block' }}>
                        Welcome back!
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
