import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const Register = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Card style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ textAlign: 'center' }}>Create Account</h2>
            <form>
                <div style={{ marginBottom: '15px' }}>
                    <label>Full Name</label>
                    <input type="text" style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input type="email" style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <input type="password" style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                </div>
                <button style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Register</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </Card>
    </div>
);

export default Register;
