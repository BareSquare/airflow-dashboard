# Netlify Deployment Guide - Connecting GitHub Repository

Complete step-by-step guide for deploying your Airflow Dashboard to Netlify.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub account with your repository created and code pushed
- ✅ Netlify account (free tier is sufficient)
  - Sign up at: https://app.netlify.com/signup
  - **Tip**: Use "Sign up with GitHub" for easier integration
- ✅ Your Astronomer Airflow credentials:
  - API Base URL (e.g., `https://your-deployment.astronomer.run/api/v1`)
  - Read-only API Token

---

## 🚀 Step-by-Step Deployment Process

### Step 1: Log into Netlify

1. Go to https://app.netlify.com/
2. Log in (or sign up if you haven't already)
3. You'll land on your Netlify dashboard (Team overview page)

---

### Step 2: Create New Site from Git

1. Click the **"Add new site"** button (or **"Import an existing project"**)
   - Located in the top right of the dashboard
   - Or click **"Sites"** in left sidebar → **"Add new site"**

2. Select **"Import an existing project"**

3. Choose **"Deploy with GitHub"**
   - You'll see three options: GitHub, GitLab, Bitbucket
   - Click on **GitHub**

---

### Step 3: Authorize Netlify to Access GitHub

**If this is your first time:**

1. A popup will appear asking to authorize Netlify
2. Click **"Authorize Netlify"**
3. You may need to enter your GitHub password

**If you've used Netlify before:**

1. Netlify will show you a list of your repositories
2. If you don't see your repository, click **"Configure Netlify on GitHub"**
3. This opens GitHub settings where you can grant access to specific repos

---

### Step 4: Configure GitHub Access (if needed)

If your repository doesn't appear in the list:

1. Click **"Configure Netlify on GitHub"** at the bottom of the repo list
2. This opens a new tab with GitHub's application settings
3. Scroll to **"Repository access"**
4. Choose one of:
   - **"All repositories"** (easier, grants access to everything)
   - **"Only select repositories"** (more secure, click "Select repositories" and choose your `airflow-dashboard` repo)
5. Click **"Save"**
6. Return to Netlify tab and refresh

---

### Step 5: Select Your Repository

1. You should now see a list of your GitHub repositories
2. Find your **`airflow-dashboard`** repository
3. Click on it to select it

---

### Step 6: Configure Build Settings

Netlify will show you a configuration screen:

#### **Owner**
- Should be pre-filled with your team name (leave as is)

#### **Branch to deploy**
- Select: **`main`** (or `master` if that's your default branch)
- This is the branch Netlify will watch for changes

#### **Build command**
- Enter: `npm run build`
- This tells Netlify how to build your React app

#### **Publish directory**
- Enter: `dist`
- This is where Vite outputs the built files

#### **Functions directory** (optional but recommended)
- Enter: `netlify/functions`
- This tells Netlify where your serverless functions are

**Your configuration should look like:**
```
Branch to deploy:     main
Build command:        npm run build
Publish directory:    dist
Functions directory:  netlify/functions
```

---

### Step 7: Advanced Build Settings (Skip for Now)

- You'll add environment variables in the next step after deployment
- Click **"Deploy [your-repo-name]"** at the bottom

---

### Step 8: Wait for Initial Deployment

1. Netlify will start building your site
2. You'll see a build log with real-time progress
3. **Expected outcome**: Build will likely **FAIL** on first deploy
   - This is normal! We haven't added environment variables yet
   - The frontend will build, but Netlify Functions will fail without Airflow credentials

4. Don't worry about the failure - we'll fix it in the next step

---

### Step 9: Configure Environment Variables

Now we'll add your Airflow credentials securely:

1. From the failed deployment page, click **"Site settings"** in the top navigation
   - Or click **"Site configuration"** in the left sidebar

2. In the left sidebar, find and click **"Environment variables"**
   - Under the "Build & deploy" section

3. Click **"Add a variable"** → **"Add a single variable"**

4. Add your first variable:
   - **Key**: `AIRFLOW_API_URL`
   - **Value**: Your Astronomer URL (e.g., `https://your-deployment.astronomer.run/api/v1`)
   - **Scopes**: Select "All scopes" (or just "Builds" and "Functions")
   - Click **"Create variable"**

5. Click **"Add a variable"** again

6. Add your second variable:
   - **Key**: `AIRFLOW_API_TOKEN`
   - **Value**: Your read-only Airflow API token
   - **Scopes**: Select "All scopes" (or just "Builds" and "Functions")
   - Click **"Create variable"**

**Security Note**: These variables are encrypted by Netlify and never exposed to the browser.

---

### Step 10: Trigger a New Deployment

Now that environment variables are configured:

1. Go to **"Deploys"** in the top navigation
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Netlify will rebuild with your environment variables
4. Wait for the build to complete (usually 1-3 minutes)

**This time it should succeed!** ✅

---

### Step 11: Access Your Deployed Site

1. Once the build completes, you'll see a green checkmark
2. At the top of the page, you'll see your site URL:
   - Format: `https://random-name-123456.netlify.app`
3. Click the URL to open your deployed dashboard
4. Test that it works:
   - Dashboard loads with metrics
   - DAG list appears
   - Navigation works
   - Data is loading from your Airflow instance

---

### Step 12: Customize Your Site URL (Optional)

The default URL is random. To customize it:

1. Go to **"Site configuration"** → **"Site details"**
2. Under **"Site information"**, find **"Site name"**
3. Click **"Change site name"**
4. Enter your desired name (e.g., `my-airflow-dashboard`)
   - Must be unique across all Netlify sites
   - Your URL will become: `https://my-airflow-dashboard.netlify.app`
5. Click **"Save"**

---

## 🔄 Auto-Deployment Setup

**Good news**: Auto-deployment is already configured! 

Every time you push to your `main` branch:
1. GitHub notifies Netlify of the change
2. Netlify automatically pulls the latest code
3. Builds and deploys the new version
4. Your site updates in 1-3 minutes

**To verify:**
1. Make a small change to your repo (e.g., edit README)
2. Push to GitHub: `git push origin main`
3. Go to Netlify **"Deploys"** tab
4. You should see a new build triggered automatically

---

## ⚙️ Additional Configuration (Optional)

### Configure Build Settings via netlify.toml

Instead of using the UI, you can commit a `netlify.toml` file to your repo:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Benefits:**
- Configuration is version controlled
- Consistent across team members
- Easy to replicate deployment

### Set Node.js Version

If you encounter build issues:

1. Go to **"Site configuration"** → **"Environment variables"**
2. Add variable:
   - Key: `NODE_VERSION`
   - Value: `18` (or `20`)

---

## 🔍 Monitoring and Logs

### View Build Logs

1. Go to **"Deploys"** tab
2. Click on any deployment
3. View the full build log
4. Useful for debugging build failures

### View Function Logs

1. Go to **"Functions"** tab
2. Click on any function (e.g., `dags`)
3. View recent invocations and logs
4. Useful for debugging API issues

### Real-time Logs (Optional)

For live debugging:
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Link your project: `netlify link`
3. View logs: `netlify watch`

---

## 🐛 Troubleshooting Common Issues

### Issue 1: Build Fails - "npm: command not found"

**Solution:**
- Netlify might be using the wrong Node version
- Add `NODE_VERSION = 18` environment variable (see above)

---

### Issue 2: Functions Return 500 Errors

**Possible causes:**
1. **Missing environment variables**
   - Check: Site configuration → Environment variables
   - Verify: `AIRFLOW_API_URL` and `AIRFLOW_API_TOKEN` are set

2. **Invalid Airflow credentials**
   - Test your token with curl:
     ```bash
     curl -H "Authorization: Bearer YOUR_TOKEN" \
          https://your-deployment.astronomer.run/api/v1/dags
     ```
   - If this fails, regenerate your Airflow token

3. **Wrong API URL**
   - Verify URL ends with `/api/v1` (not `/api/v1/`)
   - Check for typos

**Debug:**
- Check Function logs in Netlify dashboard
- Look for specific error messages

---

### Issue 3: "Page Not Found" on Direct URLs

If `/dags/my-dag` shows 404 but homepage works:

**Solution:** Add redirect rule for SPA routing

Create or update `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Or add in Netlify UI:
1. Site configuration → Redirects and rewrites
2. Add rule: `/* → /index.html (200)`

---

### Issue 4: CORS Errors in Browser Console

If you see CORS errors, it likely means:
- Your React code is trying to call Airflow API directly
- Make sure all API calls go through Netlify Functions

**Check:**
```javascript
// ❌ Wrong - calls Airflow directly
fetch('https://airflow.astronomer.run/api/v1/dags')

// ✅ Correct - calls Netlify Function
fetch('/.netlify/functions/dags')
```

---

### Issue 5: Environment Variables Not Working

**After adding/changing environment variables:**
1. You MUST trigger a new deployment
2. Environment variables are only loaded during build
3. Go to Deploys → Trigger deploy → Deploy site

---

### Issue 6: Site Builds but Shows Blank Page

**Check browser console for errors:**
1. Open DevTools (F12)
2. Look for JavaScript errors
3. Common causes:
   - API calls failing
   - Missing error boundaries
   - Routing issues

**Debug:**
- Test locally first: `netlify dev`
- Compare local behavior to production
- Check Network tab for failed API calls

---

## 📊 Site Dashboard Overview

Once deployed, your Netlify dashboard shows:

### **Deploys Tab**
- Build history
- Current deployment status
- Rollback to previous versions

### **Functions Tab**
- List of deployed functions
- Invocation count
- Execution logs
- Performance metrics

### **Site Configuration**
- Environment variables
- Build settings
- Domain settings
- Deploy notifications

### **Analytics Tab** (Optional - paid feature)
- Page views
- Bandwidth usage
- Top pages

---

## 🔐 Security Best Practices

### ✅ Do's:
- ✅ Use read-only Airflow API tokens
- ✅ Store all credentials in Netlify environment variables
- ✅ Never commit `.env` files to git
- ✅ Rotate API tokens periodically
- ✅ Use HTTPS (automatic with Netlify)

### ❌ Don'ts:
- ❌ Don't commit API tokens in code
- ❌ Don't use admin/write tokens
- ❌ Don't expose Netlify Functions URLs publicly without consideration
- ❌ Don't share environment variable values

---

## 🎓 Useful Netlify Features

### Deploy Previews
- Automatic preview deployments for pull requests
- Test changes before merging to main
- Enable in: Site configuration → Build & deploy → Deploy previews

### Split Testing
- Test different versions of your site
- A/B test features
- Available in paid plans

### Form Handling
- Netlify can handle form submissions
- No backend code needed
- Built-in spam filtering

### Analytics
- Privacy-friendly analytics
- No cookies or tracking
- Available in paid plans

---

## 📚 Additional Resources

### Documentation
- **Netlify Docs**: https://docs.netlify.com/
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Environment Variables**: https://docs.netlify.com/environment-variables/overview/

### Community
- **Netlify Community Forum**: https://answers.netlify.com/
- **Netlify Discord**: https://discord.com/invite/netlify

### CLI
- **Install**: `npm install -g netlify-cli`
- **Quick Start**: https://docs.netlify.com/cli/get-started/

---

## ✅ Final Checklist

Before considering deployment complete:

**Configuration:**
- [ ] GitHub repository connected
- [ ] Build command set to `npm run build`
- [ ] Publish directory set to `dist`
- [ ] Functions directory set to `netlify/functions`
- [ ] Environment variables added (AIRFLOW_API_URL, AIRFLOW_API_TOKEN)

**Testing:**
- [ ] Site deploys successfully (green checkmark)
- [ ] Homepage loads without errors
- [ ] API calls work (check browser Network tab)
- [ ] Navigation works between pages
- [ ] Data displays correctly from Airflow
- [ ] Mobile responsive (test on phone or DevTools)

**Security:**
- [ ] No credentials visible in browser
- [ ] No credentials in GitHub repository
- [ ] Using read-only Airflow token
- [ ] HTTPS enabled (automatic)

**Optional:**
- [ ] Custom domain configured (if desired)
- [ ] Site name customized
- [ ] Auto-deploy verified (test with a commit)

---

## 🎉 Success!

Your Airflow Dashboard is now:
- ✅ Deployed to Netlify
- ✅ Automatically deploying on git push
- ✅ Securely connecting to Airflow
- ✅ Accessible via HTTPS
- ✅ Ready for internal use

**Your deployment URL:**
```
https://[your-site-name].netlify.app
```

Share this URL with your team and start monitoring your Airflow DAGs! 🚀

---

## 🆘 Need Help?

If you encounter issues not covered here:

1. **Check Netlify Status**: https://www.netlifystatus.com/
2. **Review Build Logs**: Netlify Dashboard → Deploys → Latest Deploy
3. **Check Function Logs**: Netlify Dashboard → Functions
4. **Search Netlify Answers**: https://answers.netlify.com/
5. **Test Locally**: Run `netlify dev` to replicate the production environment

**Common search queries:**
- "netlify build failed"
- "netlify functions 500 error"
- "netlify environment variables not working"

Good luck with your deployment! 🎊
