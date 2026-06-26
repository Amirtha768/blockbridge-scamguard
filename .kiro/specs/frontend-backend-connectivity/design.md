# Design Document: Frontend-Backend Connectivity

## Overview

The fix has three parts that together restore communication between the React frontend and the Node.js backend in both local development and the Netlify production environment:

1. **Fix `Auth.jsx`** — replace the broken hardcoded URL string with an import of the `config.js` API base URL.
2. **Fix `config.js`** — correct the fallback port (5001 → 5000 to match the backend) and ensure quote-stripping is reliable.
3. **Add `netlify.toml`** — declare a rewrite rule so Netlify forwards `/api/*` traffic to the hosted backend instead of returning 404 from its CDN.

## Architecture

```
Browser
  │
  ├─ (local dev)  Vite dev server (port 5173)
  │                  └─ proxy /api/* → localhost:5000
  │
  └─ (production) Netlify CDN
                     └─ netlify.toml rewrite /api/* → BACKEND_URL
                                                           │
                                               Node.js / Express (Render / etc.)
                                                  ├─ /api/auth/*
                                                  ├─ /api/payment/*
                                                  └─ /api/health
```

In local development the Vite proxy (`vite.config.js`) already forwards `/api` to `localhost:5000`, so no backend URL is embedded in the browser bundle at all — that path continues to work as-is.

In production, Netlify serves the static bundle. The rewrite rule in `netlify.toml` forwards matching requests server-side to the `BACKEND_URL` environment variable (set in the Netlify dashboard), keeping the backend URL out of the public bundle.

## Components and Interfaces

### `frontend/src/config.js` (updated)

Exports a single string: the resolved, sanitised API base URL.

```js
// Strip surrounding quotes that can appear when the env var is set with
// explicit quotes in some CI/CD environments (e.g. VITE_API_URL="https://…")
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/^"|"$/g, '')
  .trim();

export default API;
```

Changes from current:
- Default fallback changes from `localhost:5001` → `localhost:5000` (matches backend `PORT` default).

### `frontend/src/pages/Auth.jsx` (updated)

Adds one import and changes one line in `handleSubmit`.

```js
// Add at top of file:
import API from '../config.js';

// Replace broken line inside handleSubmit:
// BEFORE (broken):
const res = await fetch(`"http://localhost:5001"${endpoint}`, { … });

// AFTER (fixed):
const res = await fetch(`${API}${endpoint}`, { … });
```

Nothing else in `Auth.jsx` changes.

### `netlify.toml` (new file, project root)

```toml
[build]
  base    = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from   = "/api/*"
  to     = "https://your-render-app.onrender.com/api/:splat"
  status = 200
  force  = true
```

- `status = 200` makes Netlify perform a transparent server-side proxy rather than a client-side redirect, so the browser never sees a cross-origin request.
- `force = true` ensures the rule applies even when a matching static file exists.
- The `to` URL should be replaced with the actual backend URL (or parameterised via a Netlify environment variable using the Netlify `BACKEND_URL` env var — see Data Models).

### `frontend/.env.example` (updated)

```dotenv
# URL of the deployed backend API server.
# For local development this is unused — the Vite proxy handles /api/* calls.
# For production (Netlify) set this in the Netlify dashboard under Site > Environment Variables.
VITE_API_URL=https://your-render-app.onrender.com
```

## Data Models

No new data models are introduced. The relevant configuration surface is:

| Variable | Where set | Used by | Purpose |
|---|---|---|---|
| `VITE_API_URL` | `frontend/.env` or Netlify env vars | `config.js` → `Auth.jsx` | Backend base URL baked into the Vite bundle at build time |
| `PORT` | `backend/.env` | `backend/index.js` | Port the Express server listens on (default `5000`) |
| `JWT_SECRET` | `backend/.env` | `authRoutes.js` | JWT signing secret (existing, unchanged) |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

Property 1: Config module never returns a URL with embedded quotes
*For any* value of `VITE_API_URL` (including values wrapped in single or double quotes), the string returned by `config.js` should contain no leading or trailing quote characters.
**Validates: Requirements 1.3**

---

Property 2: Fetch URL is always a valid HTTP(S) URL
*For any* value of `VITE_API_URL` and any valid API endpoint path, the URL passed to `fetch()` in `Auth.jsx` should start with `http://` or `https://` and contain no literal quote characters.
**Validates: Requirements 1.1, 1.2**

---

Property 3: Fallback URL is used when env var is absent
*For any* environment where `VITE_API_URL` is `undefined` or empty string, the Config_Module should return `http://localhost:5000` (not `localhost:5001` and not a URL with embedded quotes).
**Validates: Requirements 1.4**

---

Property 4: Successful login stores token and navigates
*For any* valid credential pair, when the backend returns a 200 response with a `token` field, `localStorage.bb_token` should equal that token value and `window.location.hash` should equal `#/dashboard`.
**Validates: Requirements 4.1, 4.5**

---

Property 5: Non-2xx backend response shows error message
*For any* non-2xx HTTP status from the backend, the `serverError` state in Auth_Page should be set to the `message` field from the response body (and never to the generic "Unable to connect" string).
**Validates: Requirements 4.3**

---

Property 6: Network failure shows generic error message
*For any* network-level failure (fetch throws), the `serverError` state should be exactly `"Unable to connect to server. Please try again later."`.
**Validates: Requirements 4.4**

## Error Handling

| Scenario | Current behaviour | Fixed behaviour |
|---|---|---|
| Malformed fetch URL | `fetch('"http://localhost:5001"/api/auth/login')` → 404 or TypeError | `fetch('https://backend.example.com/api/auth/login')` succeeds |
| Backend unreachable | `catch` block sets generic error ✓ | Same — no change needed |
| Backend returns 4xx/5xx | `data.message` displayed ✓ | Same — no change needed |
| No `VITE_API_URL` in Netlify env | Silent wrong URL | Documented; Netlify rewrite makes the `/api` path work regardless |

The `try/catch` in `handleSubmit` already handles network-level failures correctly — it just never fires because the URL is malformed before the request is even sent.

## Testing Strategy

### Unit tests

- Test `config.js` with various `VITE_API_URL` inputs: bare URL, URL with surrounding double quotes, URL with single quotes, empty string, `undefined`. Assert the returned string in each case.
- Test `Auth.jsx` `handleSubmit` by mocking `fetch`: verify the URL passed to `fetch` starts with a valid base URL, not the literal string `"http://localhost:5001"`.

### Property-based tests

- **Property 1 & 3**: Use a generator that produces strings with random combinations of leading/trailing quote characters wrapping a valid URL. Assert the output of the sanitiser never contains leading/trailing quotes and is always a valid URL.
- **Property 2**: Use a generator that produces random `VITE_API_URL` values (valid URLs, URLs with embedded quotes, empty strings). For each, assert the concatenated fetch URL is a valid URL string parseable by `new URL(…)`.
- **Properties 4–6**: Use a mock `fetch` generator that returns varying status codes and body shapes. Assert the resulting `serverError` state and `localStorage` values match the expected outcomes.

**Tooling**: Use [fast-check](https://fast-check.dev/) (already compatible with Vite/Vitest) for property-based tests, Vitest for unit tests.

Each property test should run a minimum of 100 iterations.

Tag format per test: `Feature: frontend-backend-connectivity, Property N: <property text>`
