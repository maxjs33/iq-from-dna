import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Loader, XCircle, ShieldCheck, BrainCircuit, Dna, Activity, ChevronDown, Target, Edit, Shield, TrendingUp, Lock, Microscope, Zap, FileText, Mail, Download, TestTube, Users, Award, BookOpen, Heart, Calculator, User, Building, ArrowRight } from 'lucide-react';

// --- Model Constants & Mock API ---
const CORE_MODEL_WEIGHTS = { EA4_PGS: 0.238, INT_PGS: 0.146, SPI: -0.284, SES: 0.112, TBV: 0.062, CT: -0.012, FA: 0.049, dFC: 0.008 };
const SPI_FACTORS = { maternal_crp: -0.15, folate_deficiency: -0.12, prenatal_stress: -0.18, lead_exposure: -0.22, pm25_exposure: -0.11, maternal_smoking: -0.20, alcohol_exposure: -0.25, gestational_diabetes: -0.08, maternal_age: -0.05 };
const ANCESTRY_CALIBRATION = { 'Northwest European': 1.000, 'West Germanic': 0.995, 'North Germanic': 0.990, 'Celtic': 0.988, 'South Asian': 0.975, 'Ashkenazi': 0.973, 'East Asian': 0.968, 'Finnish': 0.965, 'Eastern European': 0.962, 'Balkan': 0.958, 'Mediterranean': 0.955, 'Central Asian': 0.950, 'Native American': 0.945, 'Middle Eastern': 0.940, 'African': 0.935, 'Oceanian': 0.930, 'Mixed/Other': 0.950 };
const getNumber = (val, defaultVal = 0) => { const num = parseFloat(val); return isNaN(num) ? defaultVal : num; };
const mockApi = {
  createUploadJob: async () => { await new Promise(res => setTimeout(res, 500)); return { job_id: `job_${new Date().getTime()}` }; },
  getPipelineResults: async () => { await new Promise(res => setTimeout(res, 1000)); return { pgs_scores: { 'EA4': { z_score: 1.15 }, 'INT': { z_score: 0.92 } } }; },
  calculateFinalPrediction: async (formData) => {
    const calculateSPI = () => { let spi = 0, count = 0; for (const factor in SPI_FACTORS) { const val = getNumber(formData[`spi_${factor}`]); if (val !== 0) { spi += SPI_FACTORS[factor] * val; count++; } } return count > 0 ? spi / count : 0; };
    const calculateSES = () => { const ed = getNumber(formData.parent_education_years, 14), inc = getNumber(formData.household_income, 60000); return ((ed - 14) / 2 + (Math.log(inc) - Math.log(60000)) / 2) / 2; };
    const total_effect = ( (CORE_MODEL_WEIGHTS.EA4_PGS * getNumber(formData.ea4_pgs) + CORE_MODEL_WEIGHTS.INT_PGS * getNumber(formData.int_pgs)) + (CORE_MODEL_WEIGHTS.SPI * calculateSPI()) + (CORE_MODEL_WEIGHTS.SES * calculateSES()) + (CORE_MODEL_WEIGHTS.TBV * getNumber(formData.tbv_estimate, 0)) + (CORE_MODEL_WEIGHTS.CT * getNumber(formData.ct_estimate, 0)) + (CORE_MODEL_WEIGHTS.FA * getNumber(formData.fa_estimate, 0)) + (CORE_MODEL_WEIGHTS.dFC * getNumber(formData.dfc_estimate, 0)) );
    const iq_estimate = 100 + total_effect;
    const calibrated_iq = 100 + (iq_estimate - 100) * (ANCESTRY_CALIBRATION[formData.ancestry] || 1.0);
    const rmse = 10.53;
    return { predictedFSIQ: Math.round(calibrated_iq), ci_lower: Math.round(calibrated_iq - 1.96 * rmse), ci_upper: Math.round(calibrated_iq + 1.96 * rmse) };
  }
};

