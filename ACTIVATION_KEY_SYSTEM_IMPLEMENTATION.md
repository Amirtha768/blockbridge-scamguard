# 🔑 Activation Key Subscription System - Implementation Guide

## ✅ **Status: IN PROGRESS**

This document tracks the implementation of the complete activation key-based subscription system.

---

## 📊 **Implementation Progress:**

### **Phase 1: Database & Backend Core** ⏳
- [x] Create database schema
- [x] Update db.js with new tables
- [x] Create activation key generator utility
- [ ] Create payment request routes
- [ ] Create activation key routes
- [ ] Create admin verification routes
- [ ] Add file upload for screenshots

### **Phase 2: Frontend Pages** ⏳
- [ ] Update Pricing page (show phone number)
- [ ] Create Payment Submission page
- [ ] Create Activate Subscription page
- [ ] Update Dashboard (show subscription info)
- [ ] Create Admin Dashboard
- [ ] Create Admin Payment Verification page
- [ ] Create Admin Key Management page

### **Phase 3: Integration & Testing** ⏳
- [ ] Test complete user flow
- [ ] Test admin approval flow
- [ ] Test key activation
- [ ] Test expiry handling
- [ ] Security testing

### **Phase 4: Deployment** ⏳
- [ ] Build frontend
- [ ] Test locally
- [ ] Push to GitHub
- [ ] Deploy to Netlify/Render
- [ ] Verify production

---

## 🗂️ **Files Created/Modified:**

### **Database:**
- ✅ `db/activation-key-schema.sql` - Complete schema
- ✅ `backend/db.js` - Updated with new tables

### **Backend Utilities:**
- ✅ `backend/utils/keyGenerator.js` - Key generation logic

### **Backend Routes:** (In Progress)
- ⏳ `backend/routes/paymentRequestRoutes.js` - Payment submission
- ⏳ `backend/routes/activationKeyRoutes.js` - Key activation
- ⏳ `backend/routes/adminRoutes.js` - Admin verification

### **Frontend Pages:** (Next)
- ⏳ `frontend/src/pages/PaymentSubmit.jsx`
- ⏳ `frontend/src/pages/ActivateSubscription.jsx`
- ⏳ `frontend/src/pages/admin/AdminDashboard.jsx`
- ⏳ `frontend/src/pages/admin/PaymentVerification.jsx`
- ⏳ `frontend/src/pages/admin/KeyManagement.jsx`

---

## 📋 **Complete Feature List:**

### **User Features:**
1. ✅ View pricing plans (Pro/Business)
2. ⏳ Submit payment proof (screenshot + transaction ID)
3. ⏳ Activate subscription with key
4. ⏳ View subscription status on dashboard
5. ⏳ See expiry date and days remaining

### **Admin Features:**
1. ⏳ View pending payment requests
2. ⏳ View payment screenshots
3. ⏳ Approve/reject payments
4. ⏳ Generate activation keys
5. ⏳ Copy activation keys
6. ⏳ View all keys (used/unused)
7. ⏳ Search keys by user/key
8. ⏳ Revoke unused keys
9. ⏳ Mark keys as expired

### **Security Features:**
- ✅ Cryptographically random keys
- ✅ No duplicate keys
- ⏳ One-time use enforcement
- ⏳ User ownership validation
- ⏳ Expiry date enforcement
- ⏳ Admin authentication

---

## 🔄 **User Flow:**

```
1. User registers → Login
2. Go to Pricing → Select Plan (Pro/Business)
3. See payment phone number
4. Make payment via UPI
5. Upload screenshot + transaction ID
6. Status: "Pending Verification"
7. Admin verifies payment
8. Admin generates activation key
9. User receives key (via email/dashboard notification)
10. User enters key in "Activate Subscription"
11. System validates key
12. Subscription activated for 30/180 days
13. Premium features unlocked
14. Dashboard shows expiry date
```

---

## 🎨 **UI/UX Design:**

