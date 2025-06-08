import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Loader, XCircle, ShieldCheck, BrainCircuit, Dna, Activity, ChevronDown, Target, Edit, Shield, TrendingUp, Lock, Microscope, Zap, FileText, Mail, Download, TestTube2, BookOpen, HelpCircle } from 'lucide-react';

// --- Model Constants & Mock API ---
const CORE_MODEL_WEIGHTS = { EA4_PGS: 0.238, INT_PGS: 0.146, SPI: -0.284, SES: 0.112, TBV: 0.062, CT: -0.012, FA: 0.049, dFC: 0.008 };
const SPI_FACTORS = { maternal_crp: -0.15, folate_deficiency: -0.12, prenatal_stress: -0.18, lead_exposure: -0.22, pm25_exposure: -0.11, maternal_smoking: -0.20, alcohol_exposure: -0.25, gestational_diabetes: -0.10, preterm_birth: -0.14, iugr: -0.16, maternal_infection: -0.13 };
const ANCESTRY_CALIBRATION = { 'Northwest European': 1.000, 'West Germanic': 0.995, 'North Germanic': 0.990, 'Celtic': 0.988, 'South Asian': 0.975, 'Ashkenazi': 0.973, 'East Asian': 0.968, 'Finnish': 0.955, 'West Slavic': 0.965, 'East Slavic': 0.958, 'Admixed American': 0.945, 'African': 0.890 };
const getNumber = (val, defaultVal = 0) => { const num = parseFloat(val); return isNaN(num) ? defaultVal : num; };
const mockApi = {
  createUploadJob: async () => { await new Promise(res => setTimeout(res, 500)); return { job_id: `job_${new Date().getTime()}` }; },
  getPipelineResults: async () => { await new Promise(res => setTimeout(res, 1000)); return { pgs_scores: { 'EA4': { z_score: 1.15 }, 'INT': { z_score: 0.92 } } }; },
  calculateFinalPrediction: async (formData) => {
    const calculateSPI = () => { let spi = 0, count = 0; for (const factor in SPI_FACTORS) { const val = getNumber(formData[`spi_${factor}`]); if (val !== 0) { spi += SPI_FACTORS[factor] * val; count++; } } return count > 0 ? spi / Math.sqrt(count) : 0; };
    const calculateSES = () => { const ed = getNumber(formData.parent_education_years, 14), inc = getNumber(formData.household_income, 60000); return ((ed - 14) / 2 + (Math.log(inc) - Math.log(60000)) / 0.7) / 2; };
    const total_effect = ( (CORE_MODEL_WEIGHTS.EA4_PGS * getNumber(formData.ea4_pgs) + CORE_MODEL_WEIGHTS.INT_PGS * getNumber(formData.int_pgs)) + (CORE_MODEL_WEIGHTS.SPI * calculateSPI()) + (CORE_MODEL_WEIGHTS.SES * calculateSES()) + (CORE_MODEL_WEIGHTS.TBV * getNumber(formData.tbv_zscore) + CORE_MODEL_WEIGHTS.CT * getNumber(formData.ct_zscore) + CORE_MODEL_WEIGHTS.FA * getNumber(formData.fa_zscore) + CORE_MODEL_WEIGHTS.dFC * getNumber(formData.dfc_zscore)) ) * 15;
    const iq_estimate = 100 + total_effect;
    const calibrated_iq = 100 + (iq_estimate - 100) * (ANCESTRY_CALIBRATION[formData.ancestry] || 1.0);
    const rmse = 10.53;
    return { predictedFSIQ: Math.round(calibrated_iq), ci_lower: Math.round(calibrated_iq - 1.96 * rmse), ci_upper: Math.round(calibrated_iq + 1.96 * rmse) };
  }
};

// --- Reusable UI Components ---
const FormInput = ({ id, label, value, onChange, placeholder, step, disabled, type = "number" }) => (<div><label htmlFor={id} className="block text-sm text-slate-400 mb-1">{label}</label><input id={id} type={type} step={step} disabled={disabled} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder={placeholder} value={value || ''} onChange={(e) => onChange(id, e.target.value)} /></div>);
const CollapsibleSection = ({ title, icon, children, subtitle }) => { const [isOpen, setIsOpen] = useState(false); return (<div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800"><button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between mb-4 text-left"><h3 className="text-lg font-semibold text-white flex items-center">{icon}{title}</h3><ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && (<div className="space-y-4 animate-fade-in">{subtitle && <p className="text-xs text-slate-500 -mt-2 mb-4">{subtitle}</p>}{children}</div>)}</div>); };
const FAQItem = ({ q, children }) => { const [isOpen, setIsOpen] = useState(false); return (<div className="border-b border-slate-800 py-4"><button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left"><span className="font-semibold text-white">{q}</span><ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="pt-4 text-slate-400 animate-fade-in">{children}</div>}</div>); };

// --- Page Components ---
const Header = ({ onNavigate }) => (<header className="py-6 px-4 md:px-8 flex justify-between items-center w-full max-w-7xl mx-auto"><button onClick={() => onNavigate('home')} className="flex items-center space-x-2"><BrainCircuit className="w-8 h-8 text-purple-400" /><span className="text-2xl font-bold text-white">ThinQ</span></button><nav className="flex items-center space-x-4 md:space-x-6"><button onClick={() => onNavigate('methodology')} className="text-sm md:text-base text-slate-300 hover:text-white transition-colors">Our Science</button><button onClick={() => onNavigate('analysis')} className="bg-purple-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-purple-700 transition-colors">Get Started</button></nav></header>);

const HomePage = ({ onNavigate }) => (
    <div className="w-full animate-fade-in">
        <section className="text-center py-20 px-4"><h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">Estimate Your IQ From DNA</h1><p className="text-lg md:text-xl text-slate-300 mt-4 max-w-3xl mx-auto">Upload raw data from 23andMe or AncestryDNA to receive a scientifically-grounded cognitive analysis based on the latest research.</p><button onClick={() => onNavigate('analysis')} className="mt-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform">Start My DNA Analysis</button></section>
        <section className="py-20 bg-slate-900/50">
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-white mb-4">Which DNA Kit Do I Need?</h2>
                <p className="text-center text-slate-400 mb-12">You don't need the most expensive kits. The standard ancestry services provide everything we need.</p>
                <div className="grid md:grid-cols-2 gap-8 text-left bg-slate-800/50 p-8 rounded-2xl border border-slate-700"><div><h3 className="text-2xl font-semibold text-white mb-2">23andMe</h3><p className="text-green-400 font-semibold mb-4">"Ancestry + Traits Service" is sufficient.</p></div><div><h3 className="text-2xl font-semibold text-white mb-2">AncestryDNA</h3><p className="text-green-400 font-semibold mb-4">The standard "AncestryDNA" kit is sufficient.</p></div></div>
            </div>
        </section>
        <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto bg-slate-800/50 p-8 rounded-2xl border border-slate-700"><h2 className="text-2xl font-bold text-center text-white mb-6">Important Disclaimers</h2><div className="space-y-4 text-slate-400 text-sm"><p><strong className="text-amber-400">For Informational & Educational Use Only.</strong> This service is not a diagnostic tool and does not provide medical advice. Results are statistical estimations based on current scientific research and are not a definitive measure of intelligence.</p><p><strong className="text-amber-400">Not a Substitute for Professional Advice.</strong> Consult with qualified professionals for any health or life-decisions.</p></div></div>
        </section>
    </div>
);

const MethodologyPage = () => (<div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in"><h1 className="text-4xl font-bold text-white text-center mb-12">Our Scientific Approach</h1><div className="space-y-12 text-slate-300"><div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800"><h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><Dna className="w-6 h-6 mr-3 text-purple-400"/>Polygenic Scores (PGS)</h2><p>Your DNA contains millions of genetic variants (SNPs). While most have a tiny effect on their own, their combined influence on complex traits like cognition can be significant. A Polygenic Score is a powerful statistical tool that aggregates these tiny effects into a single score. We calculate your PGS based on massive, peer-reviewed Genome-Wide Association Studies (GWAS) to estimate the genetic component of your cognitive profile.</p></div><div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800"><h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><BrainCircuit className="w-6 h-6 mr-3 text-sky-400"/>A Multimodal Model</h2><p>Genetics is only part of the story. Decades of research show that environmental, developmental, and socioeconomic factors are also crucial. Our proprietary Core Multimodal Model integrates your genetic data (PGS) with these other key life factors. By analyzing how these different domains interact, we can create a more nuanced and accurate estimation than looking at genetics alone.</p></div></div></div>);

const AnalysisPage = ({ onNavigate }) => {
    const [pageState, setPageState] = useState('upload');
    const [jobId, setJobId] = useState(null); const [error, setError] = useState(""); const [pipelineResults, setPipelineResults] = useState(null);
    const [formData, setFormData] = useState({}); const [finalPrediction, setFinalPrediction] = useState(null); const [isPgsEditable, setIsPgsEditable] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const handleUploadSuccess = (newJobId) => { setJobId(newJobId); setPageState('running'); setError(""); };
    const handlePipelineComplete = useCallback(async () => { if (jobId) { const r = await mockApi.getPipelineResults(jobId); setPipelineResults(r); setFormData(p => ({...p, ea4_pgs: r.pgs_scores.EA4.z_score.toFixed(2), int_pgs: r.pgs_scores.INT.z_score.toFixed(2)})); setPageState('form'); } }, [jobId]);
    const handleFormSubmit = () => setPageState('payment');
    const handlePaymentInitiation = () => { if (!userEmail) { setError("Please enter a valid email address."); return; } setError(""); setPageState('waiting'); };
    const handleTestBypass = async () => { if (!userEmail) { setError("Please enter an email for the test report."); return; } setError(""); setPageState('waiting'); const p = await mockApi.calculateFinalPrediction(formData); setFinalPrediction(p); setPageState('results'); }

    const renderContent = () => {
        switch(pageState) {
            case 'upload': return <UploadDropzone onUploadSuccess={handleUploadSuccess} setGlobalError={setError} />;
            case 'running': return <PredictionStepper jobId={jobId} onComplete={handlePipelineComplete} />;
            case 'form': return <PredictionForm formData={formData} setFormData={setFormData} isPgsEditable={isPgsEditable} setIsPgsEditable={setIsPgsEditable} onSubmit={handleFormSubmit} />;
            case 'payment': return <PaymentScreen onInitiatePayment={handlePaymentInitiation} onTestBypass={handleTestBypass} email={userEmail} setEmail={setUserEmail} />;
            case 'waiting': return <WaitingForPaymentScreen email={userEmail} />;
            case 'results': return <PredictionResultCard result={finalPrediction} email={userEmail} />;
            default: return <UploadDropzone onUploadSuccess={handleUploadSuccess} setGlobalError={setError} />;
        }
    };
    return (<div className="w-full animate-fade-in p-8"><div className="text-center my-10 w-full"><h1 className="text-4xl font-bold text-white flex items-center justify-center"><ShieldCheck className="w-10 h-10 mr-3 text-purple-400" />Your Cognitive Analysis</h1><p className="text-slate-400 mt-2">Combine your genetic data with key life factors for the most accurate report.</p></div>{error && <div className="w-full max-w-2xl mx-auto mb-4 p-4 bg-red-900/30 border-red-500/50 text-red-300 rounded-lg flex items-center"><XCircle className="w-5 h-5 mr-3"/><span>{error}</span></div>}{renderContent()}</div>);
};

const UploadDropzone = ({ onUploadSuccess, setGlobalError }) => {
    const [isUploading, setIsUploading] = useState(false); const [gdprConsent, setGdprConsent] = useState(false);
    const onDrop = useCallback(async (acceptedFiles) => { const file = acceptedFiles[0]; if (!file || !gdprConsent) { setGlobalError(gdprConsent ? "No file selected." : "You must agree to the disclaimers to proceed."); return; } setGlobalError(""); setIsUploading(true); try { const { job_id } = await mockApi.createUploadJob(); onUploadSuccess(job_id); } catch (error) { setGlobalError(error.message || "Upload failed."); } finally { setIsUploading(false); } }, [gdprConsent, onUploadSuccess, setGlobalError]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'text/plain': ['.txt'], 'application/zip': ['.zip'] }, maxFiles: 1 });
    return (<div className="w-full max-w-2xl mx-auto"><div {...getRootProps()} className="p-10 border-2 border-dashed rounded-xl cursor-pointer border-slate-700 hover:border-slate-500"><input {...getInputProps()} /><div className="flex flex-col items-center justify-center text-center">{isUploading ? <Loader className="w-12 h-12 text-purple-400 animate-spin" /> : <UploadCloud className="w-12 h-12 text-slate-500" />}<p className="mt-4"><span className="font-semibold text-purple-400">Click to upload</span> or drag & drop</p></div></div><div className="flex items-start mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg"><input id="gdpr" type="checkbox" checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} className="h-5 w-5 mt-1 rounded border-slate-600 bg-slate-900 text-purple-500" /><label htmlFor="gdpr" className="ml-3 text-sm text-slate-400">I have read and agree to the <strong className="text-white">Important Disclaimers</strong> and understand this is not medical advice.</label></div></div>);
};

