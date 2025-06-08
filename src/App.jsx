import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/pages/HomePage';
import AnalysisPage from './components/analysis/AnalysisPage';
import MethodologyPage from './components/pages/MethodologyPage';
import LegalPage from './components/pages/LegalPage';

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