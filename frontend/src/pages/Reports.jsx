import React from 'react';
import Card from '../components/Card';

const Reports = () => {
    const handleDownload = () => {
        window.open('http://127.0.0.1:8000/api/bulletin/', '_blank');
    };

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: '#1a2a6c' }}>Report Generation</h1>
                <p style={{ color: '#666' }}>Automated Daily Market Bulletins for Lucena Fish Port</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Card title="Daily Market Bulletin">
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Generate a professionally formatted PDF bulletin containing today's average prices, 
                        retailer listings, and market summaries.
                    </p>
                    <button 
                        onClick={handleDownload}
                        style={{ 
                            padding: '12px 24px', 
                            background: '#1a2a6c', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        📄 Download Today's Bulletin
                    </button>
                </Card>

                <Card title="Custom Reports">
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Historical data export and custom date-range reports (Coming Soon).
                    </p>
                    <button disabled style={{ padding: '12px 24px', background: '#ccc', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'not-allowed' }}>
                        Generate Custom Report
                    </button>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
