import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getUserRole } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';

const MarketMap = () => {
    const navigate = useNavigate();
    const [retailers, setRetailers] = useState([]);
    const [myRetailer, setMyRetailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stallSearch, setStallSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [zoom, setZoom] = useState(1);
    const [selectedStall, setSelectedStall] = useState(null);
    const [hoveredStall, setHoveredStall] = useState(null);
    const role = getUserRole();

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

    // Data for the high-fidelity demo
    const generateStalls = (apiData) => {
        const stalls = [];
        const totalStalls = 30;

        for (let i = 1; i <= totalStalls; i++) {
            const stallId = `F${i.toString().padStart(2, '0')}`;
            const existingRetailer = apiData.find(r => r.stall_number === stallId);

            if (existingRetailer) {
                stalls.push({
                    ...existingRetailer,
                    id: stallId,
                    lastUpdated: new Date().toLocaleString(),
                });
            } else {
                stalls.push({
                    id: stallId,
                    stall_number: stallId,
                    business_name: 'VACANT STALL',
                    vendor_name: 'N/A',
                    status: 'inactive',
                    inventory: [],
                    contact_number: 'N/A',
                    lastUpdated: '---',
                });
            }
        }
        return stalls;
    };

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const promises = [api.get('retailer-map-data/')];
                if (role === 'retailer') {
                    promises.push(api.get('retailers/me/'));
                }
                
                const results = await Promise.all(promises);
                setRetailers(generateStalls(results[0].data));
                if (results[1]) {
                    setMyRetailer(results[1].data);
                }
            } catch (err) {
                console.error("Failed to load map data", err);
                setRetailers(generateStalls([])); 
            } finally {
                setLoading(false);
            }
        };
        fetchMapData();
    }, [role]);

    const isMyStall = selectedStall && myRetailer && selectedStall.stall_number === myRetailer.stall_number;

    const filteredStalls = useMemo(() => {
        return retailers.filter(stall => {
            const matchesProduct = searchTerm === '' || 
                stall.inventory.some(item => item.fish_name.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStall = stallSearch === '' || 
                stall.id.toLowerCase().includes(stallSearch.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || 
                stall.inventory.some(item => item.category === categoryFilter);

            return matchesProduct && matchesStall && matchesCategory;
        });
    }, [retailers, searchTerm, stallSearch, categoryFilter]);

    const getStatusColor = (status, isHighlighted) => {
        if (isHighlighted) return 'var(--accent-cyan)';
        switch (status) {
            case 'available': return '#22c55e';
            case 'low stock': return '#eab308';
            case 'out of stock': return '#ef4444';
            case 'inactive': return '#64748b';
            default: return '#e2e8f0';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-fade-in map-page-container">

            {/* SEARCH & FILTER SECTION */}
            <div className="map-search-section">
                <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>PRODUCT SEARCH</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search Tuna, Bangus, Tilapia..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '35px', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>STALL LOCATOR</label>
                    <input 
                        type="text" 
                        placeholder="Enter Stall # (e.g. F01)" 
                        value={stallSearch}
                        onChange={(e) => setStallSearch(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>CATEGORY</label>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ fontSize: '0.85rem' }}>
                        <option value="all">All Species</option>
                        <option value="freshwater">Freshwater</option>
                        <option value="saltwater">Saltwater</option>
                    </select>
                </div>
                <button 
                    className="btn-primary clear-filters-btn" 
                    onClick={() => { setSearchTerm(''); setStallSearch(''); setCategoryFilter('all'); }}
                >
                    CLEAR FILTERS
                </button>
            </div>

            <div className="market-main-layout">

                {/* INTERACTIVE FLOOR PLAN MAP */}
                <div className="map-view-card">
                    <div className="map-card-header">
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-navy)', fontWeight: '800' }}>
                                CENTRAL FISH PORT MAP // <span style={{ color: 'var(--accent-cyan)' }}>LUCENA CITY</span>
                                                                </h3>
                                                                <span className="map-subtitle">INTERACTIVE STALL LOCATOR & PRODUCT MONITORING SYSTEM</span>

                        </div>
                        <div className="map-legend">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '2px' }}></div> AVAILABLE</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#eab308', borderRadius: '2px' }}></div> LOW STOCK</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div> OUT STOCK</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#64748b', borderRadius: '2px' }}></div> CLOSED</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}></div> WALKWAY</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#ef4444', border: '2px solid white' }}></div> EXIT</div>
                        </div>
                    </div>

                    <div className="map-canvas-container">
                        {/* ZOOM CONTROLS */}
                        <div className="zoom-controls">
                            <button onClick={handleZoomIn}>+</button>
                            <button onClick={handleResetZoom}>{Math.round(zoom * 100)}%</button>
                            <button onClick={handleZoomOut}>-</button>
                        </div>

                        <div className="map-scroll-wrapper">
                            <div className="map-svg-container" style={{ 
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top left'
                            }}>
                                <svg viewBox="0 0 1000 600" className="map-svg-element">
                                    {/* OUTER WALLS */}
                                    <rect x="0" y="0" width="1000" height="600" fill="#f8fafc" />
                                    <rect x="30" y="30" width="940" height="540" fill="none" stroke="#1e293b" strokeWidth="8" rx="4" />
                                    
                                    <rect x="40" y="40" width="920" height="520" fill="#cbd5e1" rx="2" /> 

                                    {/* GRID LINES */}
                                    <defs>
                                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                                        </pattern>
                                        <filter id="shadow">
                                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                                        </filter>
                                    </defs>
                                    <rect x="40" y="40" width="920" height="520" fill="url(#grid)" />

                                    {/* AISLES (Centered Gaps) */}
                                    <rect x="310" y="40" width="60" height="520" fill="#f1f5f9" /> 
                                    <rect x="630" y="40" width="60" height="520" fill="#f1f5f9" /> 
                                    <rect x="40" y="260" width="920" height="80" fill="#f1f5f9" /> 

                                    {/* SECTION LABELS */}
                                    <text x="185" y="65" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="800" opacity="0.5">SECTION ALPHA</text>
                                    <text x="500" y="65" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="800" opacity="0.5">SECTION BRAVO</text>
                                    <text x="815" y="65" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="800" opacity="0.5">SECTION CHARLIE</text>

                                    {/* FACILITIES */}
                                    <g>
                                        {/* Entrance 1 + Door Swing */}
                                        <rect x="70" y="26" width="80" height="8" fill="white" />
                                        <path d="M 70 26 Q 30 26 30 66" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 2" />
                                        <text x="110" y="20" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="800">ENTRANCE 01</text>

                                        {/* Entrance 2 + Door Swing */}
                                        <rect x="850" y="26" width="80" height="8" fill="white" />
                                        <path d="M 930 26 Q 970 26 970 66" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 2" />
                                        <text x="890" y="20" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="800">ENTRANCE 02</text>

                                        {/* Emergency Exit */}
                                        <rect x="966" y="280" width="8" height="40" fill="#ef4444" />
                                        <text x="985" y="300" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="800" transform="rotate(90, 985, 300)">FIRE EXIT</text>

                                        {/* Bottom Facilities */}
                                        <rect x="40" y="560" width="180" height="40" fill="#334155" rx="2" />
                                        <text x="130" y="585" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">🏛️ ADMIN OFFICE</text>

                                        <rect x="230" y="560" width="140" height="40" fill="#334155" rx="2" />
                                        <text x="300" y="585" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">❄️ ICE STORAGE</text>

                                        <rect x="380" y="560" width="100" height="40" fill="#475569" rx="2" />
                                        <text x="430" y="585" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">🚻 WC</text>

                                        <rect x="490" y="560" width="120" height="40" fill="#475569" rx="2" />
                                        <text x="550" y="585" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">♻️ WASTE</text>

                                        <rect x="780" y="560" width="180" height="40" fill="#1e293b" rx="2" />
                                        <text x="870" y="585" textAnchor="middle" fill="white" fontSize="9" fontWeight="800">🚛 LOADING DOCKS</text>
                                    </g>

                                    {/* STALL BLOCKS */}
                                    {retailers.map((stall, index) => {
                                        const block = Math.floor(index / 10);
                                        const subIndex = index % 10;
                                        const col = subIndex % 5;
                                        const row = Math.floor(subIndex / 5);

                                        const stallWidth = 46;
                                        const stallHeight = 74;
                                        const colSpacing = 52;

                                        let xOffset = 60 + (block * 320) + (col * colSpacing);
                                        let yOffset = 80 + (row * 90);
                                        if (row === 1) yOffset += 200;

                                        const isHighlighted = (searchTerm || stallSearch) && filteredStalls.some(fs => fs.id === stall.id);
                                        const isSelected = selectedStall?.id === stall.id;

                                        return (
                                            <g 
                                                key={stall.id} 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setSelectedStall(stall)}
                                                onMouseEnter={() => setHoveredStall(stall)}
                                                onMouseLeave={() => setHoveredStall(null)}
                                            >
                                                <rect 
                                                    x={xOffset} 
                                                    y={yOffset} 
                                                    width={stallWidth} 
                                                    height={stallHeight} 
                                                    className={isHighlighted ? "map-pulse" : ""}
                                                    fill={getStatusColor(stall.status, isHighlighted)}
                                                    stroke={isSelected ? '#09090b' : 'white'}
                                                    strokeWidth={isSelected ? '3' : '1'}
                                                    rx="6"
                                                    filter="url(#shadow)"
                                                    style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                                />
                                                <text 
                                                    x={xOffset + stallWidth/2} 
                                                    y={yOffset + stallHeight/2} 
                                                    textAnchor="middle" 
                                                    dominantBaseline="central"
                                                    fill="white" 
                                                    fontSize="12" 
                                                    fontWeight="900"
                                                    style={{ pointerEvents: 'none' }}
                                                >
                                                    {stall.id}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                        {/* HOVER TOOLTIP */}
                        {hoveredStall && (
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#1e293b',
                                color: 'white',
                                padding: '6px 16px',
                                borderRadius: '30px',
                                fontSize: '0.75rem',
                                zIndex: 30,
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <span style={{ fontWeight: '800', marginRight: '8px' }}>{hoveredStall.id}</span>
                                <span>{hoveredStall.business_name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* INFORMATION PANEL - FULLY SCROLLABLE */}
                <div className="info-panel-container" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    {selectedStall ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '100%',
                            gap: '20px'
                        }}>
                            <Card 
                            title={`STALL LOG // ${selectedStall.id}`} 

                                style={{ flex: 1, minHeight: 0 }}
                                contentStyle={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
                            >
                                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px', scrollbarWidth: 'thin' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                        <div style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            background: getStatusColor(selectedStall.status, false), 
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '1.2rem',
                                            fontWeight: '800'
                                        }}>
                                            {selectedStall.id.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>{selectedStall.business_name}</h2>
                                            <span style={{ 
                                                fontSize: '0.65rem', 
                                                padding: '3px 8px', 
                                                borderRadius: '20px', 
                                                background: getStatusColor(selectedStall.status, false) + '15',
                                                color: getStatusColor(selectedStall.status, false),
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                border: `1px solid ${getStatusColor(selectedStall.status, false)}30`
                                            }}>
                                                ● {selectedStall.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', fontSize: '0.8rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Vendor</label>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedStall.vendor_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Contact</label>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedStall.contact_number}</p>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Last Sync</label>
                                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{selectedStall.lastUpdated}</p>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border-industrial)', paddingTop: '15px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                                            LIVE PRODUCT AVAILABILITY
                                        </h4>

                                        {selectedStall.inventory.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {selectedStall.inventory.map((item, idx) => (
                                                    <div key={idx} style={{ 
                                                        padding: '12px', 
                                                        borderRadius: '12px', 
                                                        background: '#f8fafc',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                            <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{item.fish_name}</span>
                                                            <span style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.85rem' }}>₱{item.price}/kg</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                                            <span style={{ color: item.stock < 50 ? '#ef4444' : '#22c55e', fontWeight: '800' }}>
                                                                {item.stock} {item.unit} STOCK
                                                            </span>
                                                            <span style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>{item.category}</span>
                                                        </div>
                                                        {item.remarks && (
                                                            <div style={{ 
                                                                marginTop: '8px', 
                                                                fontSize: '0.7rem', 
                                                                color: 'var(--text-muted)', 
                                                                fontStyle: 'italic',
                                                                padding: '6px',
                                                                background: 'rgba(0,0,0,0.03)',
                                                                borderRadius: '4px',
                                                                borderLeft: '2px solid var(--accent-cyan)'
                                                            }}>
                                                                "{item.remarks}"
                                                            </div>
                                                        )}
                                                        {item.stock < 50 && (
                                                            <div style={{ height: '3px', background: '#e2e8f0', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${(item.stock/100)*100}%`, height: '100%', background: '#ef4444' }}></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>NO INVENTORY LOGGED</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    {selectedStall.status === 'inactive' ? (
                                        <button 
                                            className="btn-primary" 
                                            style={{ flex: 1, padding: '12px', background: 'var(--accent-cyan)' }}
                                            onClick={() => navigate('/register', { state: { stall_number: selectedStall.id } })}
                                        >
                                            CLAIM THIS STALL
                                        </button>
                                    ) : (
                                        <>
                                            <button 
                                                className="btn-primary" 
                                                style={{ flex: 1, padding: '12px' }}
                                                onClick={() => navigate('/prices', { state: { retailer_id: selectedStall.id } })}
                                            >
                                                VIEW LIVE PRICES
                                            </button>
                                            {isMyStall && (
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ flex: 1, padding: '12px', background: 'var(--primary-navy)' }}
                                                    onClick={() => navigate('/my-stall')}
                                                >
                                                    MANAGE MY STALL
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {role === 'admin' && (
                                        <button 
                                            style={{ 
                                                flex: 1, 
                                                padding: '12px', 
                                                background: '#1e293b', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: 'var(--radius-sm)', 
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            MANAGE STALL
                                        </button>
                                    )}
                                </div>
                            </Card>

                            <div style={{ 
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                                padding: '20px', 
                                borderRadius: 'var(--radius-lg)', 
                                color: 'white',
                                boxShadow: 'var(--shadow-command)'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', letterSpacing: '1px', opacity: 0.8 }}>MARKET QUICK STATS</h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Active Stalls</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>26/30</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Lead Product</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>Tuna</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            textAlign: 'center',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px dashed var(--border-industrial)',
                            padding: '40px',
                            color: 'var(--text-muted)',
                            boxShadow: 'var(--shadow-command)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📍</div>
                            <h3 style={{ color: 'var(--primary-navy)', margin: '0 0 10px 0', fontWeight: '800' }}>NO STALL SELECTED</h3>
                            <p style={{ fontSize: '0.75rem', maxWidth: '240px', margin: '0 auto', lineHeight: '1.5' }}>
                                SELECT A STALL UNIT FROM THE FLOOR PLAN TO VIEW REAL-TIME INVENTORY AND VENDOR LOGS.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                .map-page-container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 120px);
                    padding-bottom: 20px;
                }

                .map-search-section {
                    background: var(--bg-card);
                    padding: 15px 25px;
                    border-radius: var(--radius-lg);
                    margin-bottom: 20px;
                    box-shadow: var(--shadow-command);
                    border: 1px solid var(--border-industrial);
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr auto;
                    gap: 20px;
                    align-items: end;
                }

                .market-main-layout {
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 25px;
                    flex: 1;
                    min-height: 0;
                }

                .map-view-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-industrial);
                    box-shadow: var(--shadow-command);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                }

                .map-card-header {
                    padding: 15px 20px;
                    border-bottom: 1px solid var(--border-industrial);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }

                .map-subtitle {
                    fontSize: 0.65rem;
                    color: var(--text-muted);
                    display: block;
                }

                .map-legend {
                    display: grid;
                    grid-template-columns: repeat(3, auto);
                    gap: 10px 20px;
                    font-size: 0.65rem;
                    font-weight: 700;
                }

                .map-canvas-container {
                    flex: 1;
                    position: relative;
                    background: #f1f5f9;
                    overflow: hidden;
                    min-height: 400px;
                }

                .zoom-controls {
                    position: absolute;
                    right: 20px;
                    bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    z-index: 20;
                }

                .zoom-controls button {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: white;
                    border: 1px solid #cbd5e1;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    cursor: pointer;
                    font-weight: 800;
                    color: var(--primary-navy);
                    transition: all 0.2s;
                }

                .zoom-controls button:hover {
                    background: #f8fafc;
                    transform: translateY(-1px);
                }

                .map-scroll-wrapper {
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    padding: 40px;
                }

                .map-svg-container {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    width: 1000px;
                    height: 600px;
                    position: relative;
                }

                .map-svg-element {
                    width: 1000px;
                    height: 600px;
                    display: block;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    border-radius: 8px;
                    background: white;
                }

                .clear-filters-btn {
                    padding: 12px 20px;
                    font-size: 0.75rem;
                }

                .map-pulse {
                    animation: pulse-border 2s infinite;
                }

                @keyframes pulse-border {
                    0% { stroke: var(--accent-cyan); stroke-width: 3; filter: brightness(1.2); }
                    50% { stroke: white; stroke-width: 1; filter: brightness(1); }
                    100% { stroke: var(--accent-cyan); stroke-width: 3; filter: brightness(1.2); }
                }

                /* RESPONSIVE BREAKPOINTS */
                @media (max-width: 1200px) {
                    .market-main-layout {
                        grid-template-columns: 1fr;
                        height: auto;
                        overflow: visible;
                    }
                    .map-page-container {
                        height: auto;
                        overflow: visible;
                    }
                    .map-view-card {
                        height: 600px;
                        margin-bottom: 25px;
                    }
                    .info-panel-container {
                        height: auto !important;
                        min-height: 500px;
                    }
                }

                @media (max-width: 1024px) {
                    .map-search-section {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .map-card-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    .map-legend {
                        grid-template-columns: repeat(2, auto);
                        width: 100%;
                    }
                }

                @media (max-width: 640px) {
                    .map-search-section {
                        grid-template-columns: 1fr;
                    }
                    .map-scroll-wrapper {
                        padding: 10px;
                    }
                    .map-svg-container, .map-svg-element {
                        width: 100%;
                        height: auto;
                    }
                    .map-view-card {
                        height: auto;
                        min-height: 400px;
                    }
                    .map-canvas-container {
                        min-height: 300px;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default MarketMap;



