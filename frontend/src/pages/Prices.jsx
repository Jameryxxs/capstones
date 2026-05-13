import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Card from '../components/Card';
import axios from 'axios';

const Prices = () => {
    const [prices, setPrices] = useState([]);
    const [fishes, setFishes] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fish: '',
        retailer: '',
        price_per_kilo: '',
        quantity_available: '',
        market_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [priceRes, fishRes, retailerRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/fish-prices/'),
                axios.get('http://127.0.0.1:8000/api/fish/'),
                axios.get('http://127.0.0.1:8000/api/retailers/')
            ]);
            setPrices(priceRes.data);
            setFishes(fishRes.data);
            setRetailers(retailerRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/fish-prices/', formData);
            alert("Price recorded successfully!");
            setShowForm(false);
            fetchData();
        } catch (err) {
            alert("Error recording price. Ensure all fields are valid.");
        }
    };

    // Helper to get names for IDs
    const getFishName = (id) => fishes.find(f => f.id === id)?.fish_name || id;
    const getRetailerName = (id) => retailers.find(r => r.id === id)?.business_name || id;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#1a2a6c' }}>Market Price Monitoring</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {showForm ? 'Cancel' : 'Record New Price'}
                </button>
            </div>

            {showForm && (
                <Card style={{ marginBottom: '20px' }}>
                    <h3>Record Daily Price</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        <div>
                            <label>Fish Species</label>
                            <select name="fish" value={formData.fish} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                                <option value="">-- Select Fish --</option>
                                {fishes.map(f => <option key={f.id} value={f.id}>{f.fish_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Retailer</label>
                            <select name="retailer" value={formData.retailer} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                                <option value="">-- Select Retailer --</option>
                                {retailers.map(r => <option key={r.id} value={r.id}>{r.business_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Price / kg (PHP)</label>
                            <input name="price_per_kilo" type="number" step="0.01" value={formData.price_per_kilo} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                            <label>Qty Available (kg)</label>
                            <input name="quantity_available" type="number" value={formData.quantity_available} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                            <label>Market Date</label>
                            <input name="market_date" type="date" value={formData.market_date} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 3' }}>
                            <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Submit Market Entry
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <Table 
                    headers={['Date', 'Fish Species', 'Retailer', 'Price / kg', 'Available Qty']} 
                    data={prices.slice(0, 50)} // Show only latest 50 for performance
                    renderRow={(item) => (
                        <>
                            <td style={{ padding: '12px' }}>{item.market_date}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{getFishName(item.fish)}</td>
                            <td style={{ padding: '12px' }}>{getRetailerName(item.retailer)}</td>
                            <td style={{ padding: '12px' }}>₱{item.price_per_kilo}</td>
                            <td style={{ padding: '12px' }}>{item.quantity_available} kg</td>
                        </>
                    )}
                />
                {prices.length > 50 && <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>Showing latest 50 records. Total: {prices.length}</p>}
            </Card>
        </div>
    );
};

export default Prices;
