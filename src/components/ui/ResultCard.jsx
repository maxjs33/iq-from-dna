import React, { useState } from 'react';
import { BrainCircuit, CheckCircle, Download, Mail } from 'lucide-react';

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
      doc.text('Predicted Full‑Scale IQ (FSIQ)', 20, 60);
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
            <BrainCircuit className="inline w-8 h-8 mr-2 text-purple-400" /> Your DNA‑Based IQ Estimate
          </h2>
          <p className="flex items-center justify-center mt-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" /> Analysis complete!
          </p>
        </div>
        <div className="my-8 text-center">
          <p className="text-lg text-slate-300">Predicted Full‑Scale IQ (FSIQ)</p>
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

export default ResultCard;