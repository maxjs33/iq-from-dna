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
 *  API – real backend stubs (wire to FastAPI later)
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

const num = (v, d = 0) => (Number.isNaN(parseFloat(v)) ? d : parseFloat(v));

/* ------------------------------------------------------------------
 *  Reusable tiny bits
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
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-6 border rounded-xl bg-slate-900/50 border-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <h3 className="flex items-center text-lg font-semibold text-white">
          {icon}
          {title}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="space-y-4 animate-fade-in">
          {subtitle && <p className="mb-4 -mt-2 text-xs text-slate-400">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------
 *  Layout – Header / Footer
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
        Upload raw data from 23andMe or AncestryDNA to receive a scientifically‑grounded cognitive analysis.
      </p>
      <button
        onClick={() => onNavigate('analysis')}
        className="px-8 py-4 mt-10 text-lg font-bold text-white transition-transform rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
      >
        Start My DNA Analysis
      </button>
    </section>
    {/* Kit chooser, FAQ, disclaimers etc. can be re‑inserted later */}
  </div>
);

/* ------------------------------------------------------------------
 *  Analysis flow – full original implementation
 * ----------------------------------------------------------------*/
const UploadDropzone = ({ onUploadSuccess, setGlobalError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [gdpr, setGdpr] = useState(false);

  const onDrop = useCallback(
    async (files) => {
      const file = files[0];
      if (!file || !gdpr) {
        setGlobalError(gdpr ? 'No file selected.' : 'You must agree to the disclaimers to proceed.');
        return;
      }
      setGlobalError('');
      setIsUploading(true);
      try {
        const { job_id } = await createUploadJob();
        onUploadSuccess(job_id);
      } catch (err) {
        setGlobalError(err.message || 'Upload failed.');
      } finally {
        setIsUploading(false);
      }
    },
    [gdpr, onUploadSuccess, setGlobalError],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1 });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className="p-10 border-2 border-dashed rounded-xl cursor-pointer border-slate-700 hover:border-slate-500"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
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
          checked={gdpr}
          onChange={(e) => setGdpr(e.target.checked)}
        />
        <span className="text-sm text-slate-400">
          I have read and agree to the <strong className="text-white">Important Disclaimers</strong> and understand this is not medical advice.
        </span>
      </label>
    </div>
  );
};

const PredictionStepper = ({ jobId, onComplete }) => {
  const steps = ['Upload', 'QC', 'Imputation', 'PGS', 'Finalizing'];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          clearInterval(t);
          onComplete();
          return s;
        }
        return s + 1;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [jobId, onComplete, steps.length]);

  return (
    <div className="w-full max-w-2xl p-8 mx-auto mt-12 bg-slate-900/50 border border-slate-800 rounded-xl">
      <h2 className="text-xl font-bold text-center text-white">Processing Genetic Data…</h2>
      <div className="flex items-center mt-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center min-w-[60px]">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  i <= step ? 'bg-green-500' : 'bg-slate-700'
                }`}
              >
                {i < step ? <CheckCircle className="w-5 h-5 text-white" /> : <span className="font-bold text-white">{i + 1}</span>}
              </div>
              <p className={`mt-2 text-xs font-medium text-center ${i <= step ? 'text-white' : 'text-slate-500'}`}>{s}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 transition-all ${i < step ? 'bg-green-500' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
 *  (shortened) – PredictionForm, Payment, Result  👉  identical to your
 *  previous copy; bring them back gradually to avoid size blow‑ups.
 * ----------------------------------------------------------------*/

const AnalysisPage = () => {
  const [state, setState] = useState('upload');
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState('');

  const start = async () => {
    const { job_id } = await createUploadJob();
    setJobId(job_id);
    setState('running');
  };

  const finish = () => setState('form');

  return (
    <div className="p-8 animate-fade-in">
      {error && (
        <div className="p-4 mb-4 text-red-300 bg-red-900/30 border border-red-500/50 rounded-lg">
          <XCircle className="inline w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {state === 'upload' && <UploadDropzone onUploadSuccess={start} setGlobalError={setError} />}
      {state === 'running' && <PredictionStepper jobId={jobId} onComplete={finish} />}
      {state === 'form' && (
        <div className="flex items-center justify-center w-full h-40 text-slate-400">Form coming next commit…</div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------
 *  Simple static pages
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
 *  Root app
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
