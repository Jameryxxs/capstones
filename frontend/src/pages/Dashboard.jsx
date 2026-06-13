import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import BulletinBoard from '../components/BulletinBoard';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_fish: 0,
        active_retailers: 0,
        price_trends: [],
        category_dist: [],
        alerts: []
    });
    const [bulletins, setBulletins] = useState([]);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [realtimeUpdates, setRealtimeUpdates] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('resize', handleResize);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const fetchData = async () => {
            try {
                const [statsRes, weatherRes, bulletinRes] = await Promise.all([
                    api.get('dashboard-stats/'),
                    api.get('weather/'),
                    api.get('bulletins/')
                ]);
                setStats(statsRes.data);
                setWeather(weatherRes.data);
                setBulletins(bulletinRes.data);
                if (statsRes.data.latest_activities) {
                    setRealtimeUpdates(statsRes.data.latest_activities);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Always automatically update weather data every 5 minutes
        const weatherInterval = setInterval(async () => {
            try {
                const res = await api.get('weather/');
                setWeather(res.data);
            } catch (err) {
                console.error("Weather poll error:", err);
            }
        }, 300000); // 5 minutes

        // WebSocket for Real-time Updates
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // Using port 8000 for backend dev server
        const wsUrl = `${protocol}://${window.location.hostname}:8000/ws/updates/`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'WEATHER_UPDATE') {
                setWeather(data.weather);
                return;
            }

            setRealtimeUpdates(prev => [
                { ...data, timestamp: new Date().toLocaleTimeString() }, 
                ...prev
            ].slice(0, 15));
            
            // Auto-refresh stats on major updates
            if (data.type === 'PRICE_UPDATE' || data.type === 'DELIVERY_UPDATE') {
                api.get('dashboard-stats/').then(res => setStats(res.data));
            }
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(weatherInterval);
            socket.close();
        };
    }, []);

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: isMobile ? '1.5rem' : '2rem', letterSpacing: '2px' }}>
                        COMMAND CENTER // <span style={{ color: 'var(--accent-cyan)' }}>OVERVIEW</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Lucena Fish Port Operational Status
                    </p>
                </div>
                <div style={{ 
                    padding: '8px 15px', 
                    borderRadius: '20px', 
                    background: isOnline ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                    color: isOnline ? 'var(--success-green)' : 'var(--fail-red)',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: `1px solid ${isOnline ? 'var(--success-green)' : 'var(--fail-red)'}`,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {isOnline ? '● NETWORK ONLINE' : '○ OFFLINE MODE'}
                </div>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '20px', 
                marginBottom: '30px' 
            }}>
                <Card interactive style={{ borderTop: '4px solid var(--accent-cyan)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>TOTAL SPECIES</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2.5rem', color: 'var(--text-main)' }}>{stats.total_fish}</h2>
                    <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ DATABASE SYNCED</p>
                </Card>
                <Card interactive style={{ borderTop: '4px solid var(--success-green)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>ACTIVE RETAILERS</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2.5rem', color: 'var(--text-main)' }}>{stats.active_retailers}</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>Verified stall operations</p>
                </Card>
                
                {weather && (
                    <Card interactive style={{ background: 'var(--secondary-blue)', border: 'none', borderTop: '4px solid #48dbfb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px' }}>METEOROLOGICAL DATA</p>
                                <h2 style={{ margin: '5px 0', fontSize: '2rem', color: 'var(--accent-cyan)' }}>{weather.temp}°C</h2>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', textTransform: 'uppercase', fontWeight: 'bold' }}>{weather.description}</p>
                                <p style={{ margin: '5px 0 0', fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>🌧️ CHANCE OF RAIN: {weather.rain_chance || 0}%</p>
                            </div>
                            <img 
                                src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                                alt="w" 
                                style={{ width: '50px', filter: 'brightness(1.5)' }} 
                            />
                        </div>
                    </Card>
                )}

                {realtimeUpdates.length > 0 && (
                    <Card interactive style={{ borderTop: '4px solid var(--accent-cyan)', background: 'rgba(100, 255, 218, 0.05)' }}>
                        <p style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>LIVE ACTIVITY</p>
                        <div style={{ marginTop: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                            {realtimeUpdates.map((update, i) => (
                                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: '8px', borderBottom: '1px solid rgba(100, 255, 218, 0.1)', paddingBottom: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>{update.fish_name}</span>
                                            <span style={{ 
                                                fontSize: '0.55rem', 
                                                padding: '1px 5px', 
                                                borderRadius: '10px',
                                                border: `1px solid ${update.category === 'freshwater' ? 'var(--accent-cyan)' : 'var(--secondary-blue)'}`,
                                                color: update.category === 'freshwater' ? 'var(--accent-cyan)' : 'var(--secondary-blue)',
                                                textTransform: 'uppercase'
                                            }}>
                                                {update.category}
                                            </span>
                                        </div>
                                        <span style={{ color: 'var(--accent-cyan)' }}>
                                            {update.type === 'PRICE_UPDATE' ? `₱${update.price}/kg` : `${update.quantity}kg`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                        <span>{update.retailer || update.source}</span>
                                        <span>{update.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Weather & Operational Alerts */}
            {stats.alerts && stats.alerts.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    {stats.alerts.map((alert, i) => (
                        <div key={i} style={{ 
                            padding: '15px 20px', 
                            background: alert.severity === 'high' ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255, 159, 67, 0.1)',
                            borderLeft: `5px solid ${alert.severity === 'high' ? 'var(--fail-red)' : 'var(--safety-orange)'}`,
                            color: 'var(--text-main)',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            animation: alert.severity === 'high' ? 'pulse-alert 2s infinite' : 'none'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{alert.type === 'weather' ? '⚠️' : '📊'}</span>
                            <div>
                                <strong style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: alert.severity === 'high' ? 'var(--fail-red)' : 'var(--safety-orange)' }}>
                                    {alert.type} ALERT // {alert.severity}
                                </strong>
                                <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', 
                gap: '20px',
                marginBottom: '30px'
            }}>
                <Card title="Market Price Index">
                    <div style={{ height: isMobile ? '250px' : '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.price_trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-industrial)' }} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-industrial)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-industrial)', color: 'var(--text-main)' }} />
                                <Line type="stepAfter" dataKey="price" stroke="var(--accent-cyan)" strokeWidth={2} dot={{ r: 4, fill: 'var(--accent-cyan)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <BulletinBoard bulletins={bulletins} />
            </div>

            <style>
                {`
                @keyframes pulse-alert {
                    0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 71, 87, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
                }
                `}
            </style>
        </div>
    );
};

export default Dashboard;

