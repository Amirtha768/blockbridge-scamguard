# Design Document: Production-Ready Improvements

## Overview

This design outlines the architecture and implementation approach for upgrading the BlockBridge ScamGuard AI platform from a prototype to a production-ready SaaS product. The system is a cybersecurity platform that analyzes URLs, emails, WhatsApp messages, QR codes, and screenshots to detect scams and phishing attempts.

The core upgrade focuses on replacing random risk scoring with intelligent AI-based analysis, implementing comprehensive scan history tracking, adding an AI chatbot assistant, removing Razorpay payment integration in favor of manual payment verification with activation keys, and enhancing the UI/UX for professional presentation.

### Key Design Goals

1. **Intelligent Risk Analysis**: Replace random scoring with deterministic, rule-based risk calculation using multiple fraud indicators
2. **Professional User Experience**: Clean, intuitive interface suitable for demonstration to judges and real-world use
3. **Comprehensive History**: Track all scans with plan-based retention and export capabilities
4. **Manual Payment Workflow**: Admin-verified payment system with activation key distribution
5. **AI Assistant Integration**: Contextual help and guidance through chatbot interface
6. **Scalable Architecture**: Maintainable codebase ready for production deployment

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Scanners  │  │ Dashboard  │  │  Admin Panel         │  │
│  │  - URL     │  │ - History  │  │  - Payment Approval  │  │
│  │  - Email   │  │ - Stats    │  │  - Key Generation    │  │
│  │  - WhatsApp│  │ - Insights │  │  - User Management   │  │
│  │  - QR      │  └────────────┘  └──────────────────────┘  │
│  │  - Image   │  ┌────────────┐                            │
│  └────────────┘  │  Chatbot   │                            │
│                  │  Assistant │                            │
│                  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Risk Analysis    │  │  Authentication & Auth       │    │
│  │ Engine           │  │  - JWT Token Management      │    │
│  │ - Input Validator│  │  - Plan-based Access Control │    │
│  │ - Risk Calculator│  └──────────────────────────────┘    │
│  │ - Blacklist Check│  ┌──────────────────────────────┐    │
│  │ - Domain Analysis│  │  Payment Management          │    │
│  └──────────────────┘  │  - Request Processing        │    │
│  ┌──────────────────┐  │  - Key Generation            │    │
│  │ Scan History     │  │  - Admin Approval Workflow   │    │
│  │ Manager          │  └──────────────────────────────┘    │
│  │ - Storage        │  ┌──────────────────────────────┐    │
│  │ - Retrieval      │  │  Admin Operations            │    │
│  │ - Export (PDF)   │  │  - Dashboard Stats           │    │
│  └──────────────────┘  │  - User Management           │    │
│                        └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (MySQL)                          │
│  - users                - activation_keys                    │
│  - scan_history         - payment_requests                   │
│  - admin_users          - blacklist_domains                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18 with Vite build tool
- **Backend**: Node.js with Express.js framework
- **Database**: MySQL 8.0 (Aiven hosted)
- **Authentication**: JWT tokens with bcryptjs password hashing
- **File Upload**: Multer for payment screenshot and QR/image uploads
- **Deployment**: Vercel (frontend), Render (backend)

## Components and Interfaces

### 1. Smart Risk Analysis Engine

The Risk Analysis Engine replaces random scoring with deterministic, rule-based calculations.

#### InputValidator Component

```typescript
interface ValidationResult {
  isValid: boolean;
  type: 'URL' | 'EMAIL' | 'MESSAGE' | 'UNKNOWN';
  error?: string;
}

class InputValidator {
  validateInput(input: string, expectedType?: string): ValidationResult
  
  // Pattern matching methods
  private isValidURL(input: string): boolean
  private isValidEmail(input: string): boolean
  private isMessage(input: string): boolean
}
```

**Validation Logic**:
- URL: Must contain domain structure (e.g., example.com, http://site.com)
- Email: Standard email regex pattern (user@domain.ext)
- Message: Any non-empty string (catch-all for text analysis)

#### RiskCalculator Component

```typescript
interface RiskIndicators {
  hasHTTPS: boolean;
  isBlacklisted: boolean;
  suspiciousKeywords: string[];
  isShortURL: boolean;
  domainAge: number | null;
  redirectCount: number;
}

interface RiskResult {
  score: number;              // 0-100
  status: 'SAFE' | 'LOW RISK' | 'SUSPICIOUS' | 'DANGEROUS';
  indicators: RiskIndicators;
  explanation: string;
  recommendation: string;
}

class RiskCalculator {
  calculateRisk(input: string, type: string): Promise<RiskResult>
  
  // Risk factor analysis methods
  private checkHTTPS(url: string): boolean
  private checkBlacklist(domain: string): Promise<boolean>
  private detectSuspiciousKeywords(text: string): string[]
  private checkShortURL(url: string): boolean
  private getDomainAge(domain: string): Promise<number | null>
  private countRedirects(url: string): Promise<number>
}
```

**Risk Scoring Algorithm**:

Starting at base score of 50:

1. **HTTPS Protocol**: -10 points (indicates basic security)
2. **Blacklisted Domain**: +40 points (known malicious domain)
3. **Suspicious Keywords**: +20 points each (win, free, click, urgent, OTP, verify, account, prize, winner, claim, congratulations)
4. **Short URL Service**: +10 points (bit.ly, tinyurl.com, goo.gl, ow.ly)
5. **New Domain** (<90 days): +25 points (recently registered)
6. **Multiple Redirects** (>2): +15 points (redirect chains)

**Final score clamping**: Ensure 0 ≤ score ≤ 100

**Status Classification**:
- 0-25: SAFE (Green indicator)
- 26-50: LOW RISK (Yellow indicator)
- 51-75: SUSPICIOUS (Orange indicator)
- 76-100: DANGEROUS (Red indicator)

#### DomainAnalyzer Component

```typescript
interface DomainInfo {
  domain: string;
  age: number | null;
  registrar: string | null;
  isNew: boolean;
}

class DomainAnalyzer {
  analyzeDomain(url: string): Promise<DomainInfo>
  
  // Use WHOIS lookup or DNS-based age estimation
  private fetchWhoisData(domain: string): Promise<any>
  private calculateAge(creationDate: Date): number
}
```

#### RedirectAnalyzer Component

```typescript
interface RedirectChain {
  urls: string[];
  count: number;
  finalDestination: string;
}

class RedirectAnalyzer {
  followRedirects(url: string, maxDepth: number = 5): Promise<RedirectChain>
  
  // Use HTTP HEAD requests to follow redirects
  private makeHeadRequest(url: string): Promise<string | null>
}
```

#### BlacklistManager Component

```typescript
interface BlacklistEntry {
  domain: string;
  pattern: string;
  addedDate: Date;
  category: 'PHISHING' | 'MALWARE' | 'SCAM';
}

class BlacklistManager {
  checkBlacklist(domain: string): Promise<boolean>
  addToBlacklist(entry: BlacklistEntry): Promise<void>
  
  // Database operations
  private queryDatabase(domain: string): Promise<boolean>
}
```

### 2. Scan History System

#### ScanHistoryManager Component

```typescript
interface ScanRecord {
  id: number;
  userId: number;
  scanType: 'URL' | 'EMAIL' | 'WHATSAPP' | 'QR' | 'SCREENSHOT' | 'JOB' | 'INVESTMENT';
  input: string;
  result: string;
  riskScore: number;
  createdAt: Date;
}

interface HistoryFilter {
  type?: string[];
  searchQuery?: string;
  startDate?: Date;
  endDate?: Date;
}

class ScanHistoryManager {
  saveScan(scan: Omit<ScanRecord, 'id' | 'createdAt'>): Promise<number>
  getRecentScans(userId: number, limit: number = 10): Promise<ScanRecord[]>
  getFilteredHistory(userId: number, filter: HistoryFilter, plan: string): Promise<ScanRecord[]>
  
  // Plan-based restrictions
  private applyPlanRestrictions(scans: ScanRecord[], plan: string): ScanRecord[]
  private getRetentionDays(plan: string): number
}
```

**Plan-Based Restrictions**:
- FREE: Last 10 scans, 7-day retention
- PRO: Unlimited scans, 30-day retention
- BUSINESS: Unlimited scans, 90-day retention

#### PDFReportGenerator Component

```typescript
interface ReportData {
  scan: ScanRecord;
  userInfo: {
    name: string;
    email: string;
  };
  riskDetails: RiskResult;
}

class PDFReportGenerator {
  generateReport(data: ReportData): Promise<Buffer>
  
  // Generate formatted PDF with scan details, risk analysis, and recommendations
  private formatHeader(userInfo: any): string
  private formatRiskSection(riskDetails: RiskResult): string
  private formatRecommendations(status: string): string
}
```

### 3. Payment and Activation System

#### PaymentRequestHandler Component

```typescript
interface PaymentRequest {
  id: number;
  userId: number;
  plan: 'PRO' | 'BUSINESS';
  amount: number;
  transactionId: string;
  screenshotUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  verifiedAt?: Date;
}

class PaymentRequestHandler {
  submitPaymentRequest(userId: number, plan: string, transactionId: string, screenshot: File): Promise<number>
  getRequestsByStatus(status: string): Promise<PaymentRequest[]>
  getUserRequests(userId: number): Promise<PaymentRequest[]>
  
  // File handling
  private saveScreenshot(file: File, userId: number): Promise<string>
  private validateScreenshot(file: File): boolean
}
```

#### ActivationKeyGenerator Component

```typescript
interface ActivationKey {
  key: string;
  userId: number;
  plan: 'PRO' | 'BUSINESS';
  status: 'UNUSED' | 'USED' | 'EXPIRED' | 'REVOKED';
  generatedAt: Date;
  activatedAt?: Date;
  expiryDate?: Date;
}

class ActivationKeyGenerator {
  generateKey(plan: string): string
  validateKeyFormat(key: string): boolean
  activateKey(key: string, userId: number): Promise<boolean>
  
  // Key format: BB-{PLAN}-{RANDOM_CODE}
  // Example: BB-PRO-X82KLM, BB-BUSINESS-Q9P7MD
  private generateRandomCode(): string
  private checkUniqueness(key: string): Promise<boolean>
}
```

**Key Generation Algorithm**:
1. Prefix: "BB-" (BlockBridge)
2. Plan identifier: "PRO" or "BUS" (for BUSINESS)
3. Random code: 6 characters (uppercase alphanumeric, excluding ambiguous: 0, O, I, 1)
4. Format: `BB-${PLAN}-${RANDOM}`

#### SubscriptionManager Component

```typescript
interface Subscription {
  userId: number;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  status: 'ACTIVE' | 'EXPIRED' | 'NONE';
  activationDate?: Date;
  expiryDate?: Date;
  lastActivationKey?: string;
}

class SubscriptionManager {
  activateSubscription(userId: number, key: string): Promise<boolean>
  checkExpiration(userId: number): Promise<boolean>
  getSubscriptionStatus(userId: number): Promise<Subscription>
  
  // Calculate expiry dates
  private calculateExpiryDate(plan: string, activationDate: Date): Date
  // PRO: 30 days, BUSINESS: 90 days
}
```

### 4. Admin Panel Components

#### AdminDashboard Component

```typescript
interface DashboardStats {
  totalUsers: number;
  pendingPayments: number;
  proUsers: number;
  businessUsers: number;
  todaysScans: number;
  totalRevenue: number;
}

class AdminDashboard {
  getStatistics(): Promise<DashboardStats>
  getRecentActivity(limit: number = 10): Promise<any[]>
}
```

#### PaymentApprovalManager Component

```typescript
interface ApprovalAction {
  requestId: number;
  adminId: number;
  action: 'APPROVE' | 'REJECT';
  notes?: string;
}

class PaymentApprovalManager {
  approvePayment(action: ApprovalAction): Promise<ActivationKey>
  rejectPayment(action: ApprovalAction): Promise<void>
  getScreenshot(filename: string): Promise<Buffer>
  
  // Workflow: Approve → Generate Key → Update Request Status → Return Key
  private processApproval(requestId: number, adminId: number): Promise<string>
}
```

#### UserManagement Component

```typescript
interface UserSummary {
  id: number;
  name: string;
  email: string;
  plan: string;
  subscriptionStatus: string;
  expiryDate?: Date;
  scansToday: number;
  totalScans: number;
}

class UserManagement {
  getAllUsers(): Promise<UserSummary[]>
  getUserDetails(userId: number): Promise<UserSummary>
  searchUsers(query: string): Promise<UserSummary[]>
}
```

### 5. AI Chatbot Assistant

#### ChatbotEngine Component

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotResponse {
  message: string;
  quickActions?: string[];
  relatedLinks?: { text: string; url: string }[];
}

class ChatbotEngine {
  processMessage(message: string, context: any): Promise<ChatbotResponse>
  
  // Intent detection and response generation
  private detectIntent(message: string): string
  private generateResponse(intent: string, context: any): ChatbotResponse
  private getFAQResponse(question: string): string | null
}
```

**FAQ Response Database**:
Predefined responses for common questions about:
- Platform features and capabilities
- Risk score interpretation
- Scanner usage instructions
- Plan differences and upgrade process
- Data privacy and security
- Scam identification tips

**Intent Categories**:
1. Platform Information
2. Scanner Usage
3. Risk Score Questions
4. Plan/Upgrade Questions
5. Security/Privacy Questions
6. Scam Identification Help
7. General Support

### 6. Frontend UI Components

#### Scanner Interface Components

```typescript
interface ScannerProps {
  type: 'URL' | 'EMAIL' | 'WHATSAPP' | 'QR' | 'SCREENSHOT' | 'JOB' | 'INVESTMENT';
  onScan: (input: string | File) => void;
  loading: boolean;
  result?: RiskResult;
}

// Common scanner component with type-specific input fields
const Scanner: React.FC<ScannerProps>
```

#### Dashboard Components

```typescript
interface DashboardProps {
  user: User;
  stats: DashboardStats;
  recentScans: ScanRecord[];
  insights: AIInsight[];
}

const Dashboard: React.FC<DashboardProps>
const RecentScanHistory: React.FC<{ scans: ScanRecord[] }>
const AIInsights: React.FC<{ insights: AIInsight[] }>
const NotificationPanel: React.FC<{ notifications: Notification[] }>
```

#### History Page Components

```typescript
interface HistoryPageProps {
  plan: string;
}

const ScanHistoryPage: React.FC<HistoryPageProps>
const HistoryFilters: React.FC<{ onFilter: (filter: HistoryFilter) => void }>
const HistoryTable: React.FC<{ scans: ScanRecord[]; onExport: () => void }>
const ExportButton: React.FC<{ plan: string; onExport: () => void }>
```

## Data Models

### Database Schema

#### users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  plan ENUM('FREE', 'PRO', 'BUSINESS') DEFAULT 'FREE',
  subscription_status ENUM('ACTIVE', 'EXPIRED', 'NONE') DEFAULT 'NONE',
  expiry_date DATETIME DEFAULT NULL,
  activation_date DATETIME DEFAULT NULL,
  last_activation_key VARCHAR(20) DEFAULT NULL,
  scans_today INT DEFAULT 0,
  scans_reset_date DATE DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_plan_status (plan, subscription_status)
);
```

#### scan_history Table (NEW)
```sql
CREATE TABLE scan_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scan_type ENUM('URL', 'EMAIL', 'WHATSAPP', 'QR', 'SCREENSHOT', 'JOB', 'INVESTMENT') NOT NULL,
  input TEXT NOT NULL,
  result VARCHAR(50) NOT NULL,
  risk_score INT NOT NULL,
  risk_details JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_scan_type (scan_type),
  INDEX idx_created_at (created_at)
);
```

#### payment_requests Table (UPDATED)
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_user_status (user_id, status)
);
```

#### activation_keys Table
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
  FOREIGN KEY (payment_request_id) REFERENCES payment_requests(id) ON DELETE SET NULL,
  INDEX idx_key (activation_key),
  INDEX idx_status (status)
);
```

#### blacklist_domains Table (NEW)
```sql
CREATE TABLE blacklist_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  pattern VARCHAR(255) DEFAULT NULL,
  category ENUM('PHISHING', 'MALWARE', 'SCAM', 'SPAM') NOT NULL,
  added_by INT DEFAULT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (added_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_domain (domain),
  INDEX idx_category (category)
);
```

#### admin_users Table
```sql
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  role ENUM('ADMIN', 'SUPER_ADMIN') DEFAULT 'ADMIN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### API Endpoints

#### Scanner Endpoints
- `POST /api/scan/url` - Scan URL
- `POST /api/scan/email` - Scan email content
- `POST /api/scan/whatsapp` - Scan WhatsApp message
- `POST /api/scan/qr` - Scan QR code (file upload)
- `POST /api/scan/image` - Scan screenshot (file upload)
- `POST /api/scan/job` - Scan job posting
- `POST /api/scan/invest` - Scan investment offer
- `GET /api/scan/quota` - Get remaining scans for today

#### Scan History Endpoints (NEW)
- `GET /api/scan-history` - Get filtered scan history
- `GET /api/scan-history/recent` - Get recent scans (5-10)
- `GET /api/scan-history/:id` - Get specific scan details
- `POST /api/scan-history/:id/export-pdf` - Generate PDF report
- `POST /api/scan-history/export-csv` - Export history as CSV (BUSINESS only)

#### Payment Endpoints (UPDATED - Remove Razorpay)
- `POST /api/payment-requests/submit` - Submit payment proof
- `GET /api/payment-requests/my-requests` - Get user's payment requests

#### Activation Endpoints
- `POST /api/activation/activate` - Activate subscription with key
- `GET /api/activation/status` - Get subscription status

#### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/payment-requests` - All payment requests
- `POST /api/admin/verify-payment` - Approve payment and generate key
- `POST /api/admin/reject-payment` - Reject payment request
- `GET /api/admin/activation-keys` - List all activation keys
- `POST /api/admin/revoke-key` - Revoke unused key
- `GET /api/admin/users` - List all users
- `GET /api/admin/screenshots/:filename` - Serve payment screenshot

#### Chatbot Endpoints (NEW)
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/faqs` - Get FAQ list

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Deterministic Risk Scoring (Idempotence)

*For any* valid input (URL, email, or message), when analyzed multiple times without changing the input or blacklist/domain data, the risk score and status classification SHALL be identical across all analyses.

**Validates: Requirements 1.13**

### Property 2: Input Type Detection Accuracy

*For any* string input, the Input_Validator SHALL correctly classify it as URL, EMAIL, or MESSAGE based on format patterns, and invalid formats SHALL be rejected with appropriate error messages.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 3: Risk Score Threshold Mapping

*For any* calculated risk score between 0-100, the status classification SHALL match the defined thresholds: 0-25→SAFE, 26-50→LOW RISK, 51-75→SUSPICIOUS, 76-100→DANGEROUS.

**Validates: Requirements 1.9, 1.10, 1.11, 1.12**

### Property 4: Risk Scoring Rules Application

*For any* input being analyzed, when specific risk indicators are present (HTTPS, blacklisted domain, suspicious keywords, short URL, new domain, multiple redirects), the risk score SHALL be adjusted by the exact specified amounts for each indicator.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

### Property 5: Scan History Persistence

*For any* successfully completed scan, a record SHALL be created in the scan_history table containing user_id, scan_type, input, result, risk_score, and timestamp, and this record SHALL be retrievable through the history endpoints.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 6: Plan-Based Access Control

*For any* user with a given plan (FREE, PRO, or BUSINESS), the accessible features and data SHALL strictly match the plan's restrictions including: scan history limits, retention days, search/filter access, and export capabilities.

**Validates: Requirements 3.4, 3.5, 3.6, 3.10, 3.11, 3.12, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11**

### Property 7: History Filtering and Search Correctness

*For any* scan history query with filters (scan type, date range) or search terms, all returned results SHALL match the specified criteria, and no records matching the criteria SHALL be excluded (within plan limits).

**Validates: Requirements 3.7, 3.8**

### Property 8: Activation Key Uniqueness and Format

*For any* generated activation key, it SHALL follow the format "BB-{PLAN}-{CODE}" where PLAN is "PRO" or "BUS" and CODE is 6 alphanumeric characters, and the key SHALL be unique across all keys in the database.

**Validates: Requirements 12.1, 12.2**

### Property 9: Activation Key Workflow

*For any* valid unused activation key, when activated by the key's designated user, the user's plan SHALL be updated to match the key's plan, the key status SHALL change to "USED", and the subscription SHALL have the correct expiry date (PRO: 30 days, BUSINESS: 90 days).

**Validates: Requirements 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10**

### Property 10: Payment Approval Workflow

*For any* pending payment request, when approved by an admin, an activation key SHALL be generated, the payment status SHALL change to "APPROVED", and the key SHALL be associated with the correct user and plan.

**Validates: Requirements 9.6, 9.7, 9.8, 9.9, 9.10**

### Property 11: Chatbot FAQ Response Consistency

*For any* predefined FAQ question submitted to the chatbot, the response SHALL match the stored FAQ answer exactly, and for questions without FAQ matches, the chatbot SHALL provide a helpful fallback response that directs users to appropriate scanners or support.

**Validates: Requirements 13.5, 13.6, 13.7, 13.8, 13.9, 13.10, 13.11**

### Property 12: Suspicious Keyword Detection

*For any* text input containing one or more suspicious keywords (win, free, click, urgent, OTP, verify, account, prize, winner, claim, congratulations), the risk score SHALL increase by 20 points for each distinct keyword occurrence.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

### Property 13: Domain Analysis Accuracy

*For any* valid URL input, when domain analysis is performed, if the domain is newly registered (<90 days) it SHALL add 25 points to the risk score, and if the URL involves more than 2 redirects it SHALL add 15 points to the risk score.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 14: Image Upload Functionality

*For any* scanner supporting image uploads (QR scanner, screenshot scanner), when a valid image file (PNG, JPEG, JPG) is uploaded, the system SHALL accept and process the file without errors and return analysis results.

**Validates: Requirements 5.6, 5.7**

## Error Handling

### Input Validation Errors

**Invalid Format Errors**:
- Return 400 Bad Request with message: "Invalid input format. Expected {type}."
- Include expected format examples in error response

**Empty Input Errors**:
- Return 400 Bad Request with message: "Input cannot be empty."

### Quota Exceeded Errors

**Daily Limit Reached**:
- Return 403 Forbidden with message: "You've used all {limit} free scans for today."
- Include `scansLeft: 0` and `upgrade: true` in response
- Suggest upgrading to PRO plan

### Authentication Errors

**Invalid Token**:
- Return 401 Unauthorized with message: "Authentication required."

**Expired Subscription**:
- Return 403 Forbidden with message: "Your subscription has expired. Please renew."

### Payment Processing Errors

**Invalid Screenshot**:
- Return 400 Bad Request with message: "Invalid file type. Only PNG and JPEG allowed."
- Maximum file size: 5MB

**Missing Transaction ID**:
- Return 400 Bad Request with message: "Transaction ID is required."

### Activation Key Errors

**Invalid Key Format**:
- Return 400 Bad Request with message: "Invalid activation key format."

**Key Already Used**:
- Return 403 Forbidden with message: "This activation key has already been used."

**Key Not Found**:
- Return 404 Not Found with message: "Invalid activation key."

**Key Revoked/Expired**:
- Return 403 Forbidden with message: "This key has been {status}."

### Admin Panel Errors

**Unauthorized Access**:
- Return 403 Forbidden with message: "Admin access required."

**Payment Already Processed**:
- Return 400 Bad Request with message: "Payment request is already {status}."

### Database Errors

**Connection Failures**:
- Log error details server-side
- Return 503 Service Unavailable with message: "Service temporarily unavailable. Please try again."

**Constraint Violations**:
- Log error details server-side
- Return 409 Conflict with user-friendly message based on constraint type

### External Service Errors

**WHOIS Lookup Timeout**:
- Continue analysis without domain age data
- Log warning for monitoring
- Do not fail entire scan

**Redirect Following Timeout**:
- Use redirect count up to timeout
- Continue with partial data
- Log warning for monitoring

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage.

**Unit Tests** focus on:
- Specific example inputs with known expected outputs
- Edge cases like empty inputs, boundary values, malformed data
- Error conditions and exception handling
- Integration points between components
- Database schema validation
- Admin workflow steps

**Property-Based Tests** focus on:
- Universal correctness properties across generated inputs
- Risk scoring determinism and consistency
- Access control enforcement across all plan combinations
- Input validation across random valid/invalid inputs
- Round-trip operations (generate key → use key → verify results)

**Property Test Configuration**:
- Use fast-check for JavaScript/TypeScript property-based testing
- Minimum 100 iterations per property test
- Each property test tagged with: `Feature: production-ready-improvements, Property {N}: {description}`

### Test Categories

#### 1. Risk Analysis Tests

**Unit Tests**:
- Test specific URLs from requirements (google.com → 5%, http://login-paytm-free.xyz → 95%)
- Test boundary cases (score exactly 25, 26, 50, 51, 75, 76)
- Test empty/null inputs
- Test malformed URLs

**Property Tests**:
- Property 1: Idempotence - same input always produces same score
- Property 2: Input validation - all inputs correctly classified
- Property 3: Score thresholds - all scores map to correct status
- Property 4: Scoring rules - indicators always adjust score correctly

#### 2. Scan History Tests

**Unit Tests**:
- Test saving a single scan record
- Test retrieving recent 5 scans
- Test empty history for new user
- Test database constraints (foreign keys)

**Property Tests**:
- Property 5: Persistence - every scan creates retrievable record
- Property 6: Plan restrictions - history always matches plan limits
- Property 7: Filtering - filtered results always match criteria

#### 3. Payment and Activation Tests

**Unit Tests**:
- Test payment submission with valid screenshot
- Test invalid file type rejection
- Test admin approval workflow steps
- Test key activation with specific keys

**Property Tests**:
- Property 8: Key uniqueness - generated keys are always unique and well-formed
- Property 9: Activation workflow - activation always updates user plan correctly
- Property 10: Payment approval - approval workflow always generates valid key

#### 4. Chatbot Tests

**Unit Tests**:
- Test each FAQ question returns correct answer
- Test unknown question fallback
- Test context-aware responses

**Property Tests**:
- Property 11: FAQ consistency - predefined questions always return correct answers

#### 5. UI/UX Tests

**Unit Tests**:
- Test "Start Free Scan" button is not present on Home/About pages
- Test Contact page displays correct email and phone
- Test Business plan shows "3 months" not "per month"
- Test payment page displays correct UPI ID
- Test image upload accepts PNG/JPEG files

#### 6. Integration Tests

**Unit Tests**:
- Test complete scan workflow: authenticate → scan → save history → retrieve
- Test complete payment workflow: submit → admin approve → activate key → verify plan updated
- Test admin login → view pending payments → approve → verify key generated
- Test user journey: register → scan → upgrade → activate → verify PRO features

#### 7. Database Tests

**Unit Tests**:
- Verify scan_history table exists with correct schema
- Verify blacklist_domains table exists
- Verify Razorpay columns removed from payments table
- Test all indexes exist
- Test foreign key constraints work

### Test Data

**Sample Blacklisted Domains**:
- login-paytm-free.xyz
- secure-verify-account.tk
- win-prize-now.ml
- free-money-claim.ga
- urgent-otp-share.cf

**Sample Safe Domains**:
- google.com
- github.com
- microsoft.com
- amazon.in
- openai.com

**Sample Suspicious Messages**:
- "Congratulations! You won ₹5,00,000. Click here immediately. Share your OTP."
- "Your bank account will be blocked. Verify immediately."
- "Work From Home ₹80,000 Salary. Registration Fee ₹999."

**Sample Safe Messages**:
- "Hi, can we meet tomorrow at 10 AM?"
- "Your Amazon order has been delivered successfully."
- "Meeting scheduled for 3 PM in conference room."

### Performance Testing

**Response Time Requirements**:
- Scanner endpoints: < 3 seconds (including external lookups)
- History retrieval: < 1 second for typical query
- Dashboard load: < 2 seconds
- Admin panel: < 2 seconds

**Load Testing**:
- Test concurrent scans from multiple users
- Test database query performance with 10,000+ scan records
- Test file upload with maximum allowed file size

### Security Testing

**Authentication**:
- Test invalid/expired JWT tokens are rejected
- Test admin endpoints require admin role
- Test users can only access their own data

**Input Sanitization**:
- Test SQL injection attempts in search/filter inputs
- Test XSS attempts in message scanning
- Test path traversal in screenshot filename

**File Upload Security**:
- Test file type validation (reject non-image files)
- Test file size limits (5MB max)
- Test malicious file content detection

## Implementation Notes

### Risk Scoring Implementation Details

**Keyword Detection**:
- Case-insensitive matching
- Count each unique keyword once (multiple occurrences of same word = 20 points total)
- Keywords list: ["win", "free", "click", "urgent", "otp", "verify", "account", "prize", "winner", "claim", "congratulations"]

**Short URL Detection**:
- Detect domains: bit.ly, tinyurl.com, goo.gl, ow.ly, t.co, is.gd, buff.ly
- Extract domain from URL and check against list

**HTTPS Detection**:
- Check URL protocol is "https://"
- Apply -10 points bonus for security

**Domain Age Lookup**:
- Use WHOIS API or DNS TXT records
- Implement timeout (2 seconds max)
- Fall back gracefully if unavailable
- Cache results for 24 hours

**Redirect Following**:
- Use HTTP HEAD requests to follow redirects
- Maximum depth: 5 redirects
- Timeout: 2 seconds per request
- Count redirects that return 301, 302, 307, 308 status codes

### Razorpay Removal Checklist

**Backend Files to Update**:
- Remove `razorpay` npm package from package.json
- Remove Razorpay imports from `routes/paymentRoutes.js`
- Remove Razorpay instance creation
- Remove `/api/payment/create-order` endpoint
- Remove `/api/payment/verify` endpoint
- Remove `/api/payment/webhook` endpoint
- Remove `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` from `.env`

**Database Updates**:
- Remove `payments` table or rename to `legacy_payments`
- Remove `razorpay_order_id` and `razorpay_payment_id` columns from payment_requests if they exist

**Frontend Files to Update**:
- Remove Razorpay SDK script from index.html
- Remove Razorpay checkout initialization code
- Remove `VITE_RAZORPAY_KEY_ID` from .env
- Update payment flow to use manual submission form instead

### Chatbot FAQ Database

Store FAQs as JSON or database table with structure:
```typescript
{
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  relatedLinks?: { text: string; url: string }[];
}
```

### PDF Report Generation

Use `pdfkit` or similar library to generate reports with:
- Header: BlockBridge ScamGuard AI logo, report date
- User Info: Name, email, plan
- Scan Details: Type, input, timestamp
- Risk Analysis: Score, status, indicators detected
- Recommendations: Specific actions based on risk level
- Footer: "Generated by BlockBridge ScamGuard AI"

### Frontend State Management

Use React Context or state management for:
- User authentication state
- Current plan and subscription status
- Scan quota remaining
- Recent scans cache
- Chatbot conversation history

### Environment Variables

**Backend (.env)**:
```
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=blockbridge
JWT_SECRET=your-jwt-secret
PORT=5000
ADMIN_EMAIL=admin@blockbridge.com
```

**Frontend (.env)**:
```
VITE_API_URL=https://your-backend-url.com
VITE_APP_NAME=BlockBridge ScamGuard AI
VITE_UPI_ID=6381487329@ybl
VITE_CONTACT_EMAIL=blockbridgescamguardai@gmail.com
VITE_CONTACT_PHONE=+91 6381487329
```

### Deployment Considerations

**Database Migrations**:
1. Create `scan_history` table
2. Create `blacklist_domains` table
3. Remove Razorpay-related columns
4. Add indexes for performance
5. Seed blacklist with initial malicious domains

**Vercel Configuration (Frontend)**:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

**Render Configuration (Backend)**:
- Build Command: `npm install`
- Start Command: `node index.js`
- Environment Variables: Set all from .env
- Health Check Path: `/api/health`

### Monitoring and Logging

**Key Metrics to Track**:
- Scan volume per hour/day
- Average risk scores by scan type
- Payment submission and approval rates
- Activation key usage rate
- Scan history query performance
- External API timeout frequency

**Logging Requirements**:
- Log all admin actions (payment approvals, key revocations)
- Log authentication failures
- Log external service timeouts
- Log database errors
- Log unusual risk scores (potential false positives/negatives)

### Future Enhancements

**Phase 2 Features**:
- Real-time scam alerts via email/SMS
- Machine learning model for improved risk detection
- Team collaboration features for BUSINESS plan
- API access for enterprise customers
- Automated blacklist updates from threat intelligence feeds
- Multi-language support for chatbot and interface
- Mobile app for iOS/Android
