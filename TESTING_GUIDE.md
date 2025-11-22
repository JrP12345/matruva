# MATRUVA - Testing Guide

## 🧪 Quick Test Script

### Prerequisites

1. Backend running on `http://localhost:3001`
2. Frontend running on `http://localhost:3000`
3. MongoDB running (backend requirement)

---

## Test 1: Login Flow ✅

### Steps:

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `owner@example.com`
   - Password: `VeryStrongPassword!`
3. Click "Sign In"

### Expected Result:

- ✅ Redirects to `/admin/dashboard`
- ✅ Shows welcome message with user name
- ✅ Displays 4 stat cards (users, roles, permissions, orders)
- ✅ Shows recent admin actions table

### Browser DevTools Checks:

1. **Application → Cookies** (localhost:3000)

   - Should see `refresh_token` cookie
   - `HttpOnly: true`
   - `SameSite: Lax`

2. **Console** - Run this:
   \`\`\`javascript
   // Should return null (token not in storage)
   console.log(localStorage.getItem('accessToken'));
   console.log(sessionStorage.getItem('accessToken'));
   \`\`\`

3. **Network Tab**
   - Should see successful POST to `/v1/auth/login`
   - Should see successful GET to `/v1/auth/me`
   - Should see successful GET to `/v1/admin/dashboard`

---

## Test 2: Page Reload (Silent Refresh) ✅

### Steps:

1. While on dashboard, press `F5` or `Ctrl+R` to reload
2. Wait for page to load

### Expected Result:

- ✅ User remains logged in
- ✅ Dashboard loads automatically
- ✅ No redirect to login

### DevTools Network Tab:

Should see this sequence:

1. POST `/v1/auth/refresh` (with `X-Auth-Refresh: 1` header)
2. GET `/v1/auth/me`
3. GET `/v1/admin/dashboard`

---

## Test 3: Access Token Expiry ✅

### Steps:

1. Login to dashboard
2. Wait 15+ minutes (or modify backend JWT_ACCESS_TTL to 30s for quick test)
3. Click any action or refresh data

### Expected Result:

- ✅ Request fails with 401
- ✅ Auto-calls `/v1/auth/refresh`
- ✅ Retries original request
- ✅ No error shown to user

### DevTools Network Tab:

Should see:

1. Failed request (401)
2. POST `/v1/auth/refresh` (automatic)
3. Retry of original request (200)

---

## Test 4: Logout ✅

### Steps:

1. Click "Logout" button in dashboard header
2. Check page

### Expected Result:

- ✅ Redirects to `/login`
- ✅ `refresh_token` cookie deleted
- ✅ Access token cleared from memory

### Verification:

1. Try to access `/admin/dashboard` directly

   - Should redirect to `/login`

2. Check cookies in DevTools
   - `refresh_token` should be gone

---

## Test 5: Protected Route (Unauthorized Access) ✅

### Steps:

1. Logout (or use incognito window)
2. Try to navigate to `http://localhost:3000/admin/dashboard`

### Expected Result:

- ✅ Immediately redirects to `/login`
- ✅ Shows login form

---

## Test 6: Invalid Credentials ❌

### Steps:

1. Go to login page
2. Enter wrong credentials:
   - Email: `test@test.com`
   - Password: `wrongpassword`
3. Submit

### Expected Result:

- ✅ Shows error message
- ✅ Stays on login page
- ✅ No cookies set
- ✅ Error: "Login failed. Please check your credentials."

---

## Test 7: CSRF Protection ✅

### Steps:

1. Login to dashboard
2. Open DevTools → Console
3. Run this command:
   \`\`\`javascript
   fetch('http://localhost:3001/v1/auth/refresh', {
   method: 'POST',
   credentials: 'include'
   // No X-Auth-Refresh header
   }).then(r => r.json()).then(console.log);
   \`\`\`

### Expected Result:

- ✅ Returns 400 or 403 error
- ✅ Error message: "Missing X-Auth-Refresh header"

### Now with header:

\`\`\`javascript
fetch('http://localhost:3001/v1/auth/refresh', {
method: 'POST',
credentials: 'include',
headers: { 'X-Auth-Refresh': '1' }
}).then(r => r.json()).then(console.log);
\`\`\`

### Expected Result:

- ✅ Returns 200 OK
- ✅ Response contains \`{ accessToken: "..." }\`

---

## Test 8: Role-Based Access ✅

### Steps:

1. Login as SUPER_ADMIN (owner@example.com)
2. Access dashboard - should work

### Expected Result:

- ✅ Dashboard loads
- ✅ Shows all data

### Test with USER role:

(If you create a USER account in backend)

1. Login as USER
2. Try to access `/admin/dashboard`

### Expected Result:

- ✅ Shows "Access Denied" message
- ✅ Says "This page requires SUPER_ADMIN role"

---

## Test 9: Network Failure Handling ❌

### Steps:

1. Login to dashboard
2. Stop backend server (Ctrl+C in backend terminal)
3. Click any action or reload

### Expected Result:

- ✅ Shows error message
- ✅ Provides "Retry" button
- ✅ Graceful error handling

---

## Test 10: Concurrent Requests During Refresh 🔄

### Steps:

1. Login to dashboard
2. Wait 15 minutes (or set short token TTL)
3. Open DevTools → Console
4. Run multiple API calls simultaneously:
   \`\`\`javascript
   Promise.all([
   fetch('http://localhost:3001/v1/admin/dashboard', {
   headers: { 'Authorization': 'Bearer expired_token' },
   credentials: 'include'
   }),
   fetch('http://localhost:3001/v1/auth/me', {
   headers: { 'Authorization': 'Bearer expired_token' },
   credentials: 'include'
   }),
   fetch('http://localhost:3001/v1/admin/users', {
   headers: { 'Authorization': 'Bearer expired_token' },
   credentials: 'include'
   })
   ]);
   \`\`\`

### Expected Result:

- ✅ Only ONE refresh request is made
- ✅ Other requests wait (queued)
- ✅ All requests succeed after refresh
- ✅ Check Network tab: should see 1 refresh, then 3 retried requests

---

## 🎯 Summary Checklist

- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Dashboard shows correct data
- [ ] Page reload maintains session
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] CSRF header required on refresh
- [ ] Access token NOT in localStorage
- [ ] Refresh cookie is HttpOnly
- [ ] Auto-refresh on 401 works
- [ ] Role-based access control works
- [ ] Error handling is graceful
- [ ] No console errors on happy path

---

## 📊 Performance Check

### Metrics to watch:

1. **Login speed:** < 500ms
2. **Dashboard load:** < 1s
3. **Refresh call:** < 200ms
4. **Token refresh on 401:** < 300ms

### DevTools → Network:

- Check "Disable cache"
- Throttle to "Fast 3G"
- Verify performance is acceptable

---

## 🐛 Debugging Tips

### If login fails:

\`\`\`bash

# Check backend logs

# Should see: "Login successful for owner@example.com"

# Check frontend console

# Should NOT see CORS errors

\`\`\`

### If cookies not set:

\`\`\`bash

# Backend: check cookie config

# Should be: httpOnly: true, sameSite: 'lax', secure: false (in dev)

# Frontend: check .env.local

# Should be: NEXT_PUBLIC_API_URL=http://localhost:3001

\`\`\`

### If 401 on /me:

\`\`\`bash

# Check Authorization header in Network tab

# Should be: "Bearer eyJhbGci..."

# Check backend JWT verification

# Should see decoded token with user ID

\`\`\`

### If refresh fails:

\`\`\`bash

# Check X-Auth-Refresh header

# Should be: "1"

# Check cookie is sent

# Network tab → Request Headers → Cookie: refresh_token=...

\`\`\`

---

## ✅ All Tests Passing?

**Congratulations! Your auth system is production-ready! 🎉**

### Next steps:

1. Add more admin pages (users, roles, audit)
2. Add toast notifications for actions
3. Add loading skeletons for better UX
4. Deploy to staging environment
5. Set up monitoring/logging

---

**Happy Testing! 🚀**
