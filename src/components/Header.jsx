import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Header = ({ onNavigate, currentPage }) => (
  <header className="py-6 px-4 md:px-8 flex justify-between items-center w-full max-w-7xl mx-auto">
    <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
      <BrainCircuit className="w-8 h-8 text-purple-400" />
      <span className="text-2xl font-bold text-white">ThinQ</span>
    </button>
    <nav className="flex items-center space-x-4 md:space-x-6">
      <button 
        onClick={() => onNavigate('home')} 
        className={`text-sm md:text-base transition-colors ${
          currentPage === 'home' ? 'text-purple-400' : 'text-slate-300 hover:text-white'
        }`}
      >
        Home
      </button>
      <button 
        onClick={() => onNavigate('about')} 
        className={`text-sm md:text-base transition-colors ${
          currentPage === 'about' ? 'text-purple-400' : 'text-slate-300 hover:text-white'
        }`}
      >
        About Us
      </button>
      <button 
        onClick={() => onNavigate('science')} 
        className={`text-sm md:text-base transition-colors ${
          currentPage === 'science' ? 'text-purple-400' : 'text-slate-300 hover:text-white'
        }`}
      >
        Our Science
      </button>
      <button 
        onClick={() => onNavigate('methodology')} 
        className={`text-sm md:text-base transition-colors ${
          currentPage === 'methodology' ? 'text-purple-400' : 'text-slate-300 hover:text-white'
        }`}
      >
        Methodology
      </button>
      <button 
        onClick={() => onNavigate('analysis')} 
        className="bg-purple-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Get Started
      </button>
    </nav>
    <div className="text-right text-sm">
      <div className="text-purple-400 font-medium">maxjs33</div>
      <div className="text-slate-400">2025-06-08 18:56:47</div>
    </div>
  </header>
);

export default Header;
