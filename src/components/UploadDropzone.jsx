import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader } from 'lucide-react';
import { createUploadJob } from '../../services/api';

const UploadDropzone = ({ onUploadSuccess, setError }) => {
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file || !consent) {
      setError(consent ? 'No file selected.' : 'Please accept the disclaimers.');
      return;
    }
    setBusy(true);
    try {
      const { job_id } = await createUploadJob();
      onUploadSuccess(job_id);
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }, [consent, onUploadSuccess, setError]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1 });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className="p-10 border-2 border-dashed rounded-xl cursor-pointer border-slate-700 hover:border-slate-500"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {busy ? (
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
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="text-sm text-slate-400">
          I have read and agree to the <strong className="text-white">Important Disclaimers</strong>.
        </span>
      </label>
    </div>
  );
};

export default UploadDropzone;