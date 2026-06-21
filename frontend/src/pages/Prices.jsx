import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';

const Prices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    // Default to empty string instead of strictly today so it fetches all recent prices
    const [selectedDate, setSelectedDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const fetchPrices = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedDate) params.append('date', selectedDate);
        if (searchQuery) params.append('search', searchQuery);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);

        api.get(`fish-prices/?${params.toString()}`)
            .then(res => {
                setPrices(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        fetchPrices();

        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPrices();
    };

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
                    background: row.fish_category === 'freshwater' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    color: row.fish_category === 'freshwater' ? 'var(--accent-cyan)' : 'var(--success-green)',
                    border: `1px solid ${row.fish_category === 'freshwater' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
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

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2rem' }}>Market Price List</h1>
                <p style={{ color: 'var(--text-muted)' }}>Daily updated retail prices from Lucena Fish Port Complex</p>
            </div>

            <Card style={{ padding: isMobile ? '15px' : '25px', marginBottom: '20px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Species Search:</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Bangus, Tilapia"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                        />
                    </div>
                    
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Date:</label>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                        />
                    </div>

                    <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Min Price (₱):</label>
                        <input 
                            type="number" 
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                        />
                    </div>

                    <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Max Price (₱):</label>
                        <input 
                            type="number" 
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                        />
                    </div>

                    <div style={{ flex: '0 0 auto', width: isMobile ? '100%' : 'auto' }}>
                        <button type="submit" style={{ width: '100%', padding: '10px 20px', backgroundColor: 'var(--accent-cyan)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                            Search
                        </button>
                    </div>
                </form>
            </Card>

            <Card style={{ padding: isMobile ? '10px' : '25px', minHeight: '300px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <LoadingSpinner size="50px" />
                    </div>
                ) : prices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <h3>No prices found.</h3>
                        <p>Try adjusting your search criteria or clearing the date to view older records.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <Table 
                            columns={isMobile ? columns.slice(0, 3) : columns} 
                            data={prices} 
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Prices;
