import React, { useState } from 'react';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import SciencePage from './pages/SciencePage.jsx';
import MethodologyPage from './pages/MethodologyPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import './styles/animations.css';

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
