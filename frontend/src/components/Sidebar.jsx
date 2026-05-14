import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUserRole } from '../api';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = getUserRole();

    const allLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'retailer', 'staff'] },
        { path: '/prices', label: 'Fish Prices', icon: '💰', roles: ['admin', 'retailer', 'staff'] },
        { path: '/retailers', label: 'Retailers', icon: '🏪', roles: ['admin', 'staff'] },
        { path: '/supply', label: 'Supply Sources', icon: '🚢', roles: ['admin', 'staff'] },
        { path: '/reports', label: 'Reports', icon: '📄', roles: ['admin', 'retailer', 'staff'] },
        { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['admin'] },
        { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin', 'retailer', 'staff'] },
    ];

    const filteredLinks = allLinks.filter(link => link.roles.includes(role));

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    return (
        <aside style={{ 
            width: '240px', 
            background: '#2c3e50', 
            color: '#fff', 
            height: '100vh', 
            position: 'fixed', 
            top: '60px', 
            left: 0,
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ flex: 1 }}>
                {filteredLinks.map(link => (
                    <NavLink 
                        key={link.path} 
                        to={link.path} 
                        style={({ isActive }) => ({
                            display: 'block',
                            padding: '12px 20px',
                            color: isActive ? '#3498db' : '#ecf0f1',
                            textDecoration: 'none',
                            borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
                            background: isActive ? '#34495e' : 'transparent',
                            fontSize: '16px'
                        })}
                    >
                        <span style={{ marginRight: '10px' }}>{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </div>
            
            <button 
                onClick={handleLogout}
                style={{
                    margin: '20px',
                    padding: '12px',
                    background: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                🚪 Logout
            </button>
        </aside>
    );
};

export default Sidebar;
