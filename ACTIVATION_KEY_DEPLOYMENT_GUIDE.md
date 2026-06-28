# Activation Key System - Deployment Guide

## ✅ Implementation Complete!

The complete Activation Key-Based Subscription System has been implemented and deployed.

---

## 🚀 What's Been Deployed

### **Backend (Render)**
- ✅ Payment request submission API
- ✅ Activation key generation and validation API  
- ✅ Admin authentication and verification API
- ✅ File upload handling with Multer
- ✅ Database tables created (payment_requests, activation_keys, admin_users)
- ✅ Secure key generation utilities

### **Frontend (Netlify)**
- ✅ Payment Upload Page (#/payment-upload)
- ✅ My Payments Page (#/my-payments)
- ✅ Activate Subscription Page (#/activate)
- ✅ Admin Login Page (#/admin/login)
- ✅ Admin Dashboard (#/admin/dashboard)
- ✅ Updated Pricing page with payment info
- ✅ Dashboard with activation links

---

## 📋 Next Steps (One-Time Setup)

### **1. Create Admin Account**

Run this command on Render backend:

```bash
npm run create-admin
```

This will create:
- **Email:** admin@blockbridge.com
- **Password:** (Will be displayed in console)
- **Role:** SUPER_ADMIN

⚠️ **Important:** Change the admin password immediately after first login!

---

## 🔑 How the System Works

### **For Users:**

1. **Select Plan** → Go to Pricing page (#/pricing)
2. **Make Payment** → Pay via UPI to the displayed phone number
3. **Submit Proof** → Click "Upgrade to Pro/Business" → Upload screenshot + Transaction ID
4. **Wait for Verification** → Check status at #/my-payments
5. **Receive Key** → Admin generates activation key after verification
6. **Activate** → Go to #/activate → Enter key → Enjoy premium features!

### **For Admins:**

1. **Login** → Go to #/admin/login
2. **View Requests** → See all pending payment submissions
3. **Verify Payment** → Click "View Screenshot" → Check transaction details
4. **Generate Key** → Click "✓ Verify & Generate Key"
5. **Copy Key** → Copy activation key and send to user
6. **Manage Keys** → View all keys, revoke unused keys if needed

---

## 🌐 Live URLs

### **User Pages:**
- Homepage: https://blockbridge-scamguard.netlify.app
- Pricing: https://blockbridge-scamguard.netlify.app/#/pricing
- Payment Upload: https://blockbridge-scamguard.netlify.app/#/payment-upload
- My Payments: https://blockbridge-scamguard.netlify.app/#/my-payments
- Activate: https://blockbridge-scamguard.netlify.app/#/activate

### **Admin Pages:**
- Admin Login: https://blockbridge-scamguard.netlify.app/#/admin/login
- Admin Dashboard: https://blockbridge-scamguard.netlify.app/#/admin/dashboard

---

## 💳 Payment Details to Display

Update the pricing page with your actual payment information:

**Current (Placeholder):**
- UPI ID: blockbridge@upi
- Phone Number: +91 9876543210

**Action Required:** Update these in:
- `frontend/src/pages/Pricing.jsx` (line ~265)
- `frontend/src/pages/PaymentUpload.jsx` (line ~124)

---

## 🧪 Testing the System

### **Test as User:**

1. Register/Login
2. Go to Pricing → Click "Upgrade to Pro"
3. Upload a test screenshot (any image)
4. Enter fake transaction ID: TEST123456
5. Submit payment proof
6. Check "My Payments" page

### **Test as Admin:**

1. Go to #/admin/login
2. Login with created admin account
3. View pending payment requests
4. View screenshot (opens in new tab)
5. Click "✓ Verify & Generate Key"
6. Copy the generated activation key

### **Test Activation:**

1. Logout from admin
2. Login as regular user
3. Go to #/activate
4. Enter the activation key
5. Verify subscription activated
6. Check dashboard shows PRO plan

---

## 📊 Database Tables

The following tables have been added:

### **payment_requests**
- Stores user payment submissions
- Fields: screenshot_url, transaction_id, plan, status, user_id

### **activation_keys**
- Stores generated activation keys
- Format: BBSG-XXXX-XXXX-XXXX
- Fields: activation_key, user_id, plan, status

### **admin_users**
- Stores admin accounts
- Links to users table via user_id

---

## 🔒 Security Features

✅ Cryptographically secure key generation (crypto.randomInt)
✅ No duplicate keys (unique constraint + collision detection)
✅ One-time use keys (status tracking)
✅ User ownership validation
✅ Admin authentication required
✅ File upload validation (type + size)
✅ Secure file storage (outside web root)

---

## 💰 Pricing Plans

### **Pro Plan**
- **Price:** ₹199
- **Duration:** 30 days
- **Features:** Unlimited scans, 5 scanners, AI analysis

### **Business Plan**
- **Price:** ₹499  
- **Duration:** 180 days
- **Features:** Everything in Pro + Job detector, Investment detector, API access, Team dashboard

---

## 📱 Key Features Implemented

### **Payment Submission:**
- ✅ Screenshot upload (max 5MB, PNG/JPEG only)
- ✅ Transaction ID input
- ✅ Plan selection (PRO/BUSINESS)
- ✅ Status tracking (PENDING/APPROVED/REJECTED)

### **Admin Verification:**
- ✅ View all pending requests
- ✅ View payment screenshots
- ✅ Approve with key generation
- ✅ Reject with notes
- ✅ Dashboard statistics

### **Key Management:**
- ✅ Unique key generation (BBSG-XXXX-XXXX-XXXX)
- ✅ View all keys with status
- ✅ Search keys by user/key value
- ✅ Revoke unused keys
- ✅ Copy to clipboard

### **Subscription Activation:**
- ✅ Key format validation
- ✅ User ownership check
- ✅ One-time use enforcement
- ✅ Automatic expiry date calculation
- ✅ Plan upgrade (FREE → PRO/BUSINESS)

---

## 🎯 Ready to Use!

Your activation key subscription system is now **LIVE** and ready to accept payments!

**Important Reminders:**
1. ✅ Create admin account on Render backend
2. ✅ Update payment details (UPI ID, Phone Number)
3. ✅ Test the complete flow before going live
4. ✅ Change default admin password immediately

---

## 🚨 Troubleshooting

### **Admin can't login:**
- Make sure you ran `npm run create-admin` on Render
- Check console for generated password
- Verify admin_users table exists

### **Payment submission fails:**
- Check file size (max 5MB)
- Verify file type (PNG/JPEG only)
- Ensure backend is running on Render

### **Activation key doesn't work:**
- Verify key format: BBSG-XXXX-XXXX-XXXX
- Check if key belongs to logged-in user
- Ensure key status is UNUSED

### **Screenshots not loading:**
- Check uploads/payment_screenshots folder exists on Render
- Verify admin token is valid
- Check file permissions

---

## 📞 Support

If you encounter any issues:
1. Check Render backend logs
2. Check browser console for frontend errors
3. Verify database tables exist
4. Ensure environment variables are set correctly

---

**🎉 Congratulations! Your activation key subscription system is complete and deployed!**

