# Requirements Document

## Introduction

This specification addresses the Vercel deployment configuration issue for a monorepo project structure. The project contains separate `frontend/` and `backend/` directories, each with its own `package.json`. Currently, Vercel deployment fails because it searches for `package.json` in the root directory instead of the `frontend/` directory. This document defines the requirements for configuring Vercel to properly deploy the frontend React/Vite application from the monorepo structure.

## Glossary

- **Vercel**: Cloud platform for static sites and serverless functions
- **Monorepo**: Repository structure containing multiple related projects in separate directories
- **Root_Directory**: The top-level directory of the repository
- **Frontend_Directory**: The `frontend/` subdirectory containing the React/Vite application
- **Build_Configuration**: Settings in vercel.json that control how Vercel builds and deploys the application
- **Vercel_Config**: The vercel.json file in the root directory
- **Build_Command**: The command Vercel executes to build the application
- **Output_Directory**: The directory containing the built application files that Vercel will deploy
- **Install_Command**: The command Vercel executes to install dependencies

## Requirements

### Requirement 1: Configure Root Directory

**User Story:** As a developer, I want Vercel to use the frontend directory as the root for builds, so that it can locate the package.json and build the application correctly.

#### Acceptance Criteria

1. WHEN Vercel executes a deployment THEN THE Vercel_Config SHALL specify the Frontend_Directory as the root directory for builds
2. WHEN Vercel searches for package.json THEN THE System SHALL locate it in the Frontend_Directory
3. THE Vercel_Config SHALL set the rootDirectory property to "frontend"

### Requirement 2: Configure Build Commands

**User Story:** As a developer, I want Vercel to execute the correct build commands from the frontend directory, so that the Vite application builds successfully.

#### Acceptance Criteria

1. WHEN Vercel installs dependencies THEN THE System SHALL execute "npm install" in the Frontend_Directory
2. WHEN Vercel builds the application THEN THE System SHALL execute "npm run build" in the Frontend_Directory
3. THE Vercel_Config SHALL specify the buildCommand as "npm run build"
4. THE Vercel_Config SHALL specify the installCommand as "npm install"

### Requirement 3: Configure Output Directory

**User Story:** As a developer, I want Vercel to deploy the correct build output, so that the compiled application is served properly.

#### Acceptance Criteria

1. WHEN the build completes THEN THE System SHALL use the Vite default output directory
2. THE Vercel_Config SHALL specify the outputDirectory as "dist"
3. WHEN Vercel deploys THEN THE System SHALL serve files from the Frontend_Directory/dist location

### Requirement 4: Preserve API Proxy Configuration

**User Story:** As a developer, I want API requests to be proxied to the backend service, so that the frontend can communicate with the backend API.

#### Acceptance Criteria

1. WHEN the frontend makes requests to /api/* THEN THE System SHALL proxy them to the backend service URL
2. THE Vercel_Config SHALL maintain the existing rewrites configuration
3. THE Vercel_Config SHALL preserve the destination URL "https://blockbridge-scamguard.onrender.com/api/:path*"

### Requirement 5: Maintain Framework Detection

**User Story:** As a developer, I want Vercel to recognize the Vite framework, so that it applies appropriate optimizations and defaults.

#### Acceptance Criteria

1. THE Vercel_Config SHALL specify "vite" as the framework
2. WHEN Vercel analyzes the project THEN THE System SHALL apply Vite-specific build optimizations

### Requirement 6: Deployment Success

**User Story:** As a developer, I want the Vercel deployment to complete without errors, so that the application is accessible to users.

#### Acceptance Criteria

1. WHEN Vercel executes a deployment THEN THE System SHALL complete without "ENOENT: no such file or directory" errors
2. WHEN the deployment completes THEN THE System SHALL report success status
3. WHEN users access the deployed URL THEN THE System SHALL serve the frontend application
