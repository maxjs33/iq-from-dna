import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CollapsibleSection = ({ title, icon, children, subtitle }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-6 border rounded-xl bg-slate-900/50 border-slate-800">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-4 text-left">
        <h3 className="flex items-center text-lg font-semibold text-white">
          {icon}
          {title}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="space-y-4 animate-fade-in">
          {subtitle && <p className="mb-4 -mt-2 text-xs text-slate-400">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;