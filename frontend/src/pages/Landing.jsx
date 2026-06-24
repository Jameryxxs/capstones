import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Landing = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [publicData, setPublicData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        
        // Fetch public market data
        api.get('public-market/')
            .then(res => {
                setPublicData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load public market data", err);
                setLoading(false);
            });

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ 
            minHeight: 'calc(100vh - 80px)', 
            background: 'var(--bg-main)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflowX: 'hidden',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
        className="page-fade-in"
        >
            {/* Hero Section */}
            <section style={{ 
                textAlign: 'center', 
                padding: isMobile ? '60px 15px' : '100px 20px 80px',
                background: 'radial-gradient(circle at top, rgba(79, 70, 229, 0.05) 0%, var(--bg-main) 70%)',
                color: 'var(--text-main)',
                borderBottom: '1px solid var(--border-industrial)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Glowing Capstone Badge */}
                    <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        background: 'rgba(79, 70, 229, 0.08)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        borderRadius: '30px',
                        marginBottom: '25px',
                        border: '1px solid rgba(79, 70, 229, 0.2)',
                        boxShadow: '0 4px 10px rgba(79, 70, 229, 0.05)'
                    }}>
                        <span>🐟</span> LUCENA FISH PORT COMPLEX PLATFORM
                    </div>
                    
                    <h1 style={{ 
                        fontSize: isMobile ? '2.2rem' : '4.2rem', 
                        color: 'var(--text-main)', 
                        marginBottom: '20px', 
                        letterSpacing: '-1.5px',
                        lineHeight: '1.1',
                        fontWeight: '800'
                    }}>
                        FISHLEDGER // <span style={{ 
                            background: 'linear-gradient(90deg, var(--accent-cyan) 0%, #3498db 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>PORT MONITORING</span>
                    </h1>
                    
                    <h2 style={{ 
                        fontSize: isMobile ? '0.95rem' : '1.25rem', 
                        color: 'var(--text-muted)', 
                        fontWeight: '500', 
                        lineHeight: '1.6', 
                        marginBottom: '45px',
                        maxWidth: '750px',
                        margin: '0 auto 40px',
                        textTransform: 'none',
                        letterSpacing: 'normal'
                    }}>
                        An integrated, offline-first Progressive Web Application (PWA) facilitating offline-enabled data entry, supply chain identification, AI price forecasting, and automated bulletin reporting.
                    </h2>
                    
                    {/* Action Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row', 
                        justifyContent: 'center', 
                        gap: '15px',
                        alignItems: 'center',
                        marginBottom: '60px'
                    }}>
                        <Link to="/dashboard" className="btn-primary" style={{ 
                            textDecoration: 'none', 
                            padding: '16px 36px', 
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            width: isMobile ? '100%' : 'auto',
                            textAlign: 'center',
                            display: 'block',
                            boxSizing: 'border-box'
                        }}>
                            ENTER COMMAND CENTER
                        </Link>
                        
                        <Link to="/login" style={{ 
                            padding: '16px 36px', 
                            color: 'var(--text-main)', 
                            textDecoration: 'none', 
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-industrial)',
                            background: 'var(--bg-card)',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease',
                            width: isMobile ? '100%' : 'auto',
                            textAlign: 'center',
                            display: 'block',
                            boxSizing: 'border-box',
                            boxShadow: 'var(--shadow-command)'
                        }}
                        onMouseOver={(e) => { e.target.style.borderColor = 'var(--accent-cyan)'; e.target.style.color = 'var(--accent-cyan)'; }}
                        onMouseOut={(e) => { e.target.style.borderColor = 'var(--border-industrial)'; e.target.style.color = 'var(--text-main)'; }}
                        >
                            OPERATOR LOGIN
                        </Link>
                    </div>

                    {/* High-Fidelity Dashboard Mockup Card */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-industrial)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '15px',
                        maxWidth: '850px',
                        margin: '0 auto',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
                        textAlign: 'left'
                    }}>
                        {/* Browser Header Bar */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '15px', borderBottom: '1px solid var(--border-industrial)', paddingBottom: '10px', alignItems: 'center' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>LUCENA_PORT_COMMAND_CENTER // LIVE_FEED</span>
                        </div>
                        
                        {/* Mock Widgets Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>📡 Weather Alert</span>
                                <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '0.85rem' }}>29.4°C | Light Rain</p>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Wind: 3.2 m/s (Normal Operations)</span>
                            </div>
                            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>🚢 Live ETA</span>
                                <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>F/B Venture 422</p>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>14m remaining (Tayabas Bay)</span>
                            </div>
                            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>📈 Predictive Trend</span>
                                <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '0.85rem' }}>Galunggong Forecast</p>
                                <span style={{ fontSize: '0.65rem', color: 'var(--success-green)', fontWeight: 'bold' }}>✓ Stable Price Trend (₱210.00)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Public Market View */}
            <section style={{ 
                maxWidth: '1000px', 
                margin: '60px auto', 
                padding: '0 20px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>PUBLIC MARKET VIEW</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Live Prices as of {publicData ? publicData.date : 'Today'}
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading market data...</div>
                ) : publicData && publicData.prices && publicData.prices.length > 0 ? (
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-industrial)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-command)'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <tr>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-industrial)' }}>Species</th>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-industrial)' }}>Category</th>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-industrial)' }}>Average Price</th>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-industrial)' }}>Market Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {publicData.prices.map(fish => (
                                        <tr key={fish.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '15px 20px', fontWeight: 'bold', color: 'var(--text-main)' }}>{fish.fish_name}</td>
                                            <td style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fish.category}</td>
                                            <td style={{ padding: '15px 20px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>₱{fish.current_price.toFixed(2)} / kg</td>
                                            <td style={{ padding: '15px 20px', fontSize: '0.85rem' }}>
                                                {fish.trend === 'Increase' ? (
                                                    <span style={{ color: 'var(--fail-red)', fontWeight: 'bold' }}>↑ +₱{fish.trend_value.toFixed(2)}</span>
                                                ) : fish.trend === 'Decrease' ? (
                                                    <span style={{ color: 'var(--success-green)', fontWeight: 'bold' }}>↓ -₱{Math.abs(fish.trend_value).toFixed(2)}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>— Stable</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No market data available right now.</div>
                )}
            </section>

            {/* Core Capstone Pillars (Objectives Grid) */}
            <section style={{ 
                maxWidth: '1200px', 
                margin: '80px auto 40px', 
                padding: '0 20px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>SYSTEM OPERATION CAPABILITIES</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Functional Modules Mapping Chapter 1 & 3 Requirements</p>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                    gap: '24px'
                }}>
                    {[
                        { title: '📊 Up-to-Date Monitoring', desc: 'Centralized command center dashboard visualizing daily fish transactions, species, active retailer volumes, and instant market sentiments.', icon: '01' },
                        { title: '🧠 Machine Learning Predictions', desc: 'Uses a Random Forest Regressor (Scikit-Learn) to output 7-day price forecasts based on seasonal monthly vectors and weekday cycles.', icon: '02' },
                        { title: '🚢 GIS Vessel Identification', desc: 'Real-time positioning map of fishing vessels and grounds powered by React-Leaflet and distance-based ETAs using the Haversine formula.', icon: '03' },
                        { title: '📍 Interactive SVG Stall Map', desc: 'High-fidelity architectural floor plan of 30 complex stalls, linking interactive units directly to active vendor logs and inventories.', icon: '04' },
                        { title: '📄 Automated Bulletin Engine', desc: 'Compiles aggregated pricing, active retailers, and market parameters into standardized, print-ready bulletins using ReportLab PDFs.', icon: '05' },
                        { title: '🔌 WebSockets Warning Feeds', desc: 'Asynchronous notification layers pushing wind warning notices and anomaly alerts instantly via Django Channels and Daphne.', icon: '06' }
                    ].map((pillar, i) => (
                        <div key={i} style={{ 
                            padding: '30px', 
                            textAlign: 'left',
                            position: 'relative'
                        }}
                        className="interactive-card"
                        >
                            <div style={{ 
                                position: 'absolute',
                                right: '20px',
                                top: '20px',
                                fontSize: '2.5rem',
                                fontWeight: '900',
                                color: 'rgba(79, 70, 229, 0.05)',
                                userSelect: 'none',
                                pointerEvents: 'none'
                            }}>{pillar.icon}</div>
                            <h3 style={{ 
                                marginBottom: '14px', 
                                fontSize: '1.05rem', 
                                color: 'var(--text-main)',
                                fontWeight: '800'
                            }}>{pillar.title}</h3>
                            <p style={{ 
                                color: 'var(--text-muted)', 
                                lineHeight: '1.6', 
                                fontSize: '0.85rem',
                                textTransform: 'none',
                                letterSpacing: 'normal',
                                fontWeight: '400',
                                margin: 0
                            }}>{pillar.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Academic Developers Section */}
            <section style={{
                background: 'var(--secondary-blue)',
                borderTop: '1px solid var(--border-industrial)',
                borderBottom: '1px solid var(--border-industrial)',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '15px' }}>CAPSTONE RESEARCH PROPONENTS</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '25px' }}>
                        This system is presented in partial fulfillment of the requirements for the degree of Bachelor of Science in Information Technology (BSIT).
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                        <div>👨‍💻 Martin Ryan Garay</div>
                        <div>👨‍💻 Jhun Albert M. Mora</div>
                        <div>👨‍💻 Edwin R. Viñas</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ 
                marginTop: 'auto', 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: 'var(--text-muted)', 
                fontSize: '0.7rem', 
                letterSpacing: '1px',
                textTransform: 'uppercase',
                background: 'var(--bg-main)'
            }}>
                &copy; 2026 LUCENA FISH PORT COMPLEX // SYSTEM_VERSION: 1.0.4-STABLE // POWERED BY <strong>FISHLEDGER PROXY</strong>
            </footer>
        </div>
    );
};

export default Landing;


