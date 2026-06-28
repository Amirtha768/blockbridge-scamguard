# Activation Key Subscription System - Requirements

## Overview
Replace Razorpay payment gateway with a manual activation key-based subscription system where users submit payment proofs, admins verify and generate activation keys, and users activate their subscriptions.

---

## User Stories

### US-1: User Payment Submission
**As a** registered user  
**I want to** submit payment proof for a subscription plan  
**So that** I can purchase Pro or Business plan access

**Acceptance Criteria:**
- User can select Pro (₹199/month) or Business (₹499/6 months) plan
- Display payment phone number prominently
- User can upload payment screenshot (image only, max 5MB)
- User can enter UPI transaction ID
- System stores request with status "PENDING"
- User receives confirmation of submission

### US-2: User Activation Key Redemption
**As a** user with an activation key  
**I want to** activate my subscription  
**So that** I can access premium features

**Acceptance Criteria:**
- User can enter activation key in format BBSG-XXXX-XXXX-XXXX
- System validates key exists, belongs to user, is unused, not expired
- If valid: activate subscription, set expiry date, mark key as used
- If invalid: show clear error message
- After activation, redirect to dashboard with premium access

### US-3: User Subscription Dashboard
**As a** subscribed user  
**I want to** view my subscription details  
**So that** I know my plan status and expiry

**Acceptance Criteria:**
- Dashboard shows: Plan name, Activation date, Expiry date, Days remaining, Status
- When subscription expires: Revoke premium access automatically
- Show renewal prompt on expiry

### US-4: Admin Payment Verification
**As an** admin  
**I want to** verify user payment submissions  
**So that** I can approve legitimate purchases

**Acceptance Criteria:**
- Admin can view all pending payment requests
- Admin can see payment screenshot (full size)
- Admin can see transaction ID
- Admin can approve or reject payment
- Admin can add notes for rejection
- On approval, system enables key generation

### US-5: Admin Activation Key Management
**As an** admin  
**I want to** generate and manage activation keys  
**So that** users can activate their subscriptions

**Acceptance Criteria:**
- Admin can generate unique activation key for approved payment
- Key format: BBSG-XXXX-XXXX-XXXX (cryptographically random)
- Admin can copy key to clipboard
- Admin can view all keys with filters (used/unused/expired/revoked)
- Admin can search keys by user email or key value
- Admin can revoke unused keys
- Admin can mark keys as expired
- No duplicate keys ever generated

### US-6: Admin Dashboard Overview
**As an** admin  
**I want to** see subscription system metrics  
**So that** I can monitor business performance

**Acceptance Criteria:**
- Show pending payment requests count
- Show active subscriptions count
- Show total revenue
- Show recent activity log
- Quick access to verification and key management

---

## Functional Requirements

### FR-1: Payment Request Submission
- Accept plan selection (PRO or BUSINESS)
- Display payment instructions with phone number
- Upload image file (JPG, PNG, max 5MB)
- Accept transaction ID (alphanumeric, max 100 chars)
- Store in database with PENDING status
- Send confirmation to user

### FR-2: Activation Key Generation
- Generate format: BBSG-XXXX-XXXX-XXXX
- Use crypto.randomInt() for secure randomness
- Check for duplicates before saving
- Link key to specific user and payment request
- Set status as UNUSED
- Record generation timestamp

### FR-3: Key Activation Process
- Validate key format matches pattern
- Check key exists in database
- Verify key belongs to requesting user
- Verify key status is UNUSED
- Verify key not expired
- On success: Update user plan, set activation_date, set expiry_date, mark key as USED
- On failure: Return specific error message

### FR-4: Subscription Expiry Handling
- Check expiry_date on every dashboard load
- If expired: Set plan to FREE, subscription_status to EXPIRED
- Lock premium features for expired users
- Show renewal prompt

### FR-5: Admin Authentication
- Create admin_users table
- Admin users have role (ADMIN or SUPER_ADMIN)
- Separate admin login or flag on regular user
- Admin middleware protects admin routes

### FR-6: File Upload Security
- Validate file type (image only)
- Limit file size (5MB max)
- Store in secure directory (uploads/payment-screenshots/)
- Generate unique filename
- Serve files only to authorized admins

---

## Non-Functional Requirements

### NFR-1: Security
- Activation keys are cryptographically secure
- Keys cannot be guessed or brute-forced
- Prevent SQL injection on all inputs
- Validate file uploads
- Admin routes require authentication
- Keys cannot be reused
- Keys cannot be activated by wrong user

### NFR-2: Performance
- Key generation under 100ms
- Payment submission under 3 seconds
- Admin dashboard loads under 2 seconds
- Image upload under 5 seconds for 5MB file

### NFR-3: Reliability
- No duplicate keys generated
- Database transactions for key activation
- Rollback on activation failure
- Error logging for debugging

### NFR-4: Usability
- Clear payment instructions
- Simple key entry interface
- Intuitive admin dashboard
- Mobile-responsive design
- Clear error messages

### NFR-5: Maintainability
- Well-documented code
- Modular route structure
- Reusable utility functions
- Environment variable configuration

---

## Data Model

### payment_requests Table
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
user_id: INT (FK to users)
plan: ENUM('PRO', 'BUSINESS')
amount: DECIMAL(10, 2)
screenshot_url: VARCHAR(500)
transaction_id: VARCHAR(100)
status: ENUM('PENDING', 'APPROVED', 'REJECTED')
admin_notes: TEXT
created_at: DATETIME
verified_at: DATETIME
verified_by: INT (FK to users)
```

### activation_keys Table
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
activation_key: VARCHAR(20) UNIQUE
user_id: INT (FK to users)
plan: ENUM('PRO', 'BUSINESS')
payment_request_id: INT (FK to payment_requests)
status: ENUM('UNUSED', 'USED', 'EXPIRED', 'REVOKED')
generated_at: DATETIME
activated_at: DATETIME
expiry_date: DATETIME
```

### users Table (additions)
```sql
activation_date: DATETIME
last_activation_key: VARCHAR(20)
```

### admin_users Table
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
user_id: INT UNIQUE (FK to users)
role: ENUM('ADMIN', 'SUPER_ADMIN')
created_at: DATETIME
```

---

## API Endpoints

### User Endpoints
- `POST /api/payment-request/submit` - Submit payment proof
- `GET /api/payment-request/my-requests` - Get user's payment requests
- `POST /api/activation/activate` - Activate with key
- `GET /api/subscription/status` - Get subscription details

### Admin Endpoints
- `GET /api/admin/payment-requests` - List all payment requests
- `GET /api/admin/payment-request/:id` - Get single request details
- `POST /api/admin/verify-payment` - Approve/reject payment
- `POST /api/admin/generate-key` - Generate activation key
- `GET /api/admin/keys` - List all activation keys
- `POST /api/admin/revoke-key` - Revoke unused key
- `GET /api/admin/search` - Search keys/users
- `GET /api/admin/stats` - Get dashboard statistics

---

## UI Pages

### User Pages
1. **Pricing Page** - Show plans, phone number, redirect to payment
2. **Payment Submission** - Upload screenshot, enter transaction ID
3. **My Payments** - View submission history and status
4. **Activate Subscription** - Enter activation key
5. **Dashboard** - Show subscription details

### Admin Pages
1. **Admin Dashboard** - Overview statistics
2. **Payment Verification** - List pending requests, approve/reject
3. **Key Management** - List, search, revoke keys
4. **Admin Login** - Separate admin authentication

---

## Business Rules

### BR-1: Plan Durations
- Pro Plan: Exactly 30 days from activation
- Business Plan: Exactly 180 days from activation

### BR-2: Plan Pricing
- Pro Plan: ₹199
- Business Plan: ₹499

### BR-3: Key Usage
- Each key can be used exactly once
- Key must be activated by the user it was generated for
- Used keys cannot be reused
- Revoked keys cannot be activated

### BR-4: Payment Verification
- Only admins can verify payments
- Only approved payments can generate keys
- Rejected payments cannot generate keys

### BR-5: Subscription Expiry
- Automatically revoke premium access on expiry
- User can renew by purchasing new activation
- Expired subscriptions cannot be extended, only renewed

---

## Success Metrics
- Payment submission success rate > 95%
- Key activation success rate > 98%
- Admin verification time < 5 minutes per request
- Zero duplicate keys generated
- Zero unauthorized key activations

---

## Future Enhancements (Out of Scope)
- Email notifications
- SMS activation key delivery
- Auto-renewal
- Subscription pause/resume
- Referral program
- Multiple payment methods
