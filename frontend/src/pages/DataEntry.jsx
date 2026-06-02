import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import { db } from '../db';
import LoadingSpinner from '../components/LoadingSpinner';

const DataEntry = () => {
    const [fishes, setFishes] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const [formData, setFormData] = useState({
        fish: '',
        retailer: '',
        price_per_kilo: '',
        quantity_available: '',
        market_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        Promise.all([
            api.get('fish/'),
            api.get('retailers/')
        ]).then(([fishRes, retailRes]) => {
            setFishes(fishRes.data);
            setRetailers(retailRes.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });

        updatePendingCount();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updatePendingCount = async () => {
        const count = await db.pendingPrices.count();
        setPendingCount(count);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            market_date: new Date().toISOString().split('T')[0], // Always use today
            price_per_kilo: parseFloat(formData.price_per_kilo),
            quantity_available: parseInt(formData.quantity_available)
        };

        if (isOnline) {
            try {
                await api.post('fish-prices/', payload);
                alert('Price added successfully!');
                setFormData({ 
                    ...formData, 
                    price_per_kilo: '', 
                    quantity_available: '' 
                });
            } catch (err) {
                console.error(err);
                alert('Failed to add price. Saving locally.');
                await db.pendingPrices.add(payload);
                updatePendingCount();
            }
        } else {
            await db.pendingPrices.add(payload);
            alert('Offline: Price saved locally. It will sync when connection is restored.');
            updatePendingCount();
            setFormData({ 
                ...formData, 
                price_per_kilo: '', 
                quantity_available: '' 
            });
        }
    };

    const handleSync = async () => {
        if (!isOnline) return;
        setSyncing(true);
        const pending = await db.pendingPrices.toArray();
        
        for (const item of pending) {
            try {
                const { id, ...data } = item;
                await api.post('fish-prices/', data);
                await db.pendingPrices.delete(id);
            } catch (err) {
                console.error('Sync failed for item', item, err);
            }
        }
        
        updatePendingCount();
        setSyncing(false);
        alert('Sync completed!');
    };

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2rem', letterSpacing: '2px' }}>
                        DATA_ENTRY // <span style={{ color: 'var(--accent-cyan)' }}>OFFLINE_ENABLED</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Record Daily Market Prices
                    </p>
                </div>
                
                {pendingCount > 0 && (
                    <button 
                        onClick={handleSync}
                        disabled={syncing || !isOnline}
                        style={{
                            padding: '10px 20px',
                            background: isOnline ? 'var(--accent-cyan)' : 'var(--text-muted)',
                            color: 'var(--bg-main)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 'bold',
                            cursor: isOnline ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        {syncing ? 'SYNCING...' : `SYNC ${pendingCount} PENDING`}
                    </button>
                )}
            </div>

            <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>FISH SPECIES</label>
                        <select 
                            value={formData.fish}
                            onChange={(e) => setFormData({...formData, fish: e.target.value})}
                            required
                        >
                            <option value="">Select Fish</option>
                            {fishes.map(f => <option key={f.id} value={f.id}>{f.fish_name}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>RETAILER / STALL</label>
                        <select 
                            value={formData.retailer}
                            onChange={(e) => setFormData({...formData, retailer: e.target.value})}
                            required
                        >
                            <option value="">Select Retailer</option>
                            {retailers.map(r => <option key={r.id} value={r.id}>{r.business_name} (Stall {r.stall_number})</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>PRICE (₱/KG)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.price_per_kilo}
                                onChange={(e) => setFormData({...formData, price_per_kilo: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>QUANTITY (KG)</label>
                            <input 
                                type="number" 
                                value={formData.quantity_available}
                                onChange={(e) => setFormData({...formData, quantity_available: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: 'transparent',
                            border: '1px solid var(--accent-cyan)',
                            color: 'var(--accent-cyan)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(100, 255, 218, 0.1)'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                        {isOnline ? 'SUBMIT_TO_SERVER' : 'SAVE_LOCALLY_OFFLINE'}
                    </button>
                </form>
            </Card>

            {!isOnline && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: 'rgba(255, 71, 87, 0.1)', 
                    color: 'var(--fail-red)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    border: '1px solid var(--fail-red)'
                }}>
                    CONNECTION_LOST // DATA_WILL_BE_CACHED_LOCALLY
                </div>
            )}
        </div>
    );
};

export default DataEntry;
