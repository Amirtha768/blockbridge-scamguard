# ⚡ Quick Setup: Enable Real Money Payments

## What You Need Right Now:

### 1️⃣ Go to Razorpay Dashboard
🔗 https://dashboard.razorpay.com/

### 2️⃣ Switch to LIVE MODE
- Look at top-left corner
- Toggle from "Test Mode" to "Live Mode"
- ⚠️ If disabled, complete KYC first (takes 24-48 hours)

### 3️⃣ Get Your Live Keys
1. Go to: **Settings** → **API Keys**
2. Click **"Generate Live Keys"**
3. Copy both:
   - Key ID (starts with `rzp_live_`)
   - Key Secret

### 4️⃣ Update Your Backend .env File

Open `backend/.env` and change:

```env
# BEFORE (Test Mode - Fake Money)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx

# AFTER (Live Mode - Real Money)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET_HERE
```

### 5️⃣ Restart Backend
```bash
cd backend
npm run dev
```

### 6️⃣ Test It!
1. Open your app
2. Login
3. Go to Pricing page
4. Click "Upgrade to Pro"
5. **PAY ₹199** (real money will be deducted!)
6. Check Dashboard → Should show "PRO" plan

---

## ⚠️ IMPORTANT WARNINGS

🚨 **Real Money Alert**: With `rzp_live_` keys, ACTUAL money is charged!

🚨 **Start Small**: First test with ₹1 (edit `PLAN_AMOUNTS` in code)

🚨 **KYC Required**: If you haven't completed Razorpay KYC, Live Mode won't work

🚨 **Webhook Setup**: For production, set up webhooks (see full guide)

---

## 🧪 Safe Testing Strategy

### Option 1: Test with ₹1 First
Edit `backend/routes/paymentRoutes.js`:

```javascript
const PLAN_AMOUNTS = {
  PRO: 100,        // ₹1 in paise (100 paise = ₹1)
  BUSINESS: 100,   // ₹1 for testing
};
```

✅ Test payment → ✅ Verify plan updates → ❌ Revert to real prices

### Option 2: Use Your Own Account
- Pay yourself
- Test the full flow
- Refund from Razorpay dashboard if needed

---

## ✅ Checklist

- [ ] Razorpay account activated (KYC done)
- [ ] Live keys obtained from dashboard
- [ ] `backend/.env` updated with live keys
- [ ] Backend server restarted
- [ ] Test payment completed
- [ ] Plan updated correctly in dashboard

---

## 🆘 Need Help?

**Issue**: "Payment Gateway Not Configured"
→ Check if live keys are correctly set in `.env`

**Issue**: Payment successful but plan not updated
→ Check webhook configuration (see full guide)

**Issue**: Can't generate live keys
→ Complete KYC verification first

---

## 📚 Full Documentation
See `RAZORPAY_LIVE_MODE_SETUP.md` for complete details.

---

**Current Mode**: Test (rzp_test_) → Fake payments  
**Target Mode**: Live (rzp_live_) → Real payments 💰

**Ready? Let's go live!** 🚀
