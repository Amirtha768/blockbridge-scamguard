# 🚀 Razorpay Live Mode Setup Guide
## Enable Real Money Payments for BlockBridge ScamGuard AI

---

## ⚠️ IMPORTANT: Pre-Requirements

Before switching to Live Mode, you MUST complete:

### 1. **Razorpay Account Activation**
- ✅ Complete KYC (Know Your Customer) verification
- ✅ Submit business documents (PAN, GST, Bank Account)
- ✅ Get Razorpay account approved (usually takes 24-48 hours)
- ✅ Activate Live Mode in Razorpay Dashboard

### 2. **Legal Requirements for India**
- Business registration or individual PAN card
- GST registration (if annual turnover > ₹20 lakhs)
- Bank account linked to your business/PAN
- Business address proof

---

## 📋 Step-by-Step Setup Process

### Step 1: Login to Razorpay Dashboard
1. Go to: https://dashboard.razorpay.com/
2. Login with your account
3. **Switch to LIVE MODE** (toggle in top-left corner)

### Step 2: Get Live API Keys
1. In Live Mode, go to **Settings** → **API Keys**
2. Click **Generate Live Keys**
3. You'll get:
   - `Key ID` (starts with `rzp_live_`)
   - `Key Secret` (keep this SECRET!)

### Step 3: Setup Webhook (Important for Payment Verification)
1. Go to **Settings** → **Webhooks**
2. Click **+ Add New Webhook**
3. Configure:
   - **Webhook URL**: `https://your-domain.com/api/payment/webhook`
   - **Secret**: Generate a random secret (save it!)
   - **Events**: Select `payment.captured`
4. Click **Create Webhook**

### Step 4: Update Backend Environment Variables
1. Open `backend/.env` file
2. Update these values:

```env
# Razorpay LIVE MODE Keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
```

### Step 5: Restart Your Backend Server
```bash
cd backend
npm run dev
```

### Step 6: Test with Real Payment
1. Open your app: http://localhost:5173 (or your domain)
2. Go to Pricing page
3. Click "Upgrade to Pro"
4. **Use real payment method** (UPI, Card, Net Banking)
5. Complete payment (real money will be charged!)
6. Verify: Check Dashboard → Should show "PRO" plan

---

## 🔒 Security Checklist

Before going live, ensure:

- [ ] `.env` file is in `.gitignore` (NEVER commit secrets to Git!)
- [ ] Backend is running on HTTPS (required for production)
- [ ] Razorpay webhook secret is configured
- [ ] Database has proper indexes and backups
- [ ] Error logging is enabled
- [ ] Payment failure notifications are set up

---

## 💰 Payment Flow (Live Mode)

```
User clicks "Upgrade to Pro"
    ↓
Backend creates Razorpay order (₹199 or ₹499)
    ↓
Razorpay payment modal opens
    ↓
User pays via UPI/Card/NetBanking (REAL MONEY)
    ↓
Razorpay captures payment
    ↓
Backend verifies payment signature
    ↓
User plan updated to PRO/BUSINESS
    ↓
Dashboard shows active subscription
```

---

## 🧪 Testing Live Mode Safely

### Option 1: Use Small Test Amount
Temporarily change amounts to ₹1 for testing:

**backend/routes/paymentRoutes.js**
```javascript
const PLAN_AMOUNTS = {
  PRO: 100,        // ₹1 in paise (for testing)
  BUSINESS: 100,   // ₹1 in paise (for testing)
};
```

After testing, revert back to:
```javascript
const PLAN_AMOUNTS = {
  PRO: 19900,      // ₹199
  BUSINESS: 49900, // ₹499
};
```

### Option 2: Test Refunds
1. Make a real payment
2. Go to Razorpay Dashboard → Payments
3. Click on payment → Click "Refund"
4. Money will be returned to customer

---

## 📊 Monitoring Live Payments

### Razorpay Dashboard
- View all transactions: **Transactions** → **Payments**
- Check payment status: Success, Failed, Pending
- Issue refunds if needed
- Download reports for accounting

### Your Database
Check payments table:
```sql
SELECT * FROM payments WHERE status = 'SUCCESS' ORDER BY created_at DESC;
```

Check active subscriptions:
```sql
SELECT id, email, plan, subscription_status, expiry_date 
FROM users 
WHERE plan != 'FREE' AND subscription_status = 'ACTIVE';
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Payment Successful but Plan Not Updated
**Cause**: Webhook not configured or webhook secret mismatch
**Solution**: 
1. Check webhook URL is accessible
2. Verify RAZORPAY_WEBHOOK_SECRET matches Razorpay dashboard
3. Check backend logs for webhook errors

### Issue 2: "Payment Gateway Not Configured" Error
**Cause**: Live keys not set or invalid
**Solution**:
1. Verify `.env` has correct `rzp_live_` keys
2. Restart backend server
3. Check keys are not expired

### Issue 3: Payment Modal Not Opening
**Cause**: Key mismatch between frontend and backend
**Solution**:
1. Backend sends correct live key in `/create-order` response
2. Frontend uses the key from backend response (already implemented)

---

## 💡 Best Practices

1. **Start with Test Mode** ✅ (You already did this!)
2. **Enable Webhooks** - For reliable payment confirmation
3. **Log Everything** - Keep payment logs for debugging
4. **Handle Failures** - Show clear error messages to users
5. **Email Notifications** - Send payment confirmation emails
6. **Refund Policy** - Clearly state your refund policy
7. **Regular Monitoring** - Check Razorpay dashboard daily

---

## 📞 Support Contacts

### Razorpay Support
- Email: support@razorpay.com
- Phone: +91-80-6861-5541
- Docs: https://razorpay.com/docs/

### Your App Support
- Monitor webhook failures
- Check user complaints about payment issues
- Verify subscription activation emails

---

## ✅ Final Checklist Before Going Live

- [ ] Razorpay account fully activated (KYC done)
- [ ] Live API keys generated and added to `.env`
- [ ] Webhook configured with correct URL and secret
- [ ] Backend restarted with new keys
- [ ] Test payment completed successfully (use ₹1 first!)
- [ ] Dashboard shows correct plan after payment
- [ ] Payment confirmation stored in database
- [ ] HTTPS enabled (if deployed to production)
- [ ] Error monitoring enabled
- [ ] Backup strategy in place

---

## 🎯 Quick Start Commands

```bash
# 1. Update backend environment variables
cd backend
# Edit .env file with live keys

# 2. Restart backend
npm run dev

# 3. Test payment flow
# Open browser → Pricing → Upgrade → Pay ₹1 (test amount)

# 4. Verify in database
# Check users table: plan should be PRO/BUSINESS
# Check payments table: status should be SUCCESS

# 5. Revert test amount to real prices
# Edit backend/routes/paymentRoutes.js
# Change PLAN_AMOUNTS back to 19900 and 49900
```

---

## 📝 Summary

**Current Status**: Test Mode (rzp_test_) ✅  
**Target Status**: Live Mode (rzp_live_) 🎯  

**What Changes**:
- Test keys → Live keys
- Fake payments → Real money charged
- Test cards → Real UPI/Cards/NetBanking

**What Stays Same**:
- Payment flow logic
- Database structure
- Frontend code
- User experience

**Action Required**:
1. Complete Razorpay KYC
2. Get live keys
3. Update `.env`
4. Restart backend
5. Test with ₹1
6. Go live with real prices!

---

Good luck with your live payments! 🚀💰
