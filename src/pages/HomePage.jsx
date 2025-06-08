import React from 'react';
import FAQItem from '../components/UI/FAQItem.jsx';

const HomePage = ({ onNavigate }) => (
  <div className="w-full animate-fade-in">
    <section className="text-center py-20 px-4">
      <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">Estimate Your IQ From DNA</h1>
      <p className="text-lg md:text-xl text-slate-300 mt-4 max-w-3xl mx-auto">Upload raw data from 23andMe or AncestryDNA to receive a scientifically-grounded cognitive analysis based on the latest research.</p>
      <button 
        onClick={() => onNavigate('analysis')} 
        className="mt-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform"
      >
        Start My DNA Analysis
      </button>
    </section>
    
    <section className="py-20 bg-slate-900/50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-4">Which DNA Kit Do I Need?</h2>
        <p className="text-center text-slate-400 mb-12">You don't need the most expensive kits. The standard ancestry services provide everything we need.</p>
        <div className="grid md:grid-cols-2 gap-8 text-left bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">23andMe</h3>
            <p className="text-green-400 font-semibold mb-4">"Ancestry + Traits Service" is sufficient.</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">AncestryDNA</h3>
            <p className="text-green-400 font-semibold mb-4">The standard "AncestryDNA" kit is sufficient.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
          <FAQItem q="What will my results look like?">
            <p>Your report lists a single predicted Full-Scale IQ (FSIQ), a 95 percent confidence interval, and a percentile rank. The point estimate represents the model's best guess given your genetic and environmental inputs.</p>
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
    
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Important Disclaimers</h2>
        <div className="space-y-4 text-slate-400 text-sm">
          <p><strong className="text-amber-400">For Informational & Educational Use Only.</strong> This service is not a diagnostic tool and does not provide medical advice. Results are statistical estimations based on current scientific research and are not a definitive measure of intelligence.</p>
          <p><strong className="text-amber-400">Not a Substitute for Professional Advice.</strong> Consult with qualified professionals for any health or life-decisions.</p>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
