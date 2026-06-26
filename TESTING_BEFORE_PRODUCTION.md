# 🧪 Complete Testing Guide - Before Going Live

## 📋 **Current Status**

✅ **Payment Mode**: TEST MODE  
✅ **Razorpay Keys**: Demo/Test keys (no real money)  
✅ **Ready for**: Full functionality testing  
🔒 **Production**: Not ready (need real Razorpay keys)

---

## 🎯 **What We're Testing**

Before adding real payment keys, we'll verify:
1. All scanners work properly
2. Scan count updates correctly
3. Dashboard displays properly
4. User registration/login works
5. Database operations work
6. UI/UX is smooth

**Payment will show error** - that's EXPECTED and CORRECT until we add real keys!

---

## ✅ **Step-by-Step Testing**

### **Test 1: Backend Health Check**

**Open browser**: http://localhost:5001  
**Expected**: "BlockBridge API is running"

✅ Pass / ❌ Fail

---

### **Test 2: Frontend Loads**

**Open browser**: http://localhost:5173  
**Expected**: Homepage with "BlockBridge ScamGuard AI"

✅ Pass / ❌ Fail

---

### **Test 3: User Registration**

1. Click "Login" or go to http://localhost:5173/#/login
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123
3. Click "Sign Up"
4. **Expected**: Registration successful, redirect to dashboard

✅ Pass / ❌ Fail

---

### **Test 4: Dashboard Display**

**Check these elements**:
- [ ] Welcome message with your name
- [ ] Plan badge shows "FREE"
- [ ] Stats show: Scans Today (0), Scans Left (5), Daily Limit (5/day)
- [ ] 8 scanner tiles visible
- [ ] URL, WhatsApp, Email, QR, Screenshot scanners unlocked
- [ ] Job, Investment, API scanners show "PRO" lock

✅ Pass / ❌ Fail

---

### **Test 5: URL Scanner**

1. Click "URL Scanner" tile (🔍)
2. Type: `https://test-suspicious-site.com`
3. Click "Scan with AI"
4. **Expected**: 
   - Result shows (SAFE/SUSPICIOUS/DANGEROUS)
   - Score displayed
   - Explanation shown
5. Click "← Back to Dashboard"
6. **Expected**: "Scans Today" = 1, "Scans Left" = 4

✅ Pass / ❌ Fail

---

### **Test 6: Email Scanner (IMPORTANT)**

1. Click "Email Scanner" tile (📧)
2. **Check**: Can you type in the textarea box? (This was the reported issue)
3. Type: `Congratulations! You won $10,000. Click here to claim your prize now!`
4. Click "Scan with AI"
5. **Expected**: 
   - Shows DANGEROUS or SUSPICIOUS
   - Explanation about scam patterns
6. Back to Dashboard
7. **Expected**: "Scans Today" = 2

✅ Pass / ❌ Fail  
✅ **Textarea typing works** / ❌ Can't type

---

### **Test 7: WhatsApp Scanner**

1. Click "WhatsApp Scanner" tile (💬)
2. Type test message
3. Click "Scan with AI"
4. **Expected**: Result shown
5. Back to Dashboard: "Scans Today" = 3

✅ Pass / ❌ Fail

---

### **Test 8: QR Scanner**

1. Click "QR Scanner" tile (📷)
2. Try to upload an image file
3. **Expected**: File upload interface works

✅ Pass / ❌ Fail

---

### **Test 9: Screenshot Analyzer**

1. Click "Screenshot Analyzer" tile (🖼)
2. Try to upload an image
3. **Expected**: Works same as QR Scanner

✅ Pass / ❌ Fail

---

### **Test 10: Premium Scanner Lock (Job Scam)**

1. Click "Job Scam Detector" tile (💼)
2. **Expected**: Redirects to pricing page (locked for FREE users)

✅ Pass / ❌ Fail

---

### **Test 11: Scan Limit (FREE User)**

1. Scan 2 more times (any scanner)
2. You should now have 5 scans total
3. Try to scan again (6th time)
4. **Expected**: 
   - Shows "Free Plan Limit Reached" message
   - Upgrade wall displayed
   - "Upgrade to Pro" button shown

✅ Pass / ❌ Fail

---

### **Test 12: Pricing Page**

1. Go to http://localhost:5173/#/pricing
2. **Check**:
   - [ ] 3 plans shown: FREE, PRO (₹199), BUSINESS (₹499)
   - [ ] PRO features list shows 5 items
   - [ ] BUSINESS features list shows 9 items
   - [ ] Comparison table has 14 rows
   - [ ] FAQ includes "PRO vs BUSINESS" question

✅ Pass / ❌ Fail

---

### **Test 13: Payment Button (Expected to Show Error)**

1. On Pricing page, click "Upgrade to Pro"
2. **Expected Behavior** (with test/demo keys):
   - Alert: "Payment gateway not configured"
   - This is CORRECT - we haven't added real keys yet!

✅ Pass (shows error) / ❌ Unexpected behavior

---

### **Test 14: Logout & Login**

1. Click "Logout"
2. **Expected**: Redirected to homepage
3. Click "Login" again
4. Enter same credentials: test@example.com / Test123
5. **Expected**: Login successful, dashboard shows correct data
6. **Check**: Scan count reset? (should reset next day, not immediately)

✅ Pass / ❌ Fail

---

### **Test 15: Mobile Responsiveness**

1. Open browser dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - [ ] iPhone viewport (375px)
   - [ ] Tablet viewport (768px)
   - [ ] Desktop (1920px)
4. **Check**: All elements responsive, no overflow

✅ Pass / ❌ Fail

---

## 🐛 **Known Issues to Verify**

### Issue 1: Email Scanner Textarea Not Working
**Status**: Should be FIXED now  
**Test**: Can you type in Email Scanner textarea?  
- ✅ Fixed / ❌ Still broken

### Issue 2: Scan Count Not Updating
**Status**: Should be FIXED now  
**Test**: After each scan, does "Scans Today" increment?  
- ✅ Fixed / ❌ Still broken

### Issue 3: Quick URL Scan Duplicate
**Status**: Should be REMOVED now  
**Test**: Is there a "Quick URL Scan" box on dashboard?  
- ✅ Removed / ❌ Still there

---

## 📊 **Test Results Summary**

Total Tests: 15

**Results**:
- ✅ Passed: ___
- ❌ Failed: ___
- ⏭️ Skipped: ___

**Critical Issues**:
- List any failures here

---

## 🚀 **Next Steps After Testing**

### If All Tests Pass ✅

**You're ready for production!** Follow these steps:

1. **Get Razorpay LIVE Keys**:
   ```
   1. Go to https://dashboard.razorpay.com/
   2. Complete KYC if not done
   3. Switch to LIVE mode
   4. Go to Settings → API Keys
   5. Generate LIVE keys
   ```

2. **Update Backend .env**:
   ```env
   RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_KEY
   RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET
   ```

3. **Test with ₹1 First**:
   - Edit backend/routes/paymentRoutes.js
   - Change PLAN_AMOUNTS to 100 (₹1)
   - Test real payment
   - Verify plan updates
   - Change back to 19900/49900

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Production ready with live Razorpay keys"
   git push origin master
   ```

### If Tests Fail ❌

**Report issues**:
1. Which test failed?
2. What was expected?
3. What actually happened?
4. Screenshot if UI issue

---

## 💡 **Testing Tips**

1. **Clear browser cache** before testing (Ctrl+Shift+Delete)
2. **Test in Incognito mode** for fresh state
3. **Open browser console** (F12) to check for errors
4. **Check backend terminal** for server errors
5. **Use MySQL Workbench** to verify database changes

---

## 📝 **Database Verification**

**Check users table**:
```sql
SELECT id, email, plan, scans_today, scans_reset_date, subscription_status 
FROM users 
WHERE email = 'test@example.com';
```

**Expected**:
- plan: 'FREE'
- scans_today: (your total scans)
- subscription_status: NULL or 'ACTIVE'

---

## ⚠️ **Important Notes**

1. **Don't worry about payment error** - it's expected with demo keys
2. **All other features should work** perfectly
3. **Once real keys added**, payment will work immediately
4. **Test mode keys** (rzp_test_) don't charge real money
5. **Live mode keys** (rzp_live_) charge REAL money!

---

## ✅ **Sign Off**

**Tested by**: _______________  
**Date**: _______________  
**Overall Status**: ✅ Ready for Production / ❌ Needs Fixes  
**Notes**: _______________

---

**After completing all tests, you're ready to add real Razorpay keys and go live!** 🚀


<function_calls>
<invoke name="executePwsh">
<parameter name="command">curl http://localhost:5001/api/auth/health 2>&1 | Select-Object -First 5