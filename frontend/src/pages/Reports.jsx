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
        api.get(`bulletin/?period=${selectedPeriod}`, {
            responseType: 'blob',
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `FishLodger_${selectedPeriod.toUpperCase()}_Bulletin.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            setDownloading(false);
        }).catch(err => {
            console.error("PDF generation failed", err);
            setDownloading(false);
            alert("Failed to generate report. Please try again.");
        });
    };

    if (loading) return <LoadingSpinner size="60px" />;

    const periods = [
        { id: 'daily', label: 'Daily Market Bulletin', desc: "Summary of today's active prices and latest stall registrations." },
        { id: 'weekly', label: 'Weekly Trend Analysis', desc: "Consolidated average prices and supply volume over the last 7 days." },
        { id: 'monthly', label: 'Monthly Port Summary', desc: "Comprehensive performance metrics and species distribution for the month." },
        { id: 'annual', label: 'Annual Statistical Report', desc: "Year-over-year market health and large-scale supply chain analytics." },
    ];

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>Reports & Intelligence</h1>
                <p style={{ color: 'var(--text-muted)' }}>Generate customized market summaries and official documentation</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* CONFIGURATION PANEL */}
                <Card title="REPORT_CONFIGURATION">
                    <div style={{ padding: '10px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>SELECT TIME PERIOD</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
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
                                letterSpacing: '1px'
                            }}
                        >
                            {downloading ? 'GENERATING_PDF...' : 'GENERATE_REPORT // DOWNLOAD'}
                        </button>
                    </div>
                </Card>

                {/* ARCHIVE PANEL */}
                <Card title="DOCUMENT_ARCHIVE">
                    <div style={{ padding: '10px' }}>
                        {reports.length > 0 ? reports.map(report => (
                            <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--border-industrial)' }}>
                                <div>
                                    <h5 style={{ margin: '0 0 5px', color: 'var(--text-main)', fontSize: '0.9rem' }}>{report.title}</h5>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{report.created_at_formatted || report.created_at}</span>
                                </div>
                                <button style={{ border: '1px solid var(--secondary-blue)', background: 'transparent', color: 'var(--secondary-blue)', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>VIEW_ARCHIVE</button>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem' }}>NO ARCHIVED DOCUMENTS DETECTED</p>
                                <p style={{ margin: '5px 0 0', fontSize: '0.65rem' }}>Automated daily snapshots will appear here.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;

