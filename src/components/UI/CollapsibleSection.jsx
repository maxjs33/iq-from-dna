import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CollapsibleSection = ({ title, icon, children, subtitle }) => { 
  const [isOpen, setIsOpen] = useState(false); 
  
  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between mb-4 text-left">
        <h3 className="text-lg font-semibold text-white flex items-center">{icon}{title}</h3>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="space-y-4 animate-fade-in">
          {subtitle && <p className="text-xs text-slate-500 -mt-2 mb-4">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  ); 
};

export default CollapsibleSection;