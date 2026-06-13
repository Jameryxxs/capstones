import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';

const Prices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        api.get('fish-prices/')
            .then(res => {
                setPrices(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = [
        { header: 'Fish Species', accessor: 'fish_name' },
        { 
            header: 'Category', 
            accessor: 'fish_category',
            render: (row) => (
                <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.65rem', 
                    fontWeight: '800',
                    background: row.fish_category === 'freshwater' ? 'rgba(72, 219, 251, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                    color: row.fish_category === 'freshwater' ? 'var(--accent-cyan)' : 'var(--secondary-blue)',
                    border: `1px solid ${row.fish_category === 'freshwater' ? 'var(--accent-cyan)' : 'var(--secondary-blue)'}`,
                    textTransform: 'uppercase'
                }}>
                    {row.fish_category}
                </span>
            )
        },
        { header: 'Retailer', accessor: 'retailer_business_name' },
        { header: 'Price (₱/kg)', accessor: 'price_per_kilo' },
        { header: 'Stock', accessor: 'quantity_available' },
        { header: 'Date', accessor: 'market_date' },
    ];

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2rem' }}>Market Price List</h1>
                <p style={{ color: 'var(--text-muted)' }}>Daily updated retail prices from Lucena Fish Port Complex</p>
            </div>

            <Card style={{ padding: isMobile ? '10px' : '25px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <Table 
                        columns={isMobile ? columns.slice(0, 3) : columns} 
                        data={prices} 
                    />
                </div>
            </Card>
        </div>
    );
};

export default Prices;