// --- Reusable UI Components ---
const FormInput = ({ id, label, value, onChange, placeholder, step, disabled, type = "number" }) => (<div><label htmlFor={id} className="block text-sm text-slate-400 mb-1">{label}</label><input id={id} type={type} value={value || ""} onChange={(e) => onChange(id, e.target.value)} placeholder={placeholder} step={step} disabled={disabled} className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none" /></div>);
const CollapsibleSection = ({ title, icon, children, subtitle }) => { const [isOpen, setIsOpen] = useState(false); return (<div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800"><div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}><div className="flex items-center"><div className="text-purple-400 mr-3">{icon}</div><div><h3 className="text-lg font-semibold text-white">{title}</h3>{subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}</div></div><ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></div>{isOpen && <div className="mt-4 pt-4 border-t border-slate-700">{children}</div>}</div>); };
const FAQItem = ({ q, children }) => { const [isOpen, setIsOpen] = useState(false); return (<div className="border-b border-slate-800 py-4"><button onClick={() => setIsOpen(!isOpen)} className="w-full text-left flex justify-between items-center text-white hover:text-purple-400 transition-colors"><span className="font-medium">{q}</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="mt-3 text-slate-300 space-y-2">{children}</div>}</div>); };

// --- Page Components ---
const Header = ({ onNavigate, currentPage }) => (
  <header className="py-6 px-4 md:px-8 flex justify-between items-center w-full max-w-7xl mx-auto">
    <button onClick={() => onNavigate('home')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
        <BrainCircuit className="w-6 h-6 text-white" />
      </div>
      <span className="text-2xl font-bold text-white">ThinQ</span>
    </button>
    <nav className="hidden md:flex items-center space-x-8">
      <button onClick={() => onNavigate('home')} className={`font-medium transition-colors ${currentPage === 'home' ? 'text-purple-400' : 'text-slate-300 hover:text-white'}`}>Home</button>
      <button onClick={() => onNavigate('about')} className={`font-medium transition-colors ${currentPage === 'about' ? 'text-purple-400' : 'text-slate-300 hover:text-white'}`}>About Us</button>
      <button onClick={() => onNavigate('science')} className={`font-medium transition-colors ${currentPage === 'science' ? 'text-purple-400' : 'text-slate-300 hover:text-white'}`}>Our Science</button>
      <button onClick={() => onNavigate('analysis')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">Get Started</button>
    </nav>
    <div className="text-right text-sm">
      <div className="text-purple-400 font-medium">maxjs33</div>
      <div className="text-slate-400">2025-06-08 18:47:41</div>
    </div>
  </header>
);

const HomePage = ({ onNavigate }) => (
  <div className="w-full animate-fade-in">
    <section className="text-center py-20 px-4">
      <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">Estimate Your IQ From DNA</h1>
      <p className="text-lg md:text-xl text-slate-400 mt-6 max-w-3xl mx-auto">Upload raw data from 23andMe or AncestryDNA to receive a scientifically-grounded cognitive analysis based on the latest research.</p>
      <button onClick={() => onNavigate('analysis')} className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">Start My DNA Analysis</button>
    </section>

    {/* DNA Kit Selection Section - Original Design */}
    <section className="py-20 bg-slate-900/50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-4">Which DNA Kit Do I Need?</h2>
        <p className="text-center text-slate-400 mb-12">You don't need the most expensive kits. The standard ancestry services provide everything we need.</p>
        <div className="grid md:grid-cols-2 gap-8 text-left bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">23andMe</h3>
            <p className="text-green-400 mb-4">"Ancestry + Traits Service" is sufficient.</p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Over 700,000 genetic variants</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Raw data download included</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Works with our polygenic scores</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">AncestryDNA</h3>
            <p className="text-green-400 mb-4">The standard "AncestryDNA" kit is sufficient.</p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />700,000+ genetic markers</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Raw data available for download</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Compatible with our algorithms</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* What is IQ Section */}
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-8">What is IQ?</h2>
        <p className="text-lg text-slate-300 mb-6">IQ, or intelligence quotient, is a standardized metric used to quantify general cognitive ability, often referred to as "g." It is derived from a range of psychometric tests that assess various domains of mental functioning, including verbal comprehension, working memory, processing speed, and reasoning abilities.</p>
        <p className="text-lg text-slate-300">These tests are normed to produce a mean score of 100 with a standard deviation of 15, situating an individual's performance relative to their age-matched peers. Neuroscientific research has linked IQ to specific brain structures, with both genetic and environmental factors playing significant roles in cognitive development.</p>
      </div>
    </section>

    {/* IQ Scale Section */}
    <section className="py-20 px-4 bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Understanding IQ Scores</h2>
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
          <div className="flex rounded-lg overflow-hidden h-20 mb-6">
            <div className="bg-red-600 flex-none w-1/12 flex items-center justify-center text-white text-sm font-medium">
              <div className="text-center">
                <div className="font-bold">{'<70'}</div>
                <div className="text-xs">Very Low</div>
              </div>
            </div>
            <div className="bg-orange-500 flex-none w-2/12 flex items-center justify-center text-white text-sm font-medium">
              <div className="text-center">
                <div className="font-bold">70-84</div>
                <div className="text-xs">Low</div>
              </div>
            </div>
            <div className="bg-yellow-500 flex-1 flex items-center justify-center text-gray-900 text-sm font-medium">
              <div className="text-center">
                <div className="font-bold">85-114</div>
                <div className="text-xs">Average</div>
              </div>
            </div>
            <div className="bg-green-600 flex-none w-2/12 flex items-center justify-center text-white text-sm font-medium">
              <div className="text-center">
                <div className="font-bold">115-129</div>
                <div className="text-xs">High</div>
              </div>
            </div>
            <div className="bg-purple-600 flex-none w-1/12 flex items-center justify-center text-white text-sm font-medium">
              <div className="text-center">
                <div className="font-bold">130+</div>
                <div className="text-xs">Very High</div>
              </div>
            </div>
          </div>
          <p className="text-slate-300 text-center">Because IQ follows a bell-curve distribution, roughly 68 percent of people fall between 85 and 115. Scores around 130 and higher place an individual in the top two percent of the population, while scores below 70 indicate significant cognitive challenges.</p>
        </div>
      </div>
    </section>

    {/* Who Is This For Section */}
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-8">Who Is This Service For?</h2>
        <p className="text-lg text-slate-300 mb-8">Our DNA-based estimate is designed for people who already possess raw genotype data from 23andMe or AncestryDNA and want a research-grade, non-diagnostic indication of cognitive potential. Typical users include:</p>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <Users className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Parents & Educators</h3>
            <p className="text-slate-300">Interested in early talent identification and gifted-program placement context</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <BookOpen className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Researchers</h3>
            <p className="text-slate-300">Exploring the connections between genetics and cognitive abilities</p>
          </div>
        </div>
      </div>
    </section>

    {/* FAQ Section */}
    <section className="py-20 px-4 bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
          <FAQItem q="What will my results look like?">
            <p>Your report lists a single predicted Full-Scale IQ (FSIQ), a 95 percent confidence interval, and a percentile rank. The point estimate represents the model's best guess given your genetic and environmental inputs. The confidence interval shows the range in which your true score would likely fall if you took a formal IQ test, and the percentile tells you what proportion of the population you are predicted to outperform.</p>
          </FAQItem>
          <FAQItem q="How accurate is the prediction?">
            <p>Our model explains approximately 9-11% of the variance in IQ scores, representing the current state of the science. While this is significant, it means many factors beyond what we measure also contribute to cognitive performance.</p>
          </FAQItem>
          <FAQItem q="Is this a replacement for clinical IQ testing?">
            <p>No. This is a research-grade estimation based on genomic data and should not be used for clinical diagnosis or decision-making. Professional IQ testing involves trained psychologists and comprehensive assessments.</p>
          </FAQItem>
          <FAQItem q="What environmental factors do you consider?">
            <p>We include the highest parental education level as an environmental variable in our model, which serves as a proxy for several developmental factors that influence cognitive ability.</p>
          </FAQItem>
          <FAQItem q="How do you protect my privacy?">
            <p>Your genetic data is encrypted during transmission and processing. We do not store your raw genetic data after analysis, and all results are de-identified and protected.</p>
          </FAQItem>
        </div>
      </div>
    </section>

    {/* Disclaimer */}
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <h2 className="text-sm font-bold text-center text-white mb-2">Important Disclaimers</h2>
        <div className="text-xs text-slate-400 text-center">
          <p><strong>DISCLAIMER:</strong> This service provides non-diagnostic, research-grade estimates only. Results should not be used for medical decisions or as a substitute for professional assessment. Individual cognitive performance depends on numerous factors beyond genetics.</p>
        </div>
      </div>
    </section>
  </div>
);

// About Us Page
const AboutPage = () => (
  <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold text-white mb-6">About Us</h1>
      <p className="text-xl text-slate-300 max-w-3xl mx-auto">Making advances in genomic science accessible and meaningful to individuals</p>
    </div>

    <div className="grid md:grid-cols-2 gap-12 mb-16">
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
        <Target className="w-12 h-12 text-purple-400 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-slate-300">At ThinQ, we're committed to making advances in genomic science accessible and meaningful to individuals. By translating complex genetic data into understandable insights about cognitive potential, we aim to empower people with knowledge that can inform educational and personal development decisions.</p>
      </div>
      
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
        <Shield className="w-12 h-12 text-purple-400 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Our Approach</h2>
        <p className="text-slate-300">We believe in the responsible application of genetic science. Our approach is research-driven, transparent, privacy-focused, and educational. We clearly communicate what our estimates can and cannot tell you, including their limitations.</p>
      </div>
    </div>

    <div className="mb-16">
      <h2 className="text-3xl font-bold text-white text-center mb-12">Our Team</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { name: "Dr. Sarah Johnson", role: "Computational Geneticist", description: "Ph.D. in Genomic Science with 10+ years of experience in polygenic scoring methods." },
          { name: "Prof. Michael Chen", role: "Psychometrician", description: "Leading researcher with 50+ published papers on cognitive assessment methodologies." },
          { name: "Dr. Rebecca Torres", role: "Neuroscientist", description: "Specializes in neural correlates of intelligence and biological basis of cognitive differences." },
          { name: "Alex Matthews", role: "Data Privacy Officer", description: "Expert in bioethics and genetic privacy, ensuring highest standards of data protection." }
        ].map((member, idx) => (
          <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
            <p className="text-purple-400 text-sm mb-3">{member.role}</p>
            <p className="text-slate-300 text-sm">{member.description}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: <BookOpen className="w-8 h-8" />, title: "Scientific Integrity", description: "Rigorous scientific standards and transparency about capabilities and limitations." },
        { icon: <Heart className="w-8 h-8" />, title: "Ethical Practice", description: "Strict ethical guidelines in handling genetic data and presenting results." },
        { icon: <Users className="w-8 h-8" />, title: "Accessibility", description: "Making scientific advances understandable and accessible to all." },
        { icon: <Award className="w-8 h-8" />, title: "Individual Empowerment", description: "Providing information for informed personal development decisions." }
      ].map((value, idx) => (
        <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <div className="text-purple-400 mb-4">{value.icon}</div>
          <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
          <p className="text-slate-300 text-sm">{value.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Science Page
const SciencePage = () => (
  <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold text-white mb-6">Our Science</h1>
      <p className="text-xl text-slate-300 max-w-3xl mx-auto">Understanding how genetics influences cognitive abilities through rigorous scientific methods</p>
    </div>

    <div className="space-y-12">
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
        <h2 className="text-3xl font-bold text-white mb-6">Understanding Genetics and Intelligence</h2>
        <p className="text-slate-300 text-lg mb-4">Intelligence is what scientists call a "complex trait" – it's influenced by hundreds or even thousands of genes, each with a small effect, as well as environmental factors. Modern genetic research has made it possible to identify many of these genetic variants and estimate their combined influence.</p>
        <p className="text-slate-300 text-lg">Genes provide instructions for building proteins that affect brain development, neural connectivity, neurotransmitter function, and other biological processes that ultimately influence cognitive abilities. Although no single "intelligence gene" exists, the combined effect of many genetic variants creates a meaningful signal that correlates with cognitive performance.</p>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Methodology in Simple Terms</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { step: "1", title: "Genome-Wide Association Studies", description: "Scientists have conducted large studies with hundreds of thousands of people, measuring both their IQ scores and their genetic makeup. These studies identify which genetic variants are more common in people with higher or lower cognitive abilities.", icon: <Microscope className="w-8 h-8" /> },
            { step: "2", title: "Creating a Polygenic Score", description: "We use these research findings to create what's called a 'polygenic score' – essentially adding up the small effects of thousands of genetic variants found in your DNA. This score represents the genetic component of your cognitive potential.", icon: <Calculator className="w-8 h-8" /> },
            { step: "3", title: "Incorporating Environmental Factors", description: "We include the highest parental education level as an environmental factor in our model. This helps account for some non-genetic influences on cognitive development, as parental education correlates with many aspects of the child's learning environment.", icon: <Building className="w-8 h-8" /> },
            { step: "4", title: "Statistical Modeling", description: "Our algorithms combine your genetic data with environmental information to produce an estimate of your Full-Scale IQ, along with a confidence interval that accounts for statistical uncertainty.", icon: <TrendingUp className="w-8 h-8" /> }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">{item.step}</div>
                <div className="text-purple-400">{item.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
        <h2 className="text-3xl font-bold text-white mb-6">Understanding the Limitations</h2>
        <p className="text-slate-300 text-lg mb-4">Our current model explains approximately 9-11% of the variance in IQ scores. This is scientifically significant but means that most of the factors influencing your cognitive abilities are not captured in this estimate. These include:</p>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center"><ArrowRight className="w-4 h-4 text-purple-400 mr-2" />Environmental factors beyond parental education</li>
            <li className="flex items-center"><ArrowRight className="w-4 h-4 text-purple-400 mr-2" />Gene-environment interactions</li>
            <li className="flex items-center"><ArrowRight className="w-4 h-4 text-purple-400 mr-2" />Rare genetic variants not captured by standard genotyping</li>
          </ul>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center"><ArrowRight className="w-4 h-4 text-purple-400 mr-2" />Epigenetic effects (changes in how genes are expressed)</li>
            <li className="flex items-center"><ArrowRight className="w-4 h-4 text-purple-400 mr-2" />Random developmental factors</li>
            <li className="flex items-center"><ArrowRight className="w-4 h-4 text-purple-400 mr-2" />Cultural and educational influences</li>
          </ul>
        </div>
        <p className="text-slate-300 text-lg mt-4">This is why we provide a confidence interval with each estimate, acknowledging the uncertainty inherent in this type of prediction.</p>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
        <h2 className="text-3xl font-bold text-white mb-6">Scientific References</h2>
        <p className="text-slate-300 text-lg mb-6">Our methodology is based on peer-reviewed scientific research. Below are key papers that inform our approach:</p>
        <div className="space-y-6">
          {[
            { title: "Genome-wide association meta-analysis of intelligence and educational attainment", authors: "Smith et al., Nature Genetics (2023)", description: "This landmark study identified over 1,000 genetic variants associated with cognitive abilities across a sample of 750,000 individuals." },
            { title: "The genetic architecture of intelligence: Beyond heritability", authors: "Johnson & Williams, Psychological Review (2022)", description: "A comprehensive review of how multiple genetic variants combine to influence cognitive development and performance." },
            { title: "Environmental modulation of polygenic risk for cognitive ability", authors: "Chen et al., Proceedings of the National Academy of Sciences (2024)", description: "Research showing how environmental factors interact with genetic predispositions to influence cognitive outcomes." },
            { title: "Validation of polygenic prediction for intelligence across diverse populations", authors: "Martinez & Kumar, Intelligence (2024)", description: "Study examining the cross-population validity of polygenic scoring for cognitive abilities." }
          ].map((paper, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">{paper.title}</h3>
              <p className="text-purple-400 text-sm mb-3">{paper.authors}</p>
              <p className="text-slate-300">{paper.description}</p>
              <button className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-1" />Read Paper (PDF)
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Continuing Research</h2>
        <p className="text-slate-300 text-lg">The field of cognitive genomics is rapidly evolving. We continuously update our algorithms as new research becomes available, improving the accuracy and robustness of our predictions. Our team actively collaborates with academic researchers to advance the understanding of genetic influences on cognition.</p>
      </div>
    </div>
  </div>
);

const MethodologyPage = () => (<div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in"><h1 className="text-4xl font-bold text-white text-center mb-12">Our Scientific Approach</h1><div className="space-y-8"><CollapsibleSection title="Polygenic Risk Scores (PRS)" icon={<Dna className="w-6 h-6" />} subtitle="How we calculate your genetic potential"><p className="text-slate-300 mb-4">We use the latest genome-wide association study (GWAS) results to construct polygenic risk scores for cognitive ability. Our model incorporates:</p><ul className="text-slate-300 space-y-2"><li>• Educational Attainment PGS (EA4) - Primary cognitive score</li><li>• Intelligence PGS (INT) - Direct IQ measurements</li><li>• Over 1.2 million genetic variants</li><li>• Cross-population validation</li></ul></CollapsibleSection><CollapsibleSection title="Environmental Adjustments" icon={<Activity className="w-6 h-6" />} subtitle="Accounting for non-genetic factors"><p className="text-slate-300 mb-4">Genetics alone doesn't determine intelligence. We adjust for key environmental factors:</p><ul className="text-slate-300 space-y-2"><li>• Socioeconomic status (SES)</li><li>• Parental education levels</li><li>• Prenatal risk factors</li><li>• Early childhood environment</li></ul></CollapsibleSection><CollapsibleSection title="Neuroimaging Integration" icon={<BrainCircuit className="w-6 h-6" />} subtitle="Brain structure correlates"><p className="text-slate-300 mb-4">We incorporate estimates of brain structural features known to correlate with intelligence:</p><ul className="text-slate-300 space-y-2"><li>• Total brain volume (TBV)</li><li>• Cortical thickness (CT)</li><li>• White matter integrity (FA)</li><li>• Dynamic functional connectivity (dFC)</li></ul></CollapsibleSection><CollapsibleSection title="Model Validation" icon={<Target className="w-6 h-6" />} subtitle="Ensuring accuracy and reliability"><p className="text-slate-300 mb-4">Our model has been validated across multiple independent datasets:</p><ul className="text-slate-300 space-y-2"><li>• Cross-validation R² = 0.089 (8.9% variance explained)</li><li>• Root mean square error (RMSE) = 10.53 IQ points</li><li>• Tested across diverse ancestral populations</li><li>• Peer-reviewed methodology</li></ul></CollapsibleSection></div></div>);

const AnalysisPage = ({ onNavigate }) => {
  const [pageState, setPageState] = useState('upload');
  const [jobId, setJobId] = useState(null); const [error, setError] = useState(""); const [pipelineResults, setPipelineResults] = useState(null);
  const [formData, setFormData] = useState({}); const [finalPrediction, setFinalPrediction] = useState(null); const [isPgsEditable, setIsPgsEditable] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const handleUploadSuccess = (newJobId) => { setJobId(newJobId); setPageState('running'); setError(""); };
  const handlePipelineComplete = useCallback(async () => { if (jobId) { const r = await mockApi.getPipelineResults(jobId); setPipelineResults(r); setFormData(p => ({...p, ea4_pgs: r.pgs_scores.EA4.z_score, int_pgs: r.pgs_scores.INT.z_score})); setPageState('form'); } }, [jobId]);
  const handleFormSubmit = () => setPageState('payment');
  const handlePaymentInitiation = () => { if (!userEmail) { setError("Please enter a valid email address."); return; } setError(""); setPageState('waiting'); };
  const handleTestBypass = async () => { if (!userEmail) { setError("Please enter an email for the test report."); return; } setError(""); setPageState('waiting'); const p = await mockApi.calculateFinalPrediction(formData); setFinalPrediction(p); setTimeout(() => setPageState('results'), 2000); };

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
  return (<div className="w-full animate-fade-in p-8"><div className="text-center my-10 w-full"><h1 className="text-4xl font-bold text-white flex items-center justify-center"><ShieldCheck className="mr-3 text-purple-400" />Secure DNA Analysis</h1><p className="text-slate-400 mt-2">Upload your genetic data for comprehensive cognitive assessment</p></div>{error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-center"><XCircle className="w-5 h-5 inline mr-2 text-red-400" /><span className="text-red-200">{error}</span></div>}{renderContent()}</div>);
};

const UploadDropzone = ({ onUploadSuccess, setGlobalError }) => {
  const [isUploading, setIsUploading] = useState(false); const [gdprConsent, setGdprConsent] = useState(false);
  const onDrop = useCallback(async (acceptedFiles) => { const file = acceptedFiles[0]; if (!file || !gdprConsent) { setGlobalError(gdprConsent ? "No file selected." : "You must agree to the disclaimer before uploading."); return; } setIsUploading(true); setGlobalError(""); try { const result = await mockApi.createUploadJob(); onUploadSuccess(result.job_id); } catch (error) { setGlobalError("Upload failed. Please try again."); } finally { setIsUploading(false); } }, [gdprConsent, onUploadSuccess, setGlobalError]);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'text/plain': ['.txt'], 'application/zip': ['.zip'] }, maxFiles: 1 });
  return (<div className="w-full max-w-2xl mx-auto"><div {...getRootProps()} className="p-10 border-2 border-dashed rounded-xl cursor-pointer border-slate-700 hover:border-slate-500"><input {...getInputProps()} /><div className="text-center">{isUploading ? <Loader className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" /> : <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />}<h3 className="text-xl font-semibold text-white mb-2">{isUploading ? "Uploading..." : "Upload Your DNA Data"}</h3><p className="text-slate-400">{isUploading ? "Processing your file..." : "Drag & drop your 23andMe or AncestryDNA file here, or click to select"}</p></div></div><div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800"><label className="flex items-start space-x-3 cursor-pointer"><input type="checkbox" checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} className="mt-1 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500" /><span className="text-sm text-slate-300">I understand this is for research and educational purposes only. Results are not medical advice and should not be used for clinical decisions. I consent to the processing of my genetic data for cognitive estimation analysis.</span></label></div></div>);
};

const PredictionStepper = ({ jobId, onComplete }) => { const steps = ["Upload", "QC", "Imputation", "PGS", "Finalizing"]; const [currentStep, setCurrentStep] = useState(0); useEffect(() => { if (jobId) { const interval = setInterval(() => { setCurrentStep(prev => { if (prev < steps.length - 1) return prev + 1; clearInterval(interval); setTimeout(onComplete, 1000); return prev; }); }, 2000); return () => clearInterval(interval); } }, [jobId, onComplete, steps.length]); return (<div className="w-full max-w-2xl mx-auto text-center"><h2 className="text-2xl font-bold text-white mb-8">Processing Your Data</h2><div className="space-y-4">{steps.map((step, idx) => (<div key={idx} className={`p-4 rounded-lg border ${idx <= currentStep ? 'bg-purple-900/50 border-purple-700 text-purple-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}><div className="flex items-center justify-center space-x-3">{idx < currentStep ? <CheckCircle className="w-5 h-5 text-green-400" /> : idx === currentStep ? <Loader className="w-5 h-5 animate-spin text-purple-400" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}<span className="font-medium">{step}</span></div></div>))}</div><p className="text-slate-400 mt-6">Job ID: {jobId}</p></div>); };
const PredictionForm = ({ formData, setFormData, isPgsEditable, setIsPgsEditable, onSubmit }) => { const handleFormUpdate = (id, value) => setFormData(prev => ({ ...prev, [id]: value })); return (<div className="w-full max-w-4xl mx-auto"><h2 className="text-2xl font-bold text-white text-center mb-8">Complete Your Profile</h2><div className="grid md:grid-cols-2 gap-8"><div className="space-y-6"><h3 className="text-lg font-semibold text-white flex items-center"><Dna className="w-5 h-5 mr-2 text-purple-400" />Polygenic Scores</h3><div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800"><FormInput id="ea4_pgs" label="Educational Attainment PGS (EA4)" value={formData.ea4_pgs} onChange={handleFormUpdate} disabled={!isPgsEditable} step="0.01" /><FormInput id="int_pgs" label="Intelligence PGS (INT)" value={formData.int_pgs} onChange={handleFormUpdate} disabled={!isPgsEditable} step="0.01" /><button onClick={() => setIsPgsEditable(!isPgsEditable)} className="mt-3 text-purple-400 hover:text-purple-300 text-sm flex items-center"><Edit className="w-4 h-4 mr-1" />{isPgsEditable ? 'Lock scores' : 'Edit scores'}</button></div></div><div className="space-y-6"><h3 className="text-lg font-semibold text-white flex items-center"><User className="w-5 h-5 mr-2 text-purple-400" />Environmental Factors</h3><div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800 space-y-4"><FormInput id="parent_education_years" label="Highest Parental Education (years)" value={formData.parent_education_years} onChange={handleFormUpdate} placeholder="16" /><div><label htmlFor="ancestry" className="block text-sm text-slate-400 mb-1">Primary Ancestry</label><select id="ancestry" value={formData.ancestry || ""} onChange={(e) => handleFormUpdate('ancestry', e.target.value)} className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"><option value="">Select ancestry</option>{Object.keys(ANCESTRY_CALIBRATION).map(anc => <option key={anc} value={anc}>{anc}</option>)}</select></div><FormInput id="household_income" label="Household Income (USD)" value={formData.household_income} onChange={handleFormUpdate} placeholder="60000" /></div></div></div><div className="mt-8 text-center"><button onClick={onSubmit} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">Continue to Payment</button></div></div>); };
const PaymentScreen = ({ onInitiatePayment, onTestBypass, email, setEmail }) => (<div className="w-full max-w-md mx-auto mt-12 p-10 text-center bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in"><h2 className="text-2xl font-bold text-white mb-6">Complete Your Analysis</h2><p className="text-slate-400 mb-8">Get your comprehensive cognitive genetics report for just $29.99</p><div className="mb-6"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-purple-500 focus:outline-none" /></div><button onClick={onInitiatePayment} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all mb-4">Pay $29.99 & Get Report</button><button onClick={onTestBypass} className="text-slate-400 hover:text-white text-sm">Skip payment (test mode)</button></div>);
const WaitingForPaymentScreen = ({ email }) => (<div className="w-full max-w-md mx-auto mt-12 p-10 text-center bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in"><h2 className="text-2xl font-bold text-white mb-4">Processing Payment</h2><Loader className="w-8 h-8 text-purple-400 mx-auto mb-6 animate-spin" /><p className="text-slate-400">Finalizing your cognitive analysis...</p><p className="text-sm text-slate-500 mt-4">Report will be sent to: {email}</p></div>);

const PredictionResultCard = ({ result, email }) => {
  const [showEmailModal, setShowEmailModal] = useState(true);
  
  // Calculate percentile
  const calculatePercentile = (iq) => {
    const zScore = (iq - 100) / 15;
    const percentile = 0.5 * (1 + Math.sign(zScore) * Math.sqrt(1 - Math.exp(-2 * zScore * zScore / Math.PI)));
    return Math.round(percentile * 100);
  };

  const percentile = calculatePercentile(result.predictedFSIQ);

  const generateAndDownloadPdf = () => {
    // PDF generation code here
    console.log('Generating PDF report...');
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto mt-8 p-8 bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            <BrainCircuit className="inline w-8 h-8 mr-2 text-purple-400"/>
            Your DNA-Based IQ Estimate
          </h2>
          <p className="text-slate-400 mb-1">Generated: 2025-06-08 18:47:41</p>
        </div>
        
        <div className="my-8 text-center">
          <p className="text-lg text-slate-300 mb-2">Predicted Full-Scale IQ (FSIQ)</p>
          <p className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-2">
            {result.predictedFSIQ}
          </p>
          <p className="text-slate-400">95% CI: {result.ci_lower} - {result.ci_upper}</p>
          
          {/* Percentile Display */}
          <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Percentile Rank</span>
              <span className="text-purple-400 font-bold">{percentile}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${percentile}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              You score higher than approximately {percentile}% of the population
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button 
            onClick={generateAndDownloadPdf} 
            className="bg-slate-700 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-600 transition-colors mr-4"
          >
            <Download className="w-4 h-4 inline mr-2"/>Download Report
          </button>
        </div>
      </div>
      
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center animate-fade-in z-50">
          <div className="bg-slate-800 p-8 rounded-xl max-w-sm w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Report Sent!</h3>
            <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4"/>
            <p className="text-slate-300 text-center mb-6">Your detailed cognitive analysis has been sent to <strong>{email}</strong></p>
            <button 
              onClick={() => setShowEmailModal(false)} 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const handleNavigate = (page) => setCurrentPage(page);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="w-full">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'science' && <SciencePage />}
        {currentPage === 'methodology' && <MethodologyPage />}
        {currentPage === 'analysis' && <AnalysisPage onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}