import React from 'react';
import BrutalistCard from '../components/BrutalistCard';
import ActionButton from '../components/ActionButton';

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-black uppercase mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                System Configuration
            </h1>

            <div className="flex flex-col gap-6">
                <BrutalistCard title="API Endpoints" headerColor="#ffff00">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                            <label className="font-bold mb-2">Live Data Provider</label>
                            <input
                                type="text"
                                defaultValue="https://api.openaq.org/v2"
                                className="border-4 border-black p-3 font-mono focus:outline-none focus:bg-[#b4a0ff] transition-colors"
                                disabled
                            />
                        </div>
                    </div>
                </BrutalistCard>

                <BrutalistCard title="Danger Zone" headerColor="#ff3b30">
                    <p className="mb-4 font-bold uppercase text-red-600">Proceed with Caution.</p>
                    <ActionButton bg="#ff3b30" onClick={() => alert('Wipe Database requested.')}>
                        <span className="text-white">WIPEOUT HISTORY DB</span>
                    </ActionButton>
                </BrutalistCard>
            </div>
        </div>
    );
};

export default Settings;
