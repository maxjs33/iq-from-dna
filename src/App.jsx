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
  Download,
  Mail,
  TestTube2,
} from 'lucide-react';

import {
  createUploadJob,
  getJobStatus,
  calculatePrediction,
} from './services/api.js';

/* ------------------------------------------------------------------------- */
/*  CONSTANTS                                                                */
/* ------------------------------------------------------------------------- */
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
  maternal_smoking: -0.20,
  alcohol_exposure: -0.25,
  gestational_diabetes: -0.10,
  preterm_birth: -0.14,
  iugr: -0.16,
  maternal_infection: -0.13,
};

const ANCESTRY_CALIBRATION = {
  'Northwest European': 1.0,
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

const getNumber = (val, def = 0) => {
  const num = parseFloat(val);
  return Number.isNaN(num) ? def : num;
};

/* ------------------------------------------------------------------------- */
/*  REUSABLE COMPONENTS                                                      */
/* ------------------------------------------------------------------------- */
const FormInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  step,
  disabled,
  type = 'number',
}) => (
  <div>
    <label htmlFor={id} className="block mb-1 text-sm text-slate-300">
      {label}
    </label>
    <input
      id={id}
      type={type}
      step={step}
      disabled={disabled}
      className="w-full px-3 py-2 text-white bg-slate-800 border border-slate-700 rounded-lg"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(id, e.target.value)}
    />
  </div>
);

const ChevronIcon = ({ open }) => (
  <ChevronDown
    className={`w-5 h-5 text-slate-400 transition-transform ${
      open ? 'rotate-180' : ''
    }`}
  />
);

const CollapsibleSection = ({ title, icon, children, subtitle }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <h3 className="flex items-center text-lg font-semibold text-white">
          {icon}
          {title}
        </h3>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="space-y-4 animate-fade-in">
          {subtitle && (
            <p className="mb-4 -mt-2 text-xs text-slate-400">{subtitle}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------- */
/*  MAIN APP                                                                 */
/* ------------------------------------------------------------------------- */

export default function App() {
  /* ---------------- state ---------------- */
  const [page, setPage] = useState('home');

  /* ------------- navigation -------------- */
  const navigate = (p) => setPage(p);

  return (
    <div className="min-h-screen font-sans text-slate-200 bg-slate-950">
      <Header onNavigate={navigate} />

      <main className="w-full">
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'analysis' && <AnalysisPage />}
        {page === 'methodology' && <MethodologyPage />}
        {page === 'privacy' && <LegalPage page="privacy-policy" />}
        {page === 'terms' && <LegalPage page="terms-of-service" />}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  HEADER / FOOTER / STATIC PAGES — unchanged from your previous version    */
/*  (omit here for brevity – copy-paste them from the working sections)      */
/* ------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------- */
/*  ANALYSIS WORKFLOW (upload → form → payment → result)                     */
/*  KEY DIFFERENCES vs. old file:                                            */
/*    • uses createUploadJob / getJobStatus / calculatePrediction helpers    */
/*    • all template-literals & className braces fixed                       */
/* ------------------------------------------------------------------------- */

/* … KEEP the rest of your original, now-fixed components (UploadDropzone,   */
/*    PredictionStepper, PredictionForm, PaymentScreen, etc.) …              */

/*  The only edits needed in those sub-components were:                      */
/*    1️⃣ Replace every  mockApi.createUploadJob()   →  await createUploadJob()  */
/*    2️⃣ Replace        mockApi.getPipelineResults() →  await getJobStatus()    */
/*    3️⃣ Replace        mockApi.calculateFinalPrediction(formData)             */
/*                                      →  await calculatePrediction(jobId, formData) */
/*    4️⃣ Wrap any remaining un-quoted className values in back-ticks           */
/*-----------------------------------------------------------------------------*/
