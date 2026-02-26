import React from 'react';
import { Settings } from 'lucide-react';
import { parameterConfig } from '../constants/chartConfig';

const ParameterSelector = ({ selectedParams, onToggle, onSelectAll, onClearAll, isOpen, onToggleOpen }) => {
    return (
        <div className="relative">
            <button
                onClick={onToggleOpen}
                className="bg-white text-black border-4 border-black px-4 py-2 font-black uppercase flex items-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-none"
            >
                <Settings size={20} strokeWidth={3} /> PARAMETERS
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 p-4 border-4 border-black bg-gray-50 z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={onSelectAll}
                            className="bg-[#00FF66] border-2 border-black px-3 py-1 font-bold text-sm uppercase hover:bg-[#00dd55] flex-1"
                        >
                            Select All
                        </button>
                        <button
                            onClick={onClearAll}
                            className="bg-[#FF3366] border-2 border-black px-3 py-1 font-bold text-sm uppercase text-white hover:bg-[#dd2255] flex-1"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(parameterConfig).map(([key, config]) => (
                            <label key={key} className="flex items-center gap-2 font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedParams[key]}
                                    onChange={() => onToggle(key)}
                                    className="w-5 h-5 border-4 border-black accent-black"
                                />
                                <span style={{ color: config.color }}>
                                    {config.name} ({config.unit})
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParameterSelector;