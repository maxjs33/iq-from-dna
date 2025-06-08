import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Header = ({ onNavigate }) => (
  <header className="flex items-center justify-between w-full max-w-7xl px-4 py-6 mx-auto md:px-8">
    <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
      <BrainCircuit className="w-8 h-8 text-purple-400" />
      <span className="text-2xl font-bold text-white">ThinQ</span>
    </button>
    <nav className="flex items-center space-x-4 md:space-x-6">
      <button onClick={() => onNavigate('methodology')} className="text-sm text-slate-300 hover:text-white md:text-base">
        Our Science
      </button>
      <button
        onClick={() => onNavigate('analysis')}
        className="px-5 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
      >
        Get Started
      </button>
    </nav>
  </header>
);

export default Header;