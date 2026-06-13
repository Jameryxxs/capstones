import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { priceApi, fishApi, retailerApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const MyProducts = () => {
    const [myPrices, setMyPrices] = useState([]);
    const [allFish, setAllFish] = useState([]);
    const [retailer, setRetailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        fish: '',
        price_per_kilo: '',
        quantity_available: '',
        market_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pricesRes, fishRes, meRes] = await Promise.all([
                    priceApi.getMine(),
                    fishApi.getAll(),
                    retailerApi.getMe()
                ]);

                setMyPrices(pricesRes.data);
                setAllFish(fishRes.data);
                setRetailer(meRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load data. Make sure your retailer profile is complete.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                const res = await priceApi.update(editingId, formData);
                setMyPrices(myPrices.map(p => p.id === editingId ? res.data : p));
                setEditingId(null);
            } else {
                const res = await priceApi.create(formData);
                setMyPrices([res.data, ...myPrices]);
            }
            setFormData({
                fish: '',
                price_per_kilo: '',
                quantity_available: '',
                market_date: new Date().toISOString().split('T')[0],
                remarks: ''
            });
            setSubmitting(false);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data ? 
                Object.entries(err.response.data).map(([field, msgs]) => `${field.toUpperCase()}: ${msgs.join(', ')}`).join(' | ') : 
                'Failed to save product. Please check your inputs.';
            alert(errorMsg);
            setSubmitting(false);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            fish: product.fish,
            price_per_kilo: product.price_per_kilo,
            quantity_available: product.quantity_available,
            market_date: product.market_date,
            remarks: product.remarks || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            fish: '',
            price_per_kilo: '',
            quantity_available: '',
            market_date: new Date().toISOString().split('T')[0],
            remarks: ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product entry?')) return;
        
        try {
            await priceApi.delete(id);
            setMyPrices(myPrices.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete product.');
        }
    };

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2rem', letterSpacing: '2px' }}>
                    MY STALL // <span style={{ color: 'var(--accent-cyan)' }}>{retailer?.business_name?.toUpperCase() || 'MANAGEMENT'}</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Stall #{retailer?.stall_number} | Management Console
                </p>
            </div>

            {error && (
                <div style={{ padding: '20px', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid var(--fail-red)', color: 'var(--fail-red)', borderRadius: '4px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
                {/* ADD/EDIT PRODUCT FORM */}
                <Card title={editingId ? "UPDATE EXISTING ENTRY" : "REGISTER NEW ENTRY"}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '800' }}>SELECT FISH</label>
                            <select 
                                name="fish"
                                value={formData.fish}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%' }}
                            >
                                <option value="">--- SELECT ---</option>
                                {allFish.map(f => (
                                    <option key={f.id} value={f.id}>{f.fish_name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '800' }}>PRICE (₱/kg)</label>
                                <input 
                                    type="number"
                                    name="price_per_kilo"
                                    value={formData.price_per_kilo}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    placeholder="0.00"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '800' }}>STOCK (kg)</label>
                                <input 
                                    type="number"
                                    name="quantity_available"
                                    value={formData.quantity_available}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '800' }}>MARKET DATE</label>
                            <input 
                                type="date"
                                name="market_date"
                                value={formData.market_date}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '800' }}>REMARKS</label>
                            <textarea 
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                placeholder="Any special notes..."
                                style={{ 
                                    width: '100%', 
                                    minHeight: '80px', 
                                    padding: '12px', 
                                    background: 'var(--bg-card)', 
                                    border: '1px solid var(--border-industrial)', 
                                    color: 'var(--text-main)', 
                                    borderRadius: 'var(--radius-sm)',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                background: 'var(--accent-cyan)', 
                                color: 'var(--bg-main)', 
                                border: 'none', 
                                borderRadius: '4px', 
                                fontWeight: '800', 
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}
                        >
                            {submitting ? 'PROCESSING...' : (editingId ? 'UPDATE PRODUCT' : 'ADD PRODUCT TO STALL')}
                        </button>
                        {editingId && (
                            <button 
                                type="button"
                                onClick={handleCancelEdit}
                                style={{ 
                                    width: '100%', 
                                    marginTop: '10px',
                                    padding: '12px', 
                                    background: 'transparent', 
                                    color: 'var(--fail-red)', 
                                    border: '1px solid var(--fail-red)', 
                                    borderRadius: '4px', 
                                    fontWeight: '800', 
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                CANCEL EDIT
                            </button>
                        )}
                    </form>
                </Card>

                {/* PRODUCT LIST */}
                <Card title="MY CURRENT PRODUCTS">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-industrial)', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '15px' }}>Species</th>
                                    <th style={{ padding: '15px' }}>Price</th>
                                    <th style={{ padding: '15px' }}>Stock</th>
                                    <th style={{ padding: '15px' }}>Date</th>
                                    <th style={{ padding: '15px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myPrices.length > 0 ? myPrices.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-industrial)' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.fish_name}</td>
                                        <td style={{ padding: '15px', color: 'var(--accent-cyan)' }}>₱{parseFloat(p.price_per_kilo).toFixed(2)}</td>
                                        <td style={{ padding: '15px' }}>{p.quantity_available} kg</td>
                                        <td style={{ padding: '15px', fontSize: '0.75rem' }}>{p.market_date}</td>
                                        <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => handleEdit(p)}
                                                style={{ 
                                                    background: 'transparent', 
                                                    border: '1px solid var(--accent-cyan)', 
                                                    color: 'var(--accent-cyan)', 
                                                    padding: '5px 10px', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer',
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                EDIT
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)}
                                                style={{ 
                                                    background: 'transparent', 
                                                    border: '1px solid var(--fail-red)', 
                                                    color: 'var(--fail-red)', 
                                                    padding: '5px 10px', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer',
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                DELETE
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            NO PRODUCTS REGISTERED YET
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MyProducts;

