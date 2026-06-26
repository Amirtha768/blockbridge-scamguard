# 🔧 Fix Production Database - Reset Users to FREE Plan

## 🐛 **Problem**
Production site shows users as PRO when they should be FREE.

**Root Cause**: Production database (on Render) has users set to PRO plan.

---

## ✅ **Solution: Run Database Reset Script**

### **Option 1: Via Render Dashboard (RECOMMENDED)**

1. **Go to Render Dashboard**:
   - https://dashboard.render.com/
   - Find your backend service

2. **Open Shell/Console**:
   - Click on your backend service
   - Go to "Shell" tab
   - Or use "SSH" option

3. **Run the reset command**:
   ```bash
   npm run reset-users
   ```

4. **Verify**:
   ```
   ✅ Should show: "Successfully reset X user(s) to FREE plan"
   ```

5. **Tell users to**:
   - Logout
   - Clear browser cache (Ctrl + Shift + Delete)
   - Login again
   - Should now see FREE dashboard!

---

### **Option 2: Via SQL Query (If you have database access)**

If Render provides direct database access:

```sql
UPDATE users 
SET plan = 'FREE', 
    subscription_status = 'NONE', 
    expiry_date = NULL,
    scans_today = 0,
    scans_reset_date = CURDATE()
WHERE id > 0;
```

---

### **Option 3: Deploy and Run Manually**

1. **Code is already pushed** to GitHub

2. **Wait for Render auto-deploy** (3-5 minutes)

3. **SSH into Render** or use Shell

4. **Run**:
   ```bash
   cd /opt/render/project/src
   npm run reset-users
   ```

---

## 🧪 **Test After Fix**

### **Test on Production Site:**

1. **Clear browser completely**:
   ```
   - Press F12 (open console)
   - Go to "Application" tab
   - Click "Clear storage"
   - Click "Clear site data"
   ```

2. **Or use Incognito mode**

3. **Go to your site**

4. **Login with your account**

5. **Check Dashboard**:
   - ✅ Should show "FREE" badge
   - ✅ Should show "Scans Today: 0"
   - ✅ Should show "Scans Left: 5"
   - ✅ Should show "Daily Limit: 5/day"

---

## 📊 **Why This Happened**

Your production database had test data where users were marked as PRO. This happened because:

1. During testing, you may have manually set users to PRO
2. Or a payment test succeeded and upgraded a user
3. The fix ensures ALL users start as FREE

---

## 🚀 **Current Status**

✅ **Fix Script Created**: `backend/reset-all-users-to-free.js`  
✅ **NPM Script Added**: `npm run reset-users`  
✅ **Code Pushed**: GitHub (commit: latest)  
⏳ **Waiting for**: Render auto-deploy  
📋 **Your Action**: Run `npm run reset-users` in Render Shell

---

## 💡 **Alternative Quick Fix (Manual)**

If you can't access Render shell, you can:

### **Temporary Frontend Fix**:

Add this to `Dashboard.jsx` temporarily:

```javascript
// At the top of Dashboard function
useEffect(() => {
  // Force FREE plan until database is fixed
  if (user && user.plan !== 'FREE') {
    const fixedUser = { ...user, plan: 'FREE', subscription_status: 'NONE', expiry_date: null };
    localStorage.setItem('bb_user', JSON.stringify(fixedUser));
    window.location.reload();
  }
}, [user]);
```

This forces all users to see FREE dashboard until you fix the production database properly.

---

## ✅ **Final Verification**

After running the reset script:

- [ ] Run `npm run reset-users` in Render Shell
- [ ] See success message
- [ ] Clear browser cache/localStorage
- [ ] Login to production site
- [ ] Dashboard shows FREE plan
- [ ] Scan counter works (0 to 5)
- [ ] Premium features locked

---

## 📞 **If You Need Help**

1. Check Render logs for errors
2. Verify database connection in Render
3. Make sure auto-deploy completed
4. Try running script multiple times if needed

---

**The fix is deployed and ready! Just need to run the reset script on Render.** 🚀
