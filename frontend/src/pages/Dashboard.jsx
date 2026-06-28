import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
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
    const [publicData, setPublicData] = useState(null);
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
                const [statsRes, weatherRes, bulletinRes, publicRes] = await Promise.all([
                    api.get('dashboard-stats/'),
                    api.get('weather/'),
                    api.get('bulletins/'),
                    api.get('public-dashboard/')
                ]);
                setStats(statsRes.data);
                setWeather(weatherRes.data);
                setBulletins(bulletinRes.data);
                setPublicData(publicRes.data);
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
            
            {(() => {
                if (!publicData || !publicData.seasonal_fish || publicData.seasonal_fish.length === 0) return null;
                const bestFish = publicData.seasonal_fish.find(f => f.trend === 'Decrease') || publicData.seasonal_fish[0];
                return (
                    <div className="animate-fade-in-up" style={{ 
                        background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(52, 152, 219, 0.1) 100%)',
                        border: '1px solid var(--success-green)',
                        borderRadius: 'var(--radius-md)',
                        padding: '15px 20px',
                        marginBottom: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <span style={{ fontSize: '2rem' }}>🔥</span>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: 'var(--success-green)', fontSize: '1.1rem' }}>Today's Best Value: {bestFish.fish_name}</h3>
                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                Highly abundant in the port right now. Prices are trending {bestFish.trend.toLowerCase()} to <strong style={{ color: 'var(--accent-cyan)' }}>₱{bestFish.current_price.toFixed(2)}/kg</strong>!
                            </p>
                        </div>
                    </div>
                );
            })()}

            <div className="animate-fade-in-up delay-1" style={{ 
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>PORT ACTIVITY</p>
                            <h2 style={{ margin: '10px 0', fontSize: '2rem', color: 'var(--text-main)' }}>
                                {stats.active_retailers > 20 ? '🟢 VERY BUSY' : stats.active_retailers > 10 ? '🟡 MODERATE' : '🔴 QUIET'}
                            </h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{stats.active_retailers} Stalls Currently Open</p>
                        </div>
                        <button 
                            onClick={() => window.location.href = '/market-map'}
                            style={{
                                padding: '8px 12px',
                                background: 'var(--accent-cyan)',
                                color: 'var(--primary-navy)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(100, 255, 218, 0.3)'
                            }}
                        >
                            📍 FIND A STALL
                        </button>
                    </div>
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
                <div className="animate-fade-in-up delay-2" style={{ marginBottom: '30px' }}>
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
            
{publicData && (
                <>
                    {/* AI Market Outlook */}
                    <div className="animate-fade-in-up delay-4">
                        <Card title={`AI Market Outlook: ${publicData.month}`} style={{ marginBottom: '30px', background: 'rgba(52, 152, 219, 0.05)', border: '1px solid var(--accent-cyan)' }}>
                            <div style={{ padding: '20px', fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-light)' }}>
                                <p>{publicData.outlook}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Catch of the Month */}
                    <div className="animate-fade-in-up delay-5">
                        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid var(--border-industrial)', paddingBottom: '10px', color: 'var(--text-main)' }}>
                            Seasonal Catch of the Month ({publicData.month})
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            {publicData.seasonal_fish.map((fish, index) => (
                                <Card key={index} style={{ textAlign: 'center', padding: '20px' }}>
                                    {fish.image && <img src={`http://localhost:8000${fish.image}`} alt={fish.fish_name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: 'var(--text-main)' }}>{fish.fish_name}</h3>
                                    <p style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', margin: '5px 0' }}>₱{fish.current_price.toFixed(2)} / kg</p>
                                    <p style={{ fontSize: '0.9rem', color: fish.trend === 'Increase' ? '#ff6b6b' : fish.trend === 'Decrease' ? '#2ecc71' : 'var(--text-muted)' }}>
                                        Trend: {fish.trend}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Top 10 Suppliers */}
                    <div className="animate-fade-in-up delay-6">
                        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid var(--border-industrial)', paddingBottom: '10px', color: 'var(--text-main)' }}>
                            Top 10 Supplying Municipalities
                        </h2>
                        <Card style={{ padding: '0', marginBottom: '30px' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-card)', textAlign: 'left', borderBottom: '1px solid var(--border-industrial)' }}>
                                            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Rank</th>
                                            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Municipality</th>
                                            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Volume Delivered (kg)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {publicData.top_suppliers.map((supplier, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid var(--border-industrial)' }}>
                                                <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>#{index + 1}</td>
                                                <td style={{ padding: '15px', color: 'var(--text-main)' }}>{supplier.location}</td>
                                                <td style={{ padding: '15px', color: 'var(--text-main)' }}>{supplier.volume}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            <div className="animate-fade-in-up delay-3" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', 
                gap: '20px',
                marginBottom: '30px'
            }}>
                <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Market Price Index <span title="Shows how the average price of all fish has changed over the past 30 days." style={{ cursor: 'help', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>(?)</span></div>}>
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

                <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Species Volume Distribution <span title="Shows the percentage of each fish type currently available in the port." style={{ cursor: 'help', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>(?)</span></div>}>
                    <div style={{ height: isMobile ? '250px' : '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-industrial)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }} />
                                <Pie 
                                    data={stats.top_species_by_volume} 
                                    dataKey="percentage" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={isMobile ? 50 : 80} 
                                    outerRadius={isMobile ? 80 : 110} 
                                    paddingAngle={5}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {stats.top_species_by_volume && stats.top_species_by_volume.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#64ffda', '#3498db', '#ff9f43', '#ff6b6b', '#10ac84'][index % 5]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {stats.top_species_by_volume && stats.top_species_by_volume.length > 0 && (
                        <p style={{ textAlign: 'center', margin: '10px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            💡 {stats.top_species_by_volume[0].name} makes up the majority of today's supply ({stats.top_species_by_volume[0].percentage.toFixed(0)}%).
                        </p>
                    )}
                </Card>
            </div>
            
            <div className="animate-fade-in-up delay-3" style={{ marginBottom: '30px' }}>
                <Card title="Average Price by Species (Last 30 Days)">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
                        {stats.species_prices && stats.species_prices.map((species, i) => (
                            <div key={i} className="interactive-card" style={{ 
                                padding: '20px 15px', 
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>{species.name}</span>
                                <span style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>₱</span>
                                    {species.price.toFixed(2)}
                                </span>
                                <span style={{ 
                                    fontSize: '0.65rem', 
                                    padding: '4px 12px', 
                                    borderRadius: '20px',
                                    background: species.category === 'freshwater' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                    border: `1px solid ${species.category === 'freshwater' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                                    color: species.category === 'freshwater' ? 'var(--accent-cyan)' : 'var(--success-green)',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px'
                                }}>{species.category}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            
                        <div className="animate-fade-in-up delay-7" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '20px',
                marginBottom: '30px'
            }}>
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

