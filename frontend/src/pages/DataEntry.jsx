import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api, { getUserRole, retailerApi } from '../api';
import { db } from '../db';
import LoadingSpinner from '../components/LoadingSpinner';

const DataEntry = () => {
    const [fishes, setFishes] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [showFishModal, setShowFishModal] = useState(false);
    const [userRole, setUserRole] = useState(getUserRole());
    const [entryType, setEntryType] = useState('retailer'); // 'retailer' or 'supplier'

    const [formData, setFormData] = useState({
        fish: '',
        retailer: '',
        supply_source: '',
        origin: '',
        price_per_kilo: '',
        quantity_available: '',
        quantity: '',
        delivery_date: new Date().toISOString().split('T')[0],
        market_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const [newFishData, setNewFishData] = useState({
        fish_name: '',
        category: 'freshwater',
        average_price: '',
        description: ''
    });

    const [lastEntries, setLastEntries] = useState([]);

    const quickSelectSpecies = ['Galunggong', 'Bangus', 'Tilapia', 'Tuna', 'Tambakol', 'Sapsap'];

    const handleQuickSelect = (name) => {
        const found = fishes.find(f => f.fish_name.toLowerCase() === name.toLowerCase());
        if (found) {
            setFormData({ ...formData, fish: found.id });
        }
    };

    const [entityDetails, setEntityDetails] = useState({ name: '', address: '', extra: '' });

    const fetchData = async () => {
        try {
            const [fishRes, retailerRes, supplierRes, locationRes] = await Promise.all([
                api.get('fish/'),
                api.get('retailers/'),
                api.get('supply-sources/'),
                api.get('locations/')
            ]);
            setFishes(fishRes.data);
            setRetailers(retailerRes.data);
            setSuppliers(supplierRes.data);
            setLocations(locationRes.data);

            // Auto-select based on role
            if (userRole === 'retailer') {
                try {
                    const meRes = await retailerApi.getMe();
                    setFormData(prev => ({ ...prev, retailer: meRes.data.id }));
                    setEntityDetails({ 
                        name: meRes.data.business_name, 
                        address: meRes.data.stall_number 
                    });
                } catch (err) {
                    console.error("Failed to fetch own retailer profile", err);
                }
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRetailerChange = (id) => {
        const found = retailers.find(r => r.id === parseInt(id));
        if (found) {
            setFormData({ ...formData, retailer: id });
            setEntityDetails({ 
                name: found.business_name, 
                address: found.stall_number 
            });
        } else {
            setFormData({ ...formData, retailer: '' });
            setEntityDetails({ name: '', address: '' });
        }
    };

    const handleSupplierChange = (id) => {
        const found = suppliers.find(s => s.id === parseInt(id));
        if (found) {
            setFormData({ ...formData, supply_source: id });
            setEntityDetails({ 
                name: found.supplier_name, 
                address: found.boat_name,
                extra: `Origin: ${found.fishing_location}`
            });
        } else {
            setFormData({ ...formData, supply_source: '' });
            setEntityDetails({ name: '', address: '', extra: '' });
        }
    };

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        fetchData();
        updatePendingCount();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updatePendingCount = async () => {
        const pCount = await db.pendingPrices.count();
        const dCount = await db.pendingDeliveries.count();
        setPendingCount(pCount + dCount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const fishName = fishes.find(f => f.id === parseInt(formData.fish))?.fish_name || 'Species';

        if (entryType === 'retailer') {
            const payload = {
                fish: formData.fish,
                retailer: formData.retailer,
                origin: formData.origin,
                price_per_kilo: parseFloat(formData.price_per_kilo),
                quantity_available: parseInt(formData.quantity_available),
                market_date: new Date().toISOString().split('T')[0],
                remarks: formData.remarks
            };

            if (isOnline) {
                try {
                    await api.post('fish-prices/', payload);
                    setLastEntries(prev => [{ 
                        name: fishName, 
                        price: formData.price_per_kilo, 
                        qty: formData.quantity_available, 
                        type: 'RETAIL',
                        time: new Date().toLocaleTimeString() 
                    }, ...prev].slice(0, 5));
                    setFormData({ ...formData, price_per_kilo: '', quantity_available: '' });
                } catch (err) {
                    alert('Failed to add price. Saving locally.');
                    await db.pendingPrices.add(payload);
                    updatePendingCount();
                }
            } else {
                await db.pendingPrices.add(payload);
                setLastEntries(prev => [{ name: fishName, price: formData.price_per_kilo, qty: formData.quantity_available, type: 'RETAIL', time: 'OFFLINE' }, ...prev].slice(0, 5));
                updatePendingCount();
                setFormData({ ...formData, price_per_kilo: '', quantity_available: '' });
            }
        } else {
            // Supplier Delivery
            const payload = {
                fish: formData.fish,
                supply_source: formData.supply_source,
                retailer: formData.retailer,
                quantity: parseInt(formData.quantity),
                delivery_date: formData.delivery_date || new Date().toISOString().split('T')[0],
                delivery_status: 'delivered',
                remarks: formData.remarks
            };

            if (isOnline) {
                try {
                    await api.post('deliveries/', payload);
                    setLastEntries(prev => [{ 
                        name: fishName, 
                        qty: formData.quantity, 
                        type: 'DELIVERY',
                        time: new Date().toLocaleTimeString() 
                    }, ...prev].slice(0, 5));
                    setFormData({ ...formData, quantity: '' });
                } catch (err) {
                    alert('Failed to add delivery. Saving locally.');
                    await db.pendingDeliveries.add(payload);
                    updatePendingCount();
                }
            } else {
                await db.pendingDeliveries.add(payload);
                setLastEntries(prev => [{ name: fishName, qty: formData.quantity, type: 'DELIVERY', time: 'OFFLINE' }, ...prev].slice(0, 5));
                updatePendingCount();
                setFormData({ ...formData, quantity: '' });
            }
        }
    };

    const handleAddFish = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('fish/', newFishData);
            setFishes([...fishes, res.data]);
            setFormData({ ...formData, fish: res.data.id });
            setShowFishModal(false);
            setNewFishData({
                fish_name: '',
                category: 'freshwater',
                average_price: '',
                description: ''
            });
            alert('New species added successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to add species. Check inputs.');
        }
    };

    const handleSync = async () => {
        if (!isOnline) return;
        setSyncing(true);
        
        // Sync Prices
        const pendingPrices = await db.pendingPrices.toArray();
        for (const item of pendingPrices) {
            try {
                const { id, ...data } = item;
                await api.post('fish-prices/', data);
                await db.pendingPrices.delete(id);
            } catch (err) {
                console.error('Sync failed for price log', item, err);
            }
        }

        // Sync Deliveries
        const pendingDeliveries = await db.pendingDeliveries.toArray();
        for (const item of pendingDeliveries) {
            try {
                const { id, ...data } = item;
                await api.post('deliveries/', data);
                await db.pendingDeliveries.delete(id);
            } catch (err) {
                console.error('Sync failed for delivery log', item, err);
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
                        DATA ENTRY // <span style={{ color: 'var(--accent-cyan)' }}>OFFLINE ENABLED</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Record Daily Market Operations
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

            {/* ENTRY TYPE TOGGLE */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => { setEntryType('retailer'); setEntityDetails({name: '', address: ''}); }}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: entryType === 'retailer' ? 'var(--accent-cyan)' : 'transparent',
                        color: entryType === 'retailer' ? 'var(--bg-main)' : 'var(--text-muted)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    RETAILER PRICE LOG
                </button>
                <button 
                    onClick={() => { setEntryType('supplier'); setEntityDetails({name: '', address: '', extra: ''}); }}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: entryType === 'supplier' ? 'var(--accent-cyan)' : 'transparent',
                        color: entryType === 'supplier' ? 'var(--bg-main)' : 'var(--text-muted)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    SUPPLIER DELIVERY LOG
                </button>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth > 900 ? '1fr 350px' : '1fr', 
                gap: '30px',
                alignItems: 'start'
            }}>
                <Card style={{ width: '100%' }}>
                    <form onSubmit={handleSubmit}>
                        {/* FISH SPECIES SECTION */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FISH SPECIES</label>
                                <button 
                                    type="button" 
                                    onClick={() => setShowFishModal(true)}
                                    style={{ 
                                        background: 'transparent', 
                                        border: 'none', 
                                        color: 'var(--accent-cyan)', 
                                        fontSize: '0.7rem', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        padding: '0'
                                    }}
                                >
                                    + ADD NEW SPECIES
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {quickSelectSpecies.map(name => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => handleQuickSelect(name)}
                                        style={{
                                            padding: '4px 10px',
                                            fontSize: '0.65rem',
                                            background: 'rgba(100, 255, 218, 0.05)',
                                            border: '1px solid rgba(100, 255, 218, 0.2)',
                                            color: 'var(--accent-cyan)',
                                            borderRadius: '15px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {name.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <select 
                                value={formData.fish}
                                onChange={(e) => setFormData({...formData, fish: e.target.value})}
                                required
                            >
                                <option value="">Select Fish</option>
                                {fishes.map(f => <option key={f.id} value={f.id}>{f.fish_name.toUpperCase()}</option>)}
                            </select>
                        </div>
                        
                        {/* ENTITY SECTION (RETAILER or SUPPLIER) */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                        {entryType === 'retailer' ? 'RETAILER / STALL' : 'SUPPLIER / BOAT'}
                                    </label>
                                    <input 
                                        type="text" 
                                        list={entryType === 'retailer' ? "retailers-datalist" : "suppliers-datalist"}
                                        value={entityDetails.name}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            setEntityDetails({ ...entityDetails, name: name });
                                            if (entryType === 'retailer') {
                                                const found = retailers.find(r => r.business_name.toLowerCase() === name.toLowerCase());
                                                if (found) handleRetailerChange(found.id);
                                                else setFormData({ ...formData, retailer: '' });
                                            } else {
                                                const found = suppliers.find(s => s.supplier_name.toLowerCase() === name.toLowerCase());
                                                if (found) handleSupplierChange(found.id);
                                                else setFormData({ ...formData, supply_source: '' });
                                            }
                                        }}
                                        placeholder="Search or type name..."
                                        style={{ background: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <datalist id={entryType === 'retailer' ? "retailers-datalist" : "suppliers-datalist"}>
                                        {entryType === 'retailer' 
                                            ? retailers.map(r => <option key={r.id} value={r.business_name} />)
                                            : suppliers.map(s => <option key={s.id} value={s.supplier_name} />)
                                        }
                                    </datalist>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                        {entryType === 'retailer' ? 'STALL NUMBER' : 'BOAT NAME'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={entityDetails.address}
                                        readOnly
                                        style={{ background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
                            {entityDetails.extra && (
                                <p style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', marginTop: '5px' }}>{entityDetails.extra}</p>
                            )}
                        </div>

                        {/* RETAILER SPECIFIC DESTINATION (FOR SUPPLIER LOG) */}
                        {entryType === 'supplier' && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TARGET RETAILER (DESTINATION)</label>
                                <select 
                                    value={formData.retailer}
                                    onChange={(e) => setFormData({...formData, retailer: e.target.value})}
                                    required
                                >
                                    <option value="">Select Target Stall</option>
                                    {retailers.map(r => <option key={r.id} value={r.id}>{r.business_name} (Stall {r.stall_number})</option>)}
                                </select>
                            </div>
                        )}

                        {/* DATA FIELDS */}
                        {entryType === 'retailer' ? (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORIGIN OF FISH</label>
                                    <input 
                                        type="text" 
                                        list="locations-datalist"
                                        placeholder="Where was this fish caught?"
                                        value={formData.origin}
                                        onChange={(e) => setFormData({...formData, origin: e.target.value})}
                                        required
                                    />
                                    <datalist id="locations-datalist">
                                        {locations.map(loc => <option key={loc.id} value={loc.location_name} />)}
                                    </datalist>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>PRICE (₱/KG)</label>
                                        <input 
                                            type="number" step="0.01" value={formData.price_per_kilo}
                                            onChange={(e) => setFormData({...formData, price_per_kilo: e.target.value})} required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>QUANTITY (KG)</label>
                                        <input 
                                            type="number" value={formData.quantity_available}
                                            onChange={(e) => setFormData({...formData, quantity_available: e.target.value})} required
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>DELIVERY DATE</label>
                                    <input 
                                        type="date" value={formData.delivery_date}
                                        onChange={(e) => setFormData({...formData, delivery_date: e.target.value})} required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>QUANTITY (KG)</label>
                                    <input 
                                        type="number" value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})} required
                                    />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            style={{
                                width: '100%', padding: '15px', background: 'transparent', border: '1px solid var(--accent-cyan)',
                                color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer'
                            }}
                        >
                            {isOnline ? 'SUBMIT TO SERVER' : 'SAVE LOCALLY OFFLINE'}
                        </button>
                    </form>
                </Card>

                {/* SESSION ACTIVITY LOG */}
                {lastEntries.length > 0 && (
                    <Card style={{ width: '100%', padding: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>SESSION ACTIVITY</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {lastEntries.map((entry, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px', background: 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${entry.type === 'RETAIL' ? 'var(--accent-cyan)' : 'var(--success-green)'}`,
                                    borderRadius: '4px'
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>{entry.name.toUpperCase()}</p>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {entry.qty} KG {entry.price ? `@ ₱${entry.price}` : '(DELIVERY)'}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>{entry.time}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* NEW FISH MODAL */}
            {showFishModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <Card style={{ maxWidth: '500px', width: '100%' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: 'var(--accent-cyan)', fontSize: '1.2rem', letterSpacing: '1px' }}>REGISTER NEW SPECIES</h3>
                        <form onSubmit={handleAddFish}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SPECIES NAME</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Bluefin Tuna"
                                    value={newFishData.fish_name}
                                    onChange={(e) => setNewFishData({...newFishData, fish_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>CATEGORY</label>
                                    <select 
                                        value={newFishData.category}
                                        onChange={(e) => setNewFishData({...newFishData, category: e.target.value})}
                                    >
                                        <option value="freshwater">Freshwater</option>
                                        <option value="saltwater">Saltwater</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>AVG PRICE</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="0.00"
                                        value={newFishData.average_price}
                                        onChange={(e) => setNewFishData({...newFishData, average_price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>DESCRIPTION</label>
                                <textarea 
                                    style={{ width: '100%', minHeight: '80px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-industrial)', color: 'white', borderRadius: '4px' }}
                                    value={newFishData.description}
                                    onChange={(e) => setNewFishData({...newFishData, description: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>ADD SPECIES</button>
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => setShowFishModal(false)}
                                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)' }}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

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
                    CONNECTION LOST // DATA WILL BE CACHED LOCALLY
                </div>
            )}
        </div>
    );
};

export default DataEntry;

