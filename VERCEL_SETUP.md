# ✅ Vercel Deployment - Quick Setup

## 🚀 Step-by-Step Deployment

### 1. Go to Vercel
Visit: https://vercel.com/

### 2. Import Your Project
- Click **"Add New..."** → **"Project"**
- Click **"Import Git Repository"**
- Select your repository: `shantanu883/IQOO`
- Click **"Import"**

### 3. Configure Build Settings

Vercel should auto-detect these from `vercel.json`, but verify:

```
Framework Preset: Other
Root Directory: ./
Build Command: cd client && npm install && npm run build
Output Directory: client/dist
Install Command: npm install --prefix client
Node.js Version: 18.x (or 20.x)
```

### 4. Click "Deploy"

That's it! Your app will be deployed in ~2 minutes.

---

## ✅ Fixes Applied

### ✓ Fixed: "tsc: command not found" error
**Solution:** Changed build script from `tsc -b && vite build` to just `vite build`

### ✓ Fixed: Node.js version warning
**Solution:** Added `"engines": { "node": ">=18.0.0" }` to package.json

### ✓ Fixed: SPA routing (404 on refresh)
**Solution:** Added rewrites in vercel.json to route all paths to index.html

---

## 🔧 If Deployment Still Fails

### Option 1: Manual Override in Vercel UI
Go to **Project Settings** → **General** and set:

```
Build Command: cd client && npm install && npm run build
Output Directory: client/dist
Install Command: npm install --prefix client
```

### Option 2: Simplify Structure
If Vercel can't find the client folder, try these settings:

```
Root Directory: client
Build Command: npm install && npm run build
Output Directory: dist
```

---

## 🎯 What You'll Get

After successful deployment:

✅ **Live URL**: `https://your-project-name.vercel.app`  
✅ All 19 pages working  
✅ Demo mode enabled (works without backend)  
✅ Responsive design  
✅ Dark/Light theme  
✅ Auto-deploys on every push to main branch  

---

## 📝 Post-Deployment

1. **Visit your live site**: Check all pages work
2. **Test onboarding**: Register → Complete onboarding → Home
3. **Browse features**: Explore, Projects, Developers, etc.
4. **Share your link**: Your app is live! 🎉

---

## 🐛 Common Issues

### Issue: "Build Failed" 
**Check**: 
- Build logs in Vercel dashboard
- Make sure latest commit is pushed to GitHub
- Verify vercel.json is in root directory

### Issue: White screen or blank page
**Check**:
- Open browser console (F12) for errors
- Verify Output Directory is set to `client/dist`
- Check if `client/dist/index.html` exists after build

### Issue: 404 on page refresh
**Check**:
- Verify rewrites are in vercel.json
- Should redirect all routes to /index.html

---

## 🎉 You're Done!

Your DevLoop app should now be live on Vercel!

**Test it**: https://your-project.vercel.app

**Next Steps**:
- [ ] Add custom domain (optional)
- [ ] Deploy backend to Railway/Render (optional)
- [ ] Connect MongoDB (optional)
- [ ] Add API keys for full features (optional)

**The app works perfectly in demo mode without any backend!** 🚀
