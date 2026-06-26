# Requirements Document

## Introduction

The BlockBridge ScamGuard AI frontend cannot reach the backend API, causing the login page to show "Unable to connect to server." Three root causes are present:

1. `Auth.jsx` constructs the fetch URL by concatenating a string literal `"http://localhost:5001"` (with embedded quote characters) instead of using the centralised `config.js` API base URL, producing a malformed URL that results in a 404.
2. `Auth.jsx` does not import `config.js` at all, so the `VITE_API_URL` environment variable is never used at the login/register call-site.
3. No `netlify.toml` exists, so Netlify has no redirect rule to proxy `/api/*` requests to the hosted backend; all API calls return 404 from Netlify's CDN.

This spec covers fixing all three issues so the login and registration flows work correctly in both local development and the Netlify production deployment.

## Glossary

- **Auth_Page**: The React component at `frontend/src/pages/Auth.jsx` that handles login and registration.
- **Config_Module**: The module at `frontend/src/config.js` that exports the resolved API base URL from the `VITE_API_URL` environment variable.
- **API_Base_URL**: The fully-qualified base URL of the backend API server (e.g. `https://your-render-app.onrender.com`), stored in `VITE_API_URL`.
- **Netlify_Redirect**: A rewrite rule in `netlify.toml` that forwards matching frontend requests to the backend server URL.
- **Backend_Server**: The Node.js/Express server defined in `backend/index.js`, hosted on an external platform (e.g. Render) and exposing routes under `/api/`.
- **Health_Endpoint**: `GET /api/health` on the Backend_Server, used to verify the server is reachable.

## Requirements

### Requirement 1: Auth page uses the centralised API base URL

**User Story:** As a developer, I want the Auth page to read the backend URL from the central config module, so that the API base URL is configured in one place and not duplicated or hardcoded.

#### Acceptance Criteria

1. THE Auth_Page SHALL import the API_Base_URL from the Config_Module.
2. WHEN Auth_Page constructs a fetch request, THE Auth_Page SHALL prepend the API_Base_URL to the endpoint path.
3. THE Config_Module SHALL strip leading and trailing quote characters from the `VITE_API_URL` value before exporting it.
4. WHEN `VITE_API_URL` is not set, THE Config_Module SHALL fall back to `http://localhost:5000`.

### Requirement 2: Netlify deployment proxies API requests to the backend

**User Story:** As a user, I want the deployed Netlify app to forward API calls to the backend server, so that login and registration work on the live site without cross-origin or routing errors.

#### Acceptance Criteria

1. THE Netlify_Redirect SHALL rewrite all requests matching `/api/*` to the Backend_Server URL.
2. WHEN a request matches `/api/*`, THE Netlify_Redirect SHALL use HTTP status 200 so the Netlify CDN forwards the request transparently rather than performing a client-side redirect.
3. THE project root SHALL contain a `netlify.toml` file that declares the redirect rule described in criteria 2.1 and 2.2.
4. WHEN `VITE_API_URL` is not defined in the Netlify build environment, THE build SHALL fail with a clear error rather than silently deploying with a broken API URL.

### Requirement 3: Environment variable configuration is documented

**User Story:** As a developer, I want clear documentation of the required environment variables, so that I can configure the app correctly for both local development and production deployments.

#### Acceptance Criteria

1. THE `frontend/.env.example` file SHALL list every environment variable required by the frontend with a descriptive comment and placeholder value.
2. WHEN a developer follows the setup instructions, THE developer SHALL be able to run the frontend locally by copying `.env.example` to `.env` and setting `VITE_API_URL` to the backend URL.

### Requirement 4: Login and registration reach the backend successfully

**User Story:** As a user, I want the login and registration forms to communicate with the backend API, so that I can authenticate and access the dashboard.

#### Acceptance Criteria

1. WHEN a user submits valid login credentials, THE Auth_Page SHALL receive a 200 response containing a JWT token from the Backend_Server.
2. WHEN a user submits valid registration data, THE Auth_Page SHALL receive a 201 response containing a JWT token from the Backend_Server.
3. IF the Backend_Server returns a non-2xx status, THEN THE Auth_Page SHALL display the error message from the response body.
4. IF the network request fails entirely, THEN THE Auth_Page SHALL display "Unable to connect to server. Please try again later."
5. WHEN authentication succeeds, THE Auth_Page SHALL store the token in `localStorage` under the key `bb_token` and navigate to `#/dashboard`.
