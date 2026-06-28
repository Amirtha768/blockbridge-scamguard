# Requirements Document

## Introduction

The Professional Scam Detection System Improvements feature enhances the BlockBridge ScamGuard AI platform by implementing intelligent AI-powered scanning, improving user experience, adding scan history tracking, and streamlining payment processes. This system will replace the current random-result scanners with professional scoring algorithms, add comprehensive scan history, remove Razorpay dependencies, and improve information accuracy across the platform.

## Glossary

- **System**: BlockBridge ScamGuard AI platform
- **Scanner**: AI-powered analysis tool for detecting scams (URL, Email, WhatsApp, QR, Screenshot, Job, Investment)
- **Risk_Score**: Numerical value from 0-100 indicating threat level
- **Scan_History**: Database record of all user scans with metadata
- **User**: Individual using the platform (Free, Pro, or Business plan)
- **Admin**: System administrator with verification and management privileges
- **UPI**: Unified Payments Interface for payment processing
- **QR_Code**: Quick Response code image for payment or data sharing
- **Input_Validation**: Process of verifying submitted data matches expected format

## Requirements

### Requirement 1: Homepage UI Updates

**User Story:** As a visitor, I want a clean homepage without the "Start Free Scan" button, so that I focus on the information presented.

#### Acceptance Criteria

1. THE System SHALL remove the "Start Free Scan" blue button from the hero section
2. THE System SHALL maintain all other homepage elements unchanged
3. WHEN the homepage loads, THEN THE System SHALL display the hero section without the "Start Free Scan" button

### Requirement 2: About Page Information Updates

**User Story:** As a user, I want accurate contact and payment information on the About page, so that I can reach support and make payments correctly.

#### Acceptance Criteria

1. THE System SHALL remove the "Start Free Scan" button from the About page
2. THE System SHALL display UPI ID as "6381487329@ybl" in the payment information section
3. THE System SHALL display phone number as "6381487329" in the payment information section
4. THE System SHALL display email as "blockbridgescamguardai@gmail.com" in the payment information section
5. THE System SHALL display a QR code payment image in the payment section
6. THE System SHALL update support email to "blockbridgescamguardai@gmail.com" in the contact information
7. THE System SHALL display response time as "Within 24-48 hours" in the contact information
8. THE System SHALL display location as "Online Global Support" in the contact information
9. THE System SHALL remove the "Business & Enterprise Solutions" card completely from the About page

### Requirement 3: AI Scanner Intelligence Implementation

**User Story:** As a user, I want the scanners to provide accurate risk assessment using real AI logic, so that I can trust the scan results to make informed security decisions.

#### Acceptance Criteria

1. WHEN a user submits input to any scanner, THEN THE System SHALL validate the input format before analysis
2. WHEN input format is invalid, THEN THE System SHALL return the message "Invalid Input - This does not appear to be a valid email, URL, QR code, or supported message"
3. WHEN a URL contains HTTPS protocol, THEN THE System SHALL reduce the risk score by 10 points
4. WHEN a URL matches a blacklisted domain, THEN THE System SHALL increase the risk score by 40 points
5. WHEN content contains suspicious keywords, THEN THE System SHALL increase the risk score by 20 points per keyword
6. WHEN a URL is a short URL, THEN THE System SHALL increase the risk score by 10 points
7. WHEN a URL has many redirects, THEN THE System SHALL increase the risk score by 15 points
8. WHEN a domain is newly registered, THEN THE System SHALL increase the risk score by 25 points
9. WHEN content contains urgency words, THEN THE System SHALL increase the risk score by 20 points
10. WHEN a URL contains a phone number, THEN THE System SHALL increase the risk score by 15 points
11. WHEN risk score is 0-25, THEN THE System SHALL categorize the result as SAFE
12. WHEN risk score is 26-50, THEN THE System SHALL categorize the result as LOW RISK
13. WHEN risk score is 51-75, THEN THE System SHALL categorize the result as SUSPICIOUS
14. WHEN risk score is 76-100, THEN THE System SHALL categorize the result as DANGEROUS
15. WHEN google.com is scanned, THEN THE System SHALL return a risk score of approximately 5% and status SAFE
16. WHEN "http://login-paytm-free.xyz" is scanned, THEN THE System SHALL return a risk score of approximately 95% and status DANGEROUS
17. WHEN an email contains "Congratulations! Win ₹5 lakh", THEN THE System SHALL detect phishing indicators and return risk score of approximately 91%
18. WHEN a WhatsApp message contains "Hello" with no scam indicators, THEN THE System SHALL return LOW RISK status
19. WHEN a WhatsApp message contains "OTP share pannunga Account lock Click", THEN THE System SHALL return DANGEROUS status

### Requirement 4: Scan History Database Schema

**User Story:** As a developer, I want a database table to store scan history, so that users can track their scanning activity over time.

#### Acceptance Criteria

1. THE System SHALL create a scan_history table with id as primary key
2. THE System SHALL store user_id as a foreign key reference to users table in scan_history
3. THE System SHALL store scan_type as ENUM with values URL, EMAIL, WHATSAPP, QR, SCREENSHOT, JOB, INVESTMENT
4. THE System SHALL store input text in the scan_history table
5. THE System SHALL store result status in the scan_history table
6. THE System SHALL store risk_score as integer in the scan_history table
7. THE System SHALL store created_at timestamp with default CURRENT_TIMESTAMP in the scan_history table
8. WHEN a scan is completed, THEN THE System SHALL insert a new record into scan_history table

### Requirement 5: Dashboard Scan History Section

**User Story:** As a user, I want to see my recent scan history on the dashboard, so that I can quickly review my past activity.

#### Acceptance Criteria

1. THE System SHALL display a scan history section on the dashboard below the AI Insights section
2. WHEN displaying scan history, THEN THE System SHALL show date and time for each scan
3. WHEN displaying scan history, THEN THE System SHALL show scan type for each scan
4. WHEN displaying scan history, THEN THE System SHALL show result status for each scan
5. WHEN displaying scan history, THEN THE System SHALL show risk score percentage for each scan
6. THE System SHALL display the most recent 10 scans in the dashboard scan history section
7. THE System SHALL provide a "View All History" button that navigates to the full scan history page
8. WHEN no scan history exists, THEN THE System SHALL display a message indicating no scans have been performed yet

### Requirement 6: Dashboard Layout Updates

**User Story:** As a user, I want an improved dashboard layout with welcome message, stats, scanners, insights, and scan history, so that I have a comprehensive overview of my account.

#### Acceptance Criteria

1. WHEN the dashboard loads, THEN THE System SHALL display "Welcome back, [NAME] 👋" with the user's current plan
2. THE System SHALL display the number of scans performed today
3. THE System SHALL display the current plan (FREE/PRO/BUSINESS)
4. THE System SHALL display the number of scans remaining for the current period
5. THE System SHALL display all 7 scanner cards in the dashboard
6. THE System SHALL display an AI Insights section with trending scam information
7. THE System SHALL display the Recent Scan History section with the last 10 scans
8. THE System SHALL display a Notifications section with subscription and system updates

### Requirement 7: Scan History Page

**User Story:** As a user, I want a dedicated scan history page with filtering and search capabilities, so that I can easily find and review specific past scans.

#### Acceptance Criteria

1. THE System SHALL create a scan history page accessible from the dashboard
2. WHEN the scan history page loads, THEN THE System SHALL display a filter dropdown with options: All, URL, Email, WhatsApp, QR, Screenshot
3. THE System SHALL provide a search box to filter scans by input content
4. THE System SHALL display scan history in a table with columns: Date, Type, Status, Risk
5. WHEN a filter is selected, THEN THE System SHALL display only scans matching that type
6. WHEN text is entered in the search box, THEN THE System SHALL filter results matching the input content
7. WHERE the user has a Pro or Business plan, THE System SHALL display a "Download PDF Report" button
8. WHERE the user has a Free plan, THE System SHALL not display the PDF download button

### Requirement 8: Plan-Based History Limitations

**User Story:** As a product manager, I want different scan history retention periods for each plan tier, so that we incentivize upgrades while providing value at each level.

#### Acceptance Criteria

1. WHEN a Free plan user accesses scan history, THEN THE System SHALL display only the last 10 scans
2. WHEN a Free plan user accesses scan history, THEN THE System SHALL display only scans from the last 7 days
3. WHEN a Free plan user accesses scan history, THEN THE System SHALL not provide PDF export functionality
4. WHEN a Pro plan user accesses scan history, THEN THE System SHALL display unlimited scans from the last 30 days
5. WHEN a Pro plan user accesses scan history, THEN THE System SHALL provide PDF download functionality
6. WHEN a Business plan user accesses scan history, THEN THE System SHALL display unlimited scans from the last 90 days
7. WHEN a Business plan user accesses scan history, THEN THE System SHALL provide both PDF and CSV export functionality
8. WHEN a Business plan user accesses scan history, THEN THE System SHALL provide analytics dashboard

### Requirement 9: Razorpay Removal

**User Story:** As a developer, I want to remove all Razorpay integration, so that the system uses only manual UPI payment verification.

#### Acceptance Criteria

1. THE System SHALL remove all Razorpay API calls from the backend codebase
2. THE System SHALL remove Razorpay configuration from environment variables
3. THE System SHALL remove Razorpay references from the database schema
4. THE System SHALL remove Razorpay script loading from the frontend
5. THE System SHALL remove Razorpay payment handler functions from the frontend
6. THE System SHALL retain manual UPI payment upload functionality
7. WHEN the pricing page loads, THEN THE System SHALL not load any Razorpay scripts

### Requirement 10: Business Plan Display Update

**User Story:** As a user viewing the Business plan, I want to see the correct subscription period displayed, so that I understand the commitment duration.

#### Acceptance Criteria

1. WHEN the Business plan pricing is displayed, THEN THE System SHALL show "3 months" instead of "per month"
2. THE System SHALL display "₹499 / 3 months" for the Business plan price

### Requirement 11: Admin Panel Verification

**User Story:** As a system administrator, I want to verify that the admin panel exists and is properly configured, so that I can manage user subscriptions and payments.

#### Acceptance Criteria

1. THE System SHALL provide an admin login page
2. THE System SHALL provide an admin dashboard page
3. WHEN an admin logs in with valid credentials, THEN THE System SHALL display the admin dashboard
4. THE System SHALL allow admins to view pending payment requests
5. THE System SHALL allow admins to approve or reject payment requests
6. THE System SHALL allow admins to generate activation keys for approved payments

### Requirement 12: Real-Time Scan Logging

**User Story:** As a user, I want all my scans to be automatically saved to history, so that I can review them later without manual action.

#### Acceptance Criteria

1. WHEN a scan is completed successfully, THEN THE System SHALL insert a record into scan_history table
2. WHEN inserting scan history, THEN THE System SHALL store the current user's ID
3. WHEN inserting scan history, THEN THE System SHALL store the scan type
4. WHEN inserting scan history, THEN THE System SHALL store the input content
5. WHEN inserting scan history, THEN THE System SHALL store the result status
6. WHEN inserting scan history, THEN THE System SHALL store the risk score
7. WHEN inserting scan history, THEN THE System SHALL store the current timestamp

### Requirement 13: Input Validation

**User Story:** As a user, I want the system to validate my input before scanning, so that I receive meaningful error messages for invalid submissions.

#### Acceptance Criteria

1. WHEN a URL scanner input is submitted, THEN THE System SHALL validate it matches URL format
2. WHEN an email scanner input is submitted, THEN THE System SHALL validate it contains email-like content
3. WHEN a QR scanner file is submitted, THEN THE System SHALL validate it is an image file
4. WHEN a screenshot file is submitted, THEN THE System SHALL validate it is an image file
5. WHEN validation fails, THEN THE System SHALL return an error message indicating the invalid input type
6. WHEN validation succeeds, THEN THE System SHALL proceed with the AI analysis

### Requirement 14: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a database operation fails, THEN THE System SHALL return an error message indicating a server error
2. WHEN a scan exceeds the daily limit, THEN THE System SHALL return an error message with upgrade information
3. WHEN file upload fails, THEN THE System SHALL return an error message indicating the upload issue
4. WHEN input validation fails, THEN THE System SHALL return a descriptive error message explaining the validation failure
5. THE System SHALL log all errors to the server console for debugging purposes

### Requirement 15: Homepage Image Upload Functionality

**User Story:** As a visitor, I want the image upload on the homepage to work properly, so that I can test the system before signing up.

#### Acceptance Criteria

1. THE System SHALL provide a functional image upload field on the homepage
2. WHEN an image is uploaded on the homepage, THEN THE System SHALL handle the upload without errors
3. WHEN an image upload fails on the homepage, THEN THE System SHALL display a clear error message
