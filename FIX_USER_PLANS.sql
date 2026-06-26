-- Fix all users to have correct FREE plan status
-- Run this in MySQL Workbench or command line

USE blockbridge;

-- Check current user plans
SELECT id, email, plan, subscription_status, expiry_date FROM users;

-- Reset all users without paid subscription to FREE plan
UPDATE users 
SET plan = 'FREE', 
    subscription_status = 'NONE', 
    expiry_date = NULL
WHERE plan IS NULL 
   OR (plan != 'FREE' AND subscription_status != 'ACTIVE');

-- Verify the fix
SELECT id, email, plan, subscription_status, expiry_date FROM users;
