# 🚀 GCP Deployment Guide for Skribbl Clone

## 📍 **Where to Go on GCP**

### **1. Google Cloud Console**
- **URL**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- **Sign in** with your Google account
- **Create a new project** or select existing one

---

## 🎯 **Deployment Options (Choose One)**

### **Option A: Cloud Run (Recommended) ⭐**
**Best for**: Easy deployment, auto-scaling, pay-per-use

**Steps:**
1. **Go to**: Cloud Run in left sidebar
2. **Click**: "Create Service"
3. **Choose**: "Continuously deploy from a source repository"
4. **Select**: Your GitHub repo or upload code
5. **Configure**: 
   - Service name: `skribbl-clone`
   - Region: `us-central1` (or your preferred region)
   - Port: `3000`
6. **Click**: "Create"

**Quick Deploy Command:**
```bash
npm run deploy:cloudrun
```

---

### **Option B: App Engine (Traditional)**
**Best for**: Managed platform, easy deployment

**Steps:**
1. **Go to**: App Engine in left sidebar
2. **Click**: "Create Application"
3. **Choose**: Region (e.g., `us-central`)
4. **Click**: "Create"
5. **Deploy**: Use the command below

**Deploy Command:**
```bash
npm run deploy:appengine
```

---

### **Option C: Compute Engine (Full Control)**
**Best for**: Full server control, custom configurations

**Steps:**
1. **Go to**: Compute Engine in left sidebar
2. **Click**: "Create Instance"
3. **Configure**: 
   - Name: `skribbl-clone-server`
   - Machine type: `e2-micro` (free tier) or `e2-small`
   - Boot disk: Ubuntu 20.04 LTS
   - Firewall: Allow HTTP/HTTPS traffic
4. **Click**: "Create"

---

## 🛠 **Pre-Deployment Setup**

### **1. Install Google Cloud CLI**
```bash
# macOS (using Homebrew)
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### **2. Authenticate & Set Project**
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Verify setup
gcloud config list
```

### **3. Enable Required APIs**
```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable App Engine API (if using App Engine)
gcloud services enable appengine.googleapis.com

# Enable Cloud Build API (if using Cloud Build)
gcloud services enable cloudbuild.googleapis.com
```

---

## 🚀 **Deployment Commands**

### **Cloud Run (Recommended)**
```bash
# Deploy to Cloud Run
npm run deploy:cloudrun

# Or manually:
gcloud run deploy skribbl-clone \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

### **App Engine**
```bash
# Deploy to App Engine
npm run deploy:appengine

# Or manually:
gcloud app deploy
```

### **Docker Build & Deploy**
```bash
# Build Docker image
npm run build:docker

# Run locally to test
npm run run:docker

# Deploy to Cloud Run with Docker
gcloud run deploy skribbl-clone \
  --image gcr.io/YOUR_PROJECT_ID/skribbl-clone \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

---

## 🌐 **Post-Deployment**

### **1. Get Your App URL**
After deployment, GCP will give you a URL like:
```
https://skribbl-clone-abc123-uc.a.run.app
```

### **2. Share with Friends**
- **Local friends**: Use your local IP
- **Online friends**: Use the GCP URL
- **Anyone**: The GCP URL works worldwide

### **3. Custom Domain (Optional)**
1. **Go to**: Cloud Run → Your Service → Manage Custom Domains
2. **Add**: Your domain
3. **Configure**: DNS records as instructed

---

## 💰 **Costs & Billing**

### **Cloud Run (Recommended)**
- **Free tier**: 2 million requests/month
- **After free tier**: Pay per request + CPU/memory usage
- **Typical cost**: $5-20/month for moderate usage

### **App Engine**
- **Free tier**: 28 instance hours/day
- **After free tier**: Pay per instance hour
- **Typical cost**: $10-30/month

### **Compute Engine**
- **Free tier**: 1 f1-micro instance/month
- **After free tier**: Pay per instance hour
- **Typical cost**: $15-50/month

---

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Permission denied"**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **"API not enabled"**
   ```bash
   gcloud services enable run.googleapis.com
   ```

3. **"Port already in use"**
   - Check if local server is running
   - Stop with `Ctrl+C` or `pkill node`

4. **"Build failed"**
   - Check Dockerfile syntax
   - Ensure all files are present
   - Check package.json dependencies

### **Useful Commands**
```bash
# Check deployment status
gcloud run services list

# View logs
gcloud run services logs read skribbl-clone

# Delete service
gcloud run services delete skribbl-clone

# Check project settings
gcloud config list
```

---

## 🎯 **Quick Start (5 minutes)**

1. **Go to**: [console.cloud.google.com](https://console.cloud.google.com/)
2. **Create project** or select existing
3. **Enable Cloud Run API**
4. **Run this command**:
   ```bash
   npm run deploy:cloudrun
   ```
5. **Share the URL** with friends!

---

## 📱 **Mobile Access**

Your deployed app will work perfectly on:
- ✅ **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- ✅ **Mobile browsers** (iOS Safari, Chrome Mobile)
- ✅ **Tablets** (iPad, Android tablets)
- ✅ **Touch devices** (drawing works with fingers!)

---

## 🌍 **Global Access**

Once deployed on GCP:
- **Anyone worldwide** can access your game
- **No need** to open ports on your router
- **Automatic scaling** handles any number of players
- **99.9% uptime** guaranteed by Google

---

**🎮 Your Skribbl Clone will be accessible worldwide!**
