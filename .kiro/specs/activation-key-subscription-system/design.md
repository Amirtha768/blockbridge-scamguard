# Design Document

## Overview

The Activation Key-Based Subscription System introduces an alternative payment workflow for BlockBridge ScamGuard AI that operates alongside the existing Razorpay integration. This system addresses scenarios where users prefer manual UPI payments or when automated payment processing faces regulatory or technical challenges.

The system implements a four-stage workflow:
1. **Payment Submission**: Users select a plan, make a UPI payment, and submit proof (screenshot + transaction ID)
2. **Admin Verification**: Administrators review payment proofs and approve or reject requests
3. **Key Generation**: System generates cryptographically secure activation keys for approved payments
4. **User Activation**: Users enter their activation keys to unlock their subscriptions

### Design Goals

- **Administrative Control**: Full oversight of payment verification and subscription activation
- **Security**: Cryptographically random keys prevent guessing, duplication, and unauthorized access
- **Traceability**: Complete audit trail from payment submission through activation
- **Integration**: Seamless integration with existing authentication, database, and UI patterns
- **User Experience**: Clear workflow with immediate feedback and error handling

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├──────────────────┬──────────────────┬──────────────────────────┤
│ Payment          │ Activation       │ Admin Dashboard          │
│ Submission Page  │ Page             │ Pages                    │
└────────┬─────────┴────────┬─────────┴───────────┬──────────────┘
         │                  │                     │
         │ HTTP/JSON        │ HTTP/JSON           │ HTTP/JSON
         │                  │                     │
┌────────▼──────────────────▼─────────────────────▼──────────────┐
│                    Backend (Express.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  activationRoutes.js    │  adminRoutes.js                       │
│  - Submit payment       │  - List payment requests              │
│  - Activate key         │  - Approve/reject payments            │
│                         │  - Generate keys                      │
│                         │  - Manage keys                        │
└────────┬────────────────┴───────────────────────────────────────┘
         │
         │ MySQL2 Pool
         │
┌────────▼─────────────────────────────────────────────────────────┐
│                    MySQL Database                                │
├──────────────────────────────────────────────────────────────────┤
│  payment_requests         activation_keys         users          │
│  - id                    - id                     - id            │
│  - user_id               - key                    - email         │
│  - plan                  - user_id                - plan          │
│  - screenshot_url        - plan                   - activation_date│
│  - transaction_id        - generated_at           - expiry_date   │
│  - status                - activated_at           - ...           │
│  - created_at            - expiry_date                            │
│                          - status                                 │
│                          - used                                   │
└──────────────────────────────────────────────────────────────────┘
```

### File Structure

**Backend:**
```
backend/
├── routes/
│   ├── activationRoutes.js    (User payment submission and activation)
│   ├── adminRoutes.js          (Admin verification and key management)
│   └── ...
├── middleware/
│   ├── auth.js                 (Existing: JWT authentication)
│   └── adminAuth.js            (New: Admin role verification)
├── utils/
│   └── keyGenerator.js         (Activation key generation logic)
├── uploads/
│   └── payment-screenshots/    (Payment proof storage)
├── db.js                       (Database schema updates)
└── index.js                    (Route registration)
```

**Frontend:**
```
frontend/src/
├── pages/
│   ├── PaymentSubmission.jsx
│   ├── ActivateSubscription.jsx
│   ├── AdminPaymentVerification.jsx
│   ├── AdminKeyManagement.jsx
│   └── Dashboard.jsx           (Updated: Show subscription info)
├── styles/
│   └── activation.css          (Activation system styling)
└── App.jsx                     (Route registration)
```



## Components and Interfaces

### Backend API Endpoints

#### User-Facing Endpoints (activationRoutes.js)

**POST /api/activation/submit-payment**
```javascript
Request:
{
  "plan": "PRO" | "BUSINESS",
  "transactionId": string,
  "screenshot": File (multipart/form-data)
}

Response (Success - 201):
{
  "success": true,
  "message": "Payment request submitted successfully",
  "requestId": number
}

Response (Error - 400/500):
{
  "success": false,
  "message": string
}
```

**POST /api/activation/activate**
```javascript
Request:
{
  "activationKey": string  // Format: BBSG-XXXX-XXXX-XXXX
}

Response (Success - 200):
{
  "success": true,
  "message": "Subscription activated successfully",
  "subscription": {
    "plan": string,
    "activationDate": string,
    "expiryDate": string,
    "daysRemaining": number
  }
}

Response (Error - 400/403/404):
{
  "success": false,
  "message": string,
  "errorCode": "INVALID_KEY" | "NOT_YOUR_KEY" | "ALREADY_USED" | "EXPIRED" | "REVOKED"
}
```

#### Admin Endpoints (adminRoutes.js)

**GET /api/admin/payment-requests**
```javascript
Query Parameters:
  status: "ALL" | "PENDING" | "APPROVED" | "REJECTED" (default: "PENDING")
  page: number (default: 1)
  limit: number (default: 20)

Response (200):
{
  "requests": [
    {
      "id": number,
      "userId": number,
      "userName": string,
      "userEmail": string,
      "plan": string,
      "screenshotUrl": string,
      "transactionId": string,
      "status": string,
      "createdAt": string
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

**POST /api/admin/payment-requests/:id/approve**
```javascript
Response (200):
{
  "success": true,
  "message": "Payment approved and activation key generated",
  "activationKey": string,
  "keyId": number
}

Response (Error - 404/500):
{
  "success": false,
  "message": string
}
```

**POST /api/admin/payment-requests/:id/reject**
```javascript
Request (optional):
{
  "reason": string
}

Response (200):
{
  "success": true,
  "message": "Payment request rejected"
}
```

**GET /api/admin/activation-keys**
```javascript
Query Parameters:
  status: "ALL" | "UNUSED" | "USED" | "EXPIRED" | "REVOKED" (default: "ALL")
  search: string (searches key and user email)
  page: number (default: 1)
  limit: number (default: 50)

Response (200):
{
  "keys": [
    {
      "id": number,
      "key": string,
      "userId": number,
      "userEmail": string,
      "plan": string,
      "generatedAt": string,
      "activatedAt": string | null,
      "expiryDate": string | null,
      "status": string,
      "used": boolean
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

**POST /api/admin/activation-keys/:id/revoke**
```javascript
Response (200):
{
  "success": true,
  "message": "Activation key revoked successfully"
}
```

**POST /api/admin/activation-keys/:id/expire**
```javascript
Response (200):
{
  "success": true,
  "message": "Activation key marked as expired"
}
```



### Core Utility Functions

#### keyGenerator.js

```javascript
/**
 * Generates a cryptographically random activation key
 * Format: BBSG-XXXX-XXXX-XXXX
 * Character set: Alphanumeric (uppercase letters and digits), excluding ambiguous characters (0, O, I, 1, L)
 */
export function generateActivationKey(): string

/**
 * Validates activation key format
 * Returns true if format matches BBSG-XXXX-XXXX-XXXX with valid characters
 */
export function validateKeyFormat(key: string): boolean

/**
 * Generates a unique activation key that doesn't exist in database
 * Retries up to 5 times if collision detected
 */
export async function generateUniqueKey(db: Pool): Promise<string>
```

### Frontend Components

#### PaymentSubmission.jsx

State Management:
```javascript
{
  selectedPlan: null | { id: string, name: string, price: number, duration: number },
  screenshot: null | File,
  transactionId: string,
  uploading: boolean,
  submitted: boolean,
  error: string
}
```

Key Functions:
- `handlePlanSelect(plan)`: Set selected plan
- `handleScreenshotUpload(file)`: Validate and set screenshot file
- `handleSubmit()`: Submit payment request to backend with multipart form data
- `validateForm()`: Ensure all fields are filled before submission

#### ActivateSubscription.jsx

State Management:
```javascript
{
  activationKey: string,
  activating: boolean,
  success: boolean,
  error: string,
  subscription: null | { plan, activationDate, expiryDate, daysRemaining }
}
```

Key Functions:
- `handleKeyInput(key)`: Format key as user types (auto-add hyphens)
- `handleActivate()`: Send activation request to backend
- `formatKeyDisplay(key)`: Display key in BBSG-XXXX-XXXX-XXXX format

#### AdminPaymentVerification.jsx

State Management:
```javascript
{
  requests: PaymentRequest[],
  selectedRequest: null | PaymentRequest,
  statusFilter: "PENDING" | "APPROVED" | "REJECTED" | "ALL",
  loading: boolean,
  processing: boolean,
  pagination: { page, limit, total, totalPages }
}
```

Key Functions:
- `fetchPaymentRequests(status, page)`: Load payment requests from API
- `handleApprove(requestId)`: Approve payment and generate key
- `handleReject(requestId, reason)`: Reject payment with optional reason
- `viewScreenshot(url)`: Open screenshot in modal or new tab

#### AdminKeyManagement.jsx

State Management:
```javascript
{
  keys: ActivationKey[],
  statusFilter: "ALL" | "UNUSED" | "USED" | "EXPIRED" | "REVOKED",
  searchQuery: string,
  loading: boolean,
  pagination: { page, limit, total, totalPages }
}
```

Key Functions:
- `fetchKeys(status, search, page)`: Load activation keys from API
- `handleRevoke(keyId)`: Revoke activation key
- `handleExpire(keyId)`: Mark key as expired
- `handleSearch(query)`: Filter keys by search term
- `copyToClipboard(key)`: Copy activation key to clipboard



## Data Models

### Database Schema Updates

#### New Table: payment_requests

```sql
CREATE TABLE payment_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('PRO', 'BUSINESS') NOT NULL,
  screenshot_url VARCHAR(500) NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user_status (user_id, status),
  INDEX idx_created_at (created_at DESC)
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `user_id`: References users table (who submitted the payment)
- `plan`: Which subscription plan was purchased
- `screenshot_url`: Relative path to uploaded payment screenshot
- `transaction_id`: UPI transaction ID entered by user
- `status`: Current verification status
- `created_at`: When request was submitted
- `updated_at`: Last modification timestamp

**Indexes:**
- `idx_status`: Fast filtering by status for admin dashboard
- `idx_user_status`: Efficient user-specific queries
- `idx_created_at`: Ordering by submission date

#### New Table: activation_keys

```sql
CREATE TABLE activation_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_code VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  plan ENUM('PRO', 'BUSINESS') NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  activated_at DATETIME DEFAULT NULL,
  expiry_date DATETIME DEFAULT NULL,
  status ENUM('UNUSED', 'USED', 'EXPIRED', 'REVOKED') DEFAULT 'UNUSED',
  used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_key_code (key_code),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_key_user (key_code, user_id)
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `key_code`: The actual activation key (BBSG-XXXX-XXXX-XXXX format)
- `user_id`: References users table (who owns this key)
- `plan`: Which plan this key activates
- `generated_at`: When admin approved payment and key was created
- `activated_at`: When user successfully used the key (NULL if unused)
- `expiry_date`: When the subscription expires (calculated upon activation)
- `status`: Current key status
- `used`: Boolean flag for quick checking

**Indexes:**
- `idx_key_code`: Unique index for fast key lookup and collision prevention
- `idx_user_id`: Find all keys for a specific user
- `idx_status`: Filter keys by status in admin panel
- `idx_key_user`: Composite index for activation validation (key + user match)

#### Updated Table: users

```sql
ALTER TABLE users 
ADD COLUMN activation_date DATETIME DEFAULT NULL,
ADD COLUMN expiry_date DATETIME DEFAULT NULL;
```

**New Fields:**
- `activation_date`: When user activated their current subscription
- `expiry_date`: When current subscription expires (used to check if subscription is active)

**Note:** These fields already exist in the codebase schema but may need migration if missing.

### Data Flow Diagrams

#### Payment Submission Flow

```
User                    Frontend              Backend              Database
 |                         |                      |                    |
 |--Select Plan----------->|                      |                    |
 |                         |                      |                    |
 |--Upload Screenshot----->|                      |                    |
 |--Enter Transaction ID-->|                      |                    |
 |                         |                      |                    |
 |--Submit---------------->|--POST /submit------->|                    |
 |                         |  (multipart)         |                    |
 |                         |                      |--Save Screenshot-->|
 |                         |                      |                    |
 |                         |                      |--INSERT payment--->|
 |                         |                      |   _requests        |
 |                         |                      |                    |
 |                         |<--201 Created--------|<--requestId--------|
 |<--Success Message-------|                      |                    |
```

#### Admin Approval Flow

```
Admin                   Frontend              Backend              Database
 |                         |                      |                    |
 |--View Pending---------->|--GET /payment------->|                    |
 |                         |  requests?status=    |--SELECT FROM------>|
 |                         |  PENDING             |  payment_requests  |
 |                         |                      |                    |
 |<--List of Requests------|<--200 OK-------------|<--Rows-------------|
 |                         |                      |                    |
 |--Review Screenshot----->|                      |                    |
 |--Verify Transaction---->|                      |                    |
 |                         |                      |                    |
 |--Click Approve--------->|--POST /approve------>|                    |
 |                         |  /:id                |                    |
 |                         |                      |--Generate Key----->|
 |                         |                      |                    |
 |                         |                      |--INSERT INTO------>|
 |                         |                      |  activation_keys   |
 |                         |                      |                    |
 |                         |                      |--UPDATE status---->|
 |                         |                      |  payment_requests  |
 |                         |                      |                    |
 |<--Key Generated---------|<--200 OK-------------|<--Success----------|
```

#### User Activation Flow

```
User                    Frontend              Backend              Database
 |                         |                      |                    |
 |--Navigate to Activate-->|                      |                    |
 |                         |                      |                    |
 |--Enter Key------------->|                      |                    |
 |  BBSG-XXXX-XXXX-XXXX    |                      |                    |
 |                         |                      |                    |
 |--Click Activate-------->|--POST /activate----->|                    |
 |                         |  { activationKey }   |                    |
 |                         |                      |--SELECT key------->|
 |                         |                      |  WHERE key_code    |
 |                         |                      |  AND user_id       |
 |                         |                      |                    |
 |                         |                      |<--Validate---------|
 |                         |                      |                    |
 |                         |                      |--UPDATE users----->|
 |                         |                      |  SET plan,         |
 |                         |                      |  activation_date,  |
 |                         |                      |  expiry_date       |
 |                         |                      |                    |
 |                         |                      |--UPDATE key------->|
 |                         |                      |  SET status=USED,  |
 |                         |                      |  activated_at      |
 |                         |                      |                    |
 |<--Subscription Active---|<--200 OK-------------|<--Success----------|
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

**Redundancies Eliminated:**
1. Requirement 3.1 (mark as PENDING) is redundant with 2.4 (create Payment_Request with PENDING status)
2. Requirements 11.2, 11.3, 11.4, 11.7 duplicate validation rules from Requirements 5.4, 7.4, 7.3, and 2.7 respectively
3. Payment request data storage (2.5) is part of the same property as payment request creation (2.4)

**Properties Combined:**
1. Activation key linking (5.6, 5.7) combined into single property about correct metadata
2. Activation process steps (7.7, 7.9, 7.10) combined into single property about complete activation
3. Key generation metadata (5.8, 5.9) combined into single property about initial state

### Testable Properties


Property 1: Payment request creation with complete data
*For any* valid payment submission (plan, screenshot, transaction ID), creating a payment request should result in a database record with status "PENDING" containing all submitted data (user_id, plan, screenshot URL, transaction ID, and timestamp).
**Validates: Requirements 2.4, 2.5**

Property 2: Invalid payment rejection
*For any* payment submission missing required fields or with invalid data, the system should reject the submission and return an error message.
**Validates: Requirements 2.6**

Property 3: Image format acceptance
*For any* file upload in JPG, JPEG, PNG, or WebP format, the system should accept it as a valid screenshot.
**Validates: Requirements 2.7**

Property 4: Payment request ordering
*For any* set of payment requests, when retrieved from the database, they should be ordered by creation timestamp with newest first.
**Validates: Requirements 3.3**

Property 5: Payment approval status update
*For any* payment request, when approved by an admin, its status should be updated to "APPROVED" in the database.
**Validates: Requirements 4.7**

Property 6: Payment rejection status update
*For any* payment request, when rejected by an admin, its status should be updated to "REJECTED" in the database.
**Validates: Requirements 4.8**

Property 7: Payment request filtering
*For any* status filter (ALL, PENDING, APPROVED, REJECTED), the system should return only payment requests matching that status.
**Validates: Requirements 4.9**

Property 8: Automatic key generation on approval
*For any* payment request approval, the system should automatically generate and store a unique activation key.
**Validates: Requirements 5.1**

Property 9: Activation key format consistency
*For any* generated activation key, it must match the format BBSG-XXXX-XXXX-XXXX where X is an alphanumeric character (excluding ambiguous characters).
**Validates: Requirements 5.2**

Property 10: Activation key uniqueness
*For any* generated activation key, it must be unique (not exist in the activation_keys table).
**Validates: Requirements 5.4**

Property 11: Activation key metadata correctness
*For any* generated activation key, it must be linked to the correct user_id and plan from the payment request, with generation timestamp and initial status "UNUSED".
**Validates: Requirements 5.6, 5.7, 5.8, 5.9**

Property 12: Activation key search
*For any* search query (key value or user email), the system should return only activation keys matching that search term.
**Validates: Requirements 6.3**

Property 13: Activation key filtering
*For any* status filter (ALL, UNUSED, USED, EXPIRED, REVOKED), the system should return only activation keys matching that status.
**Validates: Requirements 6.4**

Property 14: Key revocation status update
*For any* activation key, when revoked by an admin, its status should be updated to "REVOKED" in the database.
**Validates: Requirements 6.6**

Property 15: Subscription expiry on revocation
*For any* used activation key, when revoked, the associated user's subscription should be immediately expired (expiry_date set to current time).
**Validates: Requirements 6.7**

Property 16: Non-existent key rejection
*For any* activation key that does not exist in the database, activation should fail with an appropriate error.
**Validates: Requirements 7.2**

Property 17: Cross-user activation prevention
*For any* activation key, if the key's user_id does not match the authenticated user's id, activation should fail with an authorization error.
**Validates: Requirements 7.3**

Property 18: Used key rejection
*For any* activation key with status "USED", activation should fail with an error indicating the key has already been used.
**Validates: Requirements 7.4**

Property 19: Expired key rejection
*For any* activation key with status "EXPIRED" or "REVOKED", activation should fail with an appropriate error.
**Validates: Requirements 7.5**

Property 20: Complete activation process
*For any* valid activation key, when successfully activated, the system should: (1) update user record with plan, activation_date, and correctly calculated expiry_date, (2) update key record with status "USED" and activated_at timestamp.
**Validates: Requirements 7.6, 7.7, 7.8, 7.9, 7.10**

Property 21: Expiry date calculation accuracy
*For any* activation, the expiry_date should be exactly 30 days from activation_date for PRO plan, or 180 days for BUSINESS plan.
**Validates: Requirements 7.8**

Property 22: Days remaining calculation
*For any* active subscription, the days remaining should equal the difference between expiry_date and current_date (rounded down).
**Validates: Requirements 8.4**

Property 23: Expired subscription status
*For any* user whose expiry_date is less than the current date, the subscription status should be "Expired".
**Validates: Requirements 8.6**

Property 24: Subscription status check on requests
*For any* authenticated request to premium features, if the user's expiry_date is past, access should be denied.
**Validates: Requirements 8.8, 9.1**

Property 25: Premium access redirection
*For any* user with an expired subscription attempting to access premium features, the system should redirect to the pricing page.
**Validates: Requirements 9.2**

Property 26: Key status update on expiry
*For any* subscription that expires, the associated activation key's status should be updated to "EXPIRED".
**Validates: Requirements 9.4**

Property 27: Input sanitization
*For any* user input (transaction ID, file names), the system should sanitize it to prevent SQL injection attacks (no special SQL characters in database queries).
**Validates: Requirements 11.6**

Property 28: Authentication requirement
*For any* activation request with an invalid or expired authentication token, the request should be rejected with a 401 Unauthorized error.
**Validates: Requirements 11.9**

Property 29: Activation audit logging
*For any* activation attempt (successful or failed), the system should create an audit log entry with timestamp, user_id, key, and result.
**Validates: Requirements 11.10**



## Error Handling

### Backend Error Responses

All backend errors follow a consistent JSON structure:

```javascript
{
  "success": false,
  "message": string,        // Human-readable error message
  "errorCode": string,      // Machine-readable error code (optional)
  "details": object         // Additional context (optional)
}
```

### Error Categories

#### Authentication Errors (401)

**Scenarios:**
- Missing authentication token
- Invalid JWT signature
- Expired token
- Token for non-existent user

**Response:**
```javascript
{
  "success": false,
  "message": "Unauthorized. Please log in again.",
  "errorCode": "AUTH_REQUIRED"
}
```

**Frontend Action:** Redirect to login page, clear localStorage

#### Authorization Errors (403)

**Scenarios:**
- Non-admin accessing admin endpoints
- User trying to activate someone else's key
- Free user attempting premium features

**Response:**
```javascript
{
  "success": false,
  "message": "You do not have permission to perform this action.",
  "errorCode": "FORBIDDEN"
}
```

**Frontend Action:** Display error message, redirect to appropriate page

#### Validation Errors (400)

**Scenarios:**
- Missing required fields (plan, screenshot, transaction ID)
- Invalid file format or size
- Invalid activation key format
- Key already used, revoked, or expired

**Response:**
```javascript
{
  "success": false,
  "message": "Validation failed: <specific error>",
  "errorCode": "VALIDATION_ERROR",
  "details": { field: string, reason: string }
}
```

**Frontend Action:** Display field-specific error messages, maintain form state

#### Activation-Specific Errors (400/404)

**Key Not Found:**
```javascript
{
  "success": false,
  "message": "Invalid activation key",
  "errorCode": "INVALID_KEY"
}
```

**Key Belongs to Different User:**
```javascript
{
  "success": false,
  "message": "This key is not assigned to your account",
  "errorCode": "NOT_YOUR_KEY"
}
```

**Key Already Used:**
```javascript
{
  "success": false,
  "message": "This key has already been used",
  "errorCode": "ALREADY_USED"
}
```

**Key Revoked:**
```javascript
{
  "success": false,
  "message": "This key has been revoked",
  "errorCode": "REVOKED"
}
```

**Key Expired:**
```javascript
{
  "success": false,
  "message": "This key has expired",
  "errorCode": "EXPIRED"
}
```

#### Resource Not Found (404)

**Scenarios:**
- Payment request ID doesn't exist
- Activation key ID doesn't exist (admin operations)

**Response:**
```javascript
{
  "success": false,
  "message": "Resource not found",
  "errorCode": "NOT_FOUND"
}
```

#### Server Errors (500)

**Scenarios:**
- Database connection failure
- File upload failure
- Key generation collision after max retries
- Unexpected exceptions

**Response:**
```javascript
{
  "success": false,
  "message": "An internal server error occurred. Please try again later.",
  "errorCode": "INTERNAL_ERROR"
}
```

**Logging:** All 500 errors must be logged with full stack trace for debugging

**Frontend Action:** Display generic error message, suggest retry or contact support

### Frontend Error Handling Strategy

#### Network Errors

```javascript
try {
  const response = await fetch(endpoint, options);
  // Handle response
} catch (error) {
  if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
    // Network error - no connection to backend
    displayError('Unable to connect to server. Check your internet connection.');
  } else {
    displayError('An unexpected error occurred.');
  }
}
```

#### File Upload Errors

- **Size Validation (Client-Side):** Check file size before upload, show error if > 5MB
- **Format Validation (Client-Side):** Check file extension matches .jpg, .jpeg, .png, .webp
- **Server Validation:** Display backend error message if server-side validation fails
- **Upload Progress:** Show loading spinner during upload, disable submit button

#### Form Validation

- **Client-Side Validation:**
  - Required fields must not be empty
  - Activation key must match BBSG-XXXX-XXXX-XXXX format
  - Transaction ID must be alphanumeric
  - Show inline error messages below fields

- **Server-Side Validation:**
  - Display error returned from backend
  - Maintain form state (don't clear valid fields)
  - Re-enable form submission after error

#### State Management

- **Loading States:** Disable buttons and show spinners during async operations
- **Success States:** Show success messages, update UI state, redirect if necessary
- **Error States:** Show error messages, keep form editable, allow retry

