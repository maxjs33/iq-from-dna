// Mock API functions - replace with real endpoints later
export const createUploadJob = async () => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ 
      job_id: `job_${Date.now()}`,
      upload_url: 'https://mock-s3-bucket.com/upload',
      fields: {} 
    }), 500);
  });
};

export const getJobStatus = async (jobId) => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ 
      status: 'COMPLETED',
      progress: 100,
      snp_count: Math.floor(Math.random() * 50000) + 450000,
      pgs_scores: {
        EA4: { z_score: (Math.random() - 0.5) * 2 },
        INT: { z_score: (Math.random() - 0.5) * 2 }
      }
    }), 1000);
  });
};

export const calculatePrediction = async (formData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const baseScore = 100 + (Math.random() - 0.5) * 30;
      const margin = 8 + Math.random() * 4;
      resolve({
        predictedFSIQ: Math.round(baseScore),
        ci_lower: Math.round(baseScore - margin),
        ci_upper: Math.round(baseScore + margin),
        percentile: Math.round(((baseScore - 100) / 15) * 34 + 50)
      });
    }, 1500);
  });
};