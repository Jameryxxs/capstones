import React from 'react';
import Table from '../components/Table';
import Card from '../components/Card';

const Retailers = () => {
    const data = [
        { name: 'Juan Dela Cruz Store', stall: 'A-12', contact: '09123456789', status: 'Active' },
        { name: 'Maria Santos Fresh Fish', stall: 'B-05', contact: '09876543210', status: 'Active' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Retailer Management</h1>
                <button style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Add Retailer</button>
            </div>
            <Card>
                <Table 
                    headers={['Business Name', 'Stall No.', 'Contact', 'Status']} 
                    data={data}
                    renderRow={(item) => (
                        <>
                            <td style={{ padding: '12px' }}>{item.name}</td>
                            <td style={{ padding: '12px' }}>{item.stall}</td>
                            <td style={{ padding: '12px' }}>{item.contact}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ color: '#28a745' }}>● {item.status}</span>
                            </td>
                        </>
                    )}
                />
            </Card>
        </div>
    );
};

export default Retailers;
