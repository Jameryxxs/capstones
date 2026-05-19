import React, { useState, useEffect } from 'react';
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
                    axios.get('http://127.0.0.1:8000/api/dashboard-stats/'),
                    axios.get('http://127.0.0.1:8000/api/weather/')
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>Lucena Fish Port</h1>
                <p style={{ color: 'var(--text-muted)' }}>System Monitoring Overview</p>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '20px', 
                marginBottom: '30px' 
            }}>
                <Card interactive style={{ borderLeft: '5px solid #007bff' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>TOTAL SPECIES</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2rem', color: 'var(--primary-navy)' }}>{stats.total_fish}</h2>
                    <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.8rem', fontWeight: '500' }}>In Port</p>
                </Card>
                <Card interactive style={{ borderLeft: '5px solid #28a745' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>ACTIVE RETAILERS</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2rem', color: 'var(--primary-navy)' }}>{stats.active_retailers}</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Verified stalls</p>
                </Card>
                
                {weather && (
                    <Card interactive style={{ background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--secondary-blue) 100%)', color: '#fff', border: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', opacity: 0.9 }}>PORT WEATHER</p>
                                <h2 style={{ margin: '5px 0', fontSize: '1.8rem', color: '#fff' }}>{weather.temp}°C</h2>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>{weather.description}</p>
                            </div>
                            <img 
                                src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                                alt="w" 
                                style={{ width: '45px' }} 
                            />
                        </div>
                    </Card>
                )}

                {!isMobile && (
                    <Card interactive style={{ borderLeft: '5px solid var(--danger-red)' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>SYSTEM STATUS</p>
                        <h2 style={{ margin: '10px 0', fontSize: '2rem', color: 'var(--primary-navy)' }}>Online</h2>
                        <p style={{ margin: 0, color: 'var(--success-green)', fontSize: '0.8rem' }}>All services active</p>
                    </Card>
                )}
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
                gap: '20px' 
            }}>
                <Card title="Avg Price Trend">
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

                <Card title="Categories">
                    <div style={{ height: isMobile ? '200px' : '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.category_dist}
                                    innerRadius={isMobile ? 50 : 70}
                                    outerRadius={isMobile ? 70 : 90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.category_dist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                            {stats.category_dist.map((entry, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
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
