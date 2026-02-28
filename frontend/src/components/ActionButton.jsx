import React from 'react';

const ActionButton = ({ onClick, children, disabled = false, bg = '#ffff00', className = '' }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 cursor-pointer transition-none disabled:opacity-50 disabled:cursor-not-allowed ${className || 'px-8 py-4 text-lg'}`}
            style={{ backgroundColor: bg, fontFamily: 'Space Grotesk, sans-serif' }}
        >
            {children}
        </button>
    );
};

export default ActionButton;
