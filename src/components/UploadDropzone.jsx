import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader } from 'lucide-react';
import { mockApi } from '../utils/mockApi.jsx';

const UploadDropzone = ({ onUploadSuccess, setGlobalError }) => {
  const [isUploading, setIsUploading] = useState(false); 
  const [gdprConsent, setGdprConsent] = useState(false);
  
  const onDrop = useCallback(async (acceptedFiles) => { 
    const file = acceptedFiles[0]; 
    if (!file || !gdprConsent) { 
      setGlobalError(gdprConsent ? "No file selected." : "You must agree to the disclaimers to proceed."); 
      return; 
    } 
    setGlobalError(""); 
    setIsUploading(true); 
    try { 
      const { job_id } = await mockApi.createUploadJob(); 
      onUploadSuccess(job_id); 
    } catch (error) { 
      setGlobalError(error.message || "Upload failed."); 
    } finally { 
      setIsUploading(false); 
    } 
  }, [gdprConsent, onUploadSuccess, setGlobalError]);
  
  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: { 'text/plain': ['.txt'], 'application/zip': ['.zip'] }, 
    maxFiles: 1 
  });
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div {...getRootProps()} className="p-10 border-2 border-dashed rounded-xl cursor-pointer border-slate-700 hover:border-slate-500">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <Loader className="w-12 h-12 text-purple-400 animate-spin" />
          ) : (
            <UploadCloud className="w-12 h-12 text-slate-500" />
          )}
          <p className="mt-4">
            <span className="font-semibold text-purple-400">Click to upload</span> or drag & drop
          </p>
        </div>
      </div>
      <div className="flex items-start mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <input 
          id="gdpr" 
          type="checkbox" 
          checked={gdprConsent} 
          onChange={(e) => setGdprConsent(e.target.checked)} 
          className="h-5 w-5 mt-1 rounded border-slate-600 bg-slate-900 text-purple-500" 
        />
        <label htmlFor="gdpr" className="ml-3 text-sm text-slate-400">
          I have read and agree to the <strong className="text-white">Important Disclaimers</strong> and understand this is not medical advice.
        </label>
      </div>
    </div>
  );
};

export default UploadDropzone;
