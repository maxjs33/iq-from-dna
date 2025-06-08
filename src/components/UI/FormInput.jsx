import React from 'react';

const FormInput = ({ id, label, value, onChange, placeholder, step, disabled, type = "number" }) => (
  <div>
    <label htmlFor={id} className="block text-sm text-slate-400 mb-1">{label}</label>
    <input 
      id={id} 
      type={type} 
      step={step} 
      disabled={disabled} 
      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" 
      placeholder={placeholder} 
      value={value || ''} 
      onChange={(e) => onChange(id, e.target.value)} 
    />
  </div>
);

export default FormInput;