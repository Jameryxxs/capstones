import React, { useState, useEffect, useMemo } from 'react';
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
    const [fishes, setFishes] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [newPriceIds, setNewPriceIds] = useState([]); // Track newly arrived prices for glow

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

        api.get('fish/')
            .then(res => setFishes(res.data))
            .catch(err => console.error("Failed to fetch fishes", err));

        // WebSocket for Real-time Price Updates
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/updates/`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'PRICE_UPDATE') {
                    // Refetch prices to update the table instantly
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
                            
                            // Find the newly added price ID by comparing (assuming highest ID is newest)
                            if (res.data.length > 0) {
                                const newId = Math.max(...res.data.map(p => p.id));
                                setNewPriceIds(prev => [...prev, newId]);
                                setTimeout(() => {
                                    setNewPriceIds(prev => prev.filter(id => id !== newId));
                                }, 10000);
                            }
                        });
                }
            } catch (err) {
                console.error("WebSocket message error:", err);
            }
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            if (socket.readyState === 1) socket.close();
        };
    }, [selectedDate, searchQuery, minPrice, maxPrice]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPrices();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedDate, minPrice, maxPrice]);

    const averageStats = useMemo(() => {
        if (!prices || prices.length === 0) return null;

        if (searchQuery) {
            const sumPrice = prices.reduce((acc, p) => acc + parseFloat(p.price_per_kilo || 0), 0);
            const avgPrice = (sumPrice / prices.length).toFixed(2);
            
            const sumVol = prices.reduce((acc, p) => acc + parseFloat(p.quantity_available || 0), 0);
            const avgVol = (sumVol / prices.length).toFixed(2);

            return {
                price: { label: `Average Price for ${searchQuery}`, value: `₱ ${avgPrice}` },
                volume: { label: `Average Volume for ${searchQuery}`, value: `${avgVol} kg` }
            };
        } else {
            const speciesGroups = {};
            prices.forEach(p => {
                if (!speciesGroups[p.fish_name]) speciesGroups[p.fish_name] = { prices: [], volumes: [] };
                speciesGroups[p.fish_name].prices.push(parseFloat(p.price_per_kilo || 0));
                speciesGroups[p.fish_name].volumes.push(parseFloat(p.quantity_available || 0));
            });
            
            let lowestSpecies = '';
            let lowestAveragePrice = Infinity;

            for (const [species, data] of Object.entries(speciesGroups)) {
                const avgP = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
                if (avgP < lowestAveragePrice) {
                    lowestAveragePrice = avgP;
                    lowestSpecies = species;
                }
            }
            
            let avgVolForLowestSpecies = 0;
            if (lowestSpecies && speciesGroups[lowestSpecies]) {
                const vols = speciesGroups[lowestSpecies].volumes;
                avgVolForLowestSpecies = vols.reduce((a, b) => a + b, 0) / vols.length;
            }
            
            return {
                price: lowestAveragePrice !== Infinity ? {
                    label: `Lowest Average Price (${lowestSpecies})`,
                    value: `₱ ${lowestAveragePrice.toFixed(2)}`
                } : null,
                volume: lowestAveragePrice !== Infinity ? {
                    label: `Average Volume (${lowestSpecies})`,
                    value: `${avgVolForLowestSpecies.toFixed(2)} kg`
                } : null
            };
        }
    }, [prices, searchQuery]);

    const columns = [
        { 
            header: 'Fish Species', 
            accessor: 'fish_name',
            render: (row) => (
                <div style={{ fontWeight: 'bold' }}>
                    {row.fish_name}
                    {newPriceIds.includes(row.id) && (
                        <span style={{fontSize:'0.6rem', background:'var(--accent-cyan)', color:'#000', padding:'2px 5px', borderRadius:'4px', marginLeft:'5px'}}>NEW UPDATE</span>
                    )}
                </div>
            )
        },
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
        { header: 'Origin', accessor: 'origin', render: (row) => row.origin || 'Unknown' },
        { header: 'Date', accessor: 'market_date' },
    ];

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2rem' }}>Market Price List</h1>
                <p style={{ color: 'var(--text-muted)' }}>Daily updated retail prices from Lucena Fish Port Complex</p>
            </div>

            <Card style={{ padding: isMobile ? '15px' : '25px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Filter by Species:</label>
                        <select 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                        >
                            <option value="">All Species</option>
                            {fishes.map(f => (
                                <option key={f.id} value={f.fish_name}>{f.fish_name}</option>
                            ))}
                        </select>
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
                </div>

                {averageStats && (
                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-industrial)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '30px', flexWrap: 'wrap' }}>
                        {averageStats.price && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{averageStats.price.label}:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success-green)' }}>{averageStats.price.value}</span>
                            </div>
                        )}
                        {averageStats.volume && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{averageStats.volume.label}:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{averageStats.volume.value}</span>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <Card style={{ padding: isMobile ? '10px' : '25px', minHeight: '300px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <LoadingSpinner size="50px" />
                    </div>
                ) : prices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <h3>No prices found.</h3>
                        <p>Try adjusting your filter criteria or clearing the date to view older records.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <Table 
                            columns={isMobile ? columns.slice(0, 3) : columns} 
                            data={prices} 
                            rowStyle={(row) => newPriceIds.includes(row.id) ? { animation: 'pulseGlow 2s infinite', background: 'rgba(100, 255, 218, 0.1)' } : {}}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Prices;
