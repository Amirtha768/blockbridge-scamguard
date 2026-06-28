# Design Document: Vercel Monorepo Deployment Fix

## Overview

This design addresses the Vercel deployment failure in a monorepo project by configuring `vercel.json` to point to the correct frontend directory. The core issue is that Vercel's default behavior assumes a single-project repository structure with `package.json` in the root. Our monorepo has separate `frontend/` and `backend/` directories, each with its own `package.json`.

The solution involves adding a `rootDirectory` property to `vercel.json` that tells Vercel to treat the `frontend/` directory as the project root for all build operations.

## Architecture

### Current State
```
project-root/
├── vercel.json          (missing rootDirectory config)
├── frontend/
│   ├── package.json     (actual location)
│   ├── vite.config.js
│   └── dist/            (build output)
└── backend/
    └── package.json
```

Vercel currently looks for `package.json` at `project-root/package.json`, which doesn't exist, causing the ENOENT error.

### Desired State
```
project-root/
├── vercel.json          (configured with rootDirectory: "frontend")
├── frontend/            <-- Vercel treats this as root
│   ├── package.json     ✓ Found
│   ├── vite.config.js
│   └── dist/            ✓ Deployed
└── backend/
    └── package.json
```

With `rootDirectory: "frontend"`, Vercel changes its working directory to `frontend/` before executing any commands, allowing it to find `package.json` and execute build commands correctly.

## Components and Interfaces

### vercel.json Configuration Schema

The configuration file uses Vercel's JSON schema with the following key properties:

```json
{
  "version": 2,                    // Vercel configuration version
  "rootDirectory": "frontend",     // NEW: Tells Vercel where the app lives
  "buildCommand": "npm run build", // Command to build the app
  "outputDirectory": "dist",       // Where built files are located
  "installCommand": "npm install", // Command to install dependencies
  "framework": "vite",             // Framework detection
  "rewrites": []                   // API proxy rules
}
```

### Key Properties

**rootDirectory**: 
- Type: String
- Value: "frontend"
- Effect: Changes Vercel's working directory before executing any commands
- This is the critical property that fixes the monorepo issue

**buildCommand**:
- Type: String
- Value: "npm run build"
- Executes from the rootDirectory context
- Runs the Vite build script defined in frontend/package.json

**outputDirectory**:
- Type: String
- Value: "dist"
- Relative to rootDirectory (resolves to frontend/dist)
- Contains the compiled Vite application

**installCommand**:
- Type: String  
- Value: "npm install"
- Executes from the rootDirectory context
- Installs dependencies from frontend/package.json

**framework**:
- Type: String
- Value: "vite"
- Enables Vite-specific optimizations
- Maintained from current configuration

**rewrites**:
- Type: Array of rewrite rules
- Proxies /api/* requests to backend service
- Maintained from current configuration

## Data Models

### Vercel Configuration Object

```typescript
interface VercelConfig {
  version: 2;
  rootDirectory?: string;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  framework?: string;
  rewrites?: RewriteRule[];
}

interface RewriteRule {
  source: string;
  destination: string;
}
```

### Current Configuration
```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://blockbridge-scamguard.onrender.com/api/:path*"
    }
  ]
}
```

### Target Configuration
```json
{
  "version": 2,
  "rootDirectory": "frontend",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://blockbridge-scamguard.onrender.com/api/:path*"
    }
  ]
}
```

**Changes**:
1. Add `rootDirectory: "frontend"`
2. Simplify `buildCommand` from "npm install && npm run build" to "npm run build" (Vercel handles install separately via installCommand)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

