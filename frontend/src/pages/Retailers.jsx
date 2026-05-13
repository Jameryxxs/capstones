import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Card from '../components/Card';
import axios from 'axios';

const Retailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [fishes, setFishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isStaff, setIsStaff] = useState(true); // Defaulting for demo purposes

    useEffect(() => {
        fetchRetailers();
        fetchFishes();
    }, []);

    const fetchRetailers = async () => {
        const res = await axios.get('http://127.0.0.1:8000/api/retailers/');
        setRetailers(res.data);
    };

    const fetchFishes = async () => {
        const res = await axios.get('http://127.0.0.1:8000/api/fish/');
        setFishes(res.data);
    };

    const handleSelectRetailer = async (retailer) => {
        setSelectedRetailer(retailer);
        setLoading(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/retailers/${retailer.id}/inventory/`);
            setInventory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (item, newStatus) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/inventory/${item.id}/`, { 
                availability_status: newStatus 
            });
            handleSelectRetailer(selectedRetailer); // Refresh
        } catch (err) {
            alert("Error updating status");
        }
    };

    const getFishName = (id) => fishes.find(f => f.id === id)?.fish_name || `Fish #${id}`;

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#1a2a6c' }}>Retailer Stall Management</h1>
                <p style={{ color: '#666' }}>View and manage fish availability by specific market stalls.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Left: Retailer List */}
                <Card title="Market Retailers">
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {retailers.map(r => (
                            <div 
                                key={r.id} 
                                onClick={() => handleSelectRetailer(r)}
                                style={{ 
                                    padding: '15px', 
                                    borderBottom: '1px solid #eee', 
                                    cursor: 'pointer',
                                    background: selectedRetailer?.id === r.id ? '#e3f2fd' : 'transparent',
                                    borderRadius: '4px'
                                }}
                            >
                                <strong style={{ color: '#1a2a6c' }}>{r.business_name}</strong><br/>
                                <small>Stall: {r.stall_number}</small>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right: Stall Inventory */}
                <Card title={selectedRetailer ? `Stall Inventory: ${selectedRetailer.business_name}` : "Select a Retailer to view Inventory"}>
                    {selectedRetailer ? (
                        loading ? <p>Loading inventory...</p> : (
                            <Table 
                                headers={['Fish Species', 'Stock Qty', 'Status', 'Daily Update (Staff)']} 
                                data={inventory}
                                renderRow={(item) => (
                                    <>
                                        <td style={{ padding: '12px' }}>{getFishName(item.fish)}</td>
                                        <td style={{ padding: '12px' }}>{item.stock_quantity} {item.stock_unit}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '12px', 
                                                fontSize: '0.8rem',
                                                background: item.availability_status === 'Available' ? '#d4edda' : '#f8d7da',
                                                color: item.availability_status === 'Available' ? '#155724' : '#721c24'
                                            }}>
                                                {item.availability_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {isStaff && (
                                                <select 
                                                    value={item.availability_status}
                                                    onChange={(e) => handleUpdateStatus(item, e.target.value)}
                                                    style={{ padding: '5px', borderRadius: '4px' }}
                                                >
                                                    <option value="Available">Available</option>
                                                    <option value="Out of Stock">Out of Stock</option>
                                                    <option value="Limited">Limited</option>
                                                </select>
                                            )}
                                        </td>
                                    </>
                                )}
                            />
                        )
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: '100px 0' }}>
                            <p>Click on a retailer from the left list to see the fish available at their specific stall.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Retailers;
