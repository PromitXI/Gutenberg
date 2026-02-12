import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const generateDocument = async (formData, onProgress) => {
  const response = await axios.post(`${API_BASE}/api/generate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress?.({ step: 'uploading', percent });
    }
  });
  return response.data;
};

export const downloadDocument = (downloadUrl) => {
  window.open(`${API_BASE}${downloadUrl}`, '_blank');
};

export const healthCheck = async () => {
  const response = await axios.get(`${API_BASE}/api/health`);
  return response.data;
};
