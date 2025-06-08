import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ q, children }) => { 
  const [isOpen, setIsOpen] = useState(false); 
  
  return (
    <div className="border-b border-slate-800 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
        <span className="font-semibold text-white">{q}</span>
        <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pt-4 text-slate-400 animate-fade-in">{children}</div>
      )}
    </div>
  ); 
};

export default FAQItem;
