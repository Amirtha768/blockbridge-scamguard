// Backend API URL
// In production: set VITE_API_URL in Vercel environment variables
// In local dev: Vite's proxy handles /api → localhost:5000
const API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^"|"$/g, '').trim()
  : '';

export default API;
