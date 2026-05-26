import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import axios from 'axios';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LiveMonitoring = () => {
    const [stats, setStats] = useState({
        total_fish: 0,
        active_retailers: 0,
        price_trends: [],
        supply_trends: [],
        category_dist: [],
        top_species_by_volume: [],
        alerts: [],
        sentiment: 'Stable'
    });
    const [weather, setWeather] = useState(null);
    const [mapData, setMapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, weatherRes, mapRes] = await Promise.all([
                    api.get(`dashboard-stats/?category=${category}`),
                    api.get('weather/'),
                    api.get('map-data/')
                ]);
                setStats(statsRes.data);
                setWeather(weatherRes.data);
                setMapData(mapRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        return () => window.removeEventListener('resize', handleResize);
    }, [category]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading && stats.total_fish === 0) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            {/* Header with Category Filter */}
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                marginBottom: '30px',
                gap: '15px'
            }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2rem' }}>Live Market Insights</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitoring & Geographic Supply Tracking</p>
                </div>
                <div style={{ 
                    display: 'flex', 
                    background: 'var(--bg-main)', 
                    padding: '4px', 
                    borderRadius: '30px', 
                    border: '1px solid var(--border-light)',
                    width: isMobile ? '100%' : 'auto',
                    overflowX: 'auto'
                }}>
                    {['all', 'freshwater', 'saltwater'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                flex: isMobile ? 1 : 'none',
                                padding: '8px 16px',
                                borderRadius: '25px',
                                border: 'none',
                                background: category === cat ? 'var(--primary-navy)' : 'transparent',
                                color: category === cat ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '20px', 
                marginBottom: '30px' 
            }}>
                <Card interactive style={{ borderLeft: '5px solid #28a745' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>MARKET SENTIMENT</p>
                    <h2 style={{ margin: '10px 0', fontSize: '1.4rem', color: 'var(--primary-navy)' }}>{stats.sentiment}</h2>
                    <p style={{ margin: 0, color: 'var(--secondary-blue)', fontSize: '0.8rem', fontWeight: '500' }}>Next 24h Outlook</p>
                </Card>
                <Card interactive style={{ borderLeft: '5px solid #ffc107' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>DAILY IMPORT VOLUME</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
                        {stats.supply_trends.length > 0 ? stats.supply_trends[stats.supply_trends.length - 1].volume.toLocaleString() : 0} kg
                    </h2>
                    <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.8rem', fontWeight: '500' }}>Live arrivals</p>
                </Card>
                <Card interactive style={{ borderLeft: '5px solid #007bff' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>ACTIVE SPECIES</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2.2rem', color: 'var(--primary-navy)' }}>{stats.total_fish}</h2>
                    <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.8rem', fontWeight: '500' }}>Filtered view</p>
                </Card>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
                gap: '20px', 
                marginBottom: '20px' 
            }}>
                <Card title="Market Alerts">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {stats.alerts.length > 0 ? stats.alerts.map((alert, i) => (
                            <div key={i} style={{ 
                                padding: '15px', 
                                borderRadius: '12px', 
                                background: alert.severity === 'high' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                                borderLeft: `5px solid ${alert.severity === 'high' ? 'var(--danger-red)' : '#f1c40f'}`
                            }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: alert.severity === 'high' ? 'var(--danger-red)' : '#d4ac0d' }}>
                                    {alert.type} Alert
                                </span>
                                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{alert.message}</p>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                ✅ No market anomalies detected.
                            </div>
                        )}
                    </div>
                </Card>

                {!isMobile && (
                    <Card title="Fish Categories">
                        <div style={{ height: '200px', width: '100%' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={stats.category_dist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {stats.category_dist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '20px', 
                marginBottom: '20px' 
            }}>
                <Card title="Price Performance">
                    <div style={{ height: isMobile ? '250px' : '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.price_trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="price" stroke="var(--secondary-blue)" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Live Supply Map">
                    <div style={{ height: isMobile ? '300px' : '300px', borderRadius: '12px', overflow: 'hidden' }}>
                        <MapContainer center={[13.9, 121.7]} zoom={8} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {mapData.map(loc => (
                                <CircleMarker 
                                    key={loc.id} 
                                    center={[loc.lat, loc.lng]} 
                                    radius={Math.sqrt(loc.volume) / 10}
                                    fillColor="var(--success-green)"
                                    color="white"
                                    weight={1}
                                    fillOpacity={0.6}
                                >
                                    <Popup>
                                        <strong>{loc.name}</strong><br/>
                                        Volume: {loc.volume.toLocaleString()} kg
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </Card>
            </div>

            <Card title="Top Imported Species">
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px'
                }}>
                    {stats.top_species_by_volume.map((s, i) => (
                        <div key={i} style={{ 
                            padding: '20px', 
                            background: 'var(--bg-main)', 
                            borderRadius: '15px', 
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            alignItems: 'center',
                            justifyContent: isMobile ? 'space-between' : 'center',
                            gap: '10px'
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>🐟</div>
                            <h4 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '0.9rem' }}>{s.name}</h4>
                            <p style={{ margin: 0, fontWeight: '700', color: 'var(--success-green)', fontSize: '1.1rem' }}>{s.volume.toLocaleString()} kg</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default LiveMonitoring;
