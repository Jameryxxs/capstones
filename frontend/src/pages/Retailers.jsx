import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';

const Retailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' or 'retailers'
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        const fetchData = async () => {
            try {
                const [retailerRes, supplierRes] = await Promise.all([
                    api.get('retailers/'),
                    api.get('supply-sources/')
                ]);
                setRetailers(retailerRes.data);
                setSuppliers(supplierRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const retailerColumns = [
        { header: 'Business Name', accessor: 'business_name' },
        { header: 'Stall #', accessor: 'stall_number' },
        { header: 'Contact', accessor: 'contact_number' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <span style={{ 
                    color: row.status === 'Active' ? 'var(--success-green)' : 'var(--fail-red)',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                }}>
                    {row.status.toUpperCase()}
                </span>
            )
        },
    ];

    const supplierColumns = [
        { header: 'Vessel/Boat Name', accessor: 'boat_name' },
        { header: 'Supplier Name', accessor: 'supplier_name' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <span style={{ 
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    background: row.status === 'docked' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                    color: row.status === 'docked' ? '#2ecc71' : '#3498db',
                    border: `1px solid ${row.status === 'docked' ? '#2ecc71' : '#3498db'}`
                }}>
                    {row.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        { header: 'Contact', accessor: 'contact_number' },
    ];

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>
                    Port Directory
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Verified registry of vessels and stall operators</p>
            </div>

            {/* TAB SELECTOR */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-industrial)',
                paddingBottom: '10px'
            }}>
                <button 
                    onClick={() => setActiveTab('suppliers')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'suppliers' ? 'var(--accent-cyan)' : 'transparent',
                        color: activeTab === 'suppliers' ? 'var(--bg-main)' : 'var(--text-muted)',
                        border: activeTab === 'suppliers' ? 'none' : '1px solid var(--border-industrial)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    SUPPLIERS (VESSELS)
                </button>
                <button 
                    onClick={() => setActiveTab('retailers')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'retailers' ? 'var(--accent-cyan)' : 'transparent',
                        color: activeTab === 'retailers' ? 'var(--bg-main)' : 'var(--text-muted)',
                        border: activeTab === 'retailers' ? 'none' : '1px solid var(--border-industrial)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    RETAILERS (STALLS)
                </button>
            </div>

            <Card title={activeTab === 'suppliers' ? "ACTIVE SUPPLY VESSELS" : "REGISTERED MARKET STALLS"}>
                {activeTab === 'suppliers' ? (
                    <Table 
                        columns={isMobile ? supplierColumns.slice(0, 2).concat(supplierColumns.slice(3)) : supplierColumns} 
                        data={suppliers} 
                    />
                ) : (
                    <Table 
                        columns={isMobile ? retailerColumns.slice(0, 2).concat(retailerColumns.slice(3)) : retailerColumns} 
                        data={retailers} 
                    />
                )}
            </Card>
        </div>
    );
};

export default Retailers;

