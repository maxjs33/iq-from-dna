import React from 'react';
import { Dna, BrainCircuit } from 'lucide-react';

const MethodologyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
    <h1 className="text-4xl font-bold text-white text-center mb-12">Our Scientific Approach</h1>
    <div className="space-y-12 text-slate-300">
      <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <Dna className="w-6 h-6 mr-3 text-purple-400"/>Polygenic Scores (PGS)
        </h2>
        <p>Your DNA contains millions of genetic variants (SNPs). While most have a tiny effect on their own, their combined influence on complex traits like cognition can be significant. A Polygenic Score is a powerful statistical tool that aggregates these tiny effects into a single score. We calculate your PGS based on massive, peer-reviewed Genome-Wide Association Studies (GWAS) to estimate the genetic component of your cognitive profile.</p>
      </div>
      <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <BrainCircuit className="w-6 h-6 mr-3 text-sky-400"/>A Multimodal Model
        </h2>
        <p>Genetics is only part of the story. Decades of research show that environmental, developmental, and socioeconomic factors are also crucial. Our proprietary Core Multimodal Model integrates your genetic data (PGS) with these other key life factors. By analyzing how these different domains interact, we can create a more nuanced and accurate estimation than looking at genetics alone.</p>
      </div>
    </div>
  </div>
);

export default MethodologyPage;
