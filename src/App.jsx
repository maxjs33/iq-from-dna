import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  CheckCircle,
  Loader,
  XCircle,
  ShieldCheck,
  BrainCircuit,
  Dna,
  Activity,
  ChevronDown,
  Edit,
  Shield,
  Mail,
  Download,
  TestTube2,
} from 'lucide-react';

/* ------------------------------------------------------------------
 *  API stubs (swap for your FastAPI endpoints later)
 * ----------------------------------------------------------------*/
import {
  createUploadJob,
  getJobStatus,
  calculatePrediction,
} from './services/api.js';

/* ------------------------------------------------------------------
 *  Constants
 * ----------------------------------------------------------------*/
const CORE_MODEL_WEIGHTS = {
  EA4_PGS: 0.238,
  INT_PGS: 0.146,
  SPI: -0.284,
  SES: 0.112,
  TBV: 0.062,
  CT: -0.012,
  FA: 0.049,
  dFC: 0.008,
};

const SPI_FACTORS = {
  maternal_crp: -0.15,
  folate_deficiency: -0.12,
  prenatal_stress: -0.18,
  lead_exposure: -0.22,
  pm25_exposure: -0.11,
  maternal_smoking: -0.2,
  alcohol_exposure: -0.25,
  gestational_diabetes: -0.1,
  preterm_birth: -0.14,
  iugr: -0.16,
  maternal_infection: -0.13,
};

const ANCESTRY_CALIBRATION = {
  'Northwest European': 1,
  'West Germanic': 0.995,
  'North Germanic': 0.99,
  Celtic: 0.988,
  'South Asian': 0.975,
  Ashkenazi: 0.973,
  'East Asian': 0.968,
  Finnish: 0.955,
  'West Slavic': 0.965,
  'East Slavic': 0.958,
  'Admixed American': 0.945,
  African: 0.89,
};

const num = (v, d = 0) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? d : n;
};

/* ------------------------------------------------------------------
 *  Tiny reusable pieces
 * ----------------------------------------------------------------*/
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

const CollapsibleSection = ({ title, icon, children, subtitle }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6 border rounded-xl bg-slate-900/50 border-slate-800">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-4 text-left">
        <h3 className="flex items-center text-lg font-semibold text-white">
          {icon}
          {title}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="space-y-4 animate-fade-in">
          {subtitle && <p className="mb-4 -mt-2 text-xs text-slate-400">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------
 *  Header / Footer
 * ----------------------------------------------------------------*/
const Header = ({ onNavigate }) => (
  <header className="flex items-center justify-between w-full max-w-7xl px-4 py-6 mx-auto md:px-8">
    <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
      <BrainCircuit className="w-8 h-8 text-purple-400" />
      <span className="text-2xl font-bold text-white">ThinQ</span>
    </button>
    <nav className="flex items-center space-x-4 md:space-x-6">
      <button onClick={() => onNavigate('methodology')} className="text-sm text-slate-300 hover:text-white md:text-base">
        Our Science
      </button>
      <button
        onClick={() => onNavigate('analysis')}
        className="px-5 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
      >
        Get Started
      </button>
    </nav>
  </header>
);

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

/* ------------------------------------------------------------------
 *  Landing page
 * ----------------------------------------------------------------*/
const HomePage = ({ onNavigate }) => (
  <div className="w-full animate-fade-in">
    <section className="px-4 pt-20 pb-10 text-center">
      <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white md:text-7xl">
        Estimate Your IQ From DNA
      </h1>
      <p className="max-w-3xl mx-auto mt-4 text-lg text-slate-300 md:text-xl">
        Upload raw data from 23andMe or AncestryDNA to receive a scientifically-grounded cognitive analysis.
      </p>
      <button
        onClick={() => onNavigate('analysis')}
        className="px-8 py-4 mt-10 text-lg font-bold text-white transition-transform rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
      >
        Start My DNA Analysis
      </button>
    </section>
  </div>
);

/* ------------------------------------------------------------------
 *  Upload & Pipeline stepper
 * ----------------------------------------------------------------*/
const UploadDropzone = ({ onUploadSuccess, setError }) => {
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file || !consent) {
      setError(consent ? 'No file selected.' : 'Please accept the disclaimers.');
      return;
    }
    setBusy(true);
    try {
      const { job_id } = await createUploadJob();
      onUploadSuccess(job_id);
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }, [consent, onUploadSuccess, setError]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1 });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className="p-10 border-2 border-dashed rounded-xl cursor-pointer border-slate-700 hover:border-slate-500"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {busy ? (
            <Loader className="w-12 h-12 text-purple-400 animate-spin" />
          ) : (
            <UploadCloud className="w-12 h-12 text-slate-500" />
          )}
          <p className="mt-4">
            <span className="font-semibold text-purple-400">Click to upload</span> or drag &amp; drop
          </p>
        </div>
      </div>
      <label className="flex items-start p-4 mt-6 space-x-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <input
          type="checkbox"
          className="w-5 h-5 mt-1 text-purple-500 bg-slate-900 border-slate-600 rounded"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="text-sm text-slate-400">
          I have read and agree to the <strong className="text-white">Important Disclaimers</strong>.
        </span>
      </label>
    </div>
  );
};

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