### **Payment Submission Page:**
```
┌─────────────────────────────────────┐
│ Complete Your Payment               │
├─────────────────────────────────────┤
│ Selected Plan: Pro (₹199/month)     │
│                                     │
│ Payment Instructions:               │
│ Pay via UPI to: +91-XXXXXXXXXX      │
│                                     │
│ [Upload Payment Screenshot]         │
│ [Enter UPI Transaction ID]          │
│                                     │
│ [Submit Payment Proof]              │
└─────────────────────────────────────┘
```

### **Activate Subscription Page:**
```
┌─────────────────────────────────────┐
│ Activate Your Subscription          │
├─────────────────────────────────────┤
│ Enter Activation Key:               │
│ [BBSG-____-____-____]               │
│                                     │
│ [Activate]                          │
└─────────────────────────────────────┘
```

### **Admin Dashboard:**
```
┌─────────────────────────────────────┐
│ Admin Dashboard                     │
├─────────────────────────────────────┤
│ Pending Requests: 5                 │
│ Active Subscriptions: 12            │
│ Total Revenue: ₹2,388               │
│                                     │
│ [Payment Verification]              │
│ [Key Management]                    │
│ [User Management]                   │
└─────────────────────────────────────┘
```

---

## 🔐 **Security Measures:**

1. **Key Generation:**
   - Crypto.randomInt() for secure randomness
   - No predictable patterns
   - Check for duplicates before saving

2. **Key Validation:**
   - Format check (BBSG-XXXX-XXXX-XXXX)
   - User ownership check
   - Status check (UNUSED)
   - Expiry check

3. **Admin Access:**
   - Separate admin_users table
   - Role-based permissions
   - Admin authentication middleware

4. **File Upload:**
   - Image validation
   - File size limits (5MB)
   - Secure storage path
   - Only images allowed

---

## 📱 **API Endpoints:**

### **User Endpoints:**
- `POST /api/payment-request/submit` - Submit payment proof
- `GET /api/payment-request/status/:id` - Check request status
- `POST /api/activation/activate` - Activate with key
- `GET /api/subscription/status` - Get subscription details

### **Admin Endpoints:**
- `GET /api/admin/payment-requests` - List all requests
- `POST /api/admin/verify-payment` - Approve/reject
- `POST /api/admin/generate-key` - Generate activation key
- `GET /api/admin/keys` - List all keys
- `POST /api/admin/revoke-key` - Revoke key
- `GET /api/admin/search-keys` - Search keys

---

## 🧪 **Testing Checklist:**

### **User Flow:**
- [ ] Register and login
- [ ] Submit payment proof
- [ ] Receive activation key
- [ ] Activate subscription
- [ ] Verify premium access
- [ ] Check expiry date
- [ ] Test after expiry

### **Admin Flow:**
- [ ] Login as admin
- [ ] View pending requests
- [ ] Approve payment
- [ ] Generate key
- [ ] Copy key
- [ ] Revoke key
- [ ] Search keys

### **Security:**
- [ ] Cannot use key twice
- [ ] Cannot use another user's key
- [ ] Key format validation
- [ ] Expiry enforcement
- [ ] Admin authentication

---

## 🚀 **Deployment Steps:**

1. **Local Testing:**
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

2. **Build:**
   ```bash
   cd frontend && npm run build
   ```

3. **Push to Git:**
   ```bash
   git add .
   git commit -m "Implement activation key subscription system"
   git push origin master
   ```

4. **Verify Deployment:**
   - Netlify: Frontend auto-deploys
   - Render: Backend auto-deploys
   - Test on production URL

---

## 📝 **Environment Variables:**

Add to `backend/.env`:
```env
# Admin Phone Number for Payments
PAYMENT_PHONE_NUMBER=+91-XXXXXXXXXX

# File Upload Directory
UPLOAD_DIR=uploads/payment-screenshots

# Admin Email (for first admin user)
ADMIN_EMAIL=your-admin@email.com
```

---

## ✅ **Current Status:**

**Phase 1 Progress**: 30% Complete
- Database schema created
- Key generator implemented
- Working on API routes

**Estimated Time Remaining**: 2-3 hours for complete implementation

**Next Steps**:
1. Complete backend API routes
2. Implement frontend pages
3. Test and deploy

---

**Implementation in progress...** 🚀
