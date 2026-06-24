import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, BarChart, Bar, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomTooltip = ({ active, payload, label, activeTab }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-industrial)', padding: '10px', borderRadius: '5px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.85rem' }}>{label}</p>
                {payload.map((entry, index) => {
                    let valueStr = entry.value;
                    const nameLower = (entry.name || '').toLowerCase();
                    if (activeTab === 'forecast' || activeTab === 'comparison' || nameLower.includes('price')) {
                        valueStr = `â‚±${parseFloat(entry.value).toFixed(2)}`;
                    } else if (activeTab === 'seasonality' || activeTab === 'suppliers' || nameLower.includes('supply') || nameLower.includes('volume')) {
                        valueStr = `${entry.value} kg`;
                    }
                    
                    return (
                        <p key={index} style={{ margin: 0, color: entry.color || 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                            {entry.name || 'Value'}: {valueStr}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

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
    const [compareData, setCompareData] = useState(null);
    const [compareFish1, setCompareFish1] = useState('');
    const [compareFish2, setCompareFish2] = useState('');
    const [historicalData, setHistoricalData] = useState([]);
    const [stabilityData, setStabilityData] = useState({ status: 'Stable', volatility: 0 });
    const [aiReport, setAiReport] = useState(null);
    const [generatingReport, setGeneratingReport] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        api.get('fish/')
            .then(res => {
                setFishes(res.data);
                if (res.data.length > 0) {
                    setSelectedFish(res.data[0].id);
                    setCompareFish1(res.data[0].id);
                    if (res.data.length > 1) {
                        setCompareFish2(res.data[1].id);
                    } else {
                        setCompareFish2(res.data[0].id);
                    }
                }
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
        if (!selectedFish || activeTab === 'ai_report') return;
        
        const abortController = new AbortController();
        const signal = abortController.signal;

        if (activeTab === 'comparison' || activeTab === 'suppliers') return;
        
        setLoading(true);
        setError('');
        
        let endpoint = '';
        if (activeTab === 'forecast') endpoint = `forecast/${selectedFish}/`;
        else if (activeTab === 'correlation') endpoint = `correlation/${selectedFish}/`;
        else if (activeTab === 'seasonality') endpoint = `seasonality/${selectedFish}/`;
        else if (activeTab === 'historical_comparison') endpoint = `historical-comparison/${selectedFish}/`;

        if (!endpoint) {
            setLoading(false);
            return;
        }

        api.get(`${endpoint}`, { signal })
            .then(res => {
                if (activeTab === 'forecast') {
                    setForecastData(res.data.forecast.map(item => ({
                        date: new Date(item.date).toLocaleDateString(),
                        price: item.predicted_price,
                        trend: item.trend
                    })));
                    setStabilityData({ status: res.data.stability, volatility: res.data.volatility });
                } else if (activeTab === 'correlation') {
                    setCorrelationData(res.data);
                } else if (activeTab === 'seasonality') {
                    setSeasonalityData(res.data);
                } else if (activeTab === 'historical_comparison') {
                    setHistoricalData(res.data);
                }
                setLoading(false);
            })
            .catch(err => {
                if (err.name === 'CanceledError' || err.message === 'canceled') return;
                setError(err.response?.data?.error || 'Failed to fetch data');
                setLoading(false);
            });
            
        return () => {
            abortController.abort();
        };
    }, [selectedFish, activeTab]);

    const handleCompare = () => {
        if (!compareFish1 || !compareFish2) return;
        setLoading(true);
        api.get(`compare-prices/?fish_id_1=${compareFish1}&fish_id_2=${compareFish2}`)
            .then(res => {
                setCompareData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const getDynamicInsight = () => {
        if (loading) return "Analyzing data patterns...";
        if (error) return "Unable to generate insights due to data error.";

        const currentFishName = fishes.find(f => f.id === parseInt(selectedFish))?.fish_name || 'this species';

        if (activeTab === 'forecast') {
            if (!forecastData || forecastData.length < 2) return "Insufficient data to project price movements.";
            const firstPrice = forecastData[0].price;
            const lastPrice = forecastData[forecastData.length - 1].price;
            const diff = lastPrice - firstPrice;
            const percent = firstPrice > 0 ? (diff / firstPrice) * 100 : 0;
            
            let insight = `AI Projection indicates a ${percent > 2 ? 'bullish' : percent < -2 ? 'bearish' : 'stable'} trend for ${currentFishName}, with prices expected to ${percent > 2 ? 'rise' : percent < -2 ? 'drop' : 'hover'} around â‚±${lastPrice.toFixed(2)}.`;
            insight += ` Based on recent historical variance of ${stabilityData.volatility}%, this market is classified as ${stabilityData.status.toUpperCase()}. (Variance < 5% is Stable, > 5% is Unstable).`;
            return insight;
        }

        if (activeTab === 'correlation') {
            if (!correlationData || correlationData.length < 3) return "Gathering more data points to identify supply-price correlation.";
            const avgSupply = correlationData.reduce((acc, curr) => acc + curr.supply, 0) / correlationData.length;
            const avgPrice = correlationData.reduce((acc, curr) => acc + curr.price, 0) / correlationData.length;
            return `Analysis shows ${currentFishName} averages â‚±${avgPrice.toFixed(2)} when daily supply sits around ${Math.round(avgSupply)} kg. Notice how price fluctuates during volume extremes.`;
        }

        if (activeTab === 'seasonality') {
            if (!seasonalityData || seasonalityData.length === 0) return "Not enough historical data to map seasonal trends.";
            let peakMonth = seasonalityData[0];
            for (let i = 1; i < seasonalityData.length; i++) {
                if (seasonalityData[i].volume > peakMonth.volume) peakMonth = seasonalityData[i];
            }
            return `Historical AI analysis identifies ${peakMonth.month} as the peak harvest season for ${currentFishName}, yielding average volumes of ${Math.round(peakMonth.volume)} kg.`;
        }

        if (activeTab === 'historical_comparison') {
            if (!historicalData || historicalData.length === 0) return "Gathering historical data points.";
            return `Comparing current month performance of ${currentFishName} against the previous month. Notice changes in seasonal supply impacting price points.`;
        }

        if (activeTab === 'comparison') {
            if (!compareData || !compareData.chart_data || compareData.chart_data.length === 0) return "Select two species to compare market behaviors.";
            
            const f1 = compareData.fish1_name;
            const f2 = compareData.fish2_name;
            const lastPoint = compareData.chart_data[compareData.chart_data.length - 1];
            
            const price1 = lastPoint[f1];
            const price2 = lastPoint[f2];
            
            if (price1 === null || price2 === null) return `Not enough recent data to compare ${f1} and ${f2}.`;
            
            if (price1 > price2) {
                const diff = price1 - price2;
                return `Species Comparison Analysis: ${f1} is currently trading at a premium of â‚±${diff.toFixed(2)} higher than ${f2}.`;
            } else if (price2 > price1) {
                const diff = price2 - price1;
                return `Species Comparison Analysis: ${f2} is currently trading at a premium of â‚±${diff.toFixed(2)} higher than ${f1}.`;
            }
            return `Species Comparison Analysis: ${f1} and ${f2} are currently trading at the exact same market price.`;
        }

        if (activeTab === 'suppliers') {
            if (!supplierData || supplierData.length === 0) return "Aggregating supplier performance metrics.";
            const topSupplier = supplierData[0]; 
            return `AI Performance Matrix ranks ${topSupplier.location} as your highest-yielding fishing ground, contributing ${topSupplier.volume} kg to port operations.`;
        }

        return "AI is ready to analyze your selections.";
    };

    if (initialLoading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: isMobile ? '1.5rem' : '2rem', letterSpacing: '2px' }}>
                    DATA ANALYSIS // <span style={{ color: 'var(--accent-cyan)' }}>INSIGHTS</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Market Correlations & Predictive Forecasting
                </p>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '25px', 
                overflowX: 'auto', 
                paddingBottom: '10px',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}>
                {[
                    { id: 'forecast', label: 'Price Trends (Forecast)' }, 
                    { id: 'correlation', label: 'Correlation' }, 
                    { id: 'seasonality', label: 'Seasonal Analytics' }, 
                    { id: 'comparison', label: 'Species Comparison' }, 
                    { id: 'historical_comparison', label: 'Historical Comparison' },
                    { id: 'suppliers', label: 'Suppliers' },
                    { id: 'ai_report', label: 'AI Comprehensive Report' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 'var(--radius-sm)',
                            border: activeTab === tab.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-industrial)',
                            background: activeTab === tab.id ? 'rgba(100, 255, 218, 0.1)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            letterSpacing: '1px',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap',
                            boxShadow: activeTab === tab.id ? '0 0 10px rgba(100, 255, 218, 0.2)' : 'none'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', 
                gap: '20px' 
            }}>
                {activeTab !== 'ai_report' && (
                <Card title="Parameters">
                    {(activeTab === 'forecast' || activeTab === 'correlation' || activeTab === 'seasonality' || activeTab === 'historical_comparison') && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>Select_Species:</label>
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
                        <div style={{ padding: '15px', background: 'var(--bg-main)', borderTop: '1px solid var(--border-industrial)', borderBottom: '1px solid var(--border-industrial)' }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary-navy)' }}>SPECIES COMPARISON SETTINGS</h4>
                            
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.7rem', color: 'var(--text-muted)' }}>SPECIES 1 (BASE)</label>
                                    <select 
                                        value={compareFish1} 
                                        onChange={(e) => setCompareFish1(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                    >
                                        {fishes.map(f => <option key={f.id} value={f.id}>{f.fish_name}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.7rem', color: 'var(--text-muted)' }}>SPECIES 2 (TARGET)</label>
                                    <select 
                                        value={compareFish2} 
                                        onChange={(e) => setCompareFish2(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                    >
                                        {fishes.map(f => <option key={f.id} value={f.id}>{f.fish_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleCompare}
                                disabled={!compareFish1 || !compareFish2 || loading}
                                className="btn-primary"
                                style={{ width: '100%' }}
                            >
                                {loading ? 'Loading...' : 'Compare Species Behavior'}
                            </button>
                        </div>
                    )}

                    <div style={{ padding: '15px', background: 'rgba(52, 152, 219, 0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                        <strong style={{ color: 'var(--primary-navy)' }}>âœ¨ AI Insight:</strong> {getDynamicInsight()}
                    </div>
                </Card>
                )}

                {/* AI Report Section */}
                {activeTab === 'ai_report' && (
                    <Card title="Generative AI Market Report" style={{ marginBottom: '30px' }}>
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Generate a comprehensive market insight report summarizing overall port activity, price anomalies, and logistics using Google's Gemini AI.
                            </p>
                            <button 
                                onClick={() => {
                                    setGeneratingReport(true);
                                    api.get('generate-report/')
                                        .then(res => {
                                            setAiReport(res.data.report);
                                            setGeneratingReport(false);
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            setGeneratingReport(false);
                                            alert("Failed to generate report.");
                                        });
                                }}
                                disabled={generatingReport}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'var(--accent-cyan)',
                                    color: 'var(--bg-main)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 'bold',
                                    cursor: generatingReport ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease',
                                    opacity: generatingReport ? 0.7 : 1
                                }}
                            >
                                {generatingReport ? 'Generating Report...' : 'Generate Comprehensive Report'}
                            </button>
                        </div>
                        
                        {aiReport && (
                            <div style={{ 
                                marginTop: '20px', 
                                padding: '25px', 
                                background: 'rgba(255, 255, 255, 0.02)', 
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-industrial)',
                                color: 'var(--text-main)',
                                lineHeight: '1.8'
                            }}>
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 style={{color: 'var(--accent-cyan)', borderBottom: '1px solid var(--border-industrial)', paddingBottom: '10px'}} {...props} />,
                                        h2: ({node, ...props}) => <h2 style={{color: '#fff', marginTop: '20px'}} {...props} />,
                                        ul: ({node, ...props}) => <ul style={{paddingLeft: '20px', color: 'var(--text-muted)'}} {...props} />,
                                        li: ({node, ...props}) => <li style={{marginBottom: '5px'}} {...props} />
                                    }}
                                >
                                    {aiReport}
                                </ReactMarkdown>
                            </div>
                        )}
                    </Card>
                )}

                {/* Visualization Area */}
                {activeTab !== 'ai_report' && (
                <Card title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Visual`}>
                    {error && (
                        <div style={{ padding: '15px', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: 'var(--radius-sm)', marginBottom: '15px' }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '90%', height: '80%', borderRadius: '8px', background: 'var(--border-industrial)', opacity: 0.3 }}></div>
                        </div>
                    ) : (
                        <div style={{ height: isMobile ? '300px' : '400px', width: '100%' }}>
                            <ResponsiveContainer>
                                {activeTab === 'forecast' && forecastData.length > 0 ? (
                                    <AreaChart data={forecastData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} />
                                        <Area type="monotone" dataKey="price" stroke="var(--accent-cyan)" fill="url(#colorPrice)" strokeWidth={3} />
                                    </AreaChart>
                                ) : activeTab === 'correlation' && correlationData.length > 0 ? (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                                                Explanation: This chart plots the daily delivery supply (bars) against the average market price (line). 
                                                Observe the inverse correlation: as supply increases, the price typically decreases.
                                            </p>
                                        </div>
                                        <ComposedChart data={correlationData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Price (₱)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Supply (kg)', angle: 90, position: 'insideRight', fill: 'var(--text-muted)', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                            <Legend />
                                            <Bar yAxisId="right" dataKey="supply" name="Supply (kg)" fill="rgba(100, 255, 218, 0.4)" radius={[4, 4, 0, 0]} />
                                            <Line yAxisId="left" type="monotone" dataKey="price" name="Price (₱)" stroke="#ff9f43" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </ComposedChart>
                                    </>
                                ) : activeTab === 'seasonality' && seasonalityData.length > 0 ? (
                                    <LineChart data={seasonalityData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{stroke: 'var(--border-industrial)'}} />
                                        <Line type="monotone" dataKey="volume" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-main)', stroke: 'var(--accent-cyan)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--accent-cyan)' }} />
                                    </LineChart>
                                ) : activeTab === 'comparison' && compareData && compareData.chart_data ? (
                                    <LineChart data={compareData.chart_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{stroke: 'var(--border-industrial)'}} />
                                        <Legend />
                                        <Line type="monotone" dataKey={compareData.fish1_name} stroke="#64ffda" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey={compareData.fish2_name} stroke="#ff9f43" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : activeTab === 'historical_comparison' && historicalData && historicalData.length > 0 ? (
                                    <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{stroke: 'var(--border-industrial)'}} />
                                        <Legend />
                                        <Line type="monotone" dataKey="This Month" stroke="#64ffda" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="Last Month" stroke="#ff9f43" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : activeTab === 'suppliers' && supplierData.length > 0 ? (
                                    <BarChart data={supplierData} layout="vertical" margin={{ left: isMobile ? 10 : 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-industrial)" />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis dataKey="location" type="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={isMobile ? 80 : 120} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} />
                                        <Bar dataKey="volume" fill="var(--accent-cyan)" name="Volume (kg)" radius={[0, 2, 2, 0]} />
                                    </BarChart>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>NO DATA POINT FOUND</p>
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
                )}
            </div>
        </div>
    );
};

export default Analytics;
