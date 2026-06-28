# Implementation Plan: Activation Key-Based Subscription System

## Overview

This implementation plan breaks down the activation key-based subscription system into incremental coding tasks. Each task builds on previous work, with testing integrated throughout to catch errors early. The plan follows the order: database setup → backend core logic → backend API routes → frontend pages → integration → deployment.

## Tasks

### Phase 1: Database Schema and Setup

- [x] 1. Set up database schema and create admin account
  - Execute SQL migration to add `activation_date` column to `users` table
  - Create `payment_requests` table with all required fields and indexes
  - Create `activation_keys` table with unique constraint on `key_value`
  - Create `admin_users` table
  - Generate bcrypt hash for initial admin password using Node.js script
  - Insert initial admin account into `admin_users` table
  - Verify all tables created successfully with test queries
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

### Phase 2: Backend Core Utilities

- [x] 2. Implement activation key generation utility
  - [x] 2.1 Create `utils/keyGenerator.js` module
    - Implement character set constant excluding ambiguous characters (0,O,1,I,L)
    - Implement `generateActivationKey()` function using crypto.randomBytes()
    - Format output as `BBSG-XXXX-XXXX-XXXX` with proper grouping
    - Implement `generateUniqueKey(db)` function with collision detection
    - Add retry logic (up to 10 attempts) for collision resolution
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x]* 2.2 Write property test for activation key format
    - **Property 7: Activation Key Format**
    - **Validates: Requirements 5.1**
    - Generate 100 random keys and verify format matches regex
    - Verify no ambiguous characters present
  
  - [x]* 2.3 Write property test for key uniqueness
    - **Property 8: Activation Key Uniqueness**
    - **Validates: Requirements 5.3, 5.4**
    - Test collision detection with mocked database
    - Verify retry logic works correctly

