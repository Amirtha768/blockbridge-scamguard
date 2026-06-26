// In production (Netlify), use a relative /api path so requests go through
// the Netlify proxy defined in public/_redirects → no CORS, no env var needed.
// In local dev, Vite's proxy also handles /api → localhost:5000.
const API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^"|"$/g, '').trim()
  : '';

export default API;
