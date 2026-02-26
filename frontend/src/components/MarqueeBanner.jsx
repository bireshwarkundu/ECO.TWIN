import React from 'react';

const MarqueeBanner = ({ text }) => {
    return (
        <div className="bg-[#ff3b30] text-white border-y-4 border-black py-3 font-mono overflow-hidden whitespace-nowrap mb-6 flex">
            <div className="animate-marquee font-black uppercase text-xl inline-block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {text} &nbsp;|&nbsp; {text} &nbsp;|&nbsp; {text} &nbsp;|&nbsp; {text}
            </div>
        </div>
    );
};

export default MarqueeBanner;
