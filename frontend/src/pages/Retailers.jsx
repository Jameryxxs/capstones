import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';

const Retailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        api.get('retailers/')
            .then(res => {
                setRetailers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = [
        { header: 'Business Name', accessor: 'business_name' },
        { header: 'Stall #', accessor: 'stall_number' },
        { header: 'Contact', accessor: 'contact_number' },
        { header: 'Status', accessor: 'status' },
    ];

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>Port Retailers</h1>
                <p style={{ color: 'var(--text-muted)' }}>Directory of active stall owners and verified traders</p>
            </div>

            <Card>
                <Table 
                    columns={isMobile ? columns.slice(0, 2).concat(columns.slice(3)) : columns} 
                    data={retailers} 
                />
            </Card>
        </div>
    );
};

export default Retailers;
