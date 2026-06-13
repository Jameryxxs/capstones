import React from 'react';
import Card from './Card';

const BulletinBoard = ({ bulletins }) => {
    return (
        <Card title="PORT_ADVISORIES // BULLETIN_BOARD">
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {bulletins.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>NO_RECENT_ADVISORIES</p>
                ) : (
                    bulletins.map((item, index) => (
                        <div key={item.id} style={{ 
                            padding: '15px', 
                            borderBottom: index === bulletins.length - 1 ? 'none' : '1px solid var(--border-industrial)',
                            marginBottom: '10px',
                            background: item.category === 'urgent' ? 'rgba(255, 107, 107, 0.05)' : 
                                       item.category === 'weather' ? 'rgba(72, 219, 251, 0.05)' : 'transparent',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `3px solid ${
                                item.category === 'urgent' ? 'var(--fail-red)' : 
                                item.category === 'weather' ? 'var(--accent-cyan)' : 'var(--border-industrial)'
                            }`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', textTransform: 'uppercase' }}>{item.title}</h4>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={{ 
                                margin: 0, 
                                fontSize: '0.8rem', 
                                color: 'var(--text-muted)', 
                                lineHeight: '1.6', 
                                whiteSpace: 'pre-wrap',
                                fontFamily: item.title.includes('Weather') ? 'monospace' : 'inherit',
                                overflowX: 'auto'
                            }}>
                                {item.content}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 
                                item.category === 'urgent' ? 'var(--fail-red)' : 
                                item.category === 'weather' ? 'var(--accent-cyan)' : 'var(--text-muted)'
                            }}>
                                [{item.category}]
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default BulletinBoard;
