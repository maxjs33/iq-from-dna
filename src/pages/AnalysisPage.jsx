import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import UploadDropzone from '../components/UploadDropzone.jsx';

const AnalysisPage = ({ onNavigate }) => {
  const [error, setError] = useState("");

  return (
    <div className="w-full animate-fade-in p-8">
      <div className="text-center my-10 w-full">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 mr-3 text-purple-400" />
          Your Cognitive Analysis
        </h1>
        <p className="text-slate-400 mt-2">Combine your genetic data with key life factors for the most accurate report.</p>
      </div>
      {error && (
        <div className="w-full max-w-2xl mx-auto mb-4 p-4 bg-red-900/30 border-red-500/50 text-red-300 rounded-lg flex items-center">
          <span>{error}</span>
        </div>
      )}
      <UploadDropzone onUploadSuccess={() => {}} setGlobalError={setError} />
    </div>
  );
};

export default AnalysisPage;
