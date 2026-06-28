import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, BarChart, Bar, LineChart, Line, Legend, ComposedChart,
    PieChart, Pie, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
                    if (nameLower.includes('confidence')) {
                        valueStr = `${parseFloat(entry.value).toFixed(2)}%`;
                    } else if (nameLower.includes('price') || activeTab === 'comparison') {
                        valueStr = `₱${parseFloat(entry.value).toFixed(2)}`;
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
    const [correlationCoefficient, setCorrelationCoefficient] = useState(0);
    const [seasonalityData, setSeasonalityData] = useState([]);
    const [supplierData, setSupplierData] = useState([]);
    const [compareData, setCompareData] = useState(null);
    const [compareFish1, setCompareFish1] = useState('');
    const [compareFish2, setCompareFish2] = useState('');
    const [historicalData, setHistoricalData] = useState([]);
    const [stabilityData, setStabilityData] = useState({ status: 'Stable', volatility: 0 });
    const [aiReport, setAiReport] = useState(null);
    const [generatingReport, setGeneratingReport] = useState(false);
    
    // New Analytics States
    const [topSpeciesData, setTopSpeciesData] = useState([]);
    const [vesselData, setVesselData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedQuarter, setSelectedQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));
    const [exporting, setExporting] = useState(false);
    const [forecastDays, setForecastDays] = useState(7);
    const [forecastMonth, setForecastMonth] = useState(new Date().getMonth() + 1);
    const [seasonalityForecastData, setSeasonalityForecastData] = useState(null);
    const COLORS = ['#0088FE', '#01836bff', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FF5A', '#FFD700', '#FF4500', '#8B4513', '#708090'];

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
        if (activeTab === 'forecast') endpoint = `forecast/${selectedFish}/?days=${forecastDays}`;
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
                        supply: item.predicted_supply || 0,
                        confidence: item.confidence_score || 0,
                        trend: item.trend
                    })));
                    setStabilityData({ status: res.data.stability, volatility: res.data.volatility });
                } else if (activeTab === 'correlation') {
                    setCorrelationData(res.data.data_points || []);
                    setCorrelationCoefficient(res.data.correlation_coefficient || 0);
                } else if (activeTab === 'seasonality') {
                    setSeasonalityData(res.data);
                    // Also fetch the specific month forecast
                    api.get(`seasonality-forecast/${selectedFish}/?month=${forecastMonth}`, { signal })
                        .then(res_month => setSeasonalityForecastData(res_month.data))
                        .catch(() => setSeasonalityForecastData(null));
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
    }, [selectedFish, activeTab, forecastDays, forecastMonth]);

    useEffect(() => {
        if (activeTab === 'top_species') {
            setLoading(true);
            api.get(`analytics/top-species/?year=${selectedYear}&quarter=${selectedQuarter}`)
                .then(res => {
                    setTopSpeciesData(res.data);
                    setLoading(false);
                }).catch(() => setLoading(false));
        } else if (activeTab === 'vessel_arrivals') {
            setLoading(true);
            api.get(`analytics/vessel-arrivals/?year=${selectedYear}`)
                .then(res => {
                    setVesselData(res.data);
                    setLoading(false);
                }).catch(() => setLoading(false));
        }
    }, [activeTab, selectedYear, selectedQuarter]);

    const exportPDF = () => {
        setExporting(true);
        const input = document.getElementById('export-container');
        if (!input) {
            setExporting(false);
            return;
        }
        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${activeTab}_report_${selectedYear}.pdf`);
            setExporting(false);
        });
    };

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

    const calculateStability = (data) => {
        if (!data || data.length < 2) return { status: 'Stable', volatility: 0 };
        const prices = data.map(d => d.price).filter(p => p !== undefined && p !== null);
        if (prices.length < 2) return { status: 'Stable', volatility: 0 };
        
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        const volatility = (stdDev / mean) * 100;

        let status = 'Stable';
        if (volatility > 15) status = 'Highly Volatile';
        else if (volatility > 5) status = 'Moderate Fluctuations';

        return { status, volatility: volatility.toFixed(1) };
    };

    const renderDataTable = () => {
        if (activeTab === 'forecast' && forecastData.length > 0) {
            return (
                <div style={{ marginTop: '30px', overflowX: 'auto' }}>
                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', minWidth: '600px' }}>
                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                            <tr>
                                <th>Date</th>
                                <th>Predicted Price (₱)</th>
                                <th>Predicted Supply (kg)</th>
                                <th>Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastData.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{row.date}</td>
                                    <td>{row.price ? row.price.toFixed(2) : '-'}</td>
                                    <td>{row.supply ? row.supply.toLocaleString() : '-'}</td>
                                    <td>{row.trend || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'correlation' && correlationData.length > 0) {
            return (
                <div style={{ marginTop: '30px', overflowX: 'auto' }}>
                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', minWidth: '600px' }}>
                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                            <tr>
                                <th>Date</th>
                                <th>Supply Volume (kg)</th>
                                <th>Market Price (₱)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {correlationData.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{row.date}</td>
                                    <td>{row.supply ? row.supply.toLocaleString() : '-'}</td>
                                    <td>{row.price ? row.price.toFixed(2) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'seasonality' && seasonalityData.length > 0) {
            return (
                <div style={{ marginTop: '30px', overflowX: 'auto' }}>
                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', minWidth: '600px' }}>
                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                            <tr>
                                <th>Month</th>
                                <th>Average Volume (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seasonalityData.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{row.month}</td>
                                    <td>{row.volume ? row.volume.toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'comparison' && compareData && compareData.chart_data) {
            return (
                <div style={{ marginTop: '30px', overflowX: 'auto' }}>
                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', minWidth: '600px' }}>
                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                            <tr>
                                <th>Date</th>
                                <th>{compareData.fish1_name} Price (₱)</th>
                                <th>{compareData.fish2_name} Price (₱)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compareData.chart_data.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{row.date}</td>
                                    <td>{row[compareData.fish1_name] ? row[compareData.fish1_name].toFixed(2) : '-'}</td>
                                    <td>{row[compareData.fish2_name] ? row[compareData.fish2_name].toFixed(2) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'historical_comparison' && historicalData.length > 0) {
            return (
                <div style={{ marginTop: '30px', overflowX: 'auto' }}>
                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', minWidth: '600px' }}>
                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                            <tr>
                                <th>Day of Month</th>
                                <th>This Month Price (₱)</th>
                                <th>Last Month Price (₱)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historicalData.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{row.day}</td>
                                    <td>{row['This Month'] ? row['This Month'].toFixed(2) : '-'}</td>
                                    <td>{row['Last Month'] ? row['Last Month'].toFixed(2) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'suppliers' && supplierData.length > 0) {
            return (
                <div style={{ marginTop: '30px', overflowX: 'auto' }}>
                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', minWidth: '600px' }}>
                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                            <tr>
                                <th>Fishing Location</th>
                                <th>Contributed Volume (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplierData.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{row.location}</td>
                                    <td>{row.volume ? row.volume.toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        return null;
    };

    const getDynamicInsight = () => {
        if (loading) return "Analyzing data patterns...";
        if (error) return "Unable to generate insights due to data error.";

        const currentFishName = fishes.find(f => f.id === parseInt(selectedFish))?.fish_name || 'this species';

        if (activeTab === 'forecast') {
            if (!forecastData || forecastData.length < 2) return "Insufficient data to project price movements.";
            const firstPrice = forecastData[0].price;
            const lastPrice = forecastData[forecastData.length - 1].price;
            const avgConfidence = forecastData.reduce((acc, curr) => acc + curr.confidence, 0) / forecastData.length;
            const diff = lastPrice - firstPrice;
            const percent = firstPrice > 0 ? (diff / firstPrice) * 100 : 0;
            
            const isDecimal = avgConfidence <= 1.0;
            const displayConfidence = isDecimal ? Math.round(avgConfidence * 100) : Math.round(avgConfidence);
            
            let insight = `AI Projection indicates a ${percent > 2 ? 'bullish' : percent < -2 ? 'bearish' : 'stable'} trend for ${currentFishName}, with prices expected to ${percent > 2 ? 'rise' : percent < -2 ? 'drop' : 'hover'} around ₱${lastPrice.toFixed(2)}.`;
            insight += ` Based on recent historical variance of ${stabilityData.volatility}%, this market is classified as ${stabilityData.status.toUpperCase()}.`;
            insight += ` The AI model's average confidence score for this prediction is ${displayConfidence}%.`;
            return insight;
        }

        if (activeTab === 'correlation') {
            if (!correlationData || correlationData.length < 3) return "Gathering more data points to identify supply-price correlation.";
            let strength = "No Significant";
            if (correlationCoefficient <= -0.6) strength = "Strong Negative";
            else if (correlationCoefficient <= -0.3) strength = "Moderate Negative";
            else if (correlationCoefficient >= 0.6) strength = "Strong Positive";
            else if (correlationCoefficient >= 0.3) strength = "Moderate Positive";
            
            return `Statistical Analysis detected a ${strength} Correlation (r = ${correlationCoefficient}) between supply and price for ${currentFishName} over the last 6 months.`;
        }

        if (activeTab === 'seasonality') {
            if (!seasonalityData || seasonalityData.length === 0) return "Not enough historical data to map seasonal trends.";
            let peakMonth = seasonalityData[0];
            for (let i = 1; i < seasonalityData.length; i++) {
                if (seasonalityData[i].volume > peakMonth.volume) peakMonth = seasonalityData[i];
            }
            let insight = `Historical AI analysis identifies ${peakMonth.month} as the peak harvest season for ${currentFishName}, yielding average volumes of ${Math.round(peakMonth.volume)} kg.`;
            if (seasonalityForecastData) {
                insight += ` For the upcoming target month (${seasonalityForecastData.month_name}), we predict a volume of ${seasonalityForecastData.predicted_volume} kg (Status: ${seasonalityForecastData.abundance_status}).`;
            }
            return insight;
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
                return `Species Comparison Analysis: ${f1} is currently trading at a premium of ₱${diff.toFixed(2)} higher than ${f2}.`;
            } else if (price2 > price1) {
                const diff = price2 - price1;
                return `Species Comparison Analysis: ${f2} is currently trading at a premium of ₱${diff.toFixed(2)} higher than ${f1}.`;
            }
            return `Species Comparison Analysis: ${f1} and ${f2} are currently trading at the exact same market price.`;
        }

        if (activeTab === 'suppliers') {
            if (!supplierData || supplierData.length === 0) return "Aggregating supplier performance metrics.";
            const topSupplier = supplierData[0]; 
            return `AI Performance Matrix ranks ${topSupplier.location} as your highest-yielding fishing ground, contributing ${topSupplier.volume} kg to port operations.`;
        }

        if (activeTab === 'top_species') {
            return `Displaying Top 10 Fish Species by Volume for Q${selectedQuarter} ${selectedYear}.`;
        }

        if (activeTab === 'vessel_arrivals') {
            return `Displaying Quarterly Vessel Arrivals for ${selectedYear}.`;
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
                paddingBottom: '10px'
            }}>
                {[
                    { id: 'forecast', label: 'Price Trends (Forecast)' }, 
                    { id: 'top_species', label: 'Top 10 Species (M.T.)' },
                    { id: 'vessel_arrivals', label: 'Quarterly Vessel Arrivals' },
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

                    {activeTab === 'forecast' && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>Forecast Horizon:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setForecastDays(7)}
                                    style={{ 
                                        flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold',
                                        border: forecastDays === 7 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                                        background: forecastDays === 7 ? 'rgba(100, 255, 218, 0.1)' : 'transparent',
                                        color: forecastDays === 7 ? 'var(--accent-cyan)' : 'var(--text-muted)'
                                    }}
                                >7 Days</button>
                                <button 
                                    onClick={() => setForecastDays(30)}
                                    style={{ 
                                        flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold',
                                        border: forecastDays === 30 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                                        background: forecastDays === 30 ? 'rgba(100, 255, 218, 0.1)' : 'transparent',
                                        color: forecastDays === 30 ? 'var(--accent-cyan)' : 'var(--text-muted)'
                                    }}
                                >30 Days</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seasonality' && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>Target Month Predictor:</label>
                            <select 
                                value={forecastMonth} 
                                onChange={(e) => setForecastMonth(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                            >
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                                    <option key={i+1} value={i+1}>{m}</option>
                                ))}
                            </select>
                            {seasonalityForecastData && (
                                <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-industrial)' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{seasonalityForecastData.month_name} Prediction</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Avg Volume:</span>
                                        <span style={{ fontWeight: 'bold' }}>{seasonalityForecastData.predicted_volume} kg</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Avg Price:</span>
                                        <span style={{ fontWeight: 'bold' }}>₱{seasonalityForecastData.predicted_price}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Market Status:</span>
                                        <span style={{ fontWeight: 'bold', color: seasonalityForecastData.abundance_status.includes('High') ? '#19FF5A' : seasonalityForecastData.abundance_status.includes('Low') ? '#FF6B6B' : 'var(--accent-cyan)' }}>{seasonalityForecastData.abundance_status}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {(activeTab === 'top_species' || activeTab === 'vessel_arrivals') && (
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>Select Year:</label>
                                <select 
                                    value={selectedYear} 
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                >
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            {activeTab === 'top_species' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>Select Quarter:</label>
                                    <select 
                                        value={selectedQuarter} 
                                        onChange={(e) => setSelectedQuarter(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                    >
                                        <option value="1">1st Quarter</option>
                                        <option value="2">2nd Quarter</option>
                                        <option value="3">3rd Quarter</option>
                                        <option value="4">4th Quarter</option>
                                    </select>
                                </div>
                            )}
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
                        <strong style={{ color: 'var(--primary-navy)' }}> AI Insight:</strong> {getDynamicInsight()}
                    </div>
                </Card>
                )}

                {/* AI Report Section */}
                {activeTab === 'ai_report' && (
                    <>
                        <Card title="AI Parameters">
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.85rem' }}>
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
                                        padding: '12px',
                                        width: '100%',
                                        backgroundColor: 'var(--accent-cyan)',
                                        color: 'var(--bg-main)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        fontWeight: 'bold',
                                        cursor: generatingReport ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s ease',
                                        opacity: generatingReport ? 0.7 : 1
                                    }}
                                >
                                    {generatingReport ? 'Generating...' : 'Generate Comprehensive Report'}
                                </button>
                            </div>
                        </Card>
                        
                        <Card title="Weekly Market Insight Report">
                            {aiReport ? (
                                <div style={{ 
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
                            ) : (
                                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>No Report Generated</h3>
                                    <p style={{ margin: 0 }}>{generatingReport ? 'Gemini AI is analyzing thousands of data points...' : 'Click the button on the left to generate the latest AI insights.'}</p>
                                </div>
                            )}
                        </Card>
                    </>
                )}

                {/* Visualization Area */}
                {activeTab !== 'ai_report' && (
                <Card title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} Visual`}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                        <button 
                            onClick={exportPDF} 
                            disabled={exporting || loading}
                            className="btn-primary" 
                        >
                            {exporting ? 'Exporting PDF...' : 'Export to PDF'}
                        </button>
                    </div>
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
                        <div id="export-container" style={{ width: '100%', background: 'var(--bg-card)', padding: '15px', borderRadius: '8px' }}>
                            {activeTab === 'correlation' && correlationData.length > 0 && (
                                <div style={{ textAlign: 'center', marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-industrial)' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.6' }}>
                                        <strong style={{ color: 'var(--accent-cyan)' }}>Scatter Plot Analysis:</strong> This chart visualizes the mathematical relationship between Supply (X-Axis) and Price (Y-Axis).<br />
                                        <span style={{ color: 'var(--text-muted)' }}>A downward slope visually proves that higher supply drives market prices lower.</span>
                                    </p>
                                </div>
                            )}

                            {(activeTab === 'top_species' || activeTab === 'vessel_arrivals') ? (
                                <div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #1b4471', paddingBottom: '10px' }}>
                                            <h2 style={{ color: '#1b4471', margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {activeTab === 'top_species' ? `Lucena Fish Port Complex Top 10 Species (in M.T.) - Q${selectedQuarter} ${selectedYear}` : `LFPC Quarterly Statistics of Vessel Arrivals by Numbers @ Year ${selectedYear}`}
                                            </h2>
                                        </div>

                                        {activeTab === 'top_species' && topSpeciesData.length > 0 && (
                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                                <div style={{ height: '350px' }}>
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie data={topSpeciesData} dataKey="volume" nameKey="local_name" cx="50%" cy="50%" outerRadius={120} label>
                                                                {topSpeciesData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div>
                                                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                                                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                                                            <tr>
                                                                <th>Local_Name</th>
                                                                <th>Volume (M.T.)</th>
                                                                <th>Avg Price/kg</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topSpeciesData.map((row, i) => (
                                                                <tr key={i}>
                                                                    <td style={{ fontWeight: 'bold' }}>{row.local_name}</td>
                                                                    <td>{row.volume.toLocaleString()}</td>
                                                                    <td>{row.avg_price > 0 ? row.avg_price.toFixed(2) : '0.00'}</td>
                                                                </tr>
                                                            ))}
                                                            <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                                                                <td>Grand Total</td>
                                                                <td>{topSpeciesData.reduce((acc, curr) => acc + curr.volume, 0).toLocaleString()}</td>
                                                                <td></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'vessel_arrivals' && vesselData.length > 0 && (
                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '20px' }}>
                                                <div style={{ height: '350px' }}>
                                                    <ResponsiveContainer>
                                                        <BarChart data={vesselData}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                            <XAxis dataKey="quarter" tickFormatter={(v) => `Q${v}`} />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Bar dataKey="vessel_arrivals" fill="#3b82f6" name="Vessel Arrivals" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div>
                                                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                                                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                                                            <tr>
                                                                <th>Quarter</th>
                                                                <th>Vessel Arrivals</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {vesselData.map((row, i) => (
                                                                <tr key={i}>
                                                                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{row.quarter}</td>
                                                                    <td style={{ textAlign: 'right' }}>{row.vessel_arrivals.toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                            <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                                                                <td>Grand Total</td>
                                                                <td style={{ textAlign: 'right' }}>{vesselData.reduce((acc, curr) => acc + curr.vessel_arrivals, 0).toLocaleString()}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ height: isMobile ? '300px' : '400px', width: '100%' }}>
                                        <ResponsiveContainer>
                                        {activeTab === 'forecast' && forecastData.length > 0 ? (
                                            <ComposedChart data={forecastData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <defs>
                                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Price (₱)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }} />
                                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Supply (kg)', angle: 90, position: 'insideRight', fill: 'var(--text-muted)', fontSize: 12 }} />
                                                <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                                <Legend />
                                                <Bar yAxisId="right" dataKey="supply" name="Predicted Supply" fill="rgba(0, 168, 129, 0.2)" stroke="var(--border-industrial)" radius={[4, 4, 0, 0]} />
                                                <Area yAxisId="left" type="monotone" dataKey="price" name="Predicted Price" stroke="var(--accent-cyan)" fill="url(#colorPrice)" strokeWidth={3} />
                                            </ComposedChart>
                                        ) : activeTab === 'correlation' && correlationData.length > 0 ? (
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-industrial)" />
                                                <XAxis type="number" dataKey="supply" name="Supply" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Supply Volume (kg)', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)' }} />
                                                <YAxis type="number" dataKey="price" name="Price" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Price (₱)', angle: 0, position: 'insideTopLeft', offset: -15, fill: 'var(--text-muted)' }} />
                                                <ZAxis type="category" dataKey="date" name="Date" />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip activeTab={activeTab} />} />
                                                <Scatter name="Market Data Points" data={correlationData} fill="var(--accent-cyan)" />
                                            </ScatterChart>
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
                                    {renderDataTable()}
                                </div>
                            )}
                        </div>
                    )}
                </Card>
                )}
            </div>
        </div>
    );
};

export default Analytics;
