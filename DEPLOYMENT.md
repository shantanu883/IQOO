# DevLoop - Deployment Guide

## 🚀 Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/
2. **Sign in** with your GitHub account
3. **Click "New Project"**
4. **Import your repository**: `shantanu883/IQOO`
5. **Configure Project Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install --prefix client`

6. **Click "Deploy"**

The `vercel.json` file is already configured, so Vercel should pick up the settings automatically.

---

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## 🔧 Environment Variables (Optional)

If you want to connect to a real backend, add these environment variables in Vercel dashboard:

### In Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=your-backend-url
```

Update `client/.env.example` and create `client/.env.production`:
```
VITE_API_URL=https://your-backend-api.com
```

---

## 🌐 Deploy Backend (Optional)

### Option 1: Deploy to Railway.app

1. Go to https://railway.app/
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `IQOO` repository
5. Configure:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
6. Add environment variables from `server/.env.example`

### Option 2: Deploy to Render.com

1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create devloop-api

# Set root directory
heroku config:set PROJECT_PATH=server

# Deploy
git subtree push --prefix server heroku main
```

---

## 📋 What's Deployed

### Frontend (Vercel)
- ✅ React app with all 19 pages
- ✅ Responsive design
- ✅ Dark/Light theme
- ✅ Demo mode (works without backend)

### Backend (When deployed separately)
- ✅ Express API
- ✅ MongoDB integration
- ✅ AI features (Gemini)
- ✅ Code execution (Judge0)
- ✅ OAuth (GitHub/Google)

---

## 🐛 Troubleshooting

### Issue: Build fails with "tsc: command not found"
**Solution**: ✅ Fixed! Updated build script to use only `vite build`

### Issue: Routes not working (404 on refresh)
**Solution**: ✅ Fixed! Added rewrites in `vercel.json` to handle SPA routing

### Issue: Environment variables not working
**Solution**: Make sure to prefix with `VITE_` in the frontend:
- ✅ Correct: `VITE_API_URL`
- ❌ Wrong: `API_URL`

### Issue: Backend API not connecting
**Solution**: 
1. Deploy backend separately to Railway/Render
2. Update `VITE_API_URL` in Vercel environment variables
3. Update CORS settings in server to allow Vercel domain

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Vercel successfully
- [ ] All pages accessible
- [ ] Theme toggle working
- [ ] Demo mode functional
- [ ] Backend deployed (optional)
- [ ] Environment variables configured
- [ ] Custom domain connected (optional)
- [ ] MongoDB connected (optional)
- [ ] API integrations working (optional)

---

## 🌟 Your Live URLs

After deployment, you'll get:

**Frontend**: `https://your-project.vercel.app`  
**Backend**: `https://your-api.railway.app` (if deployed)

Update these in your environment variables!

---

## 📝 Notes

- The app works in **demo mode** without a backend
- Deploy backend separately for full functionality
- All features work locally with mock data
- Production features require API keys:
  - MongoDB for persistence
  - Gemini API for AI features
  - Judge0 API for code execution
  - GitHub/Google OAuth for login

---

## 🎉 Success!

Your DevLoop app should now be live on Vercel! 🚀

Visit your deployment URL and test:
1. Landing page
2. Register/Login (demo mode)
3. Complete onboarding
4. Browse explore, projects, developers
5. Check all 19 pages work

**Happy coding!** 💻
