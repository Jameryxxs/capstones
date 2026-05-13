import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const links = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/prices', label: 'Fish Prices', icon: '💰' },
        { path: '/retailers', label: 'Retailers', icon: '🏪' },
        { path: '/supply', label: 'Supply Sources', icon: '🚢' },
        { path: '/reports', label: 'Reports', icon: '📄' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];

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
                {links.map(link => (
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
