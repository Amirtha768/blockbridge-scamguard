# Design Document

## Overview

The Professional Scam Detection System Improvements feature transforms the BlockBridge ScamGuard AI platform from a prototype with random results into a production-grade intelligent threat detection system. The design introduces a sophisticated AI scoring engine based on real security heuristics, implements comprehensive scan history tracking, streamlines the payment process by removing Razorpay, and improves information accuracy across all user-facing pages.

The core innovation is the intelligent scoring algorithm that analyzes multiple threat indicators—domain reputation, URL structure, content patterns, redirect behavior, and urgency markers—to produce reliable risk assessments. This replaces the current random number generation with deterministic, testable logic that users can trust.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Home    │  │  About   │  │Dashboard │  │ History  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                         │                                    │
│                    React Router                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                     HTTPS/JSON API
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       Backend Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Express.js REST API                       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Auth      │  Scanners  │  History  │  Admin          │ │
│  │  Routes    │  Routes    │  Routes   │  Routes         │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │           AI Scoring Engine                         │   │
│  │  • Input Validator                                  │   │
│  │  • URL Analyzer                                     │   │
│  │  • Content Analyzer                                 │   │
│  │  • Risk Calculator                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                      MySQL Driver
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Database Layer                          │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  users   │  │ scan_history │  │ payment_requests   │   │
│  └──────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Scan Request Flow:**
   - User submits content through Dashboard scanner
   - Frontend validates file types (for QR/Screenshot)
   - Request sent to `/api/scan/{type}` with authentication token
   - Backend authenticates user, checks quota
   - AI Scoring Engine validates input format
   - AI Scoring Engine analyzes content and calculates risk score
   - Result stored in scan_history table
   - Response returned to frontend with score, status, explanation
   - Dashboard updates quota display

2. **History Retrieval Flow:**
   - User navigates to Scan History page
   - Frontend requests `/api/scan/history` with filters
   - Backend queries scan_history filtered by user_id and plan limitations
   - Results paginated and returned
   - Frontend displays in table format
   - User can filter by type or search by content

3. **Payment Flow (Manual UPI):**
   - User selects plan on Pricing page
   - User makes UPI payment using displayed credentials
   - User uploads screenshot via PaymentUpload page
   - Admin reviews in AdminDashboard
   - Admin approves and generates activation key
   - User activates key in ActivateSubscription page
   - User plan upgraded, expiry date set

## Components and Interfaces

### Frontend Components

#### 1. Home Component (Modified)
**File:** `frontend/src/pages/Home.jsx`

**Changes:**
- Remove "Start Free Scan" button from hero section
- Keep all other sections unchanged
- Update hero actions to show only "View Pricing" button

**Interface:**
```typescript
interface HomeProps {}

// No new props, only UI modifications
```

#### 2. About Component (Modified)
**File:** `frontend/src/About.jsx`

**Changes:**
- Remove "Start Free Scan" button
- Remove "Business & Enterprise Solutions" card
- Update payment information section
- Update contact information section
- Add QR code image display

**New Constants:**
```javascript
const PAYMENT_INFO = {
  upiId: '6381487329@ybl',
  phone: '6381487329',
  email: 'blockbridgescamguardai@gmail.com',
  qrCodeImage: '/assets/payment-qr.png'
};

const CONTACT_INFO = {
  supportEmail: 'blockbridgescamguardai@gmail.com',
  responseTime: 'Within 24-48 hours',
  location: 'Online Global Support'
};
```

#### 3. Dashboard Component (Modified)
**File:** `frontend/src/pages/Dashboard.jsx`

**Changes:**
- Add Recent Scan History section
- Fetch and display last 10 scans
- Add "View All History" button
- Maintain existing scanner grid and stats

**New API Calls:**
```javascript
GET /api/scan/history?limit=10
```

**Interface:**
```typescript
interface ScanHistoryItem {
  id: number;
  scan_type: string;
  result: string;
  risk_score: number;
  created_at: string;
}
```

#### 4. ScanHistory Component (New)
**File:** `frontend/src/pages/ScanHistory.jsx`

**Features:**
- Filter dropdown (All, URL, Email, WhatsApp, QR, Screenshot, Job, Investment)
- Search box for input content
- Table display with columns: Date, Type, Status, Risk
- Pagination
- PDF export button (Pro/Business only)
- CSV export button (Business only)

**Interface:**
```typescript
interface ScanHistoryProps {}

interface ScanHistoryState {
  scans: ScanHistoryItem[];
  filter: ScanType | 'ALL';
  searchQuery: string;
  page: number;
  totalPages: number;
}

type ScanType = 'URL' | 'EMAIL' | 'WHATSAPP' | 'QR' | 'SCREENSHOT' | 'JOB' | 'INVESTMENT';
```

**API Calls:**
```javascript
GET /api/scan/history?filter={type}&search={query}&page={page}
GET /api/scan/history/export?format=pdf
GET /api/scan/history/export?format=csv  // Business only
```

#### 5. Pricing Component (Modified)
**File:** `frontend/src/pages/Pricing.jsx`

**Changes:**
- Remove all Razorpay script loading
- Remove Razorpay payment handler
- Update Business plan display: "₹499 / 3 months"
- Keep UPI payment information display
- Maintain redirect to PaymentUpload page

### Backend Components

#### 1. AI Scoring Engine (New)
**File:** `backend/utils/aiScoring.js`

**Purpose:** Core intelligence module that replaces random scoring with real heuristics

**Modules:**

**a. Input Validator**
```javascript
function validateInput(input, type) {
  // Returns: { valid: boolean, message: string }
  // Validates URL, email, text format
}
```

**b. URL Analyzer**
```javascript
function analyzeUrl(url) {
  // Returns: { score: number, indicators: string[] }
  // Checks:
  // - Protocol (HTTPS: -10 points)
  // - Blacklisted domains (+40 points)
  // - Short URLs (+10 points)
  // - Phone numbers in URL (+15 points)
  // - Suspicious TLDs (+15 points)
  // - Domain age (new domain: +25 points)
}
```

**c. Content Analyzer**
```javascript
function analyzeContent(text) {
  // Returns: { score: number, indicators: string[] }
  // Checks:
  // - Suspicious keywords (+20 per keyword)
  // - Urgency words (+20 points)
  // - Financial terms (+15 points)
  // - Personal info requests (+25 points)
}
```

**d. Risk Calculator**
```javascript
function calculateRisk(indicators) {
  // Returns: { score: number, status: string, explanation: string, recommendation: string }
  // Aggregates scores from analyzers
  // Categorizes: SAFE (0-25), LOW RISK (26-50), SUSPICIOUS (51-75), DANGEROUS (76-100)
}
```

**Data Structures:**
```javascript
// Blacklist database (in-memory for MVP, can move to DB)
const BLACKLISTED_DOMAINS = [
  'login-paytm-free.xyz',
  'secure-verify-account.com',
  'win-prize-now.net',
  // ... more domains
];

const SUSPICIOUS_KEYWORDS = [
  'prize', 'winner', 'click here', 'urgent', 'verify your account',
  'free money', 'lottery', 'otp', 'bank details', 'limited time',
  'claim now', 'congratulations', 'win', 'account lock', 'share password'
];

const URGENCY_WORDS = [
  'click now', 'act now', 'hurry', 'limited time', 'expires soon',
  'immediate action', 'urgent', 'last chance', 'don\'t miss'
];

const SHORT_URL_PATTERNS = [
  /bit\.ly/i, /tinyurl/i, /goo\.gl/i, /ow\.ly/i, /t\.co/i
];
```

#### 2. Scanner Routes (Modified)
**File:** `backend/routes/scamRoutes.js`

**Changes:**
- Replace `analyzeUrl()` with intelligent scoring
- Replace `analyzeText()` with intelligent scoring
- Add input validation before scoring
- Add scan history logging after each scan
- Keep quota checking logic

**Modified Functions:**
```javascript
async function performScan(req, res, scanType, input) {
  // 1. Check quota
  if (!await checkQuota(req, res)) return;
  
  // 2. Validate input
  const validation = validateInput(input, scanType);
  if (!validation.valid) {
    return res.status(400).json({ 
      message: 'Invalid Input - This does not appear to be a valid email, URL, QR code, or supported message' 
    });
  }
  
  // 3. Analyze with AI
  const result = await aiScoringEngine.analyze(input, scanType);
  
  // 4. Log to history
  await logScanHistory(req.user.id, scanType, input, result);
  
  // 5. Return result
  res.json(result);
}
```

#### 3. History Routes (New)
**File:** `backend/routes/historyRoutes.js`

**Endpoints:**

**GET /api/scan/history**
- Query params: `filter`, `search`, `page`, `limit`
- Returns paginated scan history for authenticated user
- Applies plan-based limitations
- Free: last 10 scans, 7-day window
- Pro: unlimited scans, 30-day window
- Business: unlimited scans, 90-day window

```javascript
router.get('/scan/history', authenticate, async (req, res) => {
  const { filter, search, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;
  
  // Get user plan
  const user = await getUserPlan(userId);
  
  // Apply plan limitations
  const limitations = getPlanLimitations(user.plan);
  
  // Build query
  const query = buildHistoryQuery(userId, filter, search, limitations);
  
  // Execute with pagination
  const results = await db.execute(query, [userId, limit, offset]);
  
  res.json({
    scans: results,
    page,
    totalPages: Math.ceil(totalCount / limit)
  });
});
```

**GET /api/scan/history/export**
- Query params: `format` (pdf | csv)
- Generates export file
- Pro: PDF only
- Business: PDF and CSV
- Returns file download

```javascript
router.get('/scan/history/export', authenticate, async (req, res) => {
  const { format } = req.query;
  const user = await getUserPlan(req.user.id);
  
  // Check permissions
  if (user.plan === 'FREE') {
    return res.status(403).json({ message: 'Upgrade required' });
  }
  
  if (format === 'csv' && user.plan !== 'BUSINESS') {
    return res.status(403).json({ message: 'Business plan required' });
  }
  
  // Get user's scan history
  const scans = await getScanHistory(req.user.id);
  
  // Generate file
  if (format === 'pdf') {
    const pdf = generatePDF(scans);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } else {
    const csv = generateCSV(scans);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }
});
```

#### 4. Payment Routes (Modified)
**File:** `backend/routes/paymentRoutes.js`

**Changes:**
- Remove all Razorpay imports
- Remove Razorpay instance creation
- Remove Razorpay webhook handler
- Remove Razorpay order creation endpoint
- Keep manual payment request routes

**Removed:**
```javascript
// DELETE these:
import Razorpay from 'razorpay';
const razorpay = new Razorpay({ ... });
router.post('/create-order', ...);
router.post('/webhook', ...);
router.post('/verify', ...);
```

## Data Models

### scan_history Table (New)

```sql
CREATE TABLE scan_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  scan_type ENUM('URL','EMAIL','WHATSAPP','QR','SCREENSHOT','JOB','INVESTMENT') NOT NULL,
  input TEXT NOT NULL,
  result VARCHAR(50) NOT NULL,
  risk_score INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_user_type (user_id, scan_type)
);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users table
- `scan_type`: Type of scan performed
- `input`: Original input content (URL, message, etc.)
- `result`: Status (SAFE, LOW RISK, SUSPICIOUS, DANGEROUS)
- `risk_score`: Integer 0-100
- `created_at`: Timestamp

**Indexes:**
- `idx_user_created`: Optimizes "recent scans" queries
- `idx_user_type`: Optimizes filtered queries

### users Table (Modified)

**Existing fields retained, no changes to schema**

The current schema already supports:
- Plan tracking (FREE, PRO, BUSINESS)
- Subscription status and expiry
- Scan quota management

### payments Table (Modified)

**Changes:**
- Remove `razorpay_order_id` column (migration required)
- Remove `razorpay_payment_id` column (migration required)
- This table can be deprecated since manual payment flow uses `payment_requests` table

**Migration:**
```sql
-- Option 1: Drop the payments table (if not in use)
DROP TABLE IF EXISTS payments;

-- Option 2: Archive and remove Razorpay columns
ALTER TABLE payments DROP COLUMN razorpay_order_id;
ALTER TABLE payments DROP COLUMN razorpay_payment_id;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### AI Scoring Algorithm Properties

Property 1: HTTPS reduces risk score
*For any* URL containing the HTTPS protocol, the risk score should be reduced by 10 points compared to the same URL with HTTP
**Validates: Requirements 3.3**

Property 2: Blacklisted domains increase risk
*For any* URL that matches a domain in the blacklist, the risk score should increase by at least 40 points
**Validates: Requirements 3.4**

Property 3: Suspicious keywords accumulate risk
*For any* content containing N suspicious keywords, the risk score should increase by N × 20 points
**Validates: Requirements 3.5**

Property 4: Short URLs increase risk
*For any* URL matching short URL patterns (bit.ly, tinyurl, goo.gl, etc.), the risk score should increase by 10 points
**Validates: Requirements 3.6**

Property 5: Urgency words increase risk
*For any* content containing urgency words (click now, limited time, hurry, etc.), the risk score should increase by 20 points
**Validates: Requirements 3.9**

Property 6: Phone numbers in URLs increase risk
*For any* URL containing a phone number pattern, the risk score should increase by 15 points
**Validates: Requirements 3.10**

Property 7: Risk categorization boundaries
*For any* calculated risk score, the status categorization should be: SAFE (0-25), LOW RISK (26-50), SUSPICIOUS (51-75), or DANGEROUS (76-100)
**Validates: Requirements 3.11, 3.12, 3.13, 3.14**

### Input Validation Properties

Property 8: Invalid input rejection
*For any* invalid input submitted to any scanner, the system should return the error message "Invalid Input - This does not appear to be a valid email, URL, QR code, or supported message" without performing analysis
**Validates: Requirements 3.2, 13.5**

Property 9: Input validation precedes analysis
*For any* scan request, input validation should complete before AI analysis begins
**Validates: Requirements 3.1**

Property 10: File type validation
*For any* file upload to QR or Screenshot scanners, the system should validate that the file is an image format before processing
**Validates: Requirements 13.3, 13.4**

### Scan History Logging Properties

Property 11: Successful scans create history records
*For any* successfully completed scan, a corresponding record should be inserted into the scan_history table with all required fields (user_id, scan_type, input, result, risk_score, created_at)
**Validates: Requirements 4.8, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**

Property 12: History records belong to authenticated user
*For any* scan history record created, the user_id field should match the authenticated user performing the scan
**Validates: Requirements 12.2**

### History Display Properties

Property 13: History entries contain complete information
*For any* scan history entry displayed on the dashboard or history page, it should include date/time, scan type, result status, and risk score percentage
**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

Property 14: Dashboard shows recent scans
*For any* dashboard load, the recent scan history section should display the 10 most recent scans (or fewer if less than 10 scans exist)
**Validates: Requirements 5.6**

### Plan-Based Access Properties

Property 15: Free plan history limitations
*For any* Free plan user accessing scan history, only the last 10 scans from the past 7 days should be displayed
**Validates: Requirements 8.1, 8.2**

Property 16: Pro plan history access
*For any* Pro plan user accessing scan history, all scans from the past 30 days should be displayed with PDF export functionality available
**Validates: Requirements 8.4**

Property 17: Business plan history access
*For any* Business plan user accessing scan history, all scans from the past 90 days should be displayed with both PDF and CSV export functionality available
**Validates: Requirements 8.6, 8.7**

Property 18: Export availability by plan
*For any* user viewing the scan history page, the PDF download button should be visible if and only if their plan is Pro or Business, and CSV download should be visible if and only if their plan is Business
**Validates: Requirements 7.7, 7.8**

### Filtering and Search Properties

Property 19: Type filter accuracy
*For any* scan type filter selection, the displayed results should contain only scans matching that type
**Validates: Requirements 7.5**

Property 20: Search query matching
*For any* search query entered in the scan history search box, the displayed results should contain only scans where the input content matches the query
**Validates: Requirements 7.6**

### Error Handling Properties

Property 21: Database error handling
*For any* database operation failure, the system should return a server error message and log the error to the console
**Validates: Requirements 14.1, 14.5**

Property 22: Quota exceeded error format
*For any* scan request that exceeds the daily limit for a Free user, the system should return an error message containing upgrade information
**Validates: Requirements 14.2**

Property 23: File upload error handling
*For any* failed file upload, the system should return an error message describing the upload issue
**Validates: Requirements 14.3**

Property 24: Homepage image upload handling
*For any* image uploaded on the homepage, the system should either process it successfully or return a clear error message
**Validates: Requirements 15.2, 15.3**

### Admin Access Properties

Property 25: Admin authentication and access
*For any* admin user with valid credentials, login should succeed and grant access to the admin dashboard with payment management capabilities
**Validates: Requirements 11.3**

## Error Handling

### Error Categories

**1. Validation Errors (400)**
- Invalid input format
- Missing required fields
- File type mismatch
- File size exceeded

**Response Format:**
```javascript
{
  success: false,
  message: "Invalid Input - This does not appear to be a valid email, URL, QR code, or supported message",
  code: "VALIDATION_ERROR"
}
```

**2. Authentication Errors (401)**
- Missing or invalid token
- Expired token
- Insufficient permissions

**Response Format:**
```javascript
{
  success: false,
  message: "Unauthorized. Please log in.",
  code: "AUTH_ERROR"
}
```

**3. Quota Errors (403)**
- Daily scan limit exceeded
- Feature not available for plan tier
- Export not allowed for Free users

**Response Format:**
```javascript
{
  success: false,
  message: "You've used all 5 free scans for today.",
  upgrade: true,
  scansLeft: 0,
  code: "QUOTA_EXCEEDED"
}
```

**4. Server Errors (500)**
- Database connection failure
- File system errors
- External API failures

**Response Format:**
```javascript
{
  success: false,
  message: "Server error. Please try again later.",
  code: "SERVER_ERROR"
}
```

### Error Handling Strategies

**Backend:**
- Try-catch blocks around all async operations
- Database transaction rollback on failures
- Detailed error logging with context (user ID, operation, timestamp)
- Sanitized error messages for client (no stack traces)

**Frontend:**
- Toast notifications for user-facing errors
- Inline validation feedback
- Graceful degradation (show cached data on fetch failure)
- Retry mechanisms for network errors

**Example Implementation:**
```javascript
async function performScan(scanType, input) {
  try {
    // Validate input
    const validation = validateInput(input, scanType);
    if (!validation.valid) {
      throw new ValidationError(validation.message);
    }
    
    // Check quota
    const quotaCheck = await checkUserQuota(userId);
    if (!quotaCheck.allowed) {
      throw new QuotaError('Daily scan limit exceeded', { 
        upgrade: true, 
        scansLeft: 0 
      });
    }
    
    // Perform analysis
    const result = await aiScoringEngine.analyze(input, scanType);
    
    // Log to history
    await logScanHistory(userId, scanType, input, result);
    
    return { success: true, ...result };
    
  } catch (error) {
    // Log error
    logger.error('Scan failed', { 
      userId, 
      scanType, 
      error: error.message,
      stack: error.stack 
    });
    
    // Return appropriate error response
    if (error instanceof ValidationError) {
      return { success: false, message: error.message, code: 'VALIDATION_ERROR' };
    } else if (error instanceof QuotaError) {
      return { success: false, ...error.details, code: 'QUOTA_EXCEEDED' };
    } else {
      return { success: false, message: 'Server error', code: 'SERVER_ERROR' };
    }
  }
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both **unit testing** and **property-based testing** for comprehensive coverage. Unit tests validate specific examples and edge cases, while property tests verify universal correctness properties across all inputs.

### Unit Testing

**Focus Areas:**
- Specific UI elements (button removal, text updates)
- Database schema validation
- Admin panel functionality
- Specific scan examples (google.com, phishing URLs)
- Edge cases (empty history, no scans, upload failures)
- Integration points between components

**Example Unit Tests:**
```javascript
describe('About Page Updates', () => {
  test('should not display Start Free Scan button', () => {
    render(<About />);
    expect(screen.queryByText('Start Free Scan')).not.toBeInTheDocument();
  });
  
  test('should display correct UPI ID', () => {
    render(<About />);
    expect(screen.getByText('6381487329@ybl')).toBeInTheDocument();
  });
  
  test('should not display Business & Enterprise Solutions card', () => {
    render(<About />);
    expect(screen.queryByText(/Business & Enterprise Solutions/i)).not.toBeInTheDocument();
  });
});

describe('Specific Scan Examples', () => {
  test('google.com should return SAFE status with low risk score', async () => {
    const result = await scanURL('https://google.com');
    expect(result.status).toBe('SAFE');
    expect(result.score).toBeLessThan(25);
  });
  
  test('phishing URL should return DANGEROUS status', async () => {
    const result = await scanURL('http://login-paytm-free.xyz');
    expect(result.status).toBe('DANGEROUS');
    expect(result.score).toBeGreaterThan(75);
  });
});
```

### Property-Based Testing

**Testing Library:** Use `fast-check` (JavaScript/TypeScript) for property-based testing

**Configuration:**
- Minimum 100 iterations per property test
- Each test must reference its design document property with a comment tag
- Tag format: `// Feature: professional-scam-detection-improvements, Property {N}: {property description}`

**Property Test Examples:**

```javascript
import fc from 'fast-check';

// Feature: professional-scam-detection-improvements, Property 1: HTTPS reduces risk score
test('HTTPS URLs have lower risk scores than HTTP equivalents', () => {
  fc.assert(
    fc.property(
      fc.webUrl(), // Generate random URLs
      (url) => {
        const httpsUrl = url.replace(/^http:/, 'https:');
        const httpUrl = url.replace(/^https:/, 'http:');
        
        const httpsResult = analyzeUrl(httpsUrl);
        const httpResult = analyzeUrl(httpUrl);
        
        // HTTPS should have 10 points lower score
        expect(httpsResult.score).toBe(httpResult.score - 10);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: professional-scam-detection-improvements, Property 3: Suspicious keywords accumulate risk
test('Risk score increases by 20 points per suspicious keyword', () => {
  fc.assert(
    fc.property(
      fc.array(fc.constantFrom(...SUSPICIOUS_KEYWORDS), { minLength: 1, maxLength: 5 }),
      fc.string(), // Random filler text
      (keywords, fillerText) => {
        const content = `${fillerText} ${keywords.join(' ')}`;
        const result = analyzeContent(content);
        
        // Score should include 20 points per keyword
        const keywordScore = keywords.length * 20;
        expect(result.score).toBeGreaterThanOrEqual(keywordScore);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: professional-scam-detection-improvements, Property 7: Risk categorization boundaries
test('Risk scores are correctly categorized into status levels', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 100 }), // Generate random risk scores
      (score) => {
        const status = categorizeRisk(score);
        
        if (score >= 0 && score <= 25) {
          expect(status).toBe('SAFE');
        } else if (score >= 26 && score <= 50) {
          expect(status).toBe('LOW RISK');
        } else if (score >= 51 && score <= 75) {
          expect(status).toBe('SUSPICIOUS');
        } else if (score >= 76 && score <= 100) {
          expect(status).toBe('DANGEROUS');
        }
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: professional-scam-detection-improvements, Property 11: Successful scans create history records
test('All successful scans create complete history records', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('URL', 'EMAIL', 'WHATSAPP', 'QR', 'SCREENSHOT', 'JOB', 'INVESTMENT'),
      fc.string({ minLength: 1 }),
      async (scanType, input) => {
        const userId = await createTestUser();
        
        // Perform scan
        await performScan(userId, scanType, input);
        
        // Query history
        const history = await getScanHistory(userId);
        const latestScan = history[0];
        
        // Verify all fields present
        expect(latestScan.user_id).toBe(userId);
        expect(latestScan.scan_type).toBe(scanType);
        expect(latestScan.input).toBe(input);
        expect(latestScan.result).toBeDefined();
        expect(latestScan.risk_score).toBeGreaterThanOrEqual(0);
        expect(latestScan.risk_score).toBeLessThanOrEqual(100);
        expect(latestScan.created_at).toBeDefined();
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: professional-scam-detection-improvements, Property 15: Free plan history limitations
test('Free plan users see only last 10 scans from past 7 days', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 11, max: 50 }), // Generate various numbers of scans
      async (numScans) => {
        const user = await createFreeUser();
        
        // Create scans over 14 days
        for (let i = 0; i < numScans; i++) {
          const daysAgo = Math.floor((i / numScans) * 14); // Spread over 14 days
          await createScan(user.id, daysAgo);
        }
        
        // Fetch history
        const history = await getHistory(user.id, 'FREE');
        
        // Should have max 10 scans
        expect(history.length).toBeLessThanOrEqual(10);
        
        // All scans should be within 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        history.forEach(scan => {
          expect(new Date(scan.created_at)).toBeGreaterThanOrEqual(sevenDaysAgo);
        });
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: professional-scam-detection-improvements, Property 19: Type filter accuracy
test('Type filters return only matching scan types', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('URL', 'EMAIL', 'WHATSAPP', 'QR', 'SCREENSHOT'),
      async (filterType) => {
        const user = await createTestUser();
        
        // Create mixed scans
        await createScan(user.id, 'URL');
        await createScan(user.id, 'EMAIL');
        await createScan(user.id, 'WHATSAPP');
        
        // Apply filter
        const filtered = await getHistory(user.id, { filter: filterType });
        
        // All results should match filter
        filtered.forEach(scan => {
          expect(scan.scan_type).toBe(filterType);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

- **Unit Tests:** 80%+ code coverage
- **Property Tests:** All 25 correctness properties implemented
- **Integration Tests:** Critical user flows (signup → scan → history)
- **E2E Tests:** Key user journeys (pricing → payment → activation)

### Testing Tools

- **Frontend:** Jest, React Testing Library, fast-check
- **Backend:** Jest, Supertest, fast-check
- **E2E:** Playwright or Cypress (optional)
- **Database:** In-memory SQLite for tests, or test MySQL instance

### CI/CD Integration

- Run all tests on every pull request
- Property tests must pass with 100 iterations minimum
- No merge until all tests pass
- Track test execution time (warn if property tests exceed 5 minutes)
