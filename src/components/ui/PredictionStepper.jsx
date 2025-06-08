import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const PredictionStepper = ({ jobId, onDone }) => {
  const stages = ['Upload', 'QC', 'Imputation', 'PGS', 'Final'];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(() => {
      setIdx((i) => {
        if (i >= stages.length - 1) {
          clearInterval(t);
          onDone();
          return i;
        }
        return i + 1;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [jobId, onDone, stages.length]);

  return (
    <div className="w-full max-w-2xl p-8 mx-auto mt-12 bg-slate-900/50 border border-slate-800 rounded-xl">
      <h2 className="text-xl font-bold text-center text-white">Processing Genetic Data…</h2>
      <div className="flex items-center mt-8">
        {stages.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center min-w-[60px]">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  i <= idx ? 'bg-green-500' : 'bg-slate-700'
                }`}
              >
                {i < idx ? <CheckCircle className="w-5 h-5 text-white" /> : <span className="font-bold text-white">{i + 1}</span>}
              </div>
              <p className={`mt-2 text-xs font-medium text-center ${i <= idx ? 'text-white' : 'text-slate-500'}`}>{s}</p>
            </div>
            {i < stages.length - 1 && (
              <div className={`flex-1 h-1 mx-2 transition-all ${i < idx ? 'bg-green-500' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PredictionStepper;