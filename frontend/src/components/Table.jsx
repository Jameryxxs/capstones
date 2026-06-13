import React from 'react';

const Table = ({ columns, data, onRowClick }) => {
    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                minWidth: '600px'
            }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                        {columns.map((col, index) => (
                            <th key={index} style={{ 
                                textAlign: 'left', 
                                padding: '15px', 
                                color: 'var(--primary-navy)', 
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? data.map((row, rowIndex) => (
                        <tr 
                            key={rowIndex} 
                            className="table-row-hover"
                            onClick={() => onRowClick && onRowClick(row)}
                            style={{ 
                                borderBottom: '1px solid var(--border-light)',
                                cursor: onRowClick ? 'pointer' : 'default'
                            }}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} style={{ 
                                    padding: '15px', 
                                    fontSize: '0.9rem',
                                    color: 'var(--text-main)'
                                }}>
                                    {col.render ? col.render(row) : (row[col.accessor] || '—')}
                                </td>
                            ))}
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={columns.length} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
