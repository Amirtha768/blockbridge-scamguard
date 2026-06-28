# Requirements Document

## Introduction

This specification defines the improvements to the AI Scanner system and the addition of a comprehensive Scan History feature for the BlockBridge Scam Guard AI application. The system currently provides basic scam detection across multiple input types (URLs, emails, WhatsApp messages, QR codes, job offers, and investment schemes) but lacks realistic validation, proper scoring mechanisms, and historical tracking capabilities. This enhancement will transform the scanner into a production-grade threat detection system with complete audit trails and user-facing analytics.

## Glossary

- **System**: The BlockBridge Scam Guard AI application (frontend + backend)
- **Scanner**: The AI-powered scam detection module
- **Validator**: The input validation component that verifies format correctness
- **Risk_Engine**: The scoring component that calculates threat levels (0-100)
- **Scan_History**: The database table and UI components for tracking scan records
- **Dashboard**: The authenticated user interface showing stats and scan history
- **Admin_Panel**: The administrative interface for managing users and system settings
- **Free_Plan**: User subscription tier with 5 scans/day, 10 scan history, 7-day retention
- **Pro_Plan**: User subscription tier with unlimited scans, 30-day retention, PDF downloads
- **Business_Plan**: User subscription tier with 90-day retention, team features, CSV/PDF exports

## Requirements

### Requirement 1: Remove Deprecated UI Elements

**User Story:** As a product owner, I want to remove outdated UI elements and payment references, so that the application reflects current business processes.

#### Acceptance Criteria

1. THE System SHALL NOT display the "Start Free Scan" button on the Home page
2. THE System SHALL NOT display the "Start Free Scan" button on the About page
3. THE System SHALL NOT display the "Business & Enterprise Solutions" card on any page
4. THE System SHALL NOT reference Razorpay in any UI component
5. THE System SHALL NOT reference Razorpay in any database table or column
6. THE System SHALL NOT reference Razorpay in any backend API endpoint or route

### Requirement 2: Update Contact Information

**User Story:** As a user, I want to see current contact information, so that I can reach support when needed.

#### Acceptance Criteria

1. WHEN payment information is displayed, THE System SHALL show phone number "6381487329"
2. WHEN payment information is displayed, THE System SHALL show email "blockbridgescamguardai@gmail.com"
3. WHEN contact support information is displayed, THE System SHALL show email "blockbridgescamguardai@gmail.com"
4. THE System SHALL display consistent contact information across all pages

### Requirement 3: Update Business Plan Display

**User Story:** As a user viewing subscription options, I want accurate pricing period information, so that I understand the billing cycle.

#### Acceptance Criteria

1. WHEN the Business plan pricing is displayed, THE System SHALL show "3 months" instead of "per month"
2. THE System SHALL display the correct billing period on the Pricing page
3. THE System SHALL display the correct billing period on the Dashboard subscription section
4. THE System SHALL display the correct billing period on the Payment pages

### Requirement 4: Input Validation for Scanner

**User Story:** As a user, I want the scanner to validate my input format before analysis, so that I receive meaningful feedback for invalid entries.

#### Acceptance Criteria

1. WHEN a URL scan is requested, THE Validator SHALL verify the input matches URL format patterns
2. WHEN an email scan is requested, THE Validator SHALL verify the input contains email-like content or email addresses
3. WHEN a WhatsApp message scan is requested, THE Validator SHALL verify the input is non-empty text
4. WHEN a QR code scan is requested, THE Validator SHALL verify a valid image file is provided
5. WHEN a job offer scan is requested, THE Validator SHALL verify the input is non-empty text
6. WHEN an investment offer scan is requested, THE Validator SHALL verify the input is non-empty text
7. IF input validation fails, THEN THE System SHALL return an error with message "Invalid Input" and explanation of expected format
8. IF input validation succeeds, THEN THE System SHALL proceed to risk analysis

### Requirement 5: Risk Scoring Engine

**User Story:** As a user, I want realistic threat assessment based on multiple detection factors, so that I can trust the scanner's recommendations.

#### Acceptance Criteria

1. THE Risk_Engine SHALL calculate scores on a scale of 0-100
2. WHEN a URL uses HTTPS protocol, THE Risk_Engine SHALL add +10 points toward safe score (reduce risk)
3. WHEN a URL domain is in the blacklist, THE Risk_Engine SHALL add +40 risk points
4. WHEN content contains suspicious keywords, THE Risk_Engine SHALL add +20 risk points per keyword category
5. WHEN a URL is a short URL format, THE Risk_Engine SHALL add +10 risk points
6. WHEN a URL has multiple redirects, THE Risk_Engine SHALL add +15 risk points
7. WHEN a domain is newly registered (less than 30 days), THE Risk_Engine SHALL add +25 risk points
8. WHEN final score is 0-25, THE Risk_Engine SHALL classify result as "SAFE"
9. WHEN final score is 26-50, THE Risk_Engine SHALL classify result as "LOW RISK"
10. WHEN final score is 51-75, THE Risk_Engine SHALL classify result as "SUSPICIOUS"
11. WHEN final score is 76-100, THE Risk_Engine SHALL classify result as "DANGEROUS"

### Requirement 6: Risk Engine Test Cases

**User Story:** As a developer, I want specific test cases to validate scoring accuracy, so that the risk engine behaves correctly.

#### Acceptance Criteria

1. WHEN input "luck" is scanned, THE Validator SHALL return "Invalid Input" error
2. WHEN input "google.com" is scanned, THE Risk_Engine SHALL calculate risk score approximately 5% and classify as SAFE
3. WHEN input "http://login-paytm-free.xyz" is scanned, THE Risk_Engine SHALL calculate risk score approximately 95% and classify as DANGEROUS
4. WHEN email content "Congratulations Click below Win ₹5 lakh" is scanned, THE Risk_Engine SHALL calculate risk score approximately 91% and classify as DANGEROUS
5. WHEN WhatsApp message "Hello" is scanned, THE Risk_Engine SHALL detect no scam indicators and classify as LOW RISK
6. WHEN WhatsApp message "OTP share pannunga Account lock Click" is scanned, THE Risk_Engine SHALL detect danger indicators and classify as DANGEROUS

### Requirement 7: Scan History Database Schema

**User Story:** As a system architect, I want a robust database schema for scan history, so that user scans are properly tracked and retrievable.

#### Acceptance Criteria

1. THE System SHALL create a database table named "scan_history"
2. THE scan_history table SHALL have column "id" as INT, AUTO_INCREMENT, PRIMARY KEY
3. THE scan_history table SHALL have column "user_id" as INT, FOREIGN KEY referencing users table
4. THE scan_history table SHALL have column "scan_type" as ENUM with values: 'url', 'email', 'whatsapp', 'qr', 'image', 'job', 'invest'
5. THE scan_history table SHALL have column "input" as TEXT storing the scanned content
6. THE scan_history table SHALL have column "result" as ENUM with values: 'safe', 'low_risk', 'suspicious', 'dangerous'
7. THE scan_history table SHALL have column "risk_score" as INT storing values 0-100
8. THE scan_history table SHALL have column "explanation" as TEXT storing the analysis explanation
9. THE scan_history table SHALL have column "created_at" as DATETIME with default CURRENT_TIMESTAMP

### Requirement 8: Store Scan Results in History

**User Story:** As a user, I want my scans automatically saved, so that I can review past results later.

#### Acceptance Criteria

1. WHEN a scan completes successfully, THE System SHALL insert a record into scan_history table
2. THE System SHALL store the user_id of the authenticated user
3. THE System SHALL store the scan_type matching the scanner endpoint used
4. THE System SHALL store the original input content (URL, message, email content, etc.)
5. THE System SHALL store the calculated result classification (safe, low_risk, suspicious, dangerous)
6. THE System SHALL store the calculated risk_score (0-100)
7. THE System SHALL store the generated explanation text
8. THE System SHALL store the timestamp when the scan was performed

### Requirement 9: Dashboard Scan History Section

**User Story:** As a user, I want to see my recent scans on the dashboard, so that I can quickly review my scan activity.

#### Acceptance Criteria

1. THE Dashboard SHALL display a "Recent Scan History" section
2. THE Dashboard SHALL show the last 5 scans for the authenticated user
3. WHEN displaying a scan record, THE Dashboard SHALL show the date and time
4. WHEN displaying a scan record, THE Dashboard SHALL show the scan type (URL, Email, WhatsApp, etc.)
5. WHEN displaying a scan record, THE Dashboard SHALL show the result classification with color coding
6. WHEN displaying a scan record, THE Dashboard SHALL show the risk score percentage
7. THE Dashboard SHALL display a "View All History" button linking to the full history page
8. WHEN the user has no scans, THE Dashboard SHALL display "No scans yet. Start scanning to see your history."

### Requirement 10: Full Scan History Page

**User Story:** As a user, I want a dedicated page to view all my scan history with filtering options, so that I can find specific past scans.

#### Acceptance Criteria

1. THE System SHALL provide a Scan History page accessible from the Dashboard
2. THE Scan_History page SHALL display all scans for the authenticated user in reverse chronological order
3. THE Scan_History page SHALL provide filter buttons: All, URL, Email, WhatsApp, QR, Screenshot, Job, Investment
4. WHEN a filter is selected, THE System SHALL display only scans matching that scan_type
5. THE Scan_History page SHALL provide a search input field
6. WHEN search text is entered, THE System SHALL filter results matching input content or explanation text
7. THE Scan_History page SHALL provide a date range picker
8. WHEN date range is selected, THE System SHALL display only scans within that date range
9. THE Scan_History page SHALL display scan records in a table format with columns: Date & Time, Type, Input Preview, Result, Risk Score, Actions
10. WHEN a scan record row is clicked, THE System SHALL expand to show full details including complete input and explanation

### Requirement 11: Scan History Plan-Based Limits

**User Story:** As a product owner, I want scan history access limited by subscription plan, so that premium features incentivize upgrades.

#### Acceptance Criteria

1. WHEN user has Free_Plan, THE System SHALL display only the last 10 scan records
2. WHEN user has Free_Plan, THE System SHALL only retrieve scans from the last 7 days
3. WHEN user has Free_Plan, THE System SHALL NOT display download options
4. WHEN user has Pro_Plan, THE System SHALL display unlimited scan records
5. WHEN user has Pro_Plan, THE System SHALL retrieve scans from the last 30 days
6. WHEN user has Pro_Plan, THE System SHALL display a "Download PDF Report" button
7. WHEN user has Business_Plan, THE System SHALL retrieve scans from the last 90 days
8. WHEN user has Business_Plan, THE System SHALL display both "Download PDF Report" and "Export CSV" buttons
9. IF user reaches plan limit, THEN THE System SHALL display upgrade prompt with plan comparison

### Requirement 12: PDF Report Generation

**User Story:** As a Pro or Business user, I want to download my scan history as a PDF, so that I can keep offline records for compliance.

#### Acceptance Criteria

1. WHERE user has Pro_Plan or Business_Plan, THE System SHALL provide PDF report generation
2. WHEN "Download PDF Report" is clicked, THE System SHALL generate a PDF containing visible scan history
3. THE PDF report SHALL include user name and plan
4. THE PDF report SHALL include report generation date and time
5. THE PDF report SHALL include a table with columns: Date, Type, Input Preview, Result, Risk Score
6. THE PDF report SHALL use color coding for risk levels (green=safe, yellow=suspicious, red=dangerous)
7. THE PDF report SHALL include BlockBridge branding and logo
8. THE System SHALL return the PDF file with filename format: "BlockBridge_ScanHistory_YYYY-MM-DD.pdf"

### Requirement 13: CSV Export Generation

**User Story:** As a Business user, I want to export scan history as CSV, so that I can analyze data in spreadsheet tools.

#### Acceptance Criteria

1. WHERE user has Business_Plan, THE System SHALL provide CSV export functionality
2. WHEN "Export CSV" is clicked, THE System SHALL generate a CSV file containing visible scan history
3. THE CSV file SHALL include headers: Date, Time, Type, Input, Result, Risk Score, Explanation
4. THE CSV file SHALL include all filtered scan records (respecting current filters)
5. THE System SHALL return the CSV file with filename format: "BlockBridge_ScanHistory_YYYY-MM-DD.csv"

### Requirement 14: Dashboard Layout Enhancement

**User Story:** As a user, I want an improved dashboard layout with comprehensive information, so that I have a complete overview of my account.

#### Acceptance Criteria

1. THE Dashboard SHALL display a welcome message with format "Welcome back, [NAME] 👋 [PLAN]"
2. THE Dashboard SHALL display a stats section showing: Scans Today, Current Plan, Scans Left
3. THE Dashboard SHALL display all 7 scanner cards (URL, Email, WhatsApp, QR, Screenshot, Job, Investment)
4. THE Dashboard SHALL display an "AI Insights" section with current threat intelligence
5. THE Dashboard SHALL include at least 2 AI insights such as trending scam types
6. THE Dashboard SHALL display the "Recent Scan History" section as defined in Requirement 9
7. THE Dashboard SHALL display a "Notifications" section
8. THE Dashboard SHALL show system notifications such as "New scam campaign detected" or "Password update recommended"
9. THE Dashboard SHALL display a "Subscription" section with current plan details
10. WHEN user has Free_Plan, THE Dashboard subscription section SHALL display an "Upgrade" button

### Requirement 15: Admin Panel Verification

**User Story:** As an administrator, I want to verify the admin panel is functional, so that I can manage users and system settings.

#### Acceptance Criteria

1. THE System SHALL provide an admin panel accessible to users with admin privileges
2. THE Admin_Panel SHALL require admin authentication
3. THE Admin_Panel SHALL display user management functionality
4. THE Admin_Panel SHALL display payment request management functionality
5. THE Admin_Panel SHALL display activation key management functionality
6. IF admin panel is not accessible, THEN THE System SHALL return appropriate error messages for debugging

### Requirement 16: Remove Razorpay Backend Integration

**User Story:** As a developer, I want Razorpay completely removed from the backend, so that the codebase reflects current payment processes.

#### Acceptance Criteria

1. THE System SHALL remove the razorpay package from backend dependencies
2. THE System SHALL remove Razorpay API initialization code from backend
3. THE System SHALL remove Razorpay order creation endpoints
4. THE System SHALL remove Razorpay payment verification endpoints
5. THE System SHALL remove Razorpay-related environment variables from backend configuration
6. THE System SHALL drop the "razorpay_order_id" column from payments table IF it exists
7. THE System SHALL drop the "razorpay_payment_id" column from payments table IF it exists
8. IF payments table is no longer used, THEN THE System SHALL drop the entire payments table

### Requirement 17: Scan History API Endpoints

**User Story:** As a frontend developer, I want REST API endpoints for scan history, so that I can retrieve and filter user scan data.

#### Acceptance Criteria

1. THE System SHALL provide a GET endpoint "/api/scan-history" for retrieving scan records
2. THE "/api/scan-history" endpoint SHALL require authentication
3. THE "/api/scan-history" endpoint SHALL accept query parameter "type" for filtering by scan_type
4. THE "/api/scan-history" endpoint SHALL accept query parameter "search" for text search
5. THE "/api/scan-history" endpoint SHALL accept query parameter "start_date" for date range filtering
6. THE "/api/scan-history" endpoint SHALL accept query parameter "end_date" for date range filtering
7. THE "/api/scan-history" endpoint SHALL return scan records matching user plan limits (10 for Free, unlimited for Pro/Business)
8. THE "/api/scan-history" endpoint SHALL return records in reverse chronological order
9. THE System SHALL provide a GET endpoint "/api/scan-history/download/pdf" for PDF generation
10. THE System SHALL provide a GET endpoint "/api/scan-history/download/csv" for CSV export
11. THE download endpoints SHALL enforce plan-based access control (Pro/Business only)

### Requirement 18: Frontend Scan History Component

**User Story:** As a frontend developer, I want a reusable scan history component, so that I can display scan records consistently across pages.

#### Acceptance Criteria

1. THE System SHALL create a ScanHistoryTable React component
2. THE ScanHistoryTable component SHALL accept props: scans (array), showFilters (boolean), compact (boolean)
3. THE ScanHistoryTable SHALL display scan records in table format
4. THE ScanHistoryTable SHALL apply color coding: green for safe, yellow for suspicious/low_risk, red for dangerous
5. WHEN compact mode is enabled, THE ScanHistoryTable SHALL display limited columns (Date, Type, Result)
6. WHEN compact mode is disabled, THE ScanHistoryTable SHALL display all columns including Input Preview and Risk Score
7. THE ScanHistoryTable SHALL handle empty state with message "No scans found"
8. THE ScanHistoryTable SHALL display truncated input text with "..." for long inputs (max 50 characters)

### Requirement 19: Scan Type Display Labels

**User Story:** As a user, I want clear, readable labels for scan types, so that I understand what was scanned.

#### Acceptance Criteria

1. WHEN scan_type is "url", THE System SHALL display label "URL Scan"
2. WHEN scan_type is "email", THE System SHALL display label "Email Scan"
3. WHEN scan_type is "whatsapp", THE System SHALL display label "WhatsApp Scan"
4. WHEN scan_type is "qr", THE System SHALL display label "QR Code Scan"
5. WHEN scan_type is "image", THE System SHALL display label "Screenshot Scan"
6. WHEN scan_type is "job", THE System SHALL display label "Job Offer Scan"
7. WHEN scan_type is "invest", THE System SHALL display label "Investment Scan"

### Requirement 20: Risk Score Color Coding

**User Story:** As a user, I want visual indicators for risk levels, so that I can quickly identify dangerous content.

#### Acceptance Criteria

1. WHEN result is "safe", THE System SHALL display green color (hex #22c55e or equivalent)
2. WHEN result is "low_risk", THE System SHALL display yellow color (hex #eab308 or equivalent)
3. WHEN result is "suspicious", THE System SHALL display orange color (hex #f97316 or equivalent)
4. WHEN result is "dangerous", THE System SHALL display red color (hex #ef4444 or equivalent)
5. THE System SHALL apply color coding consistently across Dashboard, Scan History page, and PDF reports

### Requirement 21: Real-Time Scan Count Updates

**User Story:** As a user, I want my scan count to update immediately after scanning, so that I know how many scans I have left.

#### Acceptance Criteria

1. WHEN a scan completes successfully, THE Dashboard SHALL update the "Scans Today" counter
2. WHEN a scan completes successfully, THE Dashboard SHALL update the "Scans Left" counter for Free plan users
3. THE System SHALL fetch updated quota information from the server after each scan
4. WHEN user reaches scan limit, THE Dashboard SHALL display "0 scans left" and upgrade prompt

### Requirement 22: Scan History Privacy

**User Story:** As a user, I want my scan history to be private, so that only I can access my scanned content.

#### Acceptance Criteria

1. THE System SHALL only return scan_history records where user_id matches the authenticated user
2. THE System SHALL NOT allow users to access other users' scan history
3. THE System SHALL NOT expose user_id in API responses to frontend
4. WHEN an unauthorized access attempt occurs, THE System SHALL return 403 Forbidden error
