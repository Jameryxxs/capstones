import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => (
    <div style={{ 
        textAlign: 'center', 
        padding: '120px 20px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: 'calc(100vh - 60px)'
    }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3.5rem', color: '#1a2a6c', marginBottom: '20px' }}>FishLodger</h1>
            <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', fontWeight: '400', lineHeight: '1.4' }}>
                A Progressive Web App Up-to-Date Fish Market Monitoring System
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#546e7a', margin: '30px auto', lineHeight: '1.6' }}>
                Empowering the <strong>Lucena Fish Port Complex</strong> with real-time Retailer Information, 
                Supply Source Identification, Automated Report Generation, and Predictive Analytics.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '50px', marginBottom: '50px' }}>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
                    <h3 style={{ color: '#007bff' }}>Retailers</h3>
                    <p style={{ fontSize: '0.9rem' }}>Comprehensive information management</p>
                </div>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
                    <h3 style={{ color: '#28a745' }}>Supply</h3>
                    <p style={{ fontSize: '0.9rem' }}>Accurate source identification</p>
                </div>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
                    <h3 style={{ color: '#ffc107' }}>Analytics</h3>
                    <p style={{ fontSize: '0.9rem' }}>Predictive price & supply trends</p>
                </div>
            </div>

            <div style={{ marginTop: '40px' }}>
                <Link to="/dashboard" style={{ 
                    padding: '18px 40px', 
                    background: '#1a2a6c', 
                    color: '#fff', 
                    textDecoration: 'none', 
                    borderRadius: '50px',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    fontWeight: 'bold'
                }}>Explore System</Link>
            </div>
        </div>
    </div>
);

export default Landing;
