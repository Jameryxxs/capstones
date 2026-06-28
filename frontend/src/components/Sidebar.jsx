import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUserRole } from '../api';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    const navigate = useNavigate();
    const role = getUserRole() || 'guest';

    const Icons = {
        Dashboard: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        ),
        Monitoring: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        ),
        Prices: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        ),
        Retailers: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        ),
        Supply: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        ),
        Reports: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        ),
        Analytics: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        ),
        Settings: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        ),
        Map: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
        ),
        DataEntry: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        ),
        Bulletin: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        ),
        Applications: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        ),
        Staff: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        )
    };

    const allLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: <Icons.Dashboard />, roles: ['admin', 'retailer', 'staff', 'guest', 'supplier'] },
        { path: '/market-map', label: 'Stall Map', icon: <Icons.Map />, roles: ['admin', 'retailer', 'staff', 'guest', 'supplier'] },
        { path: '/my-stall', label: 'My Stall', icon: <Icons.Retailers />, roles: ['retailer', 'supplier'] },
        { path: '/monitoring', label: 'Live Monitoring', icon: <Icons.Monitoring />, roles: ['admin', 'staff'] },
        { path: '/data-entry', label: 'Data Entry', icon: <Icons.DataEntry />, roles: ['admin', 'staff'] },
        { path: '/bulletin-management', label: 'Bulletins', icon: <Icons.Bulletin />, roles: ['admin'] },
        { path: '/prices', label: 'Fish Prices', icon: <Icons.Prices />, roles: ['admin', 'retailer', 'staff', 'guest', 'supplier'] },
        { path: '/retailers', label: 'Port Directory', icon: <Icons.Retailers />, roles: ['admin', 'staff', 'guest'] },
        { path: '/supply', label: 'Supply Sources', icon: <Icons.Supply />, roles: ['admin', 'staff'] },
        { path: '/reports', label: 'Reports', icon: <Icons.Reports />, roles: ['admin', 'retailer', 'staff', 'supplier'] },
        { path: '/analytics', label: 'Analytics', icon: <Icons.Analytics />, roles: ['admin'] },
        { path: '/applications', label: 'Applications', icon: <Icons.Applications />, roles: ['admin'] },
        { path: '/staff-management', label: 'Staff Management', icon: <Icons.Staff />, roles: ['admin'] },
        { path: '/settings', label: 'Settings', icon: <Icons.Settings />, roles: ['admin', 'retailer', 'staff', 'supplier'] },
    ];

    const filteredLinks = allLinks.filter(link => link.roles.includes(role));

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username'); // Clear username as well
        navigate('/login');
        if (onClose) onClose();
        window.location.reload(); // Refresh to clear state and re-route
    };

    const isLoggedIn = !!localStorage.getItem('access_token');

    return (
        <>
            {/* Sidebar Overlay for Mobile */}
            {isMobile && isOpen && (
                <div 
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 850
                    }}
                />
            )}

            <aside style={{ 
                width: (!isMobile && !isOpen) ? '70px' : '240px', 
                background: 'var(--bg-sidebar)', 
                color: 'var(--text-main)', 
                height: '100vh', 
                position: 'fixed', 
                top: 0, 
                left: (isMobile && !isOpen) ? '-240px' : 0,
                padding: '80px 0 20px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 900,
                borderRight: '1px solid var(--border-industrial)',
                boxShadow: 'var(--shadow-command)',
                transition: 'left 0.3s ease, width 0.3s ease'
            }}>
                <div style={{ flex: 1 }}>
                    {filteredLinks.map(link => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: (!isMobile && !isOpen) ? 'center' : 'flex-start',
                                padding: (!isMobile && !isOpen) ? '14px 0' : '14px 24px',
                                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                textDecoration: 'none',
                                borderRight: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                                background: isActive ? 'rgba(100, 255, 218, 0.05)' : 'transparent',
                                fontSize: '0.8rem',
                                fontWeight: isActive ? '800' : '400',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'var(--transition-fast)'
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <span style={{ 
                                        marginRight: (!isMobile && !isOpen) ? '0' : '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                        opacity: isActive ? 1 : 0.6 
                                    }}>{link.icon}</span>
                                    {(!isMobile && !isOpen) ? null : link.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
                
                {isLoggedIn && (
                    <button 
                        onClick={handleLogout}
                        style={{
                            margin: '20px',
                            padding: '12px',
                            background: 'transparent',
                            color: 'var(--danger-red)',
                            border: '1px solid var(--danger-red)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        {(!isMobile && !isOpen) ? null : 'LOGOUT // EXIT'}
                    </button>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
