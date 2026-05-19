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
            minHeight: 'calc(100vh - 60px)',
            background: 'var(--bg-main)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Hero Section */}
            <section style={{ 
                textAlign: 'center', 
                padding: isMobile ? '60px 20px' : '100px 20px',
                background: 'linear-gradient(135deg, var(--primary-navy) 0%, #2c3e50 100%)',
                color: '#fff',
                clipPath: isMobile ? 'none' : 'polygon(0 0, 100% 0, 100% 90%, 0% 100%)',
                marginBottom: isMobile ? '40px' : '0'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: isMobile ? '2.5rem' : '4rem', color: '#fff', marginBottom: '20px', letterSpacing: '-1px' }}>
                        Fish<span style={{ color: 'var(--secondary-blue)' }}>Lodger</span>
                    </h1>
                    <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.6rem', color: 'rgba(255,255,255,0.9)', fontWeight: '400', lineHeight: '1.4', marginBottom: '40px' }}>
                        The Institutional Standard for Fish Market Monitoring
                    </h2>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: '15px' }}>
                        <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '16px 40px', fontSize: '1rem' }}>
                            Launch Dashboard
                        </Link>
                        <Link to="/login" style={{ 
                            padding: '16px 40px', 
                            color: '#fff', 
                            textDecoration: 'none', 
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'var(--transition-fast)'
                        }}
                        onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ 
                maxWidth: '1100px', 
                margin: isMobile ? '0 auto 60px' : '-60px auto 100px', 
                padding: '0 20px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px' 
            }}>
                {[
                    { title: 'Real-Time Monitoring', desc: 'Up-to-the-minute price and supply data from the Lucena Fish Port Complex.', icon: '📊' },
                    { title: 'Predictive Analytics', desc: 'AI-driven forecasting models to anticipate market trends and price shifts.', icon: '📈' },
                    { title: 'Automated Reports', desc: 'Generate professional PDF market bulletins with a single click.', icon: '📄' }
                ].map((feature, i) => (
                    <div key={i} style={{ 
                        background: '#fff', 
                        padding: isMobile ? '30px' : '40px', 
                        borderRadius: 'var(--radius-md)', 
                        boxShadow: 'var(--shadow-md)',
                        textAlign: 'center'
                    }}
                    className="interactive-card"
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{feature.icon}</div>
                        <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>{feature.title}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.9rem' }}>{feature.desc}</p>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer style={{ marginTop: 'auto', padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border-light)' }}>
                &copy; 2026 Lucena Fish Port Complex | Powered by <strong>FishLodger PWA</strong>
            </footer>
        </div>
    );
};

export default Landing;
