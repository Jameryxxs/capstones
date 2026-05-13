import React from 'react';
import Table from '../components/Table';
import Card from '../components/Card';

const Prices = () => {
    const data = [
        { fish: 'Tilapia', price: '₱120.00', status: 'Stable' },
        { fish: 'Bangus', price: '₱180.00', status: 'Increasing' },
        { fish: 'Galunggong', price: '₱240.00', status: 'Stable' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Fish Prices</h1>
                <button style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Update Price</button>
            </div>
            <Card>
                <Table 
                    headers={['Fish Name', 'Avg Price / kg', 'Market Trend']} 
                    data={data}
                    renderRow={(item) => (
                        <>
                            <td style={{ padding: '12px' }}>{item.fish}</td>
                            <td style={{ padding: '12px' }}>{item.price}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ 
                                    padding: '4px 8px', 
                                    background: item.status === 'Stable' ? '#d4edda' : '#fff3cd',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem'
                                }}>{item.status}</span>
                            </td>
                        </>
                    )}
                />
            </Card>
        </div>
    );
};

export default Prices;
