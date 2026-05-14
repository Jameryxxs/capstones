import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            axios.get('http://127.0.0.1:8000/api/notifications/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                const unread = res.data.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            })
            .catch(err => console.error("Notification error:", err));
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <nav style={{ 
            height: '60px', 
            background: '#fff', 
            borderBottom: '1px solid #eee', 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0 20px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        }}>
            <h2 style={{ margin: 0, color: '#007bff' }}>FishLodger</h2>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginRight: '20px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '1.4rem' }}>🔔</span>
                    {unreadCount > 0 && (
                        <span style={{ 
                            position: 'absolute', 
                            top: '-5px', 
                            right: '-5px', 
                            background: 'red', 
                            color: 'white', 
                            borderRadius: '50%', 
                            padding: '2px 6px', 
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </div>
                <Link to="/login" style={{ marginRight: '15px', textDecoration: 'none', color: '#666' }}>Login</Link>
                <Link to="/register" style={{ textDecoration: 'none', color: '#fff', background: '#007bff', padding: '8px 16px', borderRadius: '4px' }}>Register</Link>
            </div>
        </nav>
    );
};

export default Navbar;
