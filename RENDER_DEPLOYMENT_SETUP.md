# Render Backend Deployment Setup

## Current Status
- **Backend URL**: https://blockbridge-scamguard.onrender.com
- **Repository**: https://github.com/Amirtha768/blockbridge-scamguard
- **Branch**: main

## Required Environment Variables on Render

Go to: https://dashboard.render.com → Your Service → Environment Tab

Add/verify these environment variables:

### Database Configuration
```
DB_HOST=mysql-396690a7-amirthamurugakannan622-b852.l.aivencloud.com
DB_PORT=25763
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=defaultdb
```

### Security
```
JWT_SECRET=your_jwt_secret_min_32_characters
```

### Email Configuration (NEW - Required for Contact Form)
```
EMAIL_USER=blockbridgescamguardai@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_16_chars
```

Get Gmail App Password:
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with blockbridgescamguardai@gmail.com
3. Create app password named "BlockBridge Contact Form"
4. Copy the 16-character password
5. Paste it as EMAIL_PASSWORD value in Render

### Application URLs
```
FRONTEND_URL=https://blockbridge-scamguard2028.vercel.app
BACKEND_URL=https://blockbridge-scamguard.onrender.com
```

### Admin Configuration
```
ADMIN_EMAIL=admin@blockbridge.com
ADMIN_PASSWORD=your_secure_admin_password
```

### Payment Information
```
UPI_ID=6381487329@ybl
CONTACT_EMAIL=blockbridgescamguardai@gmail.com
CONTACT_PHONE=+91 6381487329
```

### Optional
```
PORT=5000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
ENABLE_PDF_EXPORT=true
ENABLE_CSV_EXPORT=true
```

## Deploy Process

After adding EMAIL_USER and EMAIL_PASSWORD:
1. Click **Save Changes** in Render
2. Render will automatically redeploy (takes 2-3 minutes)
3. Check deployment logs for success
4. Test contact form at: https://blockbridge-scamguard2028.vercel.app/#/contact

## Testing the Contact Form

1. Visit: https://blockbridge-scamguard2028.vercel.app/#/contact
2. Fill out the contact form with:
   - Name
   - Email
   - Phone/WhatsApp (optional)
   - Subject
   - Message
3. Submit
4. You should receive an email at blockbridgescamguardai@gmail.com

## Troubleshooting

### 404 Error on /api/contact
- **Cause**: Render hasn't deployed the latest code with contact routes
- **Fix**: 
  1. Go to Render dashboard
  2. Click **Manual Deploy** → **Deploy latest commit**
  3. Wait 2-3 minutes

### 500 Error on Contact Form
- **Cause**: EMAIL_PASSWORD not set or incorrect
- **Fix**: 
  1. Verify EMAIL_PASSWORD is set in Render environment variables
  2. Ensure it's the 16-character app password from Google (not your regular Gmail password)
  3. Redeploy if needed

### Backend Sleeping (Slow Response)
- **Cause**: Render free tier sleeps after 15 minutes of inactivity
- **Fix**: 
  - First request takes 30-60 seconds (backend waking up)
  - Subsequent requests are instant
  - Upgrade to paid tier ($7/month) for always-on service

### CORS Errors
- **Cause**: Frontend URL not in CORS whitelist
- **Fix**: Already configured to allow all origins in backend/index.js
- If persists: Clear browser cache, try incognito mode

## Latest Code Changes

Commit: `f7d239d` - "Add contact form with email notifications and phone field"

Changes:
- ✅ Added backend/routes/contactRoutes.js
- ✅ Added nodemailer dependency
- ✅ Updated frontend Contact.jsx with API integration
- ✅ Added phone/WhatsApp field to contact form
- ✅ Email notifications to blockbridgescamguardai@gmail.com

## Next Steps

1. **Add Gmail App Password to Render** (most important!)
2. **Wait for Render to redeploy** (automatic after env var change)
3. **Test contact form** on live site
4. **Check email** at blockbridgescamguardai@gmail.com

---

**Last Updated**: Just now
**Status**: Waiting for Render deployment with EMAIL_PASSWORD
