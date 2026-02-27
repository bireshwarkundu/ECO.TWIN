import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackToHomeButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/')}
            className="fixed bottom-3 left-3 z-50 bg-[#FF00FF] border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:shadow-none active:translate-x-2 active:translate-y-2 cursor-pointer flex items-center justify-center rounded-none"
            aria-label="Back to Home"
            title="Return to Base"
        >
            <ArrowLeft size={36} color="black" strokeWidth={3} />
        </button>
    );
};

export default BackToHomeButton;
