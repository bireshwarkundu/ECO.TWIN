import React from 'react';

const DataTable = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="p-4 border-2 border-dashed border-black text-center font-bold">NO DATA AVAILABLE</div>;
    }

    const keys = Object.keys(data[0]).filter(key => key !== '_id' && key !== '__v');

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse border-4 border-black">
                <thead className="bg-[#b4a0ff]">
                    <tr>
                        {keys.map((key) => (
                            <th key={key} className="border-2 border-black p-3 text-left font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {key}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-[#f4f4f0]">
                            {keys.map((key) => (
                                <td key={key} className="border-2 border-black p-3 text-left font-mono font-bold">
                                    {key === 'timestamp' || key === 'createdAt' || key === 'updatedAt'
                                        ? new Date(row[key]).toLocaleString()
                                        : row[key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
