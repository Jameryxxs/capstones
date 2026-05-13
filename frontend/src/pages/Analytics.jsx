import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
    const [fishes, setFishes] = useState([]);
    const [selectedFish, setSelectedFish] = useState('');
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/fish/')
            .then(res => setFishes(res.data))
            .catch(err => console.error(err));
    }, []);

    const fetchForecast = () => {
        if (!selectedFish) return;
        setLoading(true);
        setError('');
        axios.get(`http://127.0.0.1:8000/api/forecast/${selectedFish}/`)
            .then(res => {
                const formattedData = res.data.map(item => ({
                    date: new Date(item.date).toLocaleDateString(),
                    price: item.predicted_price
                }));
                setForecast(formattedData);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Failed to fetch prediction');
                setLoading(false);
                setForecast([]);
            });
    };

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: '#1a2a6c' }}>Predictive Analytics</h1>
                <p style={{ color: '#666' }}>AI-Driven Price Forecasting for Lucena Fish Port Complex</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <Card title="Forecast Controls">
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Fish Species:</label>
                        <select 
                            value={selectedFish} 
                            onChange={(e) => setSelectedFish(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">-- Select Species --</option>
                            {fishes.map(f => <option key={f.id} value={f.id}>{f.fish_name}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={fetchForecast}
                        disabled={!selectedFish || loading}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            background: '#28a745', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Analyzing Trends...' : 'Generate 7-Day Forecast'}
                    </button>
                    {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '0.9rem' }}>{error}</p>}
                    
                    <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>How it works:</strong> This model uses Linear Regression to analyze historical daily averages from the Lucena Port database to project price movements.
                    </div>
                </Card>

                <Card title="Price Projection Graph">
                    {forecast.length > 0 ? (
                        <div style={{ height: '400px', width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={forecast}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#28a745" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#28a745" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="price" stroke="#28a745" fillOpacity={1} fill="url(#colorPrice)" />
                                </AreaChart>
                            </ResponsiveContainer>
                            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>Predicted Average Price per kg (PHP)</p>
                        </div>
                    ) : (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '2px dashed #ddd', color: '#999' }}>
                            Select a species to visualize the 7-day forecast.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
