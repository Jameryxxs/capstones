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
        species_prices: [],
        alerts: [],
        sentiment: 'Stable'
    });
    const [weather, setWeather] = useState(null);
    const [mapData, setMapData] = useState({ locations: [], boats: [] });
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

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/updates/`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'VESSEL_LOCATION_UPDATE') {
                    setMapData(prev => {
                        const boats = prev.boats || [];
                        const existingBoatIndex = boats.findIndex(b => b.id === data.id);
                        
                        let newBoats = [...boats];
                        
                        if (existingBoatIndex >= 0) {
                            // Update existing boat
                            newBoats[existingBoatIndex] = { ...newBoats[existingBoatIndex], lat: data.lat, lng: data.lng, status: data.status };
                        } else {
                            // Add new boat
                            newBoats.push({
                                id: data.id,
                                name: data.name,
                                supplier: data.supplier,
                                lat: data.lat,
                                lng: data.lng,
                                status: data.status,
                                origin: data.origin
                            });
                        }
                        
                        // Remove boats that have arrived
                        newBoats = newBoats.filter(b => b.status === 'in_transit' || b.status === 'at_sea');
                        
                        return { ...prev, boats: newBoats };
                    });
                }
            } catch (err) {
                console.error("WebSocket message error:", err);
            }
        };

        return () => {
            if (ws.readyState === 1) ws.close();
        };
    }, []);

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
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: isMobile ? '1.5rem' : '2rem', letterSpacing: '2px' }}>
                        LIVE INTEL // <span style={{ color: 'var(--accent-cyan)' }}>MONITORING</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Geographic Supply Tracking & Anomaly Detection
                    </p>
                </div>
                <div style={{ 
                    display: 'flex', 
                    background: 'var(--secondary-blue)', 
                    padding: '4px', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-industrial)',
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
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: category === cat ? 'var(--accent-cyan)' : 'transparent',
                                color: category === cat ? 'var(--primary-navy)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: '800',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: '1px',
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
                <Card interactive style={{ borderTop: `4px solid ${stats.sentiment.includes('Bullish') ? 'var(--success-green)' : stats.sentiment.includes('Bearish') ? 'var(--danger-red)' : 'var(--accent-cyan)'}` }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>MARKET SENTIMENT</p>
                    <h2 style={{ margin: '10px 0', fontSize: '1.4rem', color: stats.sentiment.includes('Bullish') ? 'var(--success-green)' : stats.sentiment.includes('Bearish') ? 'var(--danger-red)' : 'var(--accent-cyan)' }}>
                        {stats.sentiment.includes('Bullish') ? '📈 ' : stats.sentiment.includes('Bearish') ? '📉 ' : '➖ '}
                        {stats.sentiment}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '500' }}>Next 24h Outlook</p>
                </Card>
                <Card interactive style={{ borderTop: '4px solid var(--safety-orange)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>DAILY IMPORT VOLUME</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2.2rem', color: 'var(--text-main)' }}>
                        {stats.supply_trends.length > 0 ? stats.supply_trends[stats.supply_trends.length - 1].volume.toLocaleString() : 0} KG
                    </h2>
                    <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ LIVE_ARRIVALS</p>
                </Card>
                <Card interactive style={{ borderTop: '4px solid var(--accent-cyan)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>ACTIVE SPECIES</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2.2rem', color: 'var(--text-main)' }}>{stats.total_fish}</h2>
                    <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ FILTERED_VIEW</p>
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
                            
                            {/* Static Fishing Locations */}
                            {mapData.locations?.map(loc => (
                                <React.Fragment key={`loc-frag-${loc.id}`}>
                                    <CircleMarker 
                                        center={[loc.lat, loc.lng]} 
                                        radius={Math.max(15, Math.sqrt(loc.volume) / 10)}
                                        fillColor="var(--safety-orange)"
                                        color="var(--safety-orange)"
                                        weight={1}
                                        fillOpacity={0.15}
                                    />
                                    <Marker 
                                        position={[loc.lat, loc.lng]}
                                        icon={L.divIcon({
                                            className: 'supplier-icon',
                                            html: `<div style="
                                                display: flex;
                                                justify-content: center;
                                                align-items: center;
                                                width: 24px;
                                                height: 24px;
                                                background: var(--bg-card);
                                                border: 2px solid var(--safety-orange);
                                                border-radius: 6px;
                                                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                                            ">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--safety-orange)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
                                            </div>`,
                                            iconSize: [24, 24],
                                            iconAnchor: [12, 12]
                                        })}
                                    >
                                        <Popup>
                                            <strong style={{ color: 'var(--safety-orange)' }}>{loc.name} (Source Port)</strong><br/>
                                            Total Volume: {loc.volume.toLocaleString()} kg
                                        </Popup>
                                    </Marker>
                                </React.Fragment>
                            ))}

                            {/* Active Boats In Transit */}
                            {mapData.boats?.map(boat => (
                                <Marker 
                                    key={`boat-${boat.id}`} 
                                    position={[boat.lat, boat.lng]}
                                    icon={L.divIcon({
                                        className: 'boat-icon',
                                        html: `<div style="
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            width: 32px;
                                            height: 32px;
                                            background: var(--bg-card);
                                            border: 2px solid var(--accent-cyan);
                                            border-radius: 50%;
                                            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                                            transform: rotate(${boat.status === 'in_transit' ? '45deg' : '0deg'});
                                        ">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-cyan)" stroke="var(--primary-navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 3.2-1.5 5.5-1.5 2.3 0 3 1.5 5.5 1.5 1.3 0 1.9-.5 2.5-1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>
                                        </div>`,
                                        iconSize: [30, 30],
                                        iconAnchor: [15, 15]
                                    })}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '150px' }}>
                                            <h4 style={{ margin: '0 0 5px' }}>{boat.name}</h4>
                                            <p style={{ margin: '0 0 3px', fontSize: '0.8rem' }}><strong>Status:</strong> <span style={{ color: boat.status === 'in_transit' ? 'var(--secondary-blue)' : 'var(--success-green)', fontWeight: 'bold' }}>{boat.status.replace('_', ' ').toUpperCase()}</span></p>
                                            <p style={{ margin: '0 0 3px', fontSize: '0.8rem' }}><strong>Supplier:</strong> {boat.supplier}</p>
                                            <p style={{ margin: '0 0 3px', fontSize: '0.8rem' }}><strong>Origin:</strong> {boat.origin}</p>
                                            {boat.status === 'in_transit' && (() => {
                                                const dLat = (13.90683 - boat.lat) * Math.PI / 180;
                                                const dLon = (121.62608 - boat.lng) * Math.PI / 180;
                                                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                                    Math.cos(boat.lat * Math.PI / 180) * Math.cos(13.90683 * Math.PI / 180) * 
                                                    Math.sin(dLon/2) * Math.sin(dLon/2); 
                                                const distance = 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
                                                
                                                const timeHours = distance / 20; // 20 km/h average boat speed
                                                const hrs = Math.floor(timeHours);
                                                const mins = Math.round((timeHours - hrs) * 60);
                                                const etaStr = timeHours < 0.1 ? "Arriving shortly" : (hrs === 0 ? `${mins} mins` : `${hrs}h ${mins}m`);
                                                
                                                return (
                                                    <>
                                                        <hr style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '5px 0' }} />
                                                        <p style={{ margin: '0 0 3px', fontSize: '0.8rem' }}><strong>Distance to Port:</strong> {distance.toFixed(1)} km</p>
                                                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#0984e3', fontWeight: 'bold' }}><strong>ETA:</strong> {etaStr}</p>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </Popup>
                                </Marker>
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

            <Card title="Current Market Averages">
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px',
                    marginTop: '20px'
                }}>
                    {stats.species_prices && stats.species_prices.map((s, i) => (
                        <div key={i} style={{ 
                            padding: '20px', 
                            background: 'var(--bg-main)', 
                            borderRadius: '15px', 
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            alignItems: 'center',
                            justifyContent: isMobile ? 'space-between' : 'center',
                            gap: '10px',
                            borderTop: '4px solid var(--accent-cyan)'
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>🏷️</div>
                            <h4 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '0.9rem' }}>{s.name}</h4>
                            <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem' }}>₱{s.price.toLocaleString()}</p>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                                {s.category}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default LiveMonitoring;

