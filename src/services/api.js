import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
});

export const createUploadJob = async () => {
  const res = await api.post('/upload');
  return res.data; // { job_id, url, fields } for S3 POST
};

export const getJobStatus = async (jobId) => {
  const res = await api.get(`/status/${jobId}`);
  return res.data; // { status: "RUNNING" | "DONE", ... }
};

export const calculatePrediction = async (jobId, payload) => {
  const res = await api.post('/predict', { job_id: jobId, ...payload });
  return res.data; // { predictedFSIQ, ci_lower, ci_upper }
};

export default api;
