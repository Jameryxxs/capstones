import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Card from '../components/Card';
import Table from '../components/Table';
import axios from 'axios';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Supply = () => {
    const [locations, setLocations] = useState([]);
    const [sources, setSources] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, srcRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/locations/'),
                    axios.get('http://127.0.0.1:8000/api/supply-sources/')
                ]);
                setLocations(locRes.data);
                setSources(srcRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Center on Lucena Fish Port
    const lucenaPos = [13.9189, 121.6212];

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#1a2a6c' }}>Supply Source Identification</h1>
                <p style={{ color: '#666' }}>Mapping fish origins for the Lucena Fish Port Complex</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <Card title="Supply Source Map">
                    <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                        <MapContainer center={lucenaPos} zoom={8} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={lucenaPos}>
                                <Popup><strong>Lucena Fish Port Complex</strong><br/>Central Monitoring Hub</Popup>
                            </Marker>
                            {locations.map(loc => (
                                <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                                    <Popup>
                                        <strong>{loc.location_name}</strong><br/>
                                        Region: {loc.region}<br/>
                                        {loc.description}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Card title="Active Suppliers">
                        <Table 
                            headers={['Supplier', 'Boat Name']} 
                            data={sources}
                            renderRow={(item) => (
                                <>
                                    <td style={{ padding: '10px' }}>{item.supplier_name}</td>
                                    <td style={{ padding: '10px' }}>{item.boat_name}</td>
                                </>
                            )}
                        />
                    </Card>
                    <Card title="Location Summary">
                        <p style={{ fontSize: '0.9rem' }}>
                            Currently monitoring <strong>{locations.length}</strong> fishing grounds across the region.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Supply;
