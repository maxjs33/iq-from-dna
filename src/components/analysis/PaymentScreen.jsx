import React from 'react';
import { TestTube2 } from 'lucide-react';
import FormInput from '../UI/FormInput';

const PaymentScreen = ({ email, setEmail, pay, test }) => (
  <div className="w-full max-w-md p-10 mx-auto mt-12 text-center rounded-xl bg-slate-900/50 border border-slate-800 animate-fade-in">
    <h2 className="text-2xl font-bold text-white">Unlock Your IQ Report</h2>
    <p className="mt-2 text-slate-300">We'll send your report to the email below.</p>
    <div className="my-8 space-y-4">
      <FormInput id="email" label="Email" value={email} onChange={(id, v) => setEmail(v)} placeholder="you@example.com" type="email" />
      <div className="pt-4 text-6xl font-bold text-white">$20</div>
      <p className="text-sm text-slate-500">USD</p>
    </div>
    <a
      href={import.meta.env.VITE_STRIPE_PAYMENT_LINK}
      target="_blank"
      rel="noopener noreferrer"
      onClick={pay}
      className="block w-full py-3 font-semibold text-center text-white transition-transform rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
    >
      Pay with Stripe
    </a>
    <p className="mt-6 text-xs text-slate-600">You will be redirected to Stripe for secure payment.</p>
    <div className="p-4 mt-6 border-t border-slate-700">
      <button onClick={test} className="flex items-center mx-auto text-xs text-amber-400 hover:text-amber-300">
        <TestTube2 className="w-4 h-4 mr-2" /> Bypass payment (test)
      </button>
    </div>
  </div>
);

export default PaymentScreen;