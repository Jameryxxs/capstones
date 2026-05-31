import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_fish: 0,
        active_retailers: 0,
        price_trends: [],
        category_dist: []
    });
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        const fetchData = async () => {
            try {
                const [statsRes, weatherRes] = await Promise.all([
                    api.get('dashboard-stats/'),
                    api.get('weather/')
                ]);
                setStats(statsRes.data);
                setWeather(weatherRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const COLORS = ['#64ffda', '#48dbfb', '#ff9f43', '#ff6b6b'];

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: isMobile ? '1.5rem' : '2rem', letterSpacing: '2px' }}>
                    COMMAND_CENTER // <span style={{ color: 'var(--accent-cyan)' }}>OVERVIEW</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Lucena Fish Port Operational Status
                </p>
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
                    <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ DATABASE_SYNCED</p>
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
                                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px' }}>METEOROLOGICAL_DATA</p>
                                <h2 style={{ margin: '5px 0', fontSize: '2rem', color: 'var(--accent-cyan)' }}>{weather.temp}°C</h2>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', textTransform: 'uppercase' }}>{weather.description}</p>
                            </div>
                            <img 
                                src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                                alt="w" 
                                style={{ width: '50px', filter: 'brightness(1.5)' }} 
                            />
                        </div>
                    </Card>
                )}

                {!isMobile && (
                    <Card interactive style={{ borderTop: '4px solid var(--safety-orange)' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>SYSTEM_UPLINK</p>
                        <h2 style={{ margin: '10px 0', fontSize: '2.5rem', color: 'var(--text-main)' }}>ONLINE</h2>
                        <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ ALL_SYSTEMS_GO</p>
                    </Card>
                )}
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
                gap: '20px' 
            }}>
                <Card title="Market_Price_Index">
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

                <Card title="Specimen_Diversity">
                    <div style={{ height: isMobile ? '200px' : '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.category_dist}
                                    innerRadius={isMobile ? 50 : 70}
                                    outerRadius={isMobile ? 70 : 90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="var(--bg-card)"
                                    strokeWidth={2}
                                >
                                    {stats.category_dist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-industrial)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                            {stats.category_dist.map((entry, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <div style={{ width: '8px', height: '8px', background: COLORS[index % COLORS.length] }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
