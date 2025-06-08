import React, { useState } from 'react';

const FAQItem = ({ q, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border-b border-slate-800">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full py-4 text-left text-lg font-semibold text-white hover:text-purple-400"
      >
        {q}
      </button>
      {open && <div className="pb-4 text-slate-300">{children}</div>}
    </div>
  );
};

const HomePage = ({ onNavigate }) => (
  <div className="w-full animate-fade-in">
    {/* Hero */}
    <section className="px-4 pt-20 pb-10 text-center">
      <div className="inline-flex items-center px-4 py-2 space-x-2 border rounded-full bg-slate-800/50 border-slate-700">
        <p className="text-sm font-semibold text-green-400">2,436</p>
        <p className="text-sm text-slate-300">reports delivered this month</p>
      </div>
      <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white md:text-7xl">
        Estimate Your IQ From DNA
      </h1>
      <p className="max-w-3xl mx-auto mt-4 text-lg text-slate-300 md:text-xl">
        Upload raw data from 23andMe or AncestryDNA to receive a scientifically‑grounded cognitive analysis based on the latest research.
      </p>
      <button
        onClick={() => onNavigate('analysis')}
        className="px-8 py-4 mt-10 text-lg font-bold text-white transition-transform rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
      >
        Start My DNA Analysis
      </button>
    </section>

    {/* Which kit do I need? */}
    <section className="py-20 bg-slate-900/50">
      <div className="px-4 mx-auto max-w-5xl">
        <h2 className="mb-4 text-4xl font-bold text-center text-white">Which DNA kit do I need?</h2>
        <p className="mb-12 text-center text-slate-400">The standard ancestry services provide everything required—no pricey add‑ons needed.</p>
        <div className="grid gap-8 p-8 bg-slate-800/50 border border-slate-700 rounded-2xl md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-2xl font-semibold text-white">23andMe</h3>
            <p className="font-semibold text-green-400">The "Ancestry + Traits" kit is sufficient.</p>
          </div>
          <div>
            <h3 className="mb-2 text-2xl font-semibold text-white">AncestryDNA</h3>
            <p className="font-semibold text-green-400">The standard "AncestryDNA" kit is sufficient.</p>
          </div>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-4xl font-bold text-center text-white">Frequently Asked Questions</h2>
        <FAQItem q="Is my data secure?">
          <p>
            Absolutely. We use secure, encrypted connections for all data transfer. Your raw DNA file is used once for analysis and deleted from our servers within 24 hours—we never store it long‑term.
          </p>
        </FAQItem>
        <FAQItem q="Can this diagnose medical conditions?">
          <p>
            No. This is strictly an educational tool. Results are statistical estimations of cognitive traits—not a diagnostic test. Consult a medical professional for health concerns.
          </p>
        </FAQItem>
      </div>
    </section>

    {/* Disclaimers */}
    <section className="px-4 py-20 bg-slate-900/50">
      <div className="p-8 mx-auto space-y-4 text-sm text-slate-400 bg-slate-800/50 border border-slate-700 rounded-2xl max-w-3xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">Important Disclaimers</h2>
        <p>
          <strong className="text-white">For informational &amp; educational use only.</strong> This service is not a diagnostic tool and does not constitute medical advice.
        </p>
        <p>
          <strong className="text-white">Not FDA‑cleared.</strong> Not intended for medical, employment, or legal decisions.
        </p>
      </div>
    </section>
  </div>
);

export default HomePage;