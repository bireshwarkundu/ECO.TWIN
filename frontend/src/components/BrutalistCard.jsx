import React from 'react';

const BrutalistCard = ({ title, children, headerColor = '#b4a0ff' }) => {
    return (
        <div className="bg-white border-4 border-black p-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 flex flex-col h-full hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200">
            <div
                className="border-b-4 border-black px-6 py-4 flex items-center justify-between"
                style={{ backgroundColor: headerColor }}
            >
                <h2 className="font-black uppercase text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {title}
                </h2>
            </div>
            <div className="p-6 font-mono flex-grow">
                {children}
            </div>
        </div>
    );
};

export default BrutalistCard;
