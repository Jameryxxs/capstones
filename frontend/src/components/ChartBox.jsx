import React from 'react';
import Card from './Card';

const ChartBox = ({ title, placeholder }) => (
    <Card title={title}>
        <div style={{ 
            height: '200px', 
            background: '#f8f9fa', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            border: '2px dashed #ddd'
        }}>
            {placeholder || 'Chart Visualization Placeholder'}
        </div>
    </Card>
);

export default ChartBox;

