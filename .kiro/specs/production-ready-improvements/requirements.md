# Requirements Document

## Introduction

This document specifies requirements for upgrading a scam detection SaaS product to production-ready quality. The system provides AI-powered scanning of URLs, emails, WhatsApp messages, QR codes, and screenshots to detect potential scams and phishing attempts. This upgrade focuses on implementing intelligent risk analysis, comprehensive scan history tracking, UI/UX improvements, and payment system updates to create a professional product suitable for demonstration to judges and real-world deployment.

## Glossary

- **Scanner**: A component that analyzes user input (URL, email, message, QR code, or screenshot) for scam indicators
- **Risk_Score**: A numerical value between 0-100 representing the likelihood that input is a scam
- **Scan_History**: A database record of all scans performed by a user
- **User_Plan**: The subscription tier (FREE, PRO, or BUSINESS) that determines feature access
- **Payment_System**: The infrastructure for handling subscription payments and verification
- **Risk_Analyzer**: The AI logic that calculates risk scores based on multiple indicators
- **Dashboard**: The user interface displaying scan statistics, history, and insights
- **Admin_Panel**: The administrative interface for managing users and viewing system statistics
- **Input_Validator**: Component that verifies input format before scanning
- **Blacklist**: A database of known malicious domains and patterns

## Requirements

### Requirement 1: Smart AI Risk Analysis System

**User Story:** As a user, I want accurate risk assessments of URLs, emails, and messages, so that I can trust the system's scam detection capabilities.

#### Acceptance Criteria

1. WHEN a user submits input for scanning, THE Input_Validator SHALL verify the input matches the expected format (URL, email, or message) before analysis
2. WHEN input fails format validation, THE Scanner SHALL return an "Invalid Input" result without performing risk analysis
3. WHEN analyzing a URL with HTTPS protocol, THE Risk_Analyzer SHALL reduce the Risk_Score by 10 points
4. WHEN analyzing a URL matching entries in the Blacklist, THE Risk_Analyzer SHALL increase the Risk_Score by 40 points
5. WHEN analyzing text containing suspicious keywords (win, free, click, urgent, OTP), THE Risk_Analyzer SHALL increase the Risk_Score by 20 points per keyword occurrence
6. WHEN analyzing a URL using a known URL shortener domain (bit.ly, tinyurl.com, goo.gl), THE Risk_Analyzer SHALL increase the Risk_Score by 10 points
7. WHEN analyzing a URL with a domain registration date less than 90 days old, THE Risk_Analyzer SHALL increase the Risk_Score by 25 points
8. WHEN analyzing a URL that performs multiple redirects (more than 2), THE Risk_Analyzer SHALL increase the Risk_Score by 15 points
9. WHEN the final Risk_Score is between 0-25, THE Scanner SHALL classify the result as "SAFE"
10. WHEN the final Risk_Score is between 26-50, THE Scanner SHALL classify the result as "LOW RISK"
11. WHEN the final Risk_Score is between 51-75, THE Scanner SHALL classify the result as "SUSPICIOUS"
12. WHEN the final Risk_Score is between 76-100, THE Scanner SHALL classify the result as "DANGEROUS"
13. FOR ALL valid inputs, THE Risk_Analyzer SHALL calculate scores deterministically based on the defined criteria (no random values)

### Requirement 2: Input Validation and Format Detection

**User Story:** As a user, I want the system to validate my input before scanning, so that I receive meaningful results only for valid data.

#### Acceptance Criteria

1. WHEN a user submits text for URL scanning, THE Input_Validator SHALL verify it contains a valid domain structure
2. WHEN a user submits text for email scanning, THE Input_Validator SHALL verify it matches standard email format patterns
3. WHEN a user submits text for message scanning, THE Input_Validator SHALL accept any non-empty string input
4. WHEN invalid input is detected, THE System SHALL display a clear error message indicating the expected format
5. THE Input_Validator SHALL distinguish between URL, email, and message formats automatically based on input patterns

### Requirement 3: Comprehensive Scan History System

**User Story:** As a user, I want to view my past scans and their results, so that I can track patterns and refer to previous analyses.

#### Acceptance Criteria

1. WHEN a scan completes successfully, THE System SHALL save a record to the Scan_History database table containing user_id, scan_type, input, result, risk_score, and timestamp
2. WHEN a user views their Dashboard, THE System SHALL display the 5 most recent scans from Scan_History
3. WHEN a user navigates to the Scan History page, THE System SHALL display all accessible scans based on their User_Plan restrictions
4. WHERE the user has a FREE plan, THE System SHALL limit Scan_History access to the most recent 10 scans from the last 7 days
5. WHERE the user has a PRO plan, THE System SHALL provide access to all scans from the last 30 days
6. WHERE the user has a BUSINESS plan, THE System SHALL provide access to all scans from the last 90 days
7. WHEN viewing Scan History, THE System SHALL provide filter options for scan type (All, URL, Email, WhatsApp, QR, Screenshot)
8. WHEN viewing Scan History, THE System SHALL provide search functionality to find specific scans by input content
9. WHEN a user requests a PDF report of a scan, THE System SHALL generate a formatted document containing scan details and risk analysis
10. WHERE the user has a FREE plan, THE System SHALL disable PDF download functionality
11. WHERE the user has a PRO or BUSINESS plan, THE System SHALL enable PDF report downloads for individual scans
12. WHERE the user has a BUSINESS plan, THE System SHALL additionally enable CSV export of scan history data

### Requirement 4: Enhanced User Dashboard

**User Story:** As a user, I want an informative dashboard that shows my scan activity and insights, so that I can quickly understand my usage and current threats.

#### Acceptance Criteria

1. WHEN a user views the Dashboard, THE System SHALL display a "Recent Scan History" section showing the last 5-10 scans
2. FOR each scan in Recent Scan History, THE System SHALL display the date, time, scan type, result classification, and risk score percentage
3. WHEN a user views the Dashboard, THE System SHALL display aggregate statistics including scans performed today, current User_Plan, and remaining scans for plan limits
4. WHEN a user views the Dashboard, THE System SHALL display an "AI Insights" section with trending scam alert information
5. WHEN a user clicks "View All History" on the Dashboard, THE System SHALL navigate to the full Scan History page
6. THE Dashboard SHALL present information in a professional, visually organized layout suitable for demonstration purposes

### Requirement 5: UI/UX Improvements

**User Story:** As a user, I want a clean and professional interface, so that I can easily navigate and use the scam detection features.

#### Acceptance Criteria

1. THE System SHALL remove the "Start Free Scan" button from the Home page
2. THE System SHALL remove the "Start Free Scan" button from the About page
3. WHEN a user views the Contact page, THE System SHALL display the email address as blockbridgescamguardai@gmail.com
4. WHEN a user views the Contact page, THE System SHALL display the phone number as +91 6381487329
5. THE System SHALL remove the "Business & Enterprise Solutions" card from the Contact page
6. WHEN a user attempts to upload an image in any scanner, THE System SHALL accept and process the upload without errors
7. THE System SHALL ensure image upload functionality works consistently across URL scanner, email scanner, WhatsApp scanner, QR scanner, and screenshot scanner

### Requirement 6: Payment Submission and Verification System

**User Story:** As a user, I want to submit payment proof and receive activation keys, so that I can upgrade my subscription plan through a manual verification process.

#### Acceptance Criteria

1. THE System SHALL remove all references to Razorpay from the codebase, including import statements, configuration variables, and API calls
2. THE System SHALL remove all Razorpay-related database columns and tables
3. THE System SHALL remove all Razorpay UI components and payment integration code
4. WHEN a user clicks "Upgrade to Pro" on the pricing page, THE System SHALL navigate to a Payment Submission page
5. WHEN displaying the Payment Submission page, THE System SHALL show UPI ID as amirtha@okaxis (or 6381487329@ybl), payment amount, and QR code image
6. WHEN a user submits payment, THE Payment_System SHALL collect name, email, transaction ID, and payment screenshot upload
7. WHEN payment submission is successful, THE System SHALL display confirmation message: "Payment Submitted Successfully. Your payment is under verification. Estimated verification time: Within 24 hours."
8. WHEN displaying the Business plan pricing, THE System SHALL show the duration as "3 months" instead of "per month"
9. WHEN displaying Pro plan pricing, THE System SHALL show amount as ₹199
10. THE Payment_System SHALL store submitted payment requests with status "Pending" in the database

### Requirement 7: Scan History Database Schema

**User Story:** As a system administrator, I want a properly structured database for scan history, so that the application can reliably store and retrieve scan data.

#### Acceptance Criteria

1. THE System SHALL maintain a database table named scan_history
2. THE scan_history table SHALL include columns: id (primary key, auto-increment), user_id (foreign key), scan_type (enum), input (text), result (varchar), risk_score (integer), created_at (timestamp)
3. WHEN a new scan is performed, THE System SHALL insert a record into scan_history with all required fields populated
4. THE System SHALL create appropriate indexes on user_id and created_at columns for query performance
5. THE System SHALL enforce referential integrity between scan_history.user_id and the users table

### Requirement 8: Plan-Based Feature Restrictions

**User Story:** As a business owner, I want different feature access levels for each plan tier, so that users are incentivized to upgrade for premium features.

#### Acceptance Criteria

1. WHERE the user has a FREE plan, THE System SHALL restrict scan history to 10 scans maximum
2. WHERE the user has a FREE plan, THE System SHALL restrict scan history to 7 days retention
3. WHERE the user has a FREE plan, THE System SHALL disable PDF report downloads
4. WHERE the user has a PRO plan, THE System SHALL provide unlimited scan access
5. WHERE the user has a PRO plan, THE System SHALL provide 30-day scan history retention
6. WHERE the user has a PRO plan, THE System SHALL enable search and filter functionality in scan history
7. WHERE the user has a PRO plan, THE System SHALL enable PDF report downloads
8. WHERE the user has a BUSINESS plan, THE System SHALL provide unlimited scan history retention (90 days minimum)
9. WHERE the user has a BUSINESS plan, THE System SHALL enable team scan visibility features
10. WHERE the user has a BUSINESS plan, THE System SHALL enable both PDF and CSV export functionality
11. WHERE the user has a BUSINESS plan, THE System SHALL provide analytics dashboard features

### Requirement 9: Comprehensive Admin Panel with Payment Management

**User Story:** As an administrator, I want a comprehensive admin panel with payment approval workflow, so that I can manage users, generate activation keys, and handle payment verification.

#### Acceptance Criteria

1. THE Admin_Panel SHALL be accessible only through a hidden URL (e.g., /admin or /admin/login)
2. THE Admin_Panel SHALL require separate admin authentication credentials distinct from regular user authentication
3. WHEN an administrator logs in, THE System SHALL display a navigation menu with options: Dashboard, Pending Payments, Approved Payments, Users, Activation Keys, Subscriptions, Reports, Logout
4. WHEN viewing the Dashboard, THE Admin_Panel SHALL display aggregate statistics: Total Users, Pending Payments count, Pro Users count, Business Users count, and Today's Scans count
5. WHEN viewing Pending Payments, THE Admin_Panel SHALL display a table showing User, Plan, Amount, Transaction ID, Screenshot, and Action columns
6. WHEN an administrator clicks "View Screenshot" on a payment request, THE System SHALL display the uploaded payment proof image
7. WHEN an administrator clicks "Approve" on a payment request, THE System SHALL prompt for confirmation to generate an activation key
8. WHEN approval is confirmed, THE System SHALL generate a unique activation key in format "BB-{PLAN}-{RANDOM}" (e.g., BB-PRO-X82KLM)
9. WHEN an activation key is generated, THE System SHALL store it in the database with fields: key, plan, status (Unused), generated_date, expiry_date
10. WHEN an activation key is generated, THE System SHALL update the payment request status to "Approved"
11. WHEN viewing the Activation Keys page, THE Admin_Panel SHALL display a table showing Key, Plan, Status (Used/Unused), Used By, and Expiry columns
12. WHEN viewing the Users page, THE Admin_Panel SHALL display Name, Email, Plan, and Expiry Date for all registered users
13. WHEN an administrator clicks "Reject" on a payment request, THE System SHALL update the payment status to "Rejected" and optionally notify the user

### Requirement 10: Suspicious Content Detection Patterns

**User Story:** As a user, I want the system to recognize common scam patterns in multiple languages, so that I'm protected from localized phishing attempts.

#### Acceptance Criteria

1. WHEN analyzing text containing the word "win" (case-insensitive), THE Risk_Analyzer SHALL add 20 points to the Risk_Score
2. WHEN analyzing text containing the word "free" (case-insensitive), THE Risk_Analyzer SHALL add 20 points to the Risk_Score
3. WHEN analyzing text containing the word "click" (case-insensitive), THE Risk_Analyzer SHALL add 20 points to the Risk_Score
4. WHEN analyzing text containing the word "urgent" (case-insensitive), THE Risk_Analyzer SHALL add 20 points to the Risk_Score
5. WHEN analyzing text containing "OTP" (case-insensitive), THE Risk_Analyzer SHALL add 20 points to the Risk_Score
6. THE Risk_Analyzer SHALL support detection of suspicious patterns in regional language content (Tamil, Hindi)
7. WHEN multiple suspicious keywords are present, THE Risk_Analyzer SHALL accumulate risk points for each occurrence

### Requirement 11: Domain Age and Redirect Analysis

**User Story:** As a user, I want the system to check domain trustworthiness indicators, so that I can avoid newly-created phishing sites and suspicious redirects.

#### Acceptance Criteria

1. WHEN analyzing a URL, THE Risk_Analyzer SHALL query domain registration information to determine domain age
2. WHEN domain registration data is unavailable, THE Risk_Analyzer SHALL not penalize the Risk_Score for domain age
3. WHEN analyzing a URL, THE Risk_Analyzer SHALL follow redirects up to a maximum depth of 5 to detect redirect chains
4. WHEN a redirect chain exceeds 2 redirects, THE Risk_Analyzer SHALL add 15 points to the Risk_Score
5. THE System SHALL implement timeout protections to prevent analysis delays from slow-responding domains

### Requirement 12: Activation Key System

**User Story:** As a user, I want to activate my subscription using an activation key, so that I can access premium features after payment verification.

#### Acceptance Criteria

1. WHEN a user navigates to their Dashboard and clicks "Subscription" → "Activate Plan", THE System SHALL display an activation key input form
2. WHEN a user enters an activation key and clicks "Activate", THE System SHALL validate the key format matches "BB-{PLAN}-{CODE}"
3. WHEN validating an activation key, THE System SHALL check if the key exists in the database
4. WHEN an activation key does not exist, THE System SHALL display error message: "Invalid activation key"
5. WHEN validating an existing activation key, THE System SHALL check if it has already been used
6. WHEN an activation key has already been used, THE System SHALL display error message: "This activation key has already been activated"
7. WHEN an activation key is valid and unused, THE System SHALL update the user's plan to match the key's plan type (PRO or BUSINESS)
8. WHEN an activation key is successfully applied, THE System SHALL mark the key status as "Used" and record the user_id
9. WHEN an activation key is successfully applied, THE System SHALL display success message and update the Dashboard to reflect the new plan
10. THE System SHALL set appropriate expiry dates for activated plans (Pro: 1 month, Business: 3 months)

### Requirement 13: BlockBridge AI Assistant Chatbot

**User Story:** As a user, I want an AI assistant chatbot to help me understand features and get guidance, so that I can quickly get answers without searching through documentation.

#### Acceptance Criteria

1. THE System SHALL display a floating chat icon in the bottom-right corner on every page
2. WHEN a user clicks the chat icon, THE System SHALL open a chat interface with title "BlockBridge AI Assistant"
3. WHEN the chat opens, THE System SHALL display welcome message: "Hello! 👋 I'm your AI Cyber Safety Assistant. I can help you identify scams, explain risk scores, provide cybersecurity tips, and guide you through using BlockBridge ScamGuard AI."
4. WHEN the chat opens, THE System SHALL display quick action buttons: Scan a URL, Check an Email, Analyze WhatsApp Message, QR Code Safety, Job Scam Check, Investment Scam Check, Cyber Safety Tips, Contact Support
5. WHEN a user asks about platform features, THE Chatbot SHALL provide accurate information from predefined FAQ responses
6. WHEN a user asks about suspicious content, THE Chatbot SHALL recommend using the appropriate scanner tool
7. WHEN the Chatbot cannot determine if something is a scam, THE Chatbot SHALL clearly state it cannot confirm based only on chat and encourage using relevant scanners
8. THE Chatbot SHALL never claim content is safe or dangerous without actual scanner analysis
9. WHEN ending relevant conversations, THE Chatbot SHALL include: "Stay safe online with BlockBridge ScamGuard AI."
10. THE Chatbot SHALL respond in a friendly, professional, and concise manner
11. THE Chatbot SHALL support all FAQ topics including: platform overview, scanner instructions, risk score interpretation, data privacy, upgrade process, and scam detection capabilities

### Requirement 14: Scanner Examples and Test Cases

**User Story:** As a developer, I want comprehensive test cases for each scanner type, so that I can validate the AI risk analysis produces accurate results across various inputs.

#### Acceptance Criteria

1. WHEN analyzing "https://www.google.com", THE Risk_Analyzer SHALL return Risk Score of approximately 5% with status "SAFE"
2. WHEN analyzing "http://google-login-free.xyz", THE Risk_Analyzer SHALL return Risk Score above 90% with status "DANGEROUS"
3. WHEN analyzing "http://paytm-secure-login.xyz", THE Risk_Analyzer SHALL return Risk Score above 90% with status "DANGEROUS"
4. WHEN analyzing message "Hi Amirtha, Can we meet tomorrow at 10 AM?", THE Risk_Analyzer SHALL return Risk Score below 5% with status "SAFE"
5. WHEN analyzing message "Congratulations! You won ₹5,00,000. Click here immediately. Share your OTP.", THE Risk_Analyzer SHALL return Risk Score above 95% with status "DANGEROUS"
6. WHEN analyzing message "Your bank account will be blocked. Verify immediately.", THE Risk_Analyzer SHALL return Risk Score between 51-75% with status "SUSPICIOUS"
7. WHEN analyzing email with subject "Meeting Schedule" and professional body text, THE Risk_Analyzer SHALL return Risk Score below 10% with status "SAFE"
8. WHEN analyzing email with subject "Urgent Password Reset" and suspicious link, THE Risk_Analyzer SHALL return Risk Score above 90% with status "DANGEROUS"
9. WHEN analyzing job posting for "Infosys Software Engineer" with careers.infosys.com link, THE Risk_Analyzer SHALL return Risk Score below 10% with status "SAFE"
10. WHEN analyzing job posting requesting "Registration Fee ₹999" with immediate joining, THE Risk_Analyzer SHALL return Risk Score above 95% with status "DANGEROUS"
11. WHEN analyzing investment opportunity promising "500% Guaranteed No Risk", THE Risk_Analyzer SHALL return Risk Score above 95% with status "DANGEROUS"
12. WHEN analyzing investment "Mutual Fund SIP Expected Return 10%", THE Risk_Analyzer SHALL return Risk Score below 10% with status "SAFE"

### Requirement 15: AI Insights and Notifications

**User Story:** As a user, I want to see trending scam alerts and cybersecurity insights, so that I stay informed about current threats.

#### Acceptance Criteria

1. WHEN a user views the Dashboard, THE System SHALL display an "AI Insights" section
2. THE AI Insights section SHALL include trending scam pattern information such as: most detected scam types, percentage increases in specific scam categories, and safety recommendations
3. WHEN a user views the Dashboard, THE System SHALL display a "Notifications" section with recent cybersecurity alerts
4. THE Notifications section SHALL include alerts about: new phishing campaigns, trending scam types, security best practices reminders, and platform updates
5. THE System SHALL update insights and notifications based on aggregate scan data across all users
6. THE Insights SHALL display actionable guidance such as "Avoid clicking shortened links" and "Always verify unknown recruiters"

### Requirement 16: Professional Production Quality

**User Story:** As a product owner, I want the application to demonstrate professional quality suitable for judges and real users, so that it creates a positive impression and is viable for production use.

#### Acceptance Criteria

1. THE System SHALL display consistent, professional styling across all pages
2. THE System SHALL provide clear, helpful error messages for all user-facing errors
3. THE System SHALL respond to user actions within 3 seconds under normal load conditions
4. THE System SHALL handle edge cases gracefully without crashing or displaying technical error details to users
5. THE System SHALL present information with proper formatting, spacing, and visual hierarchy
6. THE System SHALL use professional, grammatically correct copy throughout the interface
7. THE System SHALL ensure all scanner types (URL, Email, WhatsApp, QR, Screenshot, Job, Investment) produce consistent result formats
8. THE System SHALL display risk scores with percentage values and color-coded visual indicators (Green: 0-25, Yellow: 26-50, Orange: 51-75, Red: 76-100)
