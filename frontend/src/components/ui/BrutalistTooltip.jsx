import React from 'react';
import { parameterConfig } from '../constants/chartConfig';

const BrutalistTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono font-bold">
                <p className="border-b-2 border-black pb-2 mb-2 uppercase text-lg">{label}</p>
                {payload.map((entry, index) => {
                    const config = parameterConfig[entry.dataKey] || { name: entry.name, unit: '' };
                    return (
                        <p key={`item-${index}`} style={{ color: entry.color, fontWeight: 900 }}>
                            {config.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {config.unit}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

export default BrutalistTooltip;