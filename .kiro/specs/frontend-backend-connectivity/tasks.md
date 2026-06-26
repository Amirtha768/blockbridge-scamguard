# Implementation Plan: Frontend-Backend Connectivity

## Overview

Three focused code changes restore the connection between the React frontend and the Node.js backend: fix the config module fallback port, fix the Auth page to use that config, and add a `netlify.toml` rewrite rule for production.

## Tasks

- [x] 1. Fix `frontend/src/config.js` — correct the fallback port
  - Change the hardcoded fallback from `localhost:5001` to `localhost:5000` to match the backend's default `PORT`
  - Confirm the existing `.replace(/^"|"$/g, '').trim()` sanitisation is present
  - _Requirements: 1.3, 1.4_

  - [ ]* 1.1 Write property tests for config module URL sanitisation
    - Use `fast-check` with Vitest to generate strings: valid URLs with no quotes, with leading `"`, with trailing `"`, with both, with single quotes, empty string, `undefined`
    - Assert output never has leading/trailing quote characters and is a valid URL or the fallback
    - Include the edge case: `VITE_API_URL` absent → returns `http://localhost:5000`
    - **Property 1: Config module never returns a URL with embedded quotes**
    - **Property 3: Fallback URL is used when env var is absent**
    - **Validates: Requirements 1.3, 1.4**

- [x] 2. Fix `frontend/src/pages/Auth.jsx` — use config module for fetch URL
  - Add `import API from '../config.js';` at the top of the file
  - Replace the broken fetch URL `` `"http://localhost:5001"${endpoint}` `` with `` `${API}${endpoint}` ``
  - No other changes to the file
  - _Requirements: 1.1, 1.2_

  - [ ]* 2.1 Write property tests for Auth page fetch URL construction
    - Mock `config.js` to return various base URL strings (with/without trailing slash, with/without quotes)
    - Mock `fetch` and capture the URL argument
    - Assert the captured URL starts with `http://` or `https://`, contains no literal quote characters, and ends with the expected endpoint path
    - Include edge cases: successful 2xx stores token + navigates; non-2xx displays `data.message`; fetch throws → displays generic error string
    - **Property 2: Fetch URL is always a valid HTTP(S) URL**
    - **Property 4: Successful login stores token and navigates**
    - **Property 5: Non-2xx backend response shows error message**
    - **Property 6: Network failure shows generic error message**
    - **Validates: Requirements 1.1, 1.2, 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 3. Checkpoint — ensure all tests pass
  - Run `npm run test --run` (or `npx vitest --run`) inside `frontend/`
  - Ensure all existing and new tests pass before proceeding

- [x] 4. Add `netlify.toml` at the project root
  - Create the file with a `[build]` section pointing to `frontend/` and a `[[redirects]]` block:
    - `from = "/api/*"`
    - `to = "https://your-render-app.onrender.com/api/:splat"` (replace with actual backend URL)
    - `status = 200`
    - `force = true`
  - The `to` URL should match the value in `frontend/.env.example`
  - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 4.1 Write an example test that validates `netlify.toml` structure
    - Read and parse the `netlify.toml` file in the test
    - Assert a `[[redirects]]` entry exists with `from = "/api/*"`, `status = 200`, and `force = true`
    - Assert the `to` field starts with `https://`
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 5. Update `frontend/.env.example`
  - Add a descriptive comment above `VITE_API_URL` explaining its purpose, that it is unused locally (Vite proxy handles it), and that it should be set in the Netlify dashboard for production
  - _Requirements: 3.1, 3.2_

- [ ] 6. Final checkpoint — verify end-to-end wiring
  - Ensure all tests pass, ask the user if questions arise.
  - Confirm `netlify.toml` `to` URL is updated with the real backend URL before deploying

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster fix
- The Vite proxy in `vite.config.js` already handles local development correctly — no changes needed there
- The single most impactful fix is Task 2 (the broken fetch URL in `Auth.jsx`); Tasks 1 and 4 are needed for correctness in all environments
- Property tests use [fast-check](https://fast-check.dev/) and [Vitest](https://vitest.dev/), both compatible with the existing Vite setup
