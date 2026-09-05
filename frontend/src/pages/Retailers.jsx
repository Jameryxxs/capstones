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
    const [searchQuery, setSearchQuery] = useState('');
    const [editingRetailer, setEditingRetailer] = useState(null);
    const [editFormData, setEditFormData] = useState({
        business_name: '',
        stall_number: '',
        contact_number: '',
        status: 'Active'
    });

    const handleEditClick = (retailer) => {
        setEditingRetailer(retailer);
        setEditFormData({
            business_name: retailer.business_name,
            stall_number: retailer.stall_number,
            contact_number: retailer.contact_number,
            status: retailer.status
        });
    };

    const handleUpdateRetailer = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`retailers/${editingRetailer.id}/`, editFormData);
            
            // Refresh the retailers list
            const res = await api.get('retailers/');
            setRetailers(res.data);
            
            setEditingRetailer(null);
        } catch (error) {
            console.error("Error updating retailer:", error);
            alert("Failed to update retailer.");
        }
    };

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
        {
            header: 'Actions',
            render: (row) => (
                <button 
                    onClick={() => handleEditClick(row)}
                    style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                    Edit
                </button>
            )
        }
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

    const filteredRetailers = retailers.filter(r => 
        r.business_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.stall_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSuppliers = suppliers.filter(s => 
        s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.boat_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2.2rem' }}>
                    Port Directory
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Verified registry of vessels and stall operators</p>
            </div>

            {/* TAB SELECTOR & SEARCH */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px', 
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-industrial)',
                paddingBottom: '10px'
            }}>
                <div style={{ display: 'flex', gap: '10px' }}>
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
                
                <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
                    <input 
                        type="text" 
                        placeholder={activeTab === 'suppliers' ? "Search vessels/suppliers..." : "Search stalls/retailers..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)' }}
                    />
                </div>
            </div>

            <Card title={activeTab === 'suppliers' ? "ACTIVE SUPPLY VESSELS" : "REGISTERED MARKET STALLS"}>
                {activeTab === 'suppliers' ? (
                    <Table 
                        columns={isMobile ? supplierColumns.slice(0, 2).concat(supplierColumns.slice(3)) : supplierColumns} 
                        data={filteredSuppliers} 
                    />
                ) : (
                    <Table 
                        columns={retailerColumns} 
                        data={filteredRetailers} 
                    />
                )}
            </Card>

            {editingRetailer && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <Card style={{ width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, color: 'var(--primary-navy)' }}>Edit Retailer Profile</h3>
                        <form onSubmit={handleUpdateRetailer}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Business Name</label>
                                <input 
                                    type="text" 
                                    value={editFormData.business_name}
                                    onChange={(e) => setEditFormData({...editFormData, business_name: e.target.value})}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-industrial)', borderRadius: '4px' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Stall Number</label>
                                <input 
                                    type="text" 
                                    value={editFormData.stall_number}
                                    onChange={(e) => setEditFormData({...editFormData, stall_number: e.target.value})}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-industrial)', borderRadius: '4px' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Contact Number</label>
                                <input 
                                    type="text" 
                                    value={editFormData.contact_number}
                                    onChange={(e) => setEditFormData({...editFormData, contact_number: e.target.value})}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-industrial)', borderRadius: '4px' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Status</label>
                                <select 
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-industrial)', borderRadius: '4px' }}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setEditingRetailer(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Save Changes</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Retailers;

