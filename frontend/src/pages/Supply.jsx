import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';

const Supply = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        api.get('locations/')
            .then(res => {
                setLocations(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = [
        { header: 'Fishing Ground', accessor: 'location_name' },
        { header: 'Region', accessor: 'region' },
        { header: 'Province', accessor: 'province' },
    ];

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2rem' }}>Supply Sources</h1>
                <p style={{ color: 'var(--text-muted)' }}>Tracking the geographic origin of Lucena Fish Port arrivals</p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
                gap: '20px' 
            }}>
                <Card title="Active Locations">
                    <Table 
                        columns={columns} 
                        data={locations} 
                    />
                </Card>

                <Card title="Origin Summary" style={{ background: 'rgba(52, 152, 219, 0.05)', border: 'none' }}>
                    <div style={{ padding: '10px' }}>
                        <h4 style={{ color: 'var(--primary-navy)', margin: '0 0 10px 0' }}>Data Coverage</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                            Monitoring <strong>{locations.length}</strong> major fishing grounds across Luzon and Visayas. 
                            Select a location from the table to see detailed arrival logs.
                        </p>
                        <div style={{ marginTop: '20px', padding: '15px', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TOP REGION</span>
                            <p style={{ margin: '5px 0 0', fontWeight: 'bold', color: 'var(--secondary-blue)' }}>CALABARZON (Region IV-A)</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Supply;

