import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_fish: 0,
        active_retailers: 0,
        price_trends: [],
        category_dist: []
    });
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/dashboard-stats/')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
        
        axios.get('http://127.0.0.1:8000/api/weather/')
            .then(res => setWeather(res.data))
            .catch(err => console.error(err));
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: '#1a2a6c' }}>Lucena Fish Port Dashboard</h1>
                <p style={{ color: '#666' }}>FishLodger System Monitoring Overview</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Previous Stat Cards */}
                <Card style={{ borderLeft: '5px solid #007bff' }}>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>TOTAL FISH SPECIES</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2rem' }}>{stats.total_fish}</h2>
                    <p style={{ margin: 0, color: '#28a745', fontSize: '0.8rem' }}>Available in Port</p>
                </Card>
                <Card style={{ borderLeft: '5px solid #28a745' }}>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>ACTIVE RETAILERS</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2rem' }}>{stats.active_retailers}</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>Lucena Fish Port Complex</p>
                </Card>
                
                {/* Weather Widget */}
                {weather && (
                    <Card style={{ background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.8 }}>PORT WEATHER</p>
                                <h2 style={{ margin: '5px 0', fontSize: '1.8rem' }}>{weather.temp}°C</h2>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>{weather.description}</p>
                            </div>
                            <img 
                                src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                                alt="weather icon" 
                                style={{ width: '60px' }} 
                            />
                        </div>
                        <p style={{ margin: '10px 0 0', fontSize: '0.7rem', opacity: 0.7 }}>
                            Wind: {weather.wind_speed} m/s | Humidity: {weather.humidity}%
                        </p>
                    </Card>
                )}

                <Card style={{ borderLeft: '5px solid #dc3545' }}>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>SYSTEM STATUS</p>
                    <h2 style={{ margin: '10px 0', fontSize: '2rem' }}>Online</h2>
                    <p style={{ margin: 0, color: '#28a745', fontSize: '0.8rem' }}>All services active</p>
                </Card>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <Card title="Avg Price Trend (Last 7 Days)">
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.price_trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="price" stroke="#007bff" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Fish Categories">
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.category_dist}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.category_dist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '0.8rem' }}>
                            {stats.category_dist.map((entry, index) => (
                                <span key={index}><span style={{ color: COLORS[index % COLORS.length] }}>●</span> {entry.name}</span>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
