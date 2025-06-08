import React from 'react';

const FormInput = ({ id, label, value, onChange, placeholder, disabled, type = 'number' }) => (
  <div>
    <label htmlFor={id} className="block mb-1 text-sm text-slate-300">
      {label}
    </label>
    <input
      id={id}
      type={type}
      disabled={disabled}
      className="w-full px-3 py-2 text-white bg-slate-800 border border-slate-700 rounded-lg"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(id, e.target.value)}
    />
  </div>
);

export default FormInput;