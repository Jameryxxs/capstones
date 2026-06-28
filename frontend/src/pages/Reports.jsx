import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [config, setConfig] = useState({
        dailyDate: new Date().toISOString().split('T')[0],
        weeklyEnd: new Date().toISOString().split('T')[0],
        monthValue: new Date().toISOString().slice(0, 7),
        yearValue: new Date().getFullYear().toString()
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        api.get('reports/')
            .then(res => {
                setReports(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const downloadBulletin = () => {
        setDownloading(true);

        let start_date = '';
        let end_date = '';
        let title = '';

        if (selectedPeriod === 'daily') {
            start_date = config.dailyDate;
            end_date = config.dailyDate;
            title = 'Daily';
        } else if (selectedPeriod === 'weekly') {
            const end = new Date(config.weeklyEnd);
            const start = new Date(end);
            start.setDate(end.getDate() - 6);
            start_date = start.toISOString().split('T')[0];
            end_date = end.toISOString().split('T')[0];
            title = 'Weekly';
        } else if (selectedPeriod === 'monthly') {
            const [year, month] = config.monthValue.split('-');
            start_date = `${year}-${month}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            end_date = `${year}-${month}-${lastDay}`;
            title = 'Monthly';
        } else if (selectedPeriod === 'annual') {
            start_date = `${config.yearValue}-01-01`;
            end_date = `${config.yearValue}-12-31`;
            title = 'Annual';
        }

        const queryParams = new URLSearchParams({
            period: selectedPeriod,
            start_date,
            end_date,
            title
        }).toString();

        api.get(`bulletin/?${queryParams}`, {
            responseType: 'blob',
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `FishLedger_${title.toUpperCase()}_Bulletin_${end_date}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Save to Document Archive
            api.post('reports/', {
                report_name: filename,
                report_type: selectedPeriod,
                summary: queryParams // Save the params so we can regenerate it later
            }).then(() => {
                // Refresh archive list
                api.get('reports/').then(res => setReports(res.data));
            });

            setDownloading(false);
        }).catch(err => {
            console.error("PDF generation failed", err);
            setDownloading(false);
            alert("Failed to generate report. Please try again.");
        });
    };

    if (loading) return <LoadingSpinner size="60px" />;

    const periods = [
        { id: 'daily', label: 'Daily Market Bulletin', desc: "Summary of active prices and latest stall registrations for a specific date." },
        { id: 'weekly', label: 'Weekly Trend Analysis', desc: "Consolidated average prices and supply volume over a 7-day period." },
        { id: 'monthly', label: 'Monthly Port Summary', desc: "Comprehensive performance metrics and species distribution for the month." },
        { id: 'annual', label: 'Annual Statistical Report', desc: "Year-over-year market health and large-scale supply chain analytics." },
    ];

    const renderConfigInput = () => {
        const inputStyle = {
            width: '100%',
            padding: '10px',
            border: '1px solid var(--border-industrial)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'inherit',
            marginTop: '8px',
            outline: 'none'
        };

        if (selectedPeriod === 'daily') {
            return (
                <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Select Date:</label>
                    <input 
                        type="date" 
                        style={inputStyle}
                        value={config.dailyDate}
                        onChange={(e) => setConfig({...config, dailyDate: e.target.value})}
                    />
                </div>
            );
        } else if (selectedPeriod === 'weekly') {
            return (
                <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Select Week Ending Date:</label>
                    <input 
                        type="date" 
                        style={inputStyle}
                        value={config.weeklyEnd}
                        onChange={(e) => setConfig({...config, weeklyEnd: e.target.value})}
                    />
                    <small style={{ display: 'block', marginTop: '5px', color: 'var(--text-muted)' }}>Report will cover 7 days ending on this date.</small>
                </div>
            );
        } else if (selectedPeriod === 'monthly') {
            return (
                <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Select Month:</label>
                    <input 
                        type="month" 
                        style={inputStyle}
                        value={config.monthValue}
                        onChange={(e) => setConfig({...config, monthValue: e.target.value})}
                    />
                </div>
            );
        } else if (selectedPeriod === 'annual') {
            return (
                <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Select Year:</label>
                    <input 
                        type="number" 
                        min="2000"
                        max="2100"
                        style={inputStyle}
                        value={config.yearValue}
                        onChange={(e) => setConfig({...config, yearValue: e.target.value})}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>Reports Generation</h1>
                <p style={{ color: 'var(--text-muted)' }}>Generate customized market summaries and official documentation</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* CONFIGURATION PANEL */}
                <Card title="REPORT CONFIGURATION">
                    <div style={{ padding: '10px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>SELECT TIME PERIOD</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                            {periods.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => setSelectedPeriod(p.id)}
                                    style={{
                                        padding: '12px',
                                        background: selectedPeriod === p.id ? 'rgba(72, 219, 251, 0.1)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${selectedPeriod === p.id ? 'var(--accent-cyan)' : 'var(--border-industrial)'}`,
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <h5 style={{ margin: '0 0 5px 0', color: selectedPeriod === p.id ? 'var(--accent-cyan)' : 'var(--text-main)', fontSize: '0.85rem' }}>{p.label.toUpperCase()}</h5>
                                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{p.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                            <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary-navy)' }}>Customize Date Range</h4>
                            {renderConfigInput()}
                        </div>

                        <button 
                            className="btn-primary" 
                            onClick={downloadBulletin}
                            disabled={downloading}
                            style={{ 
                                width: '100%', 
                                padding: '15px',
                                background: 'var(--accent-cyan)', 
                                color: 'var(--bg-main)',
                                border: 'none',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                borderRadius: 'var(--radius-sm)'
                            }}
                        >
                            {downloading ? 'GENERATING PDF...' : 'GENERATE REPORT // DOWNLOAD'}
                        </button>
                    </div>
                </Card>

                {/* ARCHIVE PANEL */}
                <Card title="DOCUMENT ARCHIVE">
                    <div style={{ padding: '10px' }}>
                        {reports.length > 0 ? reports.map(report => (
                            <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--border-industrial)' }}>
                                <div>
                                    <h5 style={{ margin: '0 0 5px', color: 'var(--text-main)', fontSize: '0.9rem' }}>{report.report_name}</h5>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{new Date(report.generated_date).toLocaleDateString()} {new Date(report.generated_date).toLocaleTimeString()}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (report.summary) {
                                            api.get(`bulletin/?${report.summary}`, { responseType: 'blob' })
                                                .then(response => {
                                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.setAttribute('download', report.report_name);
                                                    document.body.appendChild(link);
                                                    link.click();
                                                }).catch(() => alert("Failed to download archived report."));
                                        }
                                    }}
                                    style={{ border: '1px solid var(--accent-cyan)', background: 'rgba(100, 255, 218, 0.1)', color: 'var(--accent-cyan)', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', transition: 'all 0.2s' }}
                                >
                                    VIEW ARCHIVE
                                </button>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem' }}>NO ARCHIVED DOCUMENTS DETECTED</p>
                                <p style={{ margin: '5px 0 0', fontSize: '0.65rem' }}>Automated snapshots will appear here.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;

