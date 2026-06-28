# Requirements Document

## Introduction

BlockBridge ScamGuard AI requires an activation key-based subscription system to replace or supplement the existing Razorpay payment flow. This system allows users to purchase subscription plans through manual UPI payments, submit payment proof for admin verification, receive activation keys, and activate their subscriptions. The system provides full administrative control over payment verification and subscription activation.

## Glossary

- **System**: The Activation Key-Based Subscription System
- **User**: An authenticated BlockBridge ScamGuard AI user who can purchase and activate subscriptions
- **Admin**: A privileged user who can verify payments and manage activation keys
- **Payment_Request**: A record containing payment proof submitted by a user
- **Activation_Key**: A unique, cryptographically random code used to activate subscriptions
- **Subscription**: A time-limited premium access period for a specific plan
- **Pro_Plan**: A subscription plan with 1 month duration priced at ₹199
- **Business_Plan**: A subscription plan with 6 months duration priced at ₹499
- **UPI_Transaction_ID**: The unique identifier for a UPI payment transaction

## Requirements

### Requirement 1: Subscription Plan Management

**User Story:** As a user, I want to view available subscription plans with pricing and duration, so that I can choose the plan that fits my needs.

#### Acceptance Criteria

1. THE System SHALL display the Pro_Plan with 1 month duration and ₹199 price
2. THE System SHALL display the Business_Plan with 6 months duration and ₹499 price
3. WHEN a user views the pricing page, THE System SHALL show plan features and benefits
4. THE System SHALL allow users to select a plan for purchase

### Requirement 2: Payment Submission

**User Story:** As a user, I want to submit payment proof after completing a UPI payment, so that the admin can verify my payment and approve my subscription.

#### Acceptance Criteria

1. WHEN a user selects a plan, THE System SHALL display the payment UPI phone number or QR code
2. THE System SHALL provide a form to upload a payment screenshot image file
3. THE System SHALL provide a field to enter the UPI_Transaction_ID as text
4. WHEN a user submits valid payment proof, THE System SHALL create a Payment_Request with status "PENDING"
5. WHEN a Payment_Request is created, THE System SHALL store the user_id, selected plan, screenshot URL, UPI_Transaction_ID, and timestamp
6. WHEN payment proof is missing or invalid, THE System SHALL reject the submission and display an error message
7. THE System SHALL accept image files in formats: JPG, JPEG, PNG, and WebP
8. WHEN a screenshot upload exceeds 5MB, THE System SHALL reject it and display a size limit error

### Requirement 3: Payment Notification

**User Story:** As an admin, I want to be notified when new payment requests are submitted, so that I can review and verify them promptly.

#### Acceptance Criteria

1. WHEN a new Payment_Request is created, THE System SHALL mark it as "PENDING" status
2. THE System SHALL display pending payment count on the admin dashboard
3. THE System SHALL list all Payment_Requests ordered by creation timestamp (newest first)

### Requirement 4: Admin Payment Verification

**User Story:** As an admin, I want to review payment screenshots and transaction IDs, so that I can verify legitimate payments and reject fraudulent ones.

#### Acceptance Criteria

1. WHEN an admin accesses the payment verification dashboard, THE System SHALL display all pending Payment_Requests
2. THE System SHALL display the payment screenshot image for each Payment_Request
3. THE System SHALL display the UPI_Transaction_ID for each Payment_Request
4. THE System SHALL display the user information (name, email) for each Payment_Request
5. THE System SHALL display the selected plan and price for each Payment_Request
6. THE System SHALL provide "Approve" and "Reject" actions for each Payment_Request
7. WHEN an admin approves a Payment_Request, THE System SHALL update its status to "APPROVED"
8. WHEN an admin rejects a Payment_Request, THE System SHALL update its status to "REJECTED"
9. THE System SHALL filter Payment_Requests by status: ALL, PENDING, APPROVED, REJECTED

### Requirement 5: Activation Key Generation

**User Story:** As an admin, I want to generate unique activation keys for approved payments, so that users can activate their subscriptions securely.

#### Acceptance Criteria

1. WHEN an admin approves a Payment_Request, THE System SHALL automatically generate a unique Activation_Key
2. THE System SHALL format all Activation_Keys as "BBSG-XXXX-XXXX-XXXX" where X is an alphanumeric character
3. THE System SHALL use cryptographically random generation for Activation_Keys
4. THE System SHALL verify that each generated Activation_Key is unique before storing it
5. IF an Activation_Key collision is detected, THEN THE System SHALL regenerate a new key
6. THE System SHALL link each Activation_Key to the specific user_id from the Payment_Request
7. THE System SHALL link each Activation_Key to the purchased plan (Pro_Plan or Business_Plan)
8. THE System SHALL store the generation timestamp for each Activation_Key
9. THE System SHALL set the initial status of each Activation_Key to "UNUSED"

### Requirement 6: Activation Key Management

**User Story:** As an admin, I want to view, search, and manage all activation keys, so that I can track key usage and handle edge cases like revocation.

#### Acceptance Criteria

1. WHEN an admin accesses the activation key management page, THE System SHALL display all Activation_Keys
2. THE System SHALL display for each Activation_Key: key value, user email, plan, generated timestamp, activated timestamp, expiry date, and status
3. THE System SHALL provide search functionality by key value or user email
4. THE System SHALL provide filter functionality by status: ALL, UNUSED, USED, EXPIRED, REVOKED
5. THE System SHALL allow an admin to manually revoke an Activation_Key
6. WHEN an admin revokes an Activation_Key, THE System SHALL update its status to "REVOKED"
7. WHEN an Activation_Key is revoked and was previously used, THE System SHALL expire the associated subscription immediately
8. THE System SHALL allow an admin to mark an Activation_Key as expired manually

### Requirement 7: User Activation Flow

**User Story:** As a user, I want to enter my activation key to activate my subscription, so that I can access premium features.

#### Acceptance Criteria

1. THE System SHALL provide an "Activate Subscription" page for users to enter Activation_Keys
2. WHEN a user enters an Activation_Key, THE System SHALL validate that the key exists in the database
3. WHEN a user enters an Activation_Key, THE System SHALL validate that the key belongs to the authenticated user
4. WHEN a user enters an Activation_Key, THE System SHALL validate that the key status is "UNUSED"
5. WHEN a user enters an Activation_Key, THE System SHALL validate that the key is not expired
6. WHEN all validations pass, THE System SHALL activate the user's subscription
7. WHEN activating a subscription, THE System SHALL set the activation date to the current timestamp
8. WHEN activating a subscription, THE System SHALL calculate and set the expiry date based on the plan duration
9. WHEN activating a subscription, THE System SHALL update the Activation_Key status to "USED"
10. WHEN activating a subscription, THE System SHALL store the activated timestamp in the Activation_Key record
11. WHEN activation succeeds, THE System SHALL display a success message with the subscription details
12. IF the Activation_Key does not exist, THEN THE System SHALL display error "Invalid activation key"
13. IF the Activation_Key belongs to a different user, THEN THE System SHALL display error "This key is not assigned to your account"
14. IF the Activation_Key status is "USED", THEN THE System SHALL display error "This key has already been used"
15. IF the Activation_Key status is "REVOKED", THEN THE System SHALL display error "This key has been revoked"
16. IF the Activation_Key is expired, THEN THE System SHALL display error "This key has expired"

### Requirement 8: Subscription Status Display

**User Story:** As a user, I want to view my current subscription status on my dashboard, so that I know when my subscription expires and can plan for renewal.

#### Acceptance Criteria

1. WHEN a user has an active subscription, THE System SHALL display "Current Plan" with the plan name
2. WHEN a user has an active subscription, THE System SHALL display the activation date
3. WHEN a user has an active subscription, THE System SHALL display the expiry date
4. WHEN a user has an active subscription, THE System SHALL calculate and display days remaining until expiry
5. WHEN a user has an active subscription, THE System SHALL display status as "Active"
6. WHEN a user's subscription has expired, THE System SHALL display status as "Expired"
7. WHEN a user has no subscription, THE System SHALL display a message prompting them to purchase a plan
8. THE System SHALL update subscription status in real-time based on the expiry date

### Requirement 9: Subscription Expiration Handling

**User Story:** As a system administrator, I want expired subscriptions to automatically revoke premium access, so that users only access premium features during their active subscription period.

#### Acceptance Criteria

1. WHEN the current date exceeds a user's expiry date, THE System SHALL revoke premium access
2. WHEN premium access is revoked, THE System SHALL redirect the user to the pricing page upon attempting to access premium features
3. THE System SHALL check subscription status on every authenticated request
4. WHEN a subscription expires, THE System SHALL update the Activation_Key status to "EXPIRED"

### Requirement 10: Database Schema

**User Story:** As a developer, I want a properly designed database schema, so that all subscription data is stored securely and can be queried efficiently.

#### Acceptance Criteria

1. THE System SHALL create a payment_requests table with columns: id, user_id, plan, screenshot_url, transaction_id, status, created_at, updated_at
2. THE System SHALL create an activation_keys table with columns: id, key, user_id, plan, generated_at, activated_at, expiry_date, status, used
3. THE System SHALL add activation_date column to the users table
4. THE System SHALL add expiry_date column to the users table
5. THE System SHALL create a foreign key constraint from payment_requests.user_id to users.id
6. THE System SHALL create a foreign key constraint from activation_keys.user_id to users.id
7. THE System SHALL create a unique index on activation_keys.key
8. THE System SHALL create an index on payment_requests.status for efficient filtering
9. THE System SHALL create an index on activation_keys.status for efficient filtering

### Requirement 11: Security and Validation

**User Story:** As a security engineer, I want the activation key system to prevent fraud and unauthorized access, so that subscriptions cannot be stolen or abused.

#### Acceptance Criteria

1. THE System SHALL generate Activation_Keys using a cryptographically secure random number generator
2. THE System SHALL prevent duplicate Activation_Key generation through uniqueness validation
3. THE System SHALL prevent Activation_Key reuse by checking the "used" flag before activation
4. THE System SHALL prevent cross-user activation by validating the key's user_id matches the authenticated user
5. THE System SHALL validate all activation requests on the backend (not client-side only)
6. THE System SHALL sanitize all user inputs (UPI_Transaction_ID, uploaded filenames) to prevent injection attacks
7. THE System SHALL validate file uploads to ensure only image files are accepted
8. THE System SHALL store uploaded payment screenshots in a secure storage location with restricted access
9. WHEN an authentication token is invalid or expired, THE System SHALL reject activation requests
10. THE System SHALL log all activation attempts for security auditing

### Requirement 12: User Interface Consistency

**User Story:** As a user, I want the new subscription pages to match the existing BlockBridge theme, so that the experience feels cohesive and professional.

#### Acceptance Criteria

1. THE System SHALL use the existing BlockBridge ScamGuard AI color scheme for all new pages
2. THE System SHALL use the existing typography and font styles for all new pages
3. THE System SHALL use the existing button and form component styles
4. THE System SHALL maintain consistent spacing and layout patterns with existing pages
5. THE System SHALL ensure all new pages are responsive and work on mobile devices
