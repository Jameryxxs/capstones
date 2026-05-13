import React from 'react';
import Table from '../components/Table';
import Card from '../components/Card';

const Supply = () => (
    <div>
        <h1>Supply Sources</h1>
        <Card>
            <Table 
                headers={['Supplier Name', 'Boat Name', 'Location', 'Arrival Date']} 
                data={[]}
                renderRow={() => null}
            />
        </Card>
    </div>
);

export default Supply;
