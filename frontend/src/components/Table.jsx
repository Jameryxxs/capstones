import React from 'react';

const Table = ({ headers, data, renderRow }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    {headers.map(h => <th key={h} style={{ padding: '12px', textAlign: 'left' }}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        {renderRow(item)}
                    </tr>
                ))}
            </tbody>
        </table>
        {data.length === 0 && <p style={{ textAlign: 'center', padding: '20px' }}>No records found.</p>}
    </div>
);

export default Table;
