# Admin Panel Access Guide

## How to Login to Admin Panel

### Step 1: Go to Admin Login Page
Visit: https://blockbridge-scamguard2028.vercel.app/#/admin/login

### Step 2: Login Credentials
- **Email**: `admin@blockbridge.com`
- **Password**: The password you set in your `.env` file (`ADMIN_PASSWORD`)

If you don't know the admin password, check your Render environment variables or set it now.

### Step 3: Access Admin Dashboard
After login, you'll be redirected to: https://blockbridge-scamguard2028.vercel.app/#/admin/dashboard

## What You Can See in Admin Dashboard

### 1. Contact Messages Tab (NEW!)
- View all contact form submissions
- See: Name, Email, Phone/WhatsApp, Subject, Message, Date
- Filter by status: Pending, Replied, Archived
- Mark messages as "Replied" after you contact them
- **WhatsApp Contact**: Use the phone number to message them directly

### 2. Scam Reports Tab (NEW!)
- View all scam reports submitted by users
- See: URL, WhatsApp Message, Email Content, Reporter Email, Date
- Filter by status: Pending, Reviewed, Archived

### 3. Payment Requests Tab
- View all payment upload requests from users
- Approve or reject payments
- Generate activation keys for approved payments

### 4. Users Tab
- View all registered users
- See their plan (FREE/PRO/BUSINESS)
- Check subscription status and expiry dates

### 5. Activation Keys Tab
- View all generated activation keys
- See which keys are used/unused
- Check expiry dates

## How Contact Form Works Now

1. **User submits contact form** on your website
2. **Message saved to database** (no email sent)
3. **You check Admin Dashboard** → Contact Messages tab
4. **You see pending messages** with all details including WhatsApp number
5. **You contact them** via email or WhatsApp
6. **Mark as "Replied"** in admin dashboard

## No SMTP Required!

✅ No email configuration needed
✅ No Gmail app passwords
✅ No SMTP connection issues
✅ Works instantly on Render free tier
✅ All messages stored safely in your database

## Next Steps

1. **Deploy to Render**: Go to Render dashboard → Manual Deploy
2. **Wait 2-3 minutes**: For deployment to complete
3. **Test contact form**: Submit a test message
4. **Login to admin**: Check if message appears
5. **View pending messages**: See all contact submissions

## Admin Login Issues?

If you can't login:
1. Check Render environment variable: `ADMIN_PASSWORD`
2. Or run this script locally to create admin user:
   ```bash
   cd backend
   node create-admin.js
   ```

---

**Contact form submissions are now stored in your database and visible in the admin dashboard!**
