import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const BulletinManagement = () => {
    const [bulletins, setBulletins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'info',
        is_active: true
    });

    useEffect(() => {
        fetchBulletins();
    }, []);

    const fetchBulletins = async () => {
        try {
            const res = await api.get('bulletins/');
            // Handle both array and paginated response
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setBulletins(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch_bulletins:', err);
            setBulletins([]); // Default to empty array on error
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`bulletins/${editingId}/`, formData);
                alert('Bulletin updated successfully!');
            } else {
                await api.post('bulletins/', formData);
                alert('Bulletin posted successfully!');
            }
            setFormData({ title: '', content: '', category: 'info', is_active: true });
            setEditingId(null);
            fetchBulletins();
        } catch (err) {
            console.error('Failed to save_bulletin:', err);
            alert('Error saving bulletin.');
        }
    };

    const handleEdit = (bulletin) => {
        setFormData({
            title: bulletin.title,
            content: bulletin.content,
            category: bulletin.category,
            is_active: bulletin.is_active
        });
        setEditingId(bulletin.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bulletin?')) return;
        try {
            await api.delete(`bulletins/${id}/`);
            fetchBulletins();
        } catch (err) {
            console.error('Failed to delete_bulletin:', err);
        }
    };

    if (loading) return <LoadingSpinner size="60px" />;

    return (
        <div className="page-fade-in">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2rem', letterSpacing: '2px' }}>
                    BULLETIN MGMT // <span style={{ color: 'var(--accent-cyan)' }}>ADMIN PANEL</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Post and Edit Market Advisories
                </p>
            </div>

            <Card style={{ marginBottom: '40px' }}>
                <h3 style={{ marginTop: 0, color: 'var(--accent-cyan)' }}>
                    {editingId ? 'EDIT BULLETIN' : 'POST NEW BULLETIN'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>TITLE</label>
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            placeholder="e.g., Weather_Warning: High Winds"
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>CATEGORY</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="info">Information</option>
                            <option value="urgent">Urgent Advisory</option>
                            <option value="weather">Weather Warning</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>CONTENT</label>
                        <textarea 
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            required
                            rows="5"
                            style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-industrial)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--accent-cyan)', color: 'var(--bg-main)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            {editingId ? 'UPDATE BULLETIN' : 'POST BULLETIN'}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={() => { setEditingId(null); setFormData({ title: '', content: '', category: 'info', is_active: true }); }}
                                style={{ padding: '12px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                CANCEL
                            </button>
                        )}
                    </div>
                </form>
            </Card>

            <h3 style={{ color: 'var(--text-main)', letterSpacing: '1px' }}>ACTIVE BULLETINS</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
                {bulletins.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No bulletins found.</p>
                ) : (
                    bulletins.map(bulletin => (
                        <Card key={bulletin.id} style={{ borderLeft: `4px solid ${bulletin.category === 'weather' ? 'var(--fail-red)' : bulletin.category === 'urgent' ? 'orange' : 'var(--accent-cyan)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{bulletin.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                                        {new Date(bulletin.created_at).toLocaleString()} | {bulletin.category.toUpperCase()}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleEdit(bulletin)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.8rem' }}>EDIT</button>
                                    <button onClick={() => handleDelete(bulletin.id)} style={{ background: 'none', border: 'none', color: 'var(--fail-red)', cursor: 'pointer', fontSize: '0.8rem' }}>DELETE</button>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{bulletin.content}</p>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default BulletinManagement;



