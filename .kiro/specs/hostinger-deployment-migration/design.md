# Design Document: Hostinger Premium Deployment Migration

## Overview

This design specifies the architecture and implementation approach for migrating a full-stack application from a fragmented multi-cloud deployment (Vercel, Render, Aiven) to a unified Hostinger Premium hosting environment. The migration consolidates the React/Vite frontend, Node.js/Express backend, and PostgreSQL database onto a single hosting platform with a custom domain, SSL encryption, and production-grade process management.

### Current Architecture
- **Frontend**: React/Vite SPA hosted on Vercel/Netlify
- **Backend**: Node.js/Express API on Render (suffers from cold starts)
- **Database**: PostgreSQL on Aiven (external managed service)
- **Issues**: CORS complexity, cold start latency, fragmented configuration, inter-service network overhead

### Target Architecture
- **Unified Hosting**: All components on Hostinger Premium shared hosting
- **Custom Domain**: Single domain with SSL for both frontend and backend
- **Process Management**: PM2 to eliminate cold starts and ensure uptime
- **Co-located Database**: PostgreSQL on same server, reducing latency
- **Reverse Proxy**: Apache/Nginx routing API traffic to backend process

### Migration Strategy
The migration follows a phased approach:
1. **Infrastructure Setup**: Provision Hostinger account, domain, and SSL
2. **Database Migration**: Export from Aiven, import to Hostinger PostgreSQL
3. **Backend Deployment**: Deploy Node.js backend with PM2 process management
4. **Frontend Deployment**: Build and deploy static assets to public_html
5. **Integration**: Configure reverse proxy, DNS, CORS, and environment variables
6. **Verification**: Test all functionality end-to-end

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Hostinger Server                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Apache/Nginx Reverse Proxy (Port 80/443)         │  │
│  │                                                     │  │
│  │  • SSL Termination (Let's Encrypt)                │  │
│  │  • Static File Serving (public_html)              │  │
│  │  • Reverse Proxy Rules (/api/* → localhost:5000)  │  │
│  └──────────────┬──────────────────────┬──────────────┘  │
│                 │                      │                   │
│  ┌──────────────▼──────────┐  ┌───────▼──────────────┐   │
│  │  Frontend (public_html) │  │  Backend (PM2)       │   │
│  │                         │  │                      │   │
│  │  • React/Vite SPA      │  │  • Node.js/Express   │   │
│  │  • Static HTML/JS/CSS  │  │  • Port 5000         │   │
│  │  • Routing via proxy   │  │  • Auto-restart      │   │
│  └─────────────────────────┘  └──────┬───────────────┘   │
│                                       │                    │
│                           ┌───────────▼───────────────┐   │
│                           │  PostgreSQL Database      │   │
│                           │                           │   │
│                           │  • MySQL/PostgreSQL       │   │
│                           │  • Connection pooling     │   │
│                           │  • SSL (if supported)     │   │
│                           └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

External DNS: Custom Domain → Hostinger Server IP
```

### Request Flow

**Frontend Request Flow:**
1. User navigates to `https://example.com`
2. DNS resolves to Hostinger server IP
3. Apache/Nginx serves static files from `public_html/`
4. React router handles client-side navigation

**API Request Flow:**
1. Frontend makes request to `https://example.com/api/endpoint`
2. Apache/Nginx matches `/api/*` pattern
3. Reverse proxy forwards to `http://localhost:5000/api/endpoint`
4. PM2-managed backend process handles request
5. Backend queries PostgreSQL database
6. Response returned through reverse proxy to frontend

### Technology Stack

**Frontend:**
- React 18.3.1
- Vite 5.4.0 (build tool)
- Deployment: Static files in `public_html`

**Backend:**
- Node.js (latest LTS version)
- Express 4.18.3
- Dependencies: bcryptjs, jsonwebtoken, cors, dotenv, mysql2, razorpay, multer
- Process Manager: PM2

**Database:**
- PostgreSQL (or MySQL if PostgreSQL unavailable on Hostinger)
- Connection pooling: mysql2/promise
- SSL support: Conditional based on hosting configuration

**Infrastructure:**
- Hostinger Premium (₹249/month)
- Apache or Nginx (Hostinger default)
- Let's Encrypt SSL certificate
- cPanel for management

## Components and Interfaces

### 1. Database Migration Component

**Purpose:** Transfer schema and data from Aiven PostgreSQL to Hostinger PostgreSQL/MySQL.

**Operations:**
- `exportAivenDatabase()`: Dump schema and data from Aiven using `pg_dump` or equivalent
- `createHostingerDatabase()`: Create new database in Hostinger cPanel
- `importToHostinger()`: Restore schema and data using `psql` or MySQL import
- `verifyDataIntegrity()`: Compare row counts and sample data between source and destination

**Interface:**
```bash
# Export from Aiven
pg_dump -h <aiven-host> -U <user> -d <database> -F c -f backup.dump

# Import to Hostinger (via SSH or cPanel phpMyAdmin)
psql -h localhost -U <hostinger-user> -d <hostinger-db> < backup.sql
# OR for MySQL
mysql -h localhost -u <user> -p <database> < backup.sql
```

**Error Handling:**
- Validate connection to source and destination before migration
- Check for sufficient disk space on Hostinger
- Verify table counts match after import
- Handle schema differences (PostgreSQL → MySQL if necessary)

### 2. Backend Deployment Component

**Purpose:** Deploy Node.js/Express backend with PM2 process management.

**Operations:**
- `uploadBackendCode()`: Transfer backend files via SSH/SFTP
- `installDependencies()`: Run `npm install --production`
- `createEnvironmentFile()`: Write `.env` with production configuration
- `startWithPM2()`: Launch backend with `pm2 start index.js --name blockbridge-backend`
- `configurePM2Startup()`: Enable PM2 auto-start on server reboot

**Interface:**
```bash
# SSH into Hostinger
ssh user@server-ip

# Navigate to backend directory
cd ~/backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=hostinger_user
DB_PASSWORD=secure_password
DB_NAME=blockbridge_db
JWT_SECRET=secure_random_secret_key_here
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=secret_here
RAZORPAY_WEBHOOK_SECRET=webhook_secret
EOF

# Start with PM2
pm2 start index.js --name blockbridge-backend
pm2 save
pm2 startup
```

**Configuration:**
- `.env` file with production environment variables
- PM2 ecosystem file (optional) for advanced configuration
- File permissions: `.env` set to 600

**Error Handling:**
- Verify Node.js installation before deployment
- Check port 5000 availability
- Log PM2 errors to `/home/user/.pm2/logs/`
- Set up PM2 to restart on crash (automatic)

### 3. Reverse Proxy Configuration Component

**Purpose:** Configure Apache/Nginx to route API requests to backend and serve frontend.

**Operations:**
- `detectWebServer()`: Determine if Apache or Nginx is used
- `configureProxyRules()`: Add reverse proxy configuration for `/api/*`
- `enableSSL()`: Configure SSL certificate and HTTPS redirect
- `testConfiguration()`: Validate configuration syntax and reload

**Apache Configuration (.htaccess in public_html):**
```apache
RewriteEngine On

# Reverse proxy for API requests
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# SPA routing - serve index.html for non-file requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**Nginx Configuration (if used - via cPanel or config file):**
```nginx
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

**Error Handling:**
- Test proxy configuration before enabling
- Monitor proxy error logs
- Implement fallback if backend is down (502 error page)

### 4. Frontend Build and Deployment Component

**Purpose:** Build React/Vite frontend and deploy to public_html.

**Operations:**
- `updateAPIConfiguration()`: Set `VITE_API_URL` to production domain
- `buildProduction()`: Execute `npm run build` to generate optimized assets
- `deployToPublicHTML()`: Transfer `dist/` contents to `public_html/`
- `configureSPARouting()`: Set up Apache/Nginx to handle client-side routing

**Build Process:**
```bash
# Local machine or CI/CD
cd frontend
export VITE_API_URL=https://example.com/api
npm run build

# Deploy to Hostinger
scp -r dist/* user@server:/home/user/public_html/
```

**Frontend Environment:**
- `VITE_API_URL`: Set to `/api` (same-origin) or `https://example.com/api`
- Production builds minify JS/CSS and optimize assets

**Error Handling:**
- Verify build completes without errors
- Check file permissions after upload (644 for files, 755 for directories)
- Test SPA routing with various URLs

### 5. DNS and SSL Management Component

**Purpose:** Configure DNS records and SSL certificate for custom domain.

**Operations:**
- `updateNameservers()`: Point domain to Hostinger nameservers
- `createDNSRecords()`: Add A record for domain and www subdomain
- `requestSSLCertificate()`: Obtain Let's Encrypt certificate via cPanel
- `configureAutoRenewal()`: Ensure SSL auto-renewal is enabled

**DNS Configuration (via Hostinger cPanel):**
```
Type: A
Host: @
Value: <Hostinger Server IP>
TTL: 3600

Type: A
Host: www
Value: <Hostinger Server IP>
TTL: 3600

Type: MX
Host: @
Value: mail.example.com
Priority: 10
```

**SSL Configuration:**
- Certificate Authority: Let's Encrypt
- Coverage: `example.com` and `www.example.com`
- Auto-renewal: Every 90 days (automatic via cPanel)

**Error Handling:**
- DNS propagation can take 24-48 hours
- Verify domain ownership before SSL issuance
- Monitor SSL expiration dates

### 6. Environment Variable Management Component

**Purpose:** Securely configure and manage environment variables for backend.

**Operations:**
- `generateSecrets()`: Create secure random values for JWT_SECRET
- `createEnvFile()`: Write `.env` file with all required variables
- `setFilePermissions()`: Restrict `.env` to owner read/write only (600)
- `validateConfiguration()`: Verify all required variables are present

**Environment Variables:**
```bash
# Backend .env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=hostinger_db_user
DB_PASSWORD=secure_db_password
DB_NAME=blockbridge_production
JWT_SECRET=<64-character random string>
RAZORPAY_KEY_ID=rzp_live_xxxxxxx
RAZORPAY_KEY_SECRET=<razorpay secret>
RAZORPAY_WEBHOOK_SECRET=<webhook secret>
```

**Security Measures:**
- Never commit `.env` to version control
- Use strong random secrets (minimum 32 characters)
- Rotate secrets periodically
- Restrict file permissions to 600

**Error Handling:**
- Fail backend startup if critical variables missing
- Log configuration errors without exposing secrets
- Validate database connection on startup

### 7. CORS Configuration Component

**Purpose:** Update backend CORS settings to allow requests from custom domain.

**Operations:**
- `updateCORSOrigins()`: Modify allowed origins in backend/index.js
- `configureCredentials()`: Enable credentials for authentication
- `testCORS()`: Verify preflight requests work correctly

**CORS Configuration (backend/index.js):**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',          // Local development
      'https://example.com',             // Production domain
      'https://www.example.com'          // Production www subdomain
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**Error Handling:**
- Log blocked CORS requests for debugging
- Return clear error messages for unauthorized origins
- Support OPTIONS preflight requests

## Data Models

### Database Schema

The application uses the following database schema (migrated from Aiven):

**users table:**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  plan ENUM('FREE','PRO','BUSINESS') DEFAULT 'FREE',
  subscription_status ENUM('ACTIVE','EXPIRED','NONE') DEFAULT 'NONE',
  expiry_date DATETIME DEFAULT NULL,
  activation_date DATETIME DEFAULT NULL,
  last_activation_key VARCHAR(20) DEFAULT NULL,
  scans_today INT DEFAULT 0,
  scans_reset_date DATE DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**payments table:**
```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  razorpay_order_id VARCHAR(100) NOT NULL,
  razorpay_payment_id VARCHAR(100) DEFAULT NULL,
  amount INT NOT NULL,
  plan ENUM('PRO','BUSINESS') NOT NULL,
  status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**payment_requests table:**
```sql
CREATE TABLE payment_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('PRO', 'BUSINESS') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  screenshot_url VARCHAR(500) DEFAULT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  admin_notes TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME DEFAULT NULL,
  verified_by INT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**activation_keys table:**
```sql
CREATE TABLE activation_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activation_key VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  plan ENUM('PRO', 'BUSINESS') NOT NULL,
  payment_request_id INT DEFAULT NULL,
  status ENUM('UNUSED', 'USED', 'EXPIRED', 'REVOKED') DEFAULT 'UNUSED',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  activated_at DATETIME DEFAULT NULL,
  expiry_date DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_request_id) REFERENCES payment_requests(id) ON DELETE SET NULL
);
```

**admin_users table:**
```sql
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  role ENUM('ADMIN', 'SUPER_ADMIN') DEFAULT 'ADMIN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Database Migration Data Flow

```
┌─────────────────────┐
│   Aiven PostgreSQL  │
│                     │
│  1. Export via      │
│     pg_dump         │
└──────────┬──────────┘
           │
           │ backup.sql / backup.dump
           │
           ▼
┌─────────────────────┐
│  Migration Script   │
│                     │
│  2. Transform       │
│     (if needed)     │
└──────────┬──────────┘
           │
           │ hostinger_import.sql
           │
           ▼
┌─────────────────────┐
│ Hostinger PostgreSQL│
│    or MySQL         │
│                     │
│  3. Import via      │
│     psql or mysql   │
└─────────────────────┘
```

### Environment Configuration Data

**Backend Environment Variables:**
- `PORT`: Backend server port (5000)
- `DB_HOST`: Database host (localhost for Hostinger)
- `DB_PORT`: Database port (3306 for MySQL, 5432 for PostgreSQL)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret for JWT token signing (64+ characters)
- `RAZORPAY_KEY_ID`: Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Razorpay API secret
- `RAZORPAY_WEBHOOK_SECRET`: Razorpay webhook signature secret

**Frontend Build Variables:**
- `VITE_API_URL`: API base URL (set to `/api` for same-origin or full domain)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Database Migration Data Integrity (Round Trip)

*For any* database in the pre-migration state, after exporting from Aiven, importing to Hostinger, the Hostinger database should contain identical schema structure and data content (same tables, columns, row counts, and data values) as the original Aiven database.

**Validates: Requirements 2.1, 2.2, 2.4, 2.5, 2.6**

### Property 2: Backend File Deployment Completeness

*For any* set of backend source files in the repository, after deployment to Hostinger_Server, all necessary files (source code, package.json, configuration templates) should exist in the deployment directory, excluding development-only files like node_modules and test files.

**Validates: Requirements 3.4**

### Property 3: Environment Variables Completeness

*For any* backend deployment, the .env file should contain all required environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET) with non-empty values.

**Validates: Requirements 3.6, 8.3, 8.5**

### Property 4: Reverse Proxy API Request Forwarding

*For any* HTTP request matching the pattern /api/*, the reverse proxy should forward the request to the backend process on localhost:5000, and the response received by the client should match the backend's response.

**Validates: Requirements 4.2, 4.3**

### Property 5: Reverse Proxy Header Preservation

*For any* HTTP request with authorization headers sent to /api/*, the backend should receive the same authorization header value, demonstrating that the reverse proxy preserves authentication headers.

**Validates: Requirements 4.4**

### Property 6: Frontend File Deployment Completeness

*For any* frontend build output in the dist/ directory, after deployment to public_html, all files (HTML, JavaScript, CSS, assets) should exist in public_html with identical content.

**Validates: Requirements 5.3**

### Property 7: SPA Routing for All Routes

*For any* application route (including non-root paths like /dashboard, /login, /admin), when accessed directly via HTTP, the server should serve the index.html file, enabling client-side routing.

**Validates: Requirements 5.4**

### Property 8: HTTP to HTTPS Redirect

*For any* URL accessed via HTTP (http://domain.com/*), the server should return a redirect response to the HTTPS equivalent (https://domain.com/*).

**Validates: Requirements 6.5**

### Property 9: CORS Origin Validation

*For any* request originating from the configured Custom_Domain (https://example.com), the backend should respond with appropriate CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Credentials), and for any request from an unauthorized origin, the backend should reject the request or omit CORS headers.

**Validates: Requirements 7.2, 7.4**

### Property 10: File Permissions Security

*For any* file in the backend deployment directory or public_html, regular files should have permissions 644 (rw-r--r--) and directories should have permissions 755 (rwxr-xr-x), except the .env file which should have permissions 600 (rw-------).

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 11: Credentials Not in Version Control

*For any* file tracked in the git repository, sensitive credentials (database passwords, JWT secrets, API keys) should not appear in file contents, ensuring the .env file and any files containing secrets are properly gitignored.

**Validates: Requirements 9.5**

### Property 12: Application Response Time (No Cold Starts)

*For any* API endpoint request made after the backend has been running for at least 1 minute, the response time should be less than 2 seconds, demonstrating that no cold start delay occurs.

**Validates: Requirements 10.7**

### Property 13: SSL Certificate Domain Coverage

*For any* access to the application via HTTPS, the SSL certificate should be valid, not expired, and cover both the Custom_Domain and the www subdomain (e.g., both example.com and www.example.com).

**Validates: Requirements 11.1, 11.3, 11.4**

### Property 14: Database Connection String Security

*For any* backend log output or client-side accessible code, database credentials (password, connection string with password) should not appear, ensuring sensitive information is not leaked.

**Validates: Requirements 15.5**

## Error Handling

### Database Migration Errors

**Connection Failures:**
- Validate connectivity to both Aiven (source) and Hostinger (destination) before starting migration
- Provide clear error messages indicating which database failed to connect
- Include connection parameters (host, port, database name) in error output, excluding passwords

**Data Integrity Errors:**
- Compare row counts for each table after import
- If counts mismatch, report specific tables with discrepancies
- Abort migration and require manual investigation if critical tables fail validation
- Log sample data mismatches for debugging

**Schema Incompatibility:**
- If migrating PostgreSQL to MySQL, identify and transform incompatible data types (e.g., SERIAL → AUTO_INCREMENT, BOOLEAN → TINYINT)
- Warn about potential data loss from type conversions
- Provide migration script dry-run mode to preview changes

### Backend Deployment Errors

**Node.js Installation:**
- Verify Node.js version compatibility (require Node.js >= 18 LTS)
- If incorrect version detected, provide installation instructions
- Check npm availability alongside Node.js

**PM2 Configuration:**
- If PM2 start fails, check if port 5000 is already in use
- Log PM2 error output to help diagnose startup failures
- Verify .env file exists and is readable before starting

**Environment Variable Errors:**
- On backend startup, validate all required environment variables are present
- Fail fast with descriptive error if critical variables (DB_*, JWT_SECRET) are missing
- Do not start server in invalid configuration state

**Database Connection Errors:**
- Implement retry logic with exponential backoff (3 retries, 1s/2s/4s delays)
- Log connection attempts and failures
- Check if database credentials are correct
- Verify database exists and user has appropriate permissions

### Reverse Proxy Errors

**Configuration Syntax:**
- Test Apache/Nginx configuration syntax before reloading server
- Provide clear error messages for syntax errors
- Rollback to previous configuration if reload fails

**Backend Unavailability:**
- Configure reverse proxy to return 502 Bad Gateway if backend is down
- Log backend connection failures
- Implement health check endpoint (/api/health) for monitoring

**SSL Errors:**
- If SSL certificate generation fails, check domain ownership verification
- Ensure DNS records are properly configured before requesting certificate
- Provide fallback to HTTP if HTTPS is not yet available (during setup only)

### Frontend Deployment Errors

**Build Failures:**
- Verify all dependencies are installed before build
- Check for TypeScript/ESLint errors that prevent build
- Ensure VITE_API_URL is set correctly before build

**File Transfer:**
- Verify SSH/SFTP connectivity before uploading files
- Check available disk space on Hostinger
- Validate file integrity after transfer (checksums)

### DNS and SSL Errors

**DNS Propagation Delays:**
- Inform users that DNS changes may take 24-48 hours
- Provide tools to check DNS propagation status
- Test with direct IP access before DNS is fully propagated

**SSL Certificate Expiration:**
- Monitor certificate expiration dates
- Alert 30 days before expiration
- Verify auto-renewal is enabled in cPanel

### CORS Errors

**Origin Mismatch:**
- Log rejected CORS requests with origin information
- Return 403 Forbidden for unauthorized origins
- Provide clear error message indicating CORS policy violation

**Preflight Failures:**
- Ensure OPTIONS requests are handled correctly
- Return appropriate Access-Control-Allow-Methods headers
- Support all HTTP methods used by frontend (GET, POST, PUT, DELETE)

### Security Errors

**File Permission Issues:**
- If .env file is world-readable, immediately restrict permissions and log warning
- Check for sensitive files in public_html (e.g., .env, .git)
- Alert if backend process runs as root user

**Authentication Failures:**
- Rate limit login attempts to prevent brute force attacks
- Log failed authentication attempts with IP addresses
- Return generic "Invalid credentials" message without revealing which field is incorrect

## Testing Strategy

### Dual Testing Approach

This migration project requires both **unit testing** and **property-based testing** to ensure comprehensive validation:

**Unit Tests:**
- Verify specific deployment steps complete successfully
- Test individual component configurations (PM2, reverse proxy, CORS)
- Validate edge cases (missing environment variables, invalid database connections)
- Confirm integration points between frontend and backend

**Property-Based Tests:**
- Verify universal properties across all possible inputs
- Test database migration integrity with various data sets
- Validate file permission patterns across all files
- Ensure CORS works for all valid origins and rejects invalid ones

### Property-Based Testing Framework

**Test Library:** Since this is an infrastructure/deployment project, property-based testing will use **shell script testing with randomized inputs** or **Python with Hypothesis** for migration validation scripts.

**Test Configuration:**
- Each property test should run a minimum of **100 iterations**
- Tests should generate random but valid test data
- Each test must reference its corresponding design property

**Test Tagging Format:**
```bash
# Feature: hostinger-deployment-migration, Property 1: Database Migration Data Integrity
# Tests that exported and imported databases contain identical data
```

### Unit Test Coverage

**Database Migration Tests:**
- Test database connection to Aiven and Hostinger
- Test export script generates valid SQL dump
- Test import script handles SQL dump correctly
- Test row count validation for each table
- Edge case: Empty tables
- Edge case: Tables with special characters in data
- Edge case: Large BLOB/TEXT fields

**Backend Deployment Tests:**
- Test PM2 starts backend process successfully
- Test backend responds to health check requests
- Test environment variables loaded correctly
- Test database connection pool configuration
- Edge case: Missing .env file
- Edge case: Invalid database credentials
- Edge case: Port already in use

**Reverse Proxy Tests:**
- Test /api/* requests routed to backend
- Test static file requests served from public_html
- Test HTTPS redirect from HTTP
- Test SPA routing (non-file requests serve index.html)
- Edge case: Backend process down (502 error)
- Edge case: Large request bodies
- Edge case: WebSocket upgrade requests (if applicable)

**Frontend Deployment Tests:**
- Test build process completes without errors
- Test all assets exist in dist/ directory
- Test VITE_API_URL embedded in build
- Edge case: Missing environment variable during build

**CORS Tests:**
- Test requests from production domain accepted
- Test requests from localhost accepted (development)
- Test requests from unauthorized origins rejected
- Test preflight OPTIONS requests handled
- Test credentials included in responses

**Security Tests:**
- Test .env file has 600 permissions
- Test backend files have correct permissions
- Test .env is in .gitignore
- Test no credentials in git history
- Test backend runs as non-root user

### Integration Tests

**End-to-End Application Tests:**
- Test user registration flow
- Test user login flow
- Test payment creation and processing
- Test admin dashboard access
- Test API requests from frontend to backend
- Measure response times (verify < 2 seconds)

**DNS and SSL Tests:**
- Test domain resolves to Hostinger IP
- Test SSL certificate is valid and not expired
- Test HTTPS enforced (HTTP redirects to HTTPS)
- Test certificate covers both domain and www subdomain

**Monitoring Tests:**
- Test PM2 restarts backend after crash
- Test PM2 logs contain backend output
- Test backend remains running after 24 hours

### Test Execution Plan

**Pre-Migration Testing (Local/Staging):**
1. Test database export and import scripts with test data
2. Test backend configuration with environment variables
3. Test frontend build process
4. Test CORS configuration with test domains

**Post-Deployment Testing (Production):**
1. Run property-based tests for database migration integrity
2. Run unit tests for all deployment components
3. Run integration tests for end-to-end functionality
4. Perform manual SSL certificate validation
5. Monitor backend performance and uptime for 48 hours

**Continuous Monitoring:**
- Set up uptime monitoring for application availability
- Monitor PM2 logs for errors or crashes
- Check SSL certificate expiration monthly
- Validate database backup integrity weekly
