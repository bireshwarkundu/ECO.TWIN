import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-[#f4f4f0] border-b-4 border-black px-6 py-4 flex justify-between items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 sticky top-0 z-50">
            <div className="font-black uppercase text-2xl tracking-tighter mix-blend-difference" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Urban Twin
            </div>
            <div className="flex gap-4 font-mono font-bold">
                <Link to="/" className="border-4 border-transparent hover:border-black hover:bg-[#ffff00] px-4 py-2 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Dashboard
                </Link>
                <Link to="/history" className="border-4 border-transparent hover:border-black hover:bg-[#b4a0ff] px-4 py-2 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    History
                </Link>
                <Link to="/settings" className="border-4 border-transparent hover:border-black hover:bg-[#ff3b30] px-4 py-2 transition-all hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Settings
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
