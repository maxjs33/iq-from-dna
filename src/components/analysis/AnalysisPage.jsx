import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { UploadDropzone } from '../ui/UploadDropzone'
import PredictionStepper from '../ui/PredictionStepper';
import PredictionForm from './PredictionForm';
import PaymentScreen from './PaymentScreen';
import WaitingScreen from './WaitingScreen';
import ResultCard from '../ui/ResultCard';
import { getJobStatus, calculatePrediction } from '../../services/api';

const AnalysisPage = () => {
  const [step, setStep] = useState('upload');
  const [jobId, setJobId] = useState(null);
  const [form, setForm] = useState({});
  const [editable, setEditable] = useState(false);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  /* handlers */
  const onUpload = (id) => {
    setJobId(id);
    setStep('running');
  };

  const onRunningDone = async () => {
    const r = await getJobStatus(jobId);
    setForm((p) => ({
      ...p,
      ea4_pgs: r.pgs_scores.EA4.z_score.toFixed(2),
      int_pgs: r.pgs_scores.INT.z_score.toFixed(2),
    }));
    setStep('form');
  };

  const onFormNext = () => {
    if (!form.ancestry || !form.parent_education_years) {
      setErr('Please fill all required fields');
      return;
    }
    setErr('');
    setStep('pay');
  };

  const onPay = () => {
    if (!email) {
      setErr('Enter a valid email');
      return;
    }
    setErr('');
    setStep('waiting');
  };

  const onBypass = async () => {
    if (!email) {
      setErr('Enter an email first');
      return;
    }
    setErr('');
    setStep('waitingTest');
    const r = await calculatePrediction(form);
    setResult(r);
    setStep('done');
  };

  return (
    <div className="p-8 animate-fade-in">
      {err && (
        <div className="flex items-center p-4 mb-4 text-red-300 bg-red-900/30 border border-red-500/50 rounded-lg">
          <XCircle className="w-5 h-5 mr-2" /> {err}
        </div>
      )}

      {step === 'upload' && <UploadDropzone onUploadSuccess={onUpload} setError={setErr} />}

      {step === 'running' && <PredictionStepper jobId={jobId} onDone={onRunningDone} />}

      {step === 'form' && (
        <PredictionForm data={form} setData={setForm} editable={editable} setEditable={setEditable} next={onFormNext} />
      )}

      {step === 'pay' && <PaymentScreen email={email} setEmail={setEmail} pay={onPay} test={onBypass} />}

      {step === 'waiting' && <WaitingScreen email={email} />}
      {step === 'waitingTest' && <WaitingScreen email={email} test />}
      {step === 'done' && result && <ResultCard result={result} email={email} />}
    </div>
  );
};

export default AnalysisPage;