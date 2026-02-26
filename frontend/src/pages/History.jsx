import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';

const History = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/history');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-8 p-6 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                <h1 className="text-4xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Database Records
                </h1>
                <div className="font-mono font-bold bg-[#ffff00] border-2 border-black px-4 py-2">
                    Total: {data.length}
                </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-1 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center font-bold font-mono">LOADING DATA...</div>
                ) : (
                    <DataTable data={data} />
                )}
            </div>
        </div>
    );
};

export default History;
