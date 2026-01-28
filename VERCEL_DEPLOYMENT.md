# 🚀 Vercel Deployment Guide (Free Tier)

Vercel is a great alternative for hosting Python (Flask) APIs for free. Since your project is a mono-repo, follow these steps to deploy only the backend.

## 1. Prepare for Deployment
I've already created `backend/vercel.json` and ensured `backend/requirements.txt` is ready.

## 2. Deploy to Vercel
1.  Go to [vercel.com](https://vercel.com) and log in with GitHub.
2.  Click **"Add New..."** → **"Project"**.
3.  Choose your repository: `Satyamcoder-2006/API-First-Video-App`.
4.  **Crucial Step - Project Settings**:
    *   **Framework Preset**: Other
    *   **Root Directory**: Click "Edit" and select the `backend` folder.
5.  **Environment Variables**:
    Open the **Environment Variables** section and add all the keys from your `.env.example`:
    *   `MONGO_URI` (Your MongoDB Atlas connection string)
    *   `MONGO_DB_NAME` (e.g., `video_app`)
    *   `JWT_SECRET_KEY` (Generate a random string)
    *   `CORS_ORIGINS` (Set to `*` or your frontend URL)
    *   `JWT_ACCESS_TOKEN_EXPIRES_HOURS` (Default: `24`)

6.  Click **Deploy**.

## 3. Post-Deployment
*   Vercel will give you a URL like `https://api-first-video-app-backend.vercel.app`.
*   Update your mobile app's `config.js` with this new URL.

## ⚠️ Important Note for Serverless
Vercel uses **Serverless Functions**. This means:
*   **Cold Starts**: The first request after some inactivity might take 2-3 seconds to wake up.
*   **Rate Limiting**: The `flask-limiter` I enabled will work per "execution", not globally across all users (since memory isn't shared). For a demo, this is perfectly fine.
*   **Database**: Since you are using MongoDB Atlas, it works perfectly with Vercel as it connects over the internet.

## Why use Vercel?
*   **Zero Config**: The `vercel.json` I added handles the routing.
*   **No Credit Card**: Vercel's free tier is very generous.
*   **Fast CDN**: Your API will be served from a location close to the user.
