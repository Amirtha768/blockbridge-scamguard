# 💰 ENABLE REAL MONEY PAYMENTS - ACTION STEPS

## ⚡ DO THIS NOW (Takes 5 minutes if KYC is done)

---

## STEP 1: Open Razorpay Dashboard

🔗 **URL**: https://dashboard.razorpay.com/

**Login** with your credentials

---

## STEP 2: Check KYC Status

Look for a banner or notification about KYC status

### ✅ If KYC is APPROVED:
→ Continue to Step 3

### ❌ If KYC is PENDING/NOT DONE:
You need to complete:
1. Business/Individual verification
2. Bank account details
3. PAN card/GST details
4. Wait 24-48 hours for approval
5. Then come back to this guide

---

## STEP 3: Switch to LIVE MODE

📍 **Location**: Top-left corner of dashboard

Click the toggle: **Test Mode** → **Live Mode**

⚠️ If you can't toggle, KYC is not approved yet

---

## STEP 4: Generate Live API Keys

1. In Live Mode, go to: **Settings** → **API Keys**
2. Click: **"Generate Live Keys"** (or "Regenerate" if keys exist)
3. You'll see:
   ```
   Key ID: rzp_live_XXXXXXXXXXXXXX
   Key Secret: [Click to reveal]
   ```
4. **COPY BOTH** (you'll need them in next step)

---

## STEP 5: Update Backend .env File

**Open**: `backend/.env`

**Replace** these lines:
```env
RAZORPAY_KEY_ID=rzp_live_PASTE_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=PASTE_YOUR_SECRET_KEY_HERE
```

**With your actual keys** from Step 4:
```env
RAZORPAY_KEY_ID=rzp_live_ABC123XYZ456789
RAZORPAY_KEY_SECRET=XyZ123AbC456DeF789
```

**Save** the file

---

## STEP 6: Restart Backend Server

Open terminal in `backend` folder:

```bash
cd backend
npm run dev
```

Wait for: `Server running on port 5001`

---

## STEP 7: Test with Real Payment

### 🧪 Safe Testing Method (Recommended):

**A. First, test with ₹1**

Edit `backend/routes/paymentRoutes.js`:

Find this:
```javascript
const PLAN_AMOUNTS = {
  PRO: 19900,      // ₹199 in paise
  BUSINESS: 49900, // ₹499 in paise
};
```

Change to:
```javascript
const PLAN_AMOUNTS = {
  PRO: 100,        // ₹1 for testing
  BUSINESS: 100,   // ₹1 for testing
};
```

Save and restart backend.

**B. Make Test Payment**

1. Open app: http://localhost:5173
2. Login to your account
3. Go to: Pricing page
4. Click: "Upgrade to Pro"
5. Pay ₹1 using UPI/GPay
6. Check: Dashboard should show "PRO" plan

**C. Verify in Razorpay Dashboard**

1. Go to: Transactions → Payments
2. You should see your ₹1 payment
3. Status: "Captured"

**D. Revert to Real Prices**

Edit `backend/routes/paymentRoutes.js` again:

```javascript
const PLAN_AMOUNTS = {
  PRO: 19900,      // ₹199
  BUSINESS: 49900, // ₹499
};
```

Save and restart backend.

---

## STEP 8: Go LIVE! 🚀

Now real customers can pay ₹199 or ₹499!

---

## ⚠️ SAFETY WARNINGS

1. **Real Money**: With live keys, actual money is charged to customers
2. **Refund Policy**: Have a clear refund policy ready
3. **Support**: Monitor Razorpay dashboard for failed payments
4. **Webhook**: For production, set up webhook (optional but recommended)
5. **Backup**: Keep test keys commented in .env for future testing

---

## 🎯 CURRENT STATUS

**File Updated**: ✅ `backend/.env`  
**Current Keys**: Placeholders (need your real keys)  
**Next Action**: Get live keys from Razorpay → Paste in .env → Restart backend

---

## 📞 HELP & SUPPORT

**Can't generate live keys?**  
→ Check KYC status in Razorpay dashboard

**Payment not working?**  
→ Check backend console for errors  
→ Verify keys are correct (no extra spaces)

**Plan not updating after payment?**  
→ Already fixed! (I updated the code earlier)

**Need to test more?**  
→ Use the ₹1 testing method above

---

## ✅ FINAL CHECKLIST

- [ ] Razorpay account has KYC approved
- [ ] Live Mode is accessible in dashboard
- [ ] Live API keys generated
- [ ] Keys pasted into `backend/.env`
- [ ] Backend server restarted
- [ ] Test payment with ₹1 completed successfully
- [ ] Dashboard shows correct plan after payment
- [ ] Reverted to real prices (₹199/₹499)
- [ ] Ready for real customers!

---

## 🎉 YOU'RE READY!

Once you complete the checklist above, your app will accept **REAL PAYMENTS** via:
- ✅ Google Pay (GPay)
- ✅ PhonePe
- ✅ Paytm
- ✅ Credit/Debit Cards
- ✅ Net Banking
- ✅ All UPI apps

**Money will be deposited to your linked bank account** (via Razorpay settlement)

---

**Questions?** Check `RAZORPAY_LIVE_MODE_SETUP.md` for detailed documentation.

Good luck! 💰🚀
