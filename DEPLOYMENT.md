# 🚀 Deployment Guide

This guide explains how to deploy the backend and mobile app **separately**.

## 📋 Overview

- **Backend**: Deployed to Render.com or Railway.app (provides API endpoints)
- **Mobile App**: Built via Expo EAS Build (connects to backend via API URL)

They are **completely independent** - the mobile app just needs the backend URL.

---

## 🔧 Backend Deployment

### Option 1: Render.com (Recommended - Free Tier Available)

1. **Create Account**
   - Go to [render.com](https://render.com) and sign up

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `pip install -r requirements.txt`
   - Set **Start Command**: `python app.py`

3. **Environment Variables**
   Add these in Render dashboard:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/video_app
   JWT_SECRET_KEY=your-super-secret-random-string-here
   PORT=5000
   CORS_ORIGINS=*
   JWT_ACCESS_TOKEN_EXPIRES_HOURS=24
   ```

4. **Deploy**
   - Render auto-deploys on every push to main branch
   - Your backend URL will be: `https://your-app-name.onrender.com`

### Option 2: Railway.app

1. **Create Account**
   - Go to [railway.app](https://railway.app) and sign up

2. **New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set **Root Directory**: `backend`

3. **Environment Variables**
   Add the same variables as Render above

4. **Deploy**
   - Railway auto-deploys on push
   - Your backend URL will be: `https://your-app-name.up.railway.app`

### MongoDB Setup (Required for Both)

1. **Create Free Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster (M0 tier)
   - Create database user
   - Whitelist IP: `0.0.0.0/0` (allows all IPs)

2. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/video_app`
   - Use this as `MONGO_URI` in your deployment

### Verify Backend Deployment

```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/health

# Should return:
# {"status": "ok", "time": "2026-01-27T..."}
```

---

## 📱 Mobile App Deployment

### Step 1: Update API URL

**Before building**, update `mobile/src/config.js`:

```javascript
export const API_BASE_URL = __DEV__
  ? "http://localhost:5000"  // Local dev
  : "https://your-backend-url.onrender.com";  // Production backend URL
```

**Important**: Replace `your-backend-url.onrender.com` with your actual deployed backend URL!

### Step 2: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 3: Login to Expo

```bash
eas login
```

### Step 4: Configure EAS Build

```bash
cd mobile
eas build:configure
```

This creates `eas.json` configuration file.

### Step 5: Build for Preview (Testing)

```bash
# Build for both platforms
eas build --profile preview --platform all

# Or build separately:
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

**What happens:**
- EAS builds your app in the cloud
- Provides QR code for testing
- Download links for APK/IPA files

### Step 6: Build for Production (App Stores)

```bash
# iOS (requires Apple Developer account)
eas build --profile production --platform ios

# Android (requires Google Play account)
eas build --profile production --platform android
```

### Step 7: Submit to Stores (Optional)

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

---

## 🔗 Connecting Backend and Mobile App

### Development (Local)

1. **Backend**: Run locally on `http://localhost:5000`
2. **Mobile**: Use `http://localhost:5000` in config (works for iOS Simulator/Android Emulator)
3. **Physical Device**: Use your computer's IP address:
   ```javascript
   export const API_BASE_URL = "http://192.168.1.100:5000"; // Your computer's IP
   ```

### Production

1. **Backend**: Deployed to Render/Railway → `https://your-backend.onrender.com`
2. **Mobile**: Update `config.js` with production URL
3. **Build**: Run `eas build` with production config

---

## 📝 Deployment Checklist

### Backend
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render/Railway
- [ ] Environment variables set
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Can signup/login via Postman/curl

### Mobile App
- [ ] Updated `mobile/src/config.js` with backend URL
- [ ] EAS CLI installed and logged in
- [ ] Preview build successful
- [ ] App connects to deployed backend
- [ ] Can signup/login in app
- [ ] Videos load from backend

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend returns 500 errors
- **Solution**: Check Render/Railway logs for errors
- **Common**: Missing `MONGO_URI` or invalid connection string

**Problem**: CORS errors in mobile app
- **Solution**: Ensure `CORS_ORIGINS=*` in environment variables

**Problem**: Database connection fails
- **Solution**: Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Mobile App Issues

**Problem**: "Network Error" in app
- **Solution**: Verify `API_BASE_URL` in `config.js` matches deployed backend URL
- **Solution**: Check backend is running and accessible

**Problem**: Build fails
- **Solution**: Check `package.json` dependencies are correct
- **Solution**: Verify `app.json` configuration

**Problem**: App can't connect to backend
- **Solution**: Test backend URL directly: `curl https://your-backend.onrender.com/health`
- **Solution**: Check backend logs for incoming requests

---

## 💡 Pro Tips

1. **Use Environment Variables**: Consider using Expo's environment variables for API URL:
   ```javascript
   export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
   ```

2. **Separate Dev/Prod Configs**: Create different build profiles in `eas.json`:
   ```json
   {
     "build": {
       "preview": {
         "env": {
           "EXPO_PUBLIC_API_URL": "https://dev-backend.onrender.com"
         }
       },
       "production": {
         "env": {
           "EXPO_PUBLIC_API_URL": "https://prod-backend.onrender.com"
         }
       }
     }
   }
   ```

3. **Monitor Backend**: Use Render/Railway's built-in monitoring
4. **Test Before Production**: Always test preview builds before production builds

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Mobile App (Expo EAS)           │
│  - Built as APK/IPA                     │
│  - Contains API_BASE_URL config         │
│  - Makes HTTP requests to backend       │
└──────────────┬──────────────────────────┘
               │ HTTPS Requests
               │ (JWT Auth)
               ▼
┌─────────────────────────────────────────┐
│    Backend (Render/Railway)             │
│  - Flask API                            │
│  - Handles auth, video data            │
│  - Returns embed URLs only             │
└──────────────┬──────────────────────────┘
               │ MongoDB Queries
               ▼
┌─────────────────────────────────────────┐
│      MongoDB Atlas                      │
│  - User data                            │
│  - Video metadata                       │
└─────────────────────────────────────────┘
```

---

## ✅ Summary

1. **Deploy backend first** → Get URL (e.g., `https://yourapp.onrender.com`)
2. **Update mobile config** → Set `API_BASE_URL` to backend URL
3. **Build mobile app** → Use EAS Build
4. **Test** → Verify app connects to backend
5. **Deploy** → Submit to app stores (optional)

**They are completely separate deployments** - the mobile app just needs to know where the backend is!
