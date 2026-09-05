import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvalData, setApprovalData] = useState(null);
    const [newAppIds, setNewAppIds] = useState([]); // Track newly arrived apps for glow
    const [approvingApp, setApprovingApp] = useState(null);
    const [stallNumber, setStallNumber] = useState('');

    useEffect(() => {
        fetchApplications();

        // WebSocket for Real-time Application Updates
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/updates/`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'NEW_APPLICATION_UPDATE') {
                    // Refetch applications to get full data (or optimistically push)
                    fetchApplications().then(() => {
                        setNewAppIds(prev => [...prev, data.id]);
                        // Remove glow after 10 seconds
                        setTimeout(() => {
                            setNewAppIds(prev => prev.filter(id => id !== data.id));
                        }, 10000);
                    });
                }
            } catch (err) {
                console.error("WebSocket message error:", err);
            }
        };

        return () => {
            if (socket.readyState === 1) socket.close();
        };
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await api.get('applications/');
            setApplications(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching applications:", error);
            setLoading(false);
        }
    };

    const handleApproveClick = (app) => {
        if (app.requested_role === 'retailer') {
            setApprovingApp(app);
            setStallNumber('');
        } else {
            submitApprove(app.id, null);
        }
    };

    const submitApprove = async (id, stall) => {
        try {
            const payload = stall ? { stall_number: stall } : {};
            const res = await api.post(`applications/${id}/approve/`, payload);
            setApprovalData(res.data);
            setApprovingApp(null);
            fetchApplications();
        } catch (error) {
            console.error("Error approving application:", error);
            alert("Approval failed: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    const handleReject = async (id) => {
        if(window.confirm('Are you sure you want to reject this application?')) {
            try {
                await api.post(`applications/${id}/reject/`);
                fetchApplications();
            } catch (error) {
                console.error("Error rejecting application:", error);
            }
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading applications...</div>;

    const pendingApps = applications.filter(a => a.status === 'pending');
    const processedApps = applications.filter(a => a.status !== 'pending');

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', color: 'var(--primary-navy)' }}>Account Applications</h1>

            {approvingApp && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <Card style={{ width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, color: 'var(--primary-navy)' }}>Assign Stall Number</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please assign a stall number for <strong>{approvingApp.full_name}</strong>.</p>
                        <input 
                            type="text" 
                            placeholder="e.g. Stall 14-B" 
                            value={stallNumber}
                            onChange={(e) => setStallNumber(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginTop: '10px', marginBottom: '20px', border: '1px solid var(--border-industrial)', borderRadius: '6px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setApprovingApp(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => submitApprove(approvingApp.id, stallNumber || 'TBD')} className="btn-primary" style={{ padding: '8px 16px' }}>Confirm Approval</button>
                        </div>
                    </Card>
                </div>
            )}

            {approvalData && (
                <Card style={{ marginBottom: '30px', border: '2px solid var(--success-green)', background: '#ecfdf5' }}>
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ color: 'var(--success-green)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            APPLICATION APPROVED!
                        </h3>
                        <p style={{ color: 'var(--text-main)', marginBottom: '15px' }}>Please provide these temporary credentials to the user:</p>
                        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #d1d5db', display: 'flex', gap: '30px' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>USERNAME:</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-navy)' }}>{approvalData.username}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TEMPORARY PASSWORD:</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{approvalData.temporary_password}</div>
                            </div>
                        </div>
                        <button onClick={() => setApprovalData(null)} style={{ marginTop: '15px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>Dismiss</button>
                    </div>
                </Card>
            )}

            <Card style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 20px', padding: '20px 20px 0', color: 'var(--primary-navy)' }}>Pending Applications ({pendingApps.length})</h3>
                {pendingApps.length === 0 ? (
                    <p style={{ padding: '0 20px 20px', color: 'var(--text-muted)' }}>No pending applications at this time.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%' }}>
                            <thead style={{ background: '#1b4471', color: '#fff' }}>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Business/Boat</th>
                                    <th>Role</th>
                                    <th>Appointment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApps.map(app => (
                                    <tr 
                                        key={app.id}
                                        style={newAppIds.includes(app.id) ? { animation: 'pulseGlow 2s infinite', background: 'rgba(100, 255, 218, 0.1)' } : {}}
                                    >
                                        <td style={{ fontWeight: '600' }}>{app.full_name} {newAppIds.includes(app.id) && <span style={{fontSize:'0.6rem', background:'var(--accent-cyan)', color:'#000', padding:'2px 5px', borderRadius:'4px', marginLeft:'5px'}}>NEW</span>}</td>
                                        <td>{app.contact_number}</td>
                                        <td>{app.business_name || 'N/A'}</td>
                                        <td><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--secondary-blue)' }}>{app.requested_role.toUpperCase()}</span></td>
                                        <td style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{app.appointment_date}</td>
                                        <td>
                                            <button onClick={() => handleApproveClick(app)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '10px' }}>Approve</button>
                                            <button onClick={() => handleReject(app.id)} style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'transparent', color: 'var(--danger-red)', border: '1px solid var(--danger-red)', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Card>
                <h3 style={{ margin: '0 0 20px', padding: '20px 20px 0', color: 'var(--primary-navy)' }}>Processed Applications</h3>
                <div className="table-responsive">
                    <table className="table" style={{ background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%' }}>
                        <thead style={{ background: '#1b4471', color: '#fff' }}>
                            <tr>
                                <th style={{ width: '35%', textAlign: 'left' }}>Name</th>
                                <th style={{ width: '25%', textAlign: 'left' }}>Role</th>
                                <th style={{ width: '25%', textAlign: 'left' }}>Date Applied</th>
                                <th style={{ width: '15%', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedApps.slice(0, 10).map(app => (
                                <tr key={app.id}>
                                    <td style={{ fontWeight: '600' }}>{app.full_name}</td>
                                    <td>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--secondary-blue)', color: 'var(--text-main)' }}>
                                            {app.requested_role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 'bold', 
                                            color: app.status === 'approved' ? 'var(--success-green)' : 'var(--danger-red)',
                                            background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                        }}>
                                            {app.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Applications;
