# 🔐 OAuth Setup Guide - Google & Facebook

## Quick Overview
**Time needed**: ~5 minutes per provider  
**Cost**: FREE forever  
**What you'll get**: Professional "Sign in with Google/Facebook" buttons

---

## Part 1: Get Google OAuth Credentials (5 mins)

### Step 1: Go to Google Cloud Console
📍 https://console.cloud.google.com/

### Step 2: Create/Select Project
1. Click dropdown at top → "New Project"
2. Name it: "CastUp" → Create
3. Wait 10 seconds for project to be created

### Step 3: Enable Google+ API
1. Click "APIs & Services" → "Library"
2. Search: "Google+ API"
3. Click it → Click "Enable"

### Step 4: Create OAuth Credentials
1. Click "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure consent screen:
   - Click "Configure Consent Screen"
   - Choose "External" → Create
   - App name: "CastUp"
   - User support email: your email
   - Developer email: your email
   - Click "Save and Continue" → "Save and Continue" → "Save and Continue"
   - Click "Back to Dashboard"

4. Now create OAuth client ID:
   - Application type: "Web application"
   - Name: "CastUp Web"
   - Authorized redirect URIs: Add these:
     - `http://localhost:5000/api/auth/google/callback`
     - `http://localhost:3000` (for frontend)
   - Click "Create"

### Step 5: Copy Your Credentials
You'll see a popup with:
- **Client ID**: looks like `123456-abcdef.apps.googleusercontent.com`
- **Client Secret**: looks like `GOCSPX-abc123xyz`

**Keep this window open!** You'll need these in Step 7.

---

## Part 2: Get Facebook OAuth Credentials (5 mins)

### Step 1: Go to Facebook Developers
📍 https://developers.facebook.com/

### Step 2: Create App
1. Click "My Apps" → "Create App"
2. Select "Consumer" → Next
3. App name: "CastUp"
4. App contact email: your email
5. Click "Create App"

### Step 3: Set Up Facebook Login
1. Find "Facebook Login" → Click "Set Up"
2. Choose "Web"
3. Site URL: `http://localhost:3000`
4. Click "Save" → "Continue"
5. Skip the tutorials (click "Next" until done)

### Step 4: Configure Settings
1. Left sidebar: "Facebook Login" → "Settings"
2. Valid OAuth Redirect URIs: Add these:
   - `http://localhost:5000/api/auth/facebook/callback`
   - `http://localhost:3000`
3. Click "Save Changes"

### Step 5: Get App Credentials
1. Left sidebar: "Settings" → "Basic"
2. You'll see:
   - **App ID**: like `123456789012345`
   - **App Secret**: Click "Show" → like `abc123xyz789`

**Copy these!** You'll need them next.

---

## Part 3: Add Credentials to Your App (1 min)

### Open `backend/.env` and update:

```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Facebook OAuth
FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET_HERE
```

### Restart Backend
```bash
# Stop the backend (Ctrl+C in the terminal running backend)
# Start it again:
npm run dev
```

---

## Part 4: Test It! (30 seconds)

1. Go to http://localhost:3000/signup
2. Click "Continue with Google" → Real Google login! ✅
3. Click "Continue with Facebook" → Real Facebook login! ✅

---

## ⚠️ Important Notes

### For Production (when deploying):
Add these URLs to authorized redirects:
- Google: `https://your-domain.com/api/auth/google/callback`
- Facebook: `https://your-domain.com/api/auth/facebook/callback`

### Privacy & Security:
- NEVER commit `.env` file to Git (already in .gitignore ✅)
- Keep your secrets SECRET
- For production, add privacy policy & terms of service URLs in OAuth consent screens

---

## 🆘 Troubleshooting

**"Redirect URI mismatch"**
→ Make sure you added EXACT URLs in Step 4 (Google) or Step 4 (Facebook)

**"App not approved"**
→ For testing with <100 users, you don't need approval. Add test users in console.

**"Invalid client"**
→ Check you copied Client ID and Secret correctly to `.env`

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Got Google Client ID & Secret
- [ ] Created Facebook App
- [ ] Got Facebook App ID & Secret
- [ ] Added all credentials to `backend/.env`
- [ ] Restarted backend server
- [ ] Tested Google login
- [ ] Tested Facebook login

**Once all checked, OAuth is LIVE! 🎉**
