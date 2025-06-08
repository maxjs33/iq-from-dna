import React from 'react';
import { Loader } from 'lucide-react';

const WaitingScreen = ({ email, test }) => (
  <div className="w-full max-w-md p-10 mx-auto mt-12 text-center rounded-xl bg-slate-900/50 border border-slate-800 animate-fade-in">
    <h2 className="text-2xl font-bold text-white">{test ? 'Generating test report…' : 'Awaiting payment'}</h2>
    <Loader className="mx-auto my-8 text-purple-400 animate-spin w-16 h-16" />
    <p className="mt-2 text-slate-400">
      {test
        ? 'Your test report is being generated.'
        : 'Complete payment in the new tab; this page will refresh automatically.'}
    </p>
    <p className="mt-4 text-sm text-slate-500">
      We'll send the report to <strong className="text-slate-300">{email}</strong>.
    </p>
  </div>
);

export default WaitingScreen;