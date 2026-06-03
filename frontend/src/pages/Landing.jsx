import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ 
            minHeight: 'calc(100vh - 80px)', // Accounting for App.js padding
            background: 'var(--bg-main)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflowX: 'hidden'
        }}>
            {/* Hero Section */}
            <section style={{ 
                textAlign: 'center', 
                padding: isMobile ? '40px 15px' : '80px 20px',
                background: 'linear-gradient(180deg, var(--secondary-blue) 0%, var(--bg-main) 100%)',
                color: 'var(--text-main)',
                borderBottom: '1px solid var(--border-industrial)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: 'rgba(100, 255, 218, 0.1)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '20px',
                        border: '1px solid var(--accent-cyan)'
                    }}>
                        Strategic Monitoring System
                    </div>
                    <h1 style={{ 
                        fontSize: isMobile ? '2rem' : '4rem', 
                        color: 'var(--text-main)', 
                        marginBottom: '15px', 
                        letterSpacing: '-1px',
                        lineHeight: '1.1'
                    }}>
                        FISH<span style={{ color: 'var(--accent-cyan)' }}>LODGER</span>
                    </h1>
                    <h2 style={{ 
                        fontSize: isMobile ? '1rem' : '1.4rem', 
                        color: 'var(--text-muted)', 
                        fontWeight: '400', 
                        lineHeight: '1.5', 
                        marginBottom: '40px',
                        textTransform: 'none',
                        letterSpacing: 'normal'
                    }}>
                        Advanced Predictive Analytics and Real-Time Monitoring <br /> for the Lucena Fish Port Complex
                    </h2>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row', 
                        justifyContent: 'center', 
                        gap: '15px',
                        alignItems: 'center'
                    }}>
                        <Link to="/dashboard" className="btn-primary" style={{ 
                            textDecoration: 'none', 
                            padding: '14px 32px', 
                            fontSize: '0.9rem',
                            width: isMobile ? '100%' : 'auto',
                            textAlign: 'center',
                            display: 'block'
                        }}>
                            ENTER COMMAND CENTER
                        </Link>
                        <Link to="/login" style={{ 
                            padding: '14px 32px', 
                            color: 'var(--text-main)', 
                            textDecoration: 'none', 
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-industrial)',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            width: isMobile ? '100%' : 'auto',
                            textAlign: 'center',
                            display: 'block'
                        }}
                        onMouseOver={(e) => { e.target.style.borderColor = 'var(--accent-cyan)'; e.target.style.color = 'var(--accent-cyan)'; }}
                        onMouseOut={(e) => { e.target.style.borderColor = 'var(--border-industrial)'; e.target.style.color = 'var(--text-main)'; }}
                        >
                            OPERATOR LOGIN
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ 
                maxWidth: '1200px', 
                margin: '60px auto', 
                padding: '0 20px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '24px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {[
                    { title: 'LIVE TELEMETRY', desc: 'Real-time geographic tracking of supply vessels and high-fidelity price monitoring across all retailers.', icon: '📡' },
                    { title: 'PREDICTIVE MODELS', desc: 'Random Forest AI algorithms providing 7-day price forecasts with integrated seasonality adjustments.', icon: '🧠' },
                    { title: 'AUTOMATED BULLETINS', desc: 'One-click generation of comprehensive PDF market bulletins for administrative distribution.', icon: '📑' }
                ].map((feature, i) => (
                    <div key={i} style={{ 
                        padding: isMobile ? '30px' : '40px', 
                        textAlign: 'left'
                    }}
                    className="interactive-card"
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '20px' }}>{feature.icon}</div>
                        <h3 style={{ 
                            marginBottom: '12px', 
                            fontSize: '1rem', 
                            color: 'var(--accent-cyan)',
                            letterSpacing: '1px'
                        }}>{feature.title}</h3>
                        <p style={{ 
                            color: 'var(--text-muted)', 
                            lineHeight: '1.6', 
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            letterSpacing: 'normal',
                            fontWeight: '400'
                        }}>{feature.desc}</p>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer style={{ 
                marginTop: 'auto', 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: 'var(--text-muted)', 
                fontSize: '0.7rem', 
                borderTop: '1px solid var(--border-industrial)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
            }}>
                &copy; 2026 LUCENA FISH PORT COMPLEX // SYSTEM_VERSION: 1.0.4-STABLE // POWERED BY <strong>FISHLODGER PROXY</strong>
            </footer>
        </div>
    );
};

export default Landing;
