import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import mainLogo from '../logo.svg';
import heroBackground from '../Gemini_Generated_Image_qjmdcgqjmdcgqjmd.png';

const Landing = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [publicData, setPublicData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        '/carousell/slide1.png',
        '/carousell/slide2.png',
        '/carousell/slide3.png',
        '/carousell/slide4.png',
        '/carousell/slide5.png'
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

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
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(240, 249, 255, 0.95)), url(${heroBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'var(--text-main)',
                position: 'relative'
            }}>
                <div style={{ 
                    maxWidth: '1000px', 
                    margin: '0 auto',
                    padding: isMobile ? '0' : '20px'
                }}>
                    {/* Logo Section */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '30px'
                    }}>
                        <img 
                            src={mainLogo} 
                            alt="FishLedger Logo" 
                            style={{
                                width: isMobile ? '120px' : '160px',
                                height: 'auto',
                                marginBottom: '20px'
                            }} 
                        />
                        
                        <div style={{
                            fontSize: isMobile ? '0.9rem' : '1.2rem',
                            fontWeight: '800',
                            letterSpacing: '4px',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            marginBottom: '10px'
                        }}>
                            Lucena Fish Port Complex
                        </div>
                        
                        <h1 style={{ 
                            fontSize: isMobile ? '3rem' : '5.5rem', 
                            margin: '0 0 15px 0', 
                            letterSpacing: '-2px',
                            lineHeight: '1.1',
                            fontWeight: '900',
                            color: 'var(--text-main)'
                        }}>
                            FISHLEDGER
                        </h1>
                    </div>
                    
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

                    {/* Auto-Swiping Carousel */}
                    <div style={{
                        width: '100%',
                        maxWidth: '1000px',
                        margin: '0 auto',
                        position: 'relative',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                        cursor: 'pointer',
                        background: 'var(--bg-main)'
                    }}
                    onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
                    >
                        {slides.map((slide, index) => (
                            <div 
                                key={index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: index === currentSlide ? 1 : 0,
                                    transition: 'opacity 0.8s ease-in-out',
                                    backgroundImage: `url(${slide})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                        ))}
                        
                        {/* Carousel Indicators */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            {slides.map((_, index) => (
                                <div 
                                    key={index}
                                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                                    style={{
                                        width: index === currentSlide ? '30px' : '10px',
                                        height: '10px',
                                        borderRadius: '5px',
                                        background: index === currentSlide ? 'var(--text-main)' : 'rgba(0, 0, 0, 0.15)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
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
                                            <td style={{ padding: '15px 20px', fontWeight: '600', color: 'var(--text-main)' }}>{fish.fish_name}</td>
                                            <td style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fish.category}</td>
                                            <td style={{ padding: '15px 20px', color: 'var(--accent-cyan)', fontWeight: '600' }}>₱{fish.current_price.toFixed(2)} / kg</td>
                                            <td style={{ padding: '15px 20px', fontSize: '0.85rem' }}>
                                                {fish.trend === 'Increase' ? (
                                                    <span style={{ color: 'var(--danger-red)', fontWeight: '600' }}>↑ +₱{fish.trend_value.toFixed(2)}</span>
                                                ) : fish.trend === 'Decrease' ? (
                                                    <span style={{ color: 'var(--success-green)', fontWeight: '600' }}>↓ -₱{Math.abs(fish.trend_value).toFixed(2)}</span>
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
                            position: 'relative',
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none'
                        }}
                        className="interactive-card"
                        >
                            <div style={{ 
                                position: 'absolute',
                                right: '20px',
                                top: '20px',
                                fontSize: '2.5rem',
                                fontWeight: '900',
                                color: 'rgba(14, 165, 233, 0.2)',
                                userSelect: 'none',
                                pointerEvents: 'none'
                            }}>{pillar.icon}</div>
                            <h3 style={{ 
                                marginBottom: '14px', 
                                fontSize: '1.05rem', 
                                color: 'var(--text-main)',
                                fontWeight: '700'
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


