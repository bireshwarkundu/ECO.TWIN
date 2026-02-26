import React from 'react';

const LoadingError = ({ type, message }) => {
    const bgColor = type === 'loading' ? 'bg-blue-200' : 'bg-yellow-200';
    const icon = type === 'loading' ? '🔄' : '⚠️';
    
    return (
        <div className={`${bgColor} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 font-bold text-center`}>
            {icon} {message}
        </div>
    );
};

export default LoadingError;