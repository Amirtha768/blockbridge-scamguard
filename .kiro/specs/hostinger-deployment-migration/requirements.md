# Requirements Document: Hostinger Premium Deployment Migration

## Introduction

This specification defines the requirements for migrating a full-stack application (React/Vite frontend + Node.js/Express backend + PostgreSQL database) from a fragmented deployment architecture (Vercel frontend, Render backend, Aiven database) to a unified Hostinger Premium hosting environment with a custom domain. The migration addresses CORS issues, cold start problems, and deployment complexity while establishing a production-ready infrastructure with SSL, email, and monitoring capabilities.

## Glossary

- **Application**: The full-stack web application consisting of Frontend, Backend, and Database components
- **Frontend**: The React/Vite single-page application serving the user interface
- **Backend**: The Node.js/Express REST API server handling business logic and database operations
- **Database**: The PostgreSQL database storing application data
- **Hostinger_Server**: The Hostinger Premium hosting server environment
- **cPanel**: The Hostinger control panel web interface for server management
- **PM2**: The Node.js process manager for keeping Backend running continuously
- **SSL_Certificate**: The TLS/SSL certificate enabling HTTPS connections
- **Custom_Domain**: The purchased domain name pointing to the Application
- **DNS**: Domain Name System records mapping Custom_Domain to Hostinger_Server
- **Reverse_Proxy**: The Apache or Nginx web server routing HTTP requests to Backend
- **Migration_Script**: Automated scripts or manual procedures for transferring data and configuration
- **Environment_Variables**: Configuration values for Backend (JWT_SECRET, DB credentials, API keys)

## Requirements

### Requirement 1: Hostinger Account Provisioning

**User Story:** As a system administrator, I want to provision a Hostinger Premium hosting account with a custom domain, so that I have a unified hosting platform for the entire Application.

#### Acceptance Criteria

1. THE System_Administrator SHALL purchase a Hostinger Premium plan subscription
2. THE System_Administrator SHALL register a free custom domain through Hostinger
3. WHEN the domain is registered, THE Hostinger_Server SHALL automatically provision DNS nameservers
4. THE System_Administrator SHALL enable an SSL_Certificate for the Custom_Domain through cPanel
5. THE System_Administrator SHALL create an email account with the format admin@{Custom_Domain}

### Requirement 2: Database Migration from Aiven to Hostinger

**User Story:** As a database administrator, I want to migrate the PostgreSQL database from Aiven to Hostinger with all schema and data intact, so that the Application can operate with a co-located database.

#### Acceptance Criteria

1. WHEN the database export is initiated, THE Migration_Script SHALL export the complete PostgreSQL schema from Aiven
2. WHEN the database export is initiated, THE Migration_Script SHALL export all table data from Aiven
3. THE System_Administrator SHALL create a new PostgreSQL database in Hostinger cPanel
4. WHEN the database is imported, THE Migration_Script SHALL restore the complete schema to Hostinger Database
5. WHEN the database is imported, THE Migration_Script SHALL restore all data to Hostinger Database
6. WHEN the migration is complete, THE Database SHALL contain identical data to the pre-migration Aiven database
7. THE Backend SHALL connect to the Hostinger Database using updated Environment_Variables

### Requirement 3: Backend Deployment and Process Management

**User Story:** As a backend developer, I want to deploy the Node.js/Express backend to Hostinger with PM2 process management, so that the API runs continuously without cold starts.

#### Acceptance Criteria

1. THE System_Administrator SHALL establish SSH access to Hostinger_Server
2. WHEN Node.js is not present, THE System_Administrator SHALL install Node.js on Hostinger_Server
3. THE System_Administrator SHALL install PM2 on Hostinger_Server
4. WHEN the Backend code is deployed, THE System_Administrator SHALL transfer all Backend files to Hostinger_Server
5. WHEN Backend files are transferred, THE System_Administrator SHALL install Node.js dependencies on Hostinger_Server
6. THE System_Administrator SHALL create an Environment_Variables file containing JWT_SECRET, database credentials, and Razorpay API keys
7. WHEN the Backend is started, THE PM2 SHALL launch the Backend process and keep it running continuously
8. WHEN the Hostinger_Server restarts, THE PM2 SHALL automatically restart the Backend process
9. THE Backend SHALL listen on a designated port accessible to Reverse_Proxy

### Requirement 4: Reverse Proxy Configuration

**User Story:** As a system administrator, I want to configure a reverse proxy to route API requests to the Backend, so that the Frontend can communicate with the Backend through the same domain.

#### Acceptance Criteria

1. THE System_Administrator SHALL configure Reverse_Proxy (Apache or Nginx) on Hostinger_Server
2. WHEN an HTTP request matches the pattern /api/*, THE Reverse_Proxy SHALL forward it to the Backend process
3. WHEN the Backend responds, THE Reverse_Proxy SHALL return the response to the client
4. THE Reverse_Proxy SHALL preserve request headers including authentication tokens
5. THE Reverse_Proxy SHALL set appropriate CORS headers to allow Frontend access

### Requirement 5: Frontend Build and Deployment

**User Story:** As a frontend developer, I want to deploy the built React/Vite frontend to Hostinger, so that users can access the application through the Custom_Domain.

#### Acceptance Criteria

1. WHEN the Frontend is built, THE Build_System SHALL execute `npm run build` to generate production assets
2. THE Build_System SHALL output optimized static files to the `dist` directory
3. THE System_Administrator SHALL transfer all files from the `dist` directory to the public_html directory on Hostinger_Server
4. WHEN a user navigates to any route, THE Reverse_Proxy SHALL serve the Frontend single-page application
5. THE Frontend SHALL be configured to send API requests to /api/* endpoints on the same Custom_Domain

### Requirement 6: DNS and SSL Configuration

**User Story:** As a system administrator, I want to configure DNS records and SSL certificates, so that users can access the Application securely via HTTPS on the Custom_Domain.

#### Acceptance Criteria

1. THE System_Administrator SHALL point the Custom_Domain nameservers to Hostinger's nameservers
2. THE System_Administrator SHALL create an A record pointing Custom_Domain to Hostinger_Server IP address
3. WHEN SSL is enabled, THE Hostinger_Server SHALL obtain a Let's Encrypt SSL_Certificate
4. WHEN the SSL_Certificate is obtained, THE Reverse_Proxy SHALL serve all traffic over HTTPS
5. WHEN a user accesses the Application via HTTP, THE Reverse_Proxy SHALL redirect to HTTPS
6. THE SSL_Certificate SHALL automatically renew before expiration

### Requirement 7: CORS Configuration Update

**User Story:** As a backend developer, I want to update CORS settings to allow requests from the Custom_Domain, so that the Frontend and Backend can communicate without CORS errors.

#### Acceptance Criteria

1. THE Backend SHALL configure CORS middleware to accept requests from https://{Custom_Domain}
2. WHEN a request originates from https://{Custom_Domain}, THE Backend SHALL respond with appropriate CORS headers
3. THE Backend SHALL allow credentials (cookies, authorization headers) in cross-origin requests
4. THE Backend SHALL NOT accept requests from unauthorized origins

### Requirement 8: Environment Variable Configuration

**User Story:** As a deployment engineer, I want to configure production environment variables, so that the Application uses production credentials and configuration.

#### Acceptance Criteria

1. THE Backend SHALL load Environment_Variables from a .env file on Hostinger_Server
2. THE Environment_Variables file SHALL contain DB_HOST pointing to Hostinger Database
3. THE Environment_Variables file SHALL contain DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME for database connection
4. THE Environment_Variables file SHALL contain JWT_SECRET for authentication token signing
5. THE Environment_Variables file SHALL contain RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET for payment processing
6. THE Frontend build SHALL embed VITE_API_URL pointing to https://{Custom_Domain}/api
7. THE Environment_Variables file SHALL have restricted file permissions preventing unauthorized access

### Requirement 9: File Permissions and Security

**User Story:** As a security administrator, I want to set appropriate file permissions, so that the Application is secure from unauthorized access.

#### Acceptance Criteria

1. THE System_Administrator SHALL set file permissions for Backend code to 644 for files and 755 for directories
2. THE Environment_Variables file SHALL have permissions set to 600 (readable only by owner)
3. THE public_html directory SHALL have permissions set to 755 for directories and 644 for files
4. THE Backend process SHALL run under a non-root user account
5. THE Database credentials SHALL NOT be stored in version control or publicly accessible locations

### Requirement 10: Application Functionality Verification

**User Story:** As a QA engineer, I want to verify all application features work correctly after migration, so that users experience no disruption in service.

#### Acceptance Criteria

1. WHEN a user registers a new account, THE Application SHALL create the account and return a valid authentication token
2. WHEN a user logs in with valid credentials, THE Application SHALL authenticate and return a valid authentication token
3. WHEN a user initiates a payment, THE Application SHALL create a Razorpay order and process the payment
4. WHEN an admin logs into the admin dashboard, THE Application SHALL display administrative functions
5. WHEN the Application queries the Database, THE Database SHALL return correct data
6. WHEN the Frontend makes an API request, THE Backend SHALL respond without CORS errors
7. THE Application SHALL respond to requests within 2 seconds (no cold starts)

### Requirement 11: SSL Certificate Validation

**User Story:** As a security engineer, I want to validate the SSL certificate is properly configured, so that all traffic is encrypted and secure.

#### Acceptance Criteria

1. WHEN a user accesses https://{Custom_Domain}, THE Browser SHALL display a valid SSL certificate
2. THE SSL_Certificate SHALL be issued by Let's Encrypt or another trusted certificate authority
3. THE SSL_Certificate SHALL cover the Custom_Domain and www.{Custom_Domain}
4. WHEN the SSL_Certificate is checked, THE Certificate SHALL NOT be expired
5. THE SSL configuration SHALL achieve an A rating on SSL Labs test

### Requirement 12: Email Account Configuration

**User Story:** As a system administrator, I want to configure email accounts for the Custom_Domain, so that the Application can send and receive emails.

#### Acceptance Criteria

1. THE System_Administrator SHALL create an email account admin@{Custom_Domain} in cPanel
2. THE Email_Account SHALL be accessible via webmail interface
3. THE Email_Account SHALL support IMAP and SMTP protocols for external email clients
4. THE System_Administrator SHALL configure SPF and DKIM records for email authentication

### Requirement 13: Monitoring and Auto-Restart Configuration

**User Story:** As a DevOps engineer, I want to configure monitoring and auto-restart capabilities, so that the Backend remains operational even after crashes or server restarts.

#### Acceptance Criteria

1. THE PM2 SHALL monitor the Backend process and automatically restart it if it crashes
2. WHEN the Hostinger_Server reboots, THE PM2 startup script SHALL automatically launch the Backend
3. THE System_Administrator SHALL configure PM2 to save the process list
4. THE PM2 SHALL maintain logs of Backend output and errors
5. THE System_Administrator SHALL be able to view Backend logs through PM2 commands

### Requirement 14: Legacy Deployment Cleanup

**User Story:** As a developer, I want to remove legacy deployment configuration files, so that the repository reflects the current deployment architecture.

#### Acceptance Criteria

1. THE Developer SHALL remove or archive vercel.json configuration file
2. THE Developer SHALL remove or archive netlify.toml configuration file
3. THE Repository SHALL contain updated deployment documentation reflecting Hostinger setup
4. THE Developer SHALL update README.md with new deployment instructions

### Requirement 15: Database Connection Validation

**User Story:** As a database administrator, I want to validate database connections are stable and secure, so that the Application maintains reliable data access.

#### Acceptance Criteria

1. WHEN the Backend starts, THE Backend SHALL successfully connect to the Hostinger Database
2. THE Database connection SHALL use SSL/TLS encryption if supported by Hostinger
3. THE Backend SHALL use connection pooling with a maximum of 10 concurrent connections
4. WHEN a database query fails, THE Backend SHALL retry the connection and log the error
5. THE Database connection string SHALL NOT be exposed in client-side code or logs
