import React from 'react';

const ActionButton = ({ onClick, children, disabled = false, bg = '#ffff00' }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`border-4 border-black px-8 py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ backgroundColor: bg, fontFamily: 'Space Grotesk, sans-serif' }}
        >
            {children}
        </button>
    );
};

export default ActionButton;