/* ------------------------------------------------------------------
 *  PredictionForm, PaymentScreen, ResultCard – full original blocks
 * ----------------------------------------------------------------*/
const PredictionForm = ({ data, setData, editable, setEditable, next }) => {
  const update = (id, v) => setData((p) => ({ ...p, [id]: v }));

  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-8 mx-auto lg:grid-cols-2 animate-fade-in">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Step 2: Complete Your Profile</h2>
        <div className="p-6 space-y-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-lg font-semibold text-white">
              <Dna className="w-5 h-5 mr-2 text-purple-400" /> Polygenic Scores{' '}
              <span className="ml-2 text-xs text-green-400">(auto)</span>
            </h3>
            <button onClick={() => setEditable(!editable)} className="flex items-center text-xs text-purple-400">
              <Edit className="w-3 h-3 mr-1" /> {editable ? 'Lock' : 'Override'}
            </button>
          </div>
          <FormInput id="ea4_pgs" label="Educational Attainment PGS" value={data.ea4_pgs} onChange={update} disabled={!editable} />
          <FormInput id="int_pgs" label="Intelligence PGS" value={data.int_pgs} onChange={update} disabled={!editable} />
        </div>

        <CollapsibleSection
          title="Socioeconomic Status (required)"
          subtitle="Factors related to your developmental environment."
          icon={<Shield className="w-5 h-5 mr-2 text-blue-400" />}
        >
          <FormInput id="parent_education_years" label="Parental Education (years)" value={data.parent_education_years} onChange={update} placeholder="16" />
          <FormInput id="household_income" label="Household Income ($)" value={data.household_income} onChange={update} placeholder="60000" />
        </CollapsibleSection>

        <CollapsibleSection
          title="Prenatal Index (optional)"
          subtitle="Higher accuracy with more data."
          icon={<Shield className="w-5 h-5 mr-2 text-sky-400" />}
        >
          {Object.keys(SPI_FACTORS).map((f) => (
            <FormInput
              key={f}
              id={`spi_${f}`}
              label={f.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              value={data[`spi_${f}`]}
              onChange={update}
              placeholder="Z-score"
            />
          ))}
        </CollapsibleSection>

        <CollapsibleSection
          title="Neuroimaging Metrics (optional)"
          subtitle="Structural MRI-derived metrics."
          icon={<Activity className="w-5 h-5 mr-2 text-green-400" />}
        >
          <FormInput id="tbv_zscore" label="TBV" value={data.tbv_zscore} onChange={update} placeholder="Z-score" />
          <FormInput id="ct_zscore" label="CT" value={data.ct_zscore} onChange={update} placeholder="Z-score" />
          <FormInput id="fa_zscore" label="FA" value={data.fa_zscore} onChange={update} placeholder="Z-score" />
          <FormInput id="dfc_zscore" label="dFC" value={data.dfc_zscore} onChange={update} placeholder="Z-score" />
        </CollapsibleSection>
      </div>

      <div className="sticky top-24 space-y-6">
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800">
          <h3 className="text-lg font-bold text-white">Final Step (required)</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="ancestry" className="block mb-1 text-sm text-slate-300">
                Ancestry Calibration
              </label>
              <select
                id="ancestry"
                className="w-full px-3 py-2 text-white bg-slate-800 border border-slate-700 rounded-lg"
                value={data.ancestry ?? ''}
                onChange={(e) => update('ancestry', e.target.value)}
              >
                <option value="">Select…</option>
                {Object.keys(ANCESTRY_CALIBRATION).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={next}
              className="w-full py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentScreen = ({ email, setEmail, pay, test }) => (
  <div className="w-full max-w-md p-10 mx-auto mt-12 text-center rounded-xl bg-slate-900/50 border border-slate-800 animate-fade-in">
    <h2 className="text-2xl font-bold text-white">Unlock Your IQ Report</h2>
    <p className="mt-2 text-slate-300">We’ll send your report to the email below.</p>
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
      We’ll send the report to <strong className="text-slate-300">{email}</strong>.
    </p>
  </div>
);

const ResultCard = ({ result, email }) => {
  const [showMail, setShowMail] = useState(true);

  const pdf = () => {
    if (!window.jspdf) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = gen;
      document.body.appendChild(s);
    } else gen();

    function gen() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(68, 51, 122);
      doc.text('ThinQ Cognitive Analysis', 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(`Official Report For: ${email}`, 105, 30, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 37, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 45, 190, 45);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Predicted Full-Scale IQ (FSIQ)', 20, 60);
      doc.setFontSize(48);
      doc.setTextColor(88, 80, 236);
      doc.text(String(result.predictedFSIQ), 105, 85, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`95% CI: ${result.ci_lower} – ${result.ci_upper}`, 105, 95, { align: 'center' });
      doc.save(`ThinQ_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl p-8 mx-auto mt-8 rounded-xl bg-slate-900/50 border border-slate-800 animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            <BrainCircuit className="inline w-8 h-8 mr-2 text-purple-400" /> Your DNA-Based IQ Estimate
          </h2>
          <p className="flex items-center justify-center mt-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" /> Analysis complete!
          </p>
        </div>
        <div className="my-8 text-center">
          <p className="text-lg text-slate-300">Predicted Full-Scale IQ (FSIQ)</p>
          <p className="my-2 text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            {result.predictedFSIQ}
          </p>
          <p className="text-slate-400">95% CI: {result.ci_lower} – {result.ci_upper}</p>
        </div>
        <div className="mt-8 text-center">
          <button onClick={pdf} className="px-5 py-2 font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-600">
            <Download className="inline w-4 h-4 mr-2" /> Download PDF Report
          </button>
        </div>
      </div>

      {showMail && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 animate-fade-in z-50">
          <div className="w-full max-w-sm p-8 m-4 rounded-xl bg-slate-800 border border-slate-700">
            <h3 className="flex items-center text-lg font-bold text-white">
              <Mail className="w-5 h-5 mr-3 text-green-400" /> Email Delivery (simulation)
            </h3>
            <p className="mt-4 text-sm text-slate-400">
              In production, a secure link to this report has been sent to:
            </p>
            <p className="px-4 py-2 my-4 font-mono rounded-md bg-slate-900 text-purple-300">{email}</p>
            <p className="text-xs text-slate-500">This ensures you always have a copy of your results.</p>
            <button onClick={() => setShowMail(false)} className="w-full py-2 mt-6 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------
 *  AnalysisPage orchestrator
 * ----------------------------------------------------------------*/
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

/* ------------------------------------------------------------------
 *  Static pages
 * ----------------------------------------------------------------*/
const MethodologyPage = () => (
  <div className="max-w-4xl px-4 py-16 mx-auto animate-fade-in">
    <h1 className="mb-12 text-4xl font-bold text-center text-white">Our Scientific Approach</h1>
    <p className="text-slate-300">Detailed explanation coming soon…</p>
  </div>
);

const LegalPage = ({ page }) => (
  <div className="max-w-4xl px-4 py-16 mx-auto animate-fade-in">
    <h1 className="text-4xl font-bold capitalize text-white">{page.replace('-', ' ')}</h1>
    <p className="mt-8 text-slate-400">Placeholder for {page.replace('-', ' ')} content.</p>
  </div>
);

/* ------------------------------------------------------------------
 *  Root
 * ----------------------------------------------------------------*/
export default function App() {
  const [page, setPage] = useState('home');
  return (
    <div className="min-h-screen font-sans text-slate-200 bg-slate-950">
      <Header onNavigate={setPage} />
      <main className="w-full">
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'analysis' && <AnalysisPage />}
        {page === 'methodology' && <MethodologyPage />}
        {page === 'privacy' && <LegalPage page="privacy-policy" />}
        {page === 'terms' && <LegalPage page="terms-of-service" />}
      </main>
      <Footer onNavigate={setPage} />
    </div>
  );
}