import React from 'react';

const LegalPage = ({ page }) => (
  <div className="max-w-4xl px-4 py-16 mx-auto animate-fade-in">
    <h1 className="text-4xl font-bold capitalize text-white">{page.replace('-', ' ')}</h1>
    <p className="mt-8 text-slate-400">Placeholder for {page.replace('-', ' ')} content.</p>
  </div>
);

export default LegalPage;