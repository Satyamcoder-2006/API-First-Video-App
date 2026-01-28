# 🚂 Railway.app Deployment Guide (No Credit Card Required)

Railway.app offers a free tier with $5 credit/month - perfect for Flask backends!

## Quick Steps

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub (no credit card needed)

### 2. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `Satyamcoder-2006/API-First-Video-App`
4. Railway will detect it's a Python project

### 3. Configure Service
1. Railway will create a service automatically
2. Click on the service → **Settings**
3. Set **Root Directory**: `/backend`
4. Set **Start Command**: `python app.py`
5. **Important Settings**:
   - **Build Command**: Leave blank (Railway auto-detects)
   - **Pre-deploy Command**: Leave blank (remove `npm run migrate` if present)
   - **Healthcheck Path**: `/health`
   - **Watch Paths**: `/backend/**` (ensures only backend changes trigger rebuilds)

### 4. Add Environment Variables
Click **Variables** tab and add:

```
MONGO_URI=mongodb+srv://satyam:YOUR_PASSWORD@cluster0.wyhjalg.mongodb.net/video_app?appName=Cluster0
MONGO_DB_NAME=video_app
JWT_SECRET_KEY=QSccONRwXHx08xvJdlSZMRfT0Bordv7HJn6oJE1FN_NZdutQdau55zjAAEtL5ksYQSectiL_NeKGPnhUJ5CPGw
PORT=5000
CORS_ORIGINS=*
JWT_ACCESS_TOKEN_EXPIRES_HOURS=24
```

**Important**: Replace `YOUR_PASSWORD` with your actual MongoDB Atlas password!

### 5. Deploy
- Railway auto-deploys on every push to main branch
- Or click **"Deploy"** button manually
- Wait 2-3 minutes for build to complete

### 6. Get Your URL
- Once deployed, Railway provides a URL like:
  - `https://your-app-name.up.railway.app`
- Click **Settings** → **Generate Domain** for a custom domain (optional)

### 7. Test Deployment
```powershell
curl https://your-app-name.up.railway.app/health
```

Should return: `{"status":"ok","time":"..."}`

## Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| Free Tier | ✅ $5/month credit | ❌ Requires card |
| Credit Card | ❌ Not required | ✅ Required |
| Auto Deploy | ✅ Yes | ✅ Yes |
| Python Support | ✅ Excellent | ✅ Excellent |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Troubleshooting

**Build fails?**
- Check Railway logs: Click service → **Deployments** → View logs
- Ensure `requirements.txt` is in `backend/` folder
- Verify Python version (Railway auto-detects)

**Environment variables not working?**
- Make sure variables are added in Railway dashboard
- Redeploy after adding variables

**Database connection fails?**
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify `MONGO_URI` has correct password (URL-encode special chars)

## Update Mobile Config

Once Railway gives you a URL, update `mobile/src/config.js`:

```javascript
export const API_BASE_URL = __DEV__
  ? "http://192.168.1.21:5000"  // Local dev
  : "https://your-app-name.up.railway.app";  // Railway URL
```

Then commit and push:
```powershell
git add mobile/src/config.js
git commit -m "Update config with Railway backend URL"
git push
```

---

**That's it!** Railway is simpler and doesn't require a credit card. 🎉
