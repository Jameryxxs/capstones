import React from 'react';
import Card from '../components/Card';
import ChartBox from '../components/ChartBox';

const Dashboard = () => (
    <div>
        <div style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: 0, color: '#1a2a6c' }}>Lucena Fish Port Dashboard</h1>
            <p style={{ color: '#666' }}>FishLodger System Monitoring Overview</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <Card style={{ borderLeft: '5px solid #007bff' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>TOTAL FISH SPECIES</p>
                <h2 style={{ margin: '10px 0', fontSize: '2rem' }}>24</h2>
                <p style={{ margin: 0, color: '#28a745', fontSize: '0.8rem' }}>↑ 4 new this week</p>
            </Card>
            <Card style={{ borderLeft: '5px solid #28a745' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>ACTIVE RETAILERS</p>
                <h2 style={{ margin: '10px 0', fontSize: '2rem' }}>15</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>In Lucena Fish Port Complex</p>
            </Card>
            <Card style={{ borderLeft: '5px solid #ffc107' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>DAILY SUPPLY VOLUME</p>
                <h2 style={{ margin: '10px 0', fontSize: '2rem' }}>1.2k kg</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>Identified sources: 5</p>
            </Card>
            <Card style={{ borderLeft: '5px solid #dc3545' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>AVG PRICE INDEX</p>
                <h2 style={{ margin: '10px 0', fontSize: '2rem' }}>₱185.50</h2>
                <p style={{ margin: 0, color: '#dc3545', fontSize: '0.8rem' }}>↑ 2.5% vs yesterday</p>
            </Card>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <ChartBox title="Predictive Price Trends (Next 7 Days)" placeholder="Predictive Analytics Graph Placeholder" />
            <ChartBox title="Supply Source Distribution" placeholder="Lucena Supply Map Placeholder" />
        </div>
    </div>
);

export default Dashboard;
