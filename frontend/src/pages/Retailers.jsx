import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Card from '../components/Card';
import { retailerApi } from '../api';

const Retailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        stall_number: '',
        contact_number: '',
        email: '',
        address: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchRetailers();
    }, []);

    const fetchRetailers = async () => {
        const res = await retailerApi.getAll();
        setRetailers(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // For demo purposes, we'll associate with a default user or handle it simply
        // Ideally, we'd pick a user from a dropdown
        try {
            // Note: Retailer model requires a User. We'll assume the admin handles this.
            // For now, I'll just show the list and allow adding if user_id is provided or created.
            // Simplified for the demo:
            alert("Retailer creation requires a linked User account. Use the Admin panel for full management.");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Retailer Information</h1>
                <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {showForm ? 'Close Form' : 'Add Retailer'}
                </button>
            </div>

            {showForm && (
                <Card style={{ marginBottom: '20px' }}>
                    <h3>Add New Retailer</h3>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Note: Each retailer must be linked to a system user account.</p>
                    {/* Simplified form for display */}
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <input placeholder="Business Name" required style={{ padding: '8px' }} />
                        <input placeholder="Stall Number" required style={{ padding: '8px' }} />
                        <input placeholder="Contact Number" required style={{ padding: '8px' }} />
                        <input placeholder="Email" type="email" required style={{ padding: '8px' }} />
                        <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Save Retailer</button>
                    </form>
                </Card>
            )}

            <Card>
                <Table 
                    headers={['Business Name', 'Stall No.', 'Contact', 'Email', 'Status']} 
                    data={retailers}
                    renderRow={(item) => (
                        <>
                            <td style={{ padding: '12px' }}>{item.business_name}</td>
                            <td style={{ padding: '12px' }}>{item.stall_number}</td>
                            <td style={{ padding: '12px' }}>{item.contact_number}</td>
                            <td style={{ padding: '12px' }}>{item.email}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ color: item.status === 'Active' ? '#28a745' : '#dc3545' }}>● {item.status}</span>
                            </td>
                        </>
                    )}
                />
            </Card>
        </div>
    );
};

export default Retailers;
