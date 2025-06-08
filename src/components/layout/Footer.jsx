import React from 'react';

const Footer = ({ onNavigate }) => (
  <footer className="mt-20 bg-slate-900/50 border-t border-slate-800">
    <div className="px-4 py-12 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
      <div className="flex justify-center mb-4 space-x-6">
        <button onClick={() => onNavigate('privacy')} className="text-sm text-slate-400 hover:text-white">
          Privacy Policy
        </button>
        <button onClick={() => onNavigate('terms')} className="text-sm text-slate-400 hover:text-white">
          Terms of Service
        </button>
        <button onClick={() => onNavigate('methodology')} className="text-sm text-slate-400 hover:text-white">
          Our Science
        </button>
      </div>
      <p className="text-sm text-slate-500">© {new Date().getFullYear()} ThinQ Corporation. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;