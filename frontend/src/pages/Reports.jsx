import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
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
        api.get('bulletin/', {
            responseType: 'blob',
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Daily_Market_Bulletin.pdf');
            document.body.appendChild(link);
            link.click();
            setDownloading(false);
        });
    };

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>Reports & Bulletins</h1>
                <p style={{ color: 'var(--text-muted)' }}>Official documentation and market summaries</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr', gap: '25px' }}>
                <Card title="Quick Generate">
                    <div style={{ padding: '10px' }}>
                        <h4 style={{ color: 'var(--primary-navy)', marginBottom: '15px' }}>Daily Market Bulletin</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '20px' }}>
                            Generate an official PDF summary of today's market activities, including top fish prices, 
                            retailer listings, and market summaries.
                        </p>
                        <button 
                            className="btn-primary" 
                            onClick={downloadBulletin}
                            disabled={downloading}
                            style={{ width: '100%', background: 'var(--primary-navy)' }}
                        >
                            {downloading ? 'Generating PDF...' : 'Download PDF Bulletin'}
                        </button>
                    </div>
                </Card>

                <Card title="Recent Archives">
                    <div style={{ padding: '10px' }}>
                        {reports.length > 0 ? reports.map(report => (
                            <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div>
                                    <h5 style={{ margin: '0 0 5px', color: 'var(--text-main)' }}>{report.title}</h5>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{report.created_at_formatted || report.created_at}</span>
                                </div>
                                <button style={{ border: 'none', background: 'transparent', color: 'var(--secondary-blue)', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>View</button>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No archived reports found.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