const PredictionStepper = ({ jobId, onComplete }) => { const steps = ["Upload", "QC", "Imputation", "PGS", "Finalizing"]; const [currentStep, setCurrentStep] = useState(0); useEffect(() => { if (!jobId) return; const interval = setInterval(() => setCurrentStep(prev => (prev >= steps.length - 1) ? (clearInterval(interval), onComplete(), prev) : prev + 1), 1500); return () => clearInterval(interval); }, [jobId, onComplete]); return (<div className="w-full max-w-2xl mx-auto mt-12 p-8 bg-slate-900/50 border border-slate-800 rounded-xl"><h2 className="text-xl font-bold text-white text-center">Processing Genetic Data...</h2><div className="flex items-center mt-8">{steps.map((step, index) => (<React.Fragment key={step}><div className="flex flex-col items-center min-w-[60px]"><div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${index <= currentStep ? 'bg-green-500' : 'bg-slate-700'}`}>{index < currentStep ? <CheckCircle className="w-5 h-5 text-white"/> : <span className="text-white font-bold">{index + 1}</span>}</div><p className={`mt-2 text-xs font-medium text-center ${index <= currentStep ? 'text-white' : 'text-slate-500'}`}>{step}</p></div>{index < steps.length - 1 && (<div className={`flex-1 h-1 mx-2 transition-all ${index < currentStep ? 'bg-green-500' : 'bg-slate-700'}`}></div>)}</React.Fragment>))}</div></div>); };
const PredictionForm = ({ formData, setFormData, isPgsEditable, setIsPgsEditable, onSubmit }) => { const handleFormUpdate = (id, value) => setFormData(prev => ({ ...prev, [id]: value })); return (<div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in"><div className="space-y-6"><h2 className="text-xl font-bold text-white">Step 2: Complete Your Profile</h2><div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 space-y-4"><div className="flex justify-between items-center"><h3 className="text-lg font-semibold text-white flex items-center"><Dna className="w-5 h-5 mr-2 text-purple-400" />Polygenic Scores <span className="text-xs ml-2 text-green-400">(Auto-calculated)</span></h3><button onClick={() => setIsPgsEditable(!isPgsEditable)} className="text-xs text-purple-400 flex items-center"><Edit className="w-3 h-3 mr-1"/>{isPgsEditable ? 'Lock' : 'Override'}</button></div><FormInput id="ea4_pgs" label="Educational Attainment PGS" value={formData.ea4_pgs} onChange={handleFormUpdate} disabled={!isPgsEditable} /><FormInput id="int_pgs" label="Intelligence PGS" value={formData.int_pgs} onChange={handleFormUpdate} disabled={!isPgsEditable} /></div><CollapsibleSection title="Socioeconomic Status (Required)" subtitle="Factors related to your developmental environment." icon={<Dna className="w-5 h-5 mr-2 text-blue-400" />}><FormInput id="parent_education_years" label="Parental Education (years)" value={formData.parent_education_years} onChange={handleFormUpdate} placeholder="16" /><FormInput id="household_income" label="Household Income ($)" value={formData.household_income} onChange={handleFormUpdate} placeholder="60000" /></CollapsibleSection><CollapsibleSection title="Prenatal Index (Optional)" subtitle="Higher accuracy with more data." icon={<Shield className="w-5 h-5 mr-2 text-sky-400" />}>{Object.keys(SPI_FACTORS).map(factor => (<FormInput key={factor} id={`spi_${factor}`} label={factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={formData[`spi_${factor}`]} onChange={handleFormUpdate} placeholder="Z-score" />))}</CollapsibleSection><CollapsibleSection title="Neuroimaging Metrics (Optional)" subtitle="Metrics from structural MRI scans, if available." icon={<Activity className="w-5 h-5 mr-2 text-green-400" />}><FormInput id="tbv_zscore" label="TBV (Total Brain Volume)" value={formData.tbv_zscore} onChange={handleFormUpdate} placeholder="Z-score" /><FormInput id="ct_zscore" label="CT (Cortical Thickness)" value={formData.ct_zscore} onChange={handleFormUpdate} placeholder="Z-score" /><FormInput id="fa_zscore" label="FA (Fractional Anisotropy)" value={formData.fa_zscore} onChange={handleFormUpdate} placeholder="Z-score" /><FormInput id="dfc_zscore" label="dFC (Dynamic Functional Connectivity)" value={formData.dfc_zscore} onChange={handleFormUpdate} placeholder="Z-score" /></CollapsibleSection></div><div className="sticky top-24 space-y-6"><div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl"><h3 className="text-lg font-bold text-white">Final Step (Required)</h3><div className="mt-4 space-y-4"><div><label htmlFor="ancestry" className="block text-sm text-slate-400 mb-1">Ancestry Calibration</label><select id="ancestry" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={formData.ancestry || ''} onChange={(e) => handleFormUpdate('ancestry', e.target.value)}><option value="">Select closest ancestry...</option>{Object.keys(ANCESTRY_CALIBRATION).map(ancestry => (<option key={ancestry} value={ancestry}>{ancestry}</option>))}</select></div><button onClick={onSubmit} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600">Proceed to Payment</button></div></div></div></div>); };
const PaymentScreen = ({ onInitiatePayment, onTestBypass, email, setEmail }) => (<div className="w-full max-w-md mx-auto mt-12 p-10 text-center bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in"><h2 className="text-2xl font-bold text-white">Unlock Your IQ Report</h2><p className="text-slate-400 mt-2">Your report and certificate will be sent to the email below.</p><div className="my-8 space-y-4"><FormInput id="email" label="Your Email Address" value={email} onChange={(id, val) => setEmail(val)} placeholder="you@example.com" type="email" /><div className="text-6xl font-bold text-white pt-4">$20</div><p className="text-sm text-slate-500">USD</p></div><a href="https://buy.stripe.com/4gM7sN1N71vH1YCc8Q3ks00" target="_blank" rel="noopener noreferrer" onClick={onInitiatePayment} className="w-full block py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform text-center">Pay with Stripe</a><p className="text-xs text-slate-600 mt-6">You will be redirected to Stripe for secure payment.</p><div className="mt-6 p-4 border-t border-slate-700"><button onClick={onTestBypass} className="text-xs text-amber-400 hover:text-amber-300 flex items-center mx-auto"><TestTube2 className="w-4 h-4 mr-2" />For Testing Only: Bypass Payment & Generate Report</button></div></div>);
const WaitingForPaymentScreen = ({ email }) => (<div className="w-full max-w-md mx-auto mt-12 p-10 text-center bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in"><h2 className="text-2xl font-bold text-white">Waiting for Payment Confirmation</h2><Loader className="w-16 h-16 text-purple-400 animate-spin my-8 mx-auto" /><p className="text-slate-400 mt-2">Please complete your payment in the new tab. This page will update automatically once payment is confirmed by Stripe.</p><p className="text-slate-500 text-sm mt-4">Your report will be emailed to <strong className="text-slate-300">{email}</strong>.</p></div>);

const PredictionResultCard = ({ result, email }) => {
    const [showEmailModal, setShowEmailModal] = useState(true);

    const generateAndDownloadPdf = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(68, 51, 122);
        doc.text("ThinQ Cognitive Analysis", 105, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(`Official Report For: ${email}`, 105, 30, { align: "center" });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 37, { align: "center" });

        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Predicted Full-Scale IQ (FSIQ) Estimate", 20, 60);
        
        doc.setFontSize(48);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(88, 80, 236);
        doc.text(String(result.predictedFSIQ), 105, 85, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`95% Confidence Interval: ${result.ci_lower} - ${result.ci_upper}`, 105, 95, { align: "center" });

        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text("Disclaimer: This report is for informational and educational purposes only and is not a substitute for professional medical advice.", 20, 120);

        doc.save(`ThinQ_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
    <>
        <div className="w-full max-w-2xl mx-auto mt-8 p-8 bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in">
            <div className="text-center"><h2 className="text-2xl font-bold text-white"><BrainCircuit className="inline w-8 h-8 mr-2 text-purple-400"/>Your DNA-Based IQ Estimate</h2><p className="text-sm text-green-400 mt-2 flex items-center justify-center"><CheckCircle className="w-4 h-4 mr-2"/>Analysis Complete!</p></div>
            <div className="my-8 text-center"><p className="text-lg text-slate-300">Predicted Full-Scale IQ (FSIQ)</p><p className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 my-2">{result.predictedFSIQ}</p><p className="text-slate-400">95% Confidence Interval: {result.ci_lower} - {result.ci_upper}</p></div>
            <div className="text-center mt-8"><button onClick={generateAndDownloadPdf} className="bg-slate-700 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-600 transition-colors"><Download className="inline w-4 h-4 mr-2"/>Download PDF Report</button></div>
        </div>
        {showEmailModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center animate-fade-in z-50"><div className="bg-slate-800 p-8 rounded-xl max-w-sm w-full border border-slate-700 m-4"><h3 className="text-lg font-bold text-white flex items-center"><Mail className="w-5 h-5 mr-3 text-green-400"/>Report Sent (Simulation)</h3><p className="text-slate-400 mt-4 text-sm">In a live production environment, a PDF report has been dispatched to:</p><p className="font-mono text-purple-300 bg-slate-900 px-4 py-2 rounded-md my-4">{email}</p><p className="text-slate-500 text-xs">This ensures you have a permanent copy of your results.</p><button onClick={() => setShowEmailModal(false)} className="w-full mt-6 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">Got it</button></div></div>)}
    </>
    );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const handleNavigate = (page) => setCurrentPage(page);
  return (<div className="min-h-screen bg-slate-950 text-slate-200 font-sans"><Header onNavigate={handleNavigate} /><main className="w-full">{currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}{currentPage === 'analysis' && <AnalysisPage onNavigate={handleNavigate} />}{currentPage === 'methodology' && <MethodologyPage />}</main></div>);
}
