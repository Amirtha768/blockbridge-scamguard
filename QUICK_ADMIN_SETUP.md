# 🚀 Quick Admin Setup Guide

## Create Admin Account (ONE-TIME SETUP)

### **Option 1: Via Render Dashboard (Recommended)**

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Select your BlockBridge backend service**
3. **Click "Shell" in the left sidebar**
4. **Run this command:**
   ```bash
   npm run create-admin
   ```
5. **Copy the generated password** (displayed in console)
6. **Test admin login:**
   - Go to: https://blockbridge-scamguard.netlify.app/#/admin/login
   - Email: admin@blockbridge.com
   - Password: (use the generated password)

---

## ✅ Quick Test Checklist

### **1. Test User Flow:**
- [ ] Register/Login as user
- [ ] Go to Pricing page
- [ ] Click "Upgrade to Pro"
- [ ] Upload a test image
- [ ] Enter transaction ID: TEST123
- [ ] Submit payment proof
- [ ] Check "My Payments" page

### **2. Test Admin Flow:**
- [ ] Go to #/admin/login
- [ ] Login with admin credentials
- [ ] Click "Payments" tab
- [ ] See pending payment request
- [ ] Click "View Screenshot"
- [ ] Click "✓ Verify & Generate Key"
- [ ] Copy the activation key

### **3. Test Activation:**
- [ ] Logout from admin
- [ ] Login as regular user
- [ ] Go to #/activate
- [ ] Enter activation key (paste copied key)
- [ ] Click "Activate Subscription"
- [ ] Verify success message
- [ ] Check Dashboard shows "PRO" plan
- [ ] Verify expiry date is 30 days from now

---

## 🔧 Update Payment Info

**Current placeholder values need to be updated:**

### **File 1:** `frontend/src/pages/Pricing.jsx` (line ~265)
```jsx
<p><strong>UPI ID:</strong> YOUR_ACTUAL_UPI_ID</p>
<p><strong>Phone Number:</strong> YOUR_ACTUAL_PHONE_NUMBER</p>
```

### **File 2:** `frontend/src/pages/PaymentUpload.jsx` (line ~124)
```jsx
<p><strong>UPI ID:</strong> YOUR_ACTUAL_UPI_ID</p>
<p><strong>Phone Number:</strong> YOUR_ACTUAL_PHONE_NUMBER</p>
```

After updating:
1. Run `npm run build` in frontend folder
2. Commit and push to deploy

---

## 📊 Monitor Your System

### **Check Backend Logs:**
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Watch for:
   - Payment submission logs
   - Key generation logs
   - Admin authentication logs

### **Check Database:**
1. Connect to your MySQL database
2. Query tables:
   ```sql
   SELECT * FROM payment_requests;
   SELECT * FROM activation_keys;
   SELECT * FROM admin_users;
   ```

---

## 🎯 You're All Set!

Your activation key subscription system is now fully operational:

✅ **Frontend deployed on Netlify** (auto-updates on push)
✅ **Backend deployed on Render** (auto-updates on push)
✅ **Database tables created**
✅ **All APIs working**
✅ **Admin panel ready**

**Next:** Create admin account and test the complete flow!

