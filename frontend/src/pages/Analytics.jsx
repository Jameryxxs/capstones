import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import axios from 'axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
    const [fishes, setFishes] = useState([]);
    const [selectedFish, setSelectedFish] = useState('');
    const [activeTab, setActiveTab] = useState('forecast');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Data states
    const [forecastData, setForecastData] = useState([]);
    const [correlationData, setCorrelationData] = useState([]);
    const [seasonalityData, setSeasonalityData] = useState([]);
    const [supplierData, setSupplierData] = useState([]);
    const [compareData, setCompareData] = useState([]);
    const [selectedCompare, setSelectedCompare] = useState([]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        api.get('fish/')
            .then(res => {
                setFishes(res.data);
                if (res.data.length > 0) setSelectedFish(res.data[0].id);
                setInitialLoading(false);
            })
            .catch(err => {
                console.error(err);
                setInitialLoading(false);
            });
            
        // Load global analytics
        api.get('supplier-performance/')
            .then(res => setSupplierData(res.data));

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (selectedFish) {
            fetchAnalyticsForFish();
        }
    }, [selectedFish, activeTab]);

    const fetchAnalyticsForFish = () => {
        if (activeTab === 'comparison' || activeTab === 'suppliers') return;
        setLoading(true);
        setError('');
        
        let endpoint = '';
        if (activeTab === 'forecast') endpoint = `forecast/${selectedFish}/`;
        else if (activeTab === 'correlation') endpoint = `correlation/${selectedFish}/`;
        else if (activeTab === 'seasonality') endpoint = `seasonality/${selectedFish}/`;

        if (!endpoint) {
            setLoading(false);
            return;
        }

        api.get(`${endpoint}`)
            .then(res => {
                if (activeTab === 'forecast') {
                    setForecastData(res.data.map(item => ({
                        date: new Date(item.date).toLocaleDateString(),
                        price: item.predicted_price
                    })));
                } else if (activeTab === 'correlation') {
                    setCorrelationData(res.data);
                } else if (activeTab === 'seasonality') {
                    setSeasonalityData(res.data);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Failed to fetch data');
                setLoading(false);
            });
    };

    const handleCompare = () => {
        if (selectedCompare.length < 2) return;
        setLoading(true);
        const params = selectedCompare.map(id => `ids=${id}`).join('&');
        api.get(`compare-prices/?${params}`)
            .then(res => {
                setCompareData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    if (initialLoading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2rem' }}>Advanced Port Analytics</h1>
                <p style={{ color: 'var(--text-muted)' }}>Market Trends & Supply Chain Insights</p>
            </div>

            {/* Navigation Tabs - Scrollable on mobile */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '25px', 
                overflowX: 'auto', 
                paddingBottom: '10px',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}>
                {['forecast', 'correlation', 'seasonality', 'comparison', 'suppliers'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '25px',
                            border: 'none',
                            background: activeTab === tab ? 'var(--primary-navy)' : 'var(--bg-card)',
                            color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap',
                            boxShadow: activeTab === tab ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', 
                gap: '20px' 
            }}>
                {/* Control Panel */}
                <Card title="Parameters">
                    {(activeTab === 'forecast' || activeTab === 'correlation' || activeTab === 'seasonality') && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>Select Species:</label>
                            <select 
                                value={selectedFish} 
                                onChange={(e) => setSelectedFish(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                            >
                                {fishes.map(f => <option key={f.id} value={f.id}>{f.fish_name}</option>)}
                            </select>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>Select 2-3 Species:</label>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
                                {fishes.map(f => (
                                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCompare.includes(f.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedCompare([...selectedCompare, f.id]);
                                                else setSelectedCompare(selectedCompare.filter(id => id !== f.id));
                                            }}
                                        />
                                        <span style={{ fontSize: '0.85rem' }}>{f.fish_name}</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={handleCompare}
                                disabled={selectedCompare.length < 2 || loading}
                                className="btn-primary"
                                style={{ width: '100%' }}
                            >
                                {loading ? 'Loading...' : 'Compare Prices'}
                            </button>
                        </div>
                    )}

                    <div style={{ padding: '15px', background: 'rgba(52, 152, 219, 0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                        <strong style={{ color: 'var(--primary-navy)' }}>Insight:</strong> {
                            activeTab === 'forecast' ? "Projected price movements based on regression." :
                            activeTab === 'correlation' ? "Relationship between supply volume and market price." :
                            activeTab === 'seasonality' ? "Average monthly supply patterns." :
                            activeTab === 'comparison' ? "Relative market value over time." :
                            "Production volume by fishing ground."
                        }
                    </div>
                </Card>

                {/* Visualization Area */}
                <Card title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Visual`}>
                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LoadingSpinner size="40px" />
                        </div>
                    ) : (
                        <div style={{ height: isMobile ? '300px' : '400px', width: '100%' }}>
                            <ResponsiveContainer>
                                {activeTab === 'forecast' && forecastData.length > 0 ? (
                                    <AreaChart data={forecastData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--success-green)" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="var(--success-green)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="price" stroke="var(--success-green)" fill="url(#colorPrice)" />
                                    </AreaChart>
                                ) : activeTab === 'correlation' && correlationData.length > 0 ? (
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                        <CartesianGrid />
                                        <XAxis type="number" dataKey="supply" name="Supply" unit="kg" tick={{ fontSize: 10 }} />
                                        <YAxis type="number" dataKey="price" name="Price" unit="₱" tick={{ fontSize: 10 }} />
                                        <ZAxis type="number" range={[64, 144]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Market Data" data={correlationData} fill="var(--secondary-blue)" />
                                    </ScatterChart>
                                ) : activeTab === 'seasonality' && seasonalityData.length > 0 ? (
                                    <BarChart data={seasonalityData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Bar dataKey="volume" fill="var(--primary-navy)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : activeTab === 'comparison' && compareData.length > 0 ? (
                                    <LineChart data={compareData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        {!isMobile && <Legend />}
                                        {Object.keys(compareData[0] || {}).filter(k => k !== 'date').map((key, i) => (
                                            <Line 
                                                key={key} 
                                                type="monotone" 
                                                dataKey={key} 
                                                stroke={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][i % 5]} 
                                                strokeWidth={3} 
                                                dot={false}
                                            />
                                        ))}
                                    </LineChart>
                                ) : activeTab === 'suppliers' && supplierData.length > 0 ? (
                                    <BarChart data={supplierData} layout="vertical" margin={{ left: isMobile ? 10 : 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10 }} />
                                        <YAxis dataKey="location" type="category" tick={{ fontSize: 10 }} width={isMobile ? 80 : 120} />
                                        <Tooltip />
                                        <Bar dataKey="volume" fill="var(--success-green)" name="Volume (kg)" />
                                    </BarChart>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                        <p style={{ fontSize: '0.9rem' }}>No data available.</p>
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
