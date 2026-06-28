import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api, { supplyApi } from '../api';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';

const Supply = () => {
    const [locations, setLocations] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        supplier_type: 'vessel',
        supplier_name: '',
        boat_name: '',
        fishing_location: '',
        contact_number: '',
        status: 'at_sea',
        arrival_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        Promise.all([
            api.get('locations/'),
            supplyApi.getAll()
        ]).then(([locRes, supRes]) => {
            setLocations(locRes.data);
            setSuppliers(supRes.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                fishing_location: parseInt(formData.fishing_location)
            };
            const res = await supplyApi.create(payload);
            setSuppliers([res.data, ...suppliers]);
            setFormData({
                supplier_type: 'vessel',
                supplier_name: '',
                boat_name: '',
                fishing_location: '',
                contact_number: '',
                status: 'at_sea',
                arrival_date: new Date().toISOString().split('T')[0]
            });
            alert('Supplier added successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to add supplier. Check your inputs.');
        }
    };

    const handleDeleteSupplier = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await supplyApi.delete(id);
            setSuppliers(suppliers.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete supplier.');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await supplyApi.update(id, { status: newStatus });
            setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: newStatus } : s));
        } catch (err) {
            console.error(err);
            alert('Failed to update status.');
        }
    };

    const locationColumns = [
        { header: 'Fishing Ground', accessor: 'location_name' },
        { header: 'Region', accessor: 'region' },
        { header: 'Province', accessor: 'province' },
    ];

    const supplierColumns = [
        { 
            header: 'Type', 
            accessor: 'supplier_type',
            render: (row) => (
                <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                    background: row.supplier_type === 'vessel' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                    color: row.supplier_type === 'vessel' ? 'var(--secondary-blue)' : 'var(--success-green)'
                }}>
                    {row.supplier_type === 'vessel' ? '🚢 VESSEL' : '🚛 EXTERNAL'}
                </span>
            )
        },
        { header: 'Supplier Name', accessor: 'supplier_name' },
        { 
            header: 'Vehicle / Boat', 
            accessor: 'boat_name',
            render: (row) => row.boat_name ? row.boat_name : <span style={{ color: 'var(--text-muted)' }}>N/A</span>
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <select 
                    value={row.status}
                    onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
                    style={{
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        border: `1px solid ${row.status === 'docked' ? 'var(--success-green)' : row.status === 'in_transit' ? 'rgba(29, 78, 216, 0.5)' : 'var(--safety-orange)'}`,
                        background: row.status === 'docked' ? 'rgba(16, 185, 129, 0.1)' : row.status === 'in_transit' ? 'rgba(29, 78, 216, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: row.status === 'docked' ? 'var(--success-green)' : row.status === 'in_transit' ? '#1d4ed8' : 'var(--safety-orange)',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        textAlign: 'center'
                    }}
                >
                    <option value="at_sea">AT SEA</option>
                    <option value="in_transit">IN TRANSIT</option>
                    <option value="docked">DOCKED</option>
                </select>
            )
        },
        { header: 'Arrival Date', accessor: 'arrival_date' },
        { 
            header: 'Actions', 
            accessor: 'id',
            render: (row) => (
                <button 
                    onClick={() => handleDeleteSupplier(row.id)}
                    style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--fail-red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}
                >
                    Delete
                </button>
            )
        }
    ];

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (s.boat_name && s.boat_name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: isMobile ? '1.5rem' : '2rem' }}>Supply Sources</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage suppliers, vessels, and active fishing locations</p>
            </div>

            <Card title="Add New Supplier" style={{ marginBottom: '30px', padding: isMobile ? '15px' : '25px' }}>
                <form onSubmit={handleAddSupplier} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '15px' }}>
                    <div style={{ gridColumn: isMobile ? '1' : '1 / span 3' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Supplier Type *</label>
                        <select 
                            required 
                            value={formData.supplier_type} 
                            onChange={e => {
                                const t = e.target.value;
                                setFormData({
                                    ...formData, 
                                    supplier_type: t, 
                                    status: t === 'vessel' ? 'at_sea' : 'in_transit',
                                    boat_name: ''
                                });
                            }}
                            style={{ padding: '10px', width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-industrial)' }}
                        >
                            <option value="vessel">Fishing Vessel 🚢</option>
                            <option value="external">External Supplier (Land Transport) 🚛</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Supplier Name *</label>
                        <input required type="text" value={formData.supplier_name} onChange={e => setFormData({...formData, supplier_name: e.target.value})} />
                    </div>
                    {formData.supplier_type === 'vessel' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Boat Name *</label>
                            <input required type="text" value={formData.boat_name} onChange={e => setFormData({...formData, boat_name: e.target.value})} />
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Contact Number *</label>
                        <input required type="text" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{formData.supplier_type === 'vessel' ? 'Fishing Location' : 'Origin Place / Municipality'} *</label>
                        <select required value={formData.fishing_location} onChange={e => setFormData({...formData, fishing_location: e.target.value})}>
                            <option value="">Select a location...</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.location_name} ({loc.province})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Status *</label>
                        <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            {formData.supplier_type === 'vessel' && <option value="at_sea">At Sea</option>}
                            <option value="in_transit">In Transit</option>
                            {formData.supplier_type === 'vessel' && <option value="docked">Docked</option>}
                            {formData.supplier_type === 'external' && <option value="arrived">Arrived</option>}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Arrival Date *</label>
                        <input required type="date" value={formData.arrival_date} onChange={e => setFormData({...formData, arrival_date: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: isMobile ? '1' : '1 / span 3', marginTop: '10px' }}>
                        <button type="submit" style={{ padding: '12px 24px', backgroundColor: 'var(--accent-cyan)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
                            Add Supplier
                        </button>
                    </div>
                </form>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <Card title="Active Suppliers">
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <input 
                            type="text" 
                            placeholder="Search by supplier or boat name..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: '1', padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)' }}
                        />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '10px', border: '1px solid var(--border-industrial)', borderRadius: 'var(--radius-sm)' }}
                        >
                            <option value="all">All Status</option>
                            <option value="at_sea">At Sea</option>
                            <option value="in_transit">In Transit</option>
                            <option value="docked">Docked</option>
                            <option value="arrived">Arrived</option>
                        </select>
                    </div>
                    {filteredSuppliers.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No suppliers match your filters.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <Table columns={supplierColumns} data={filteredSuppliers} />
                        </div>
                    )}
                </Card>

                <Card title="Fishing Locations Reference">
                    <div style={{ overflowX: 'auto' }}>
                        <Table columns={locationColumns} data={locations} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Supply;

