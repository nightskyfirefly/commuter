# Environment Variables Setup Guide

## 🔐 Security Notice

**The API key has been removed from the codebase for security.** You must set it as an environment variable.

---

## 📋 Local Development Setup

### Step 1: Create `.env.local` File

In the **root directory** of the project (same level as `package.json`), create a file named `.env.local`:

```bash
# .env.local
ORS_API_KEY=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgxZGM5YzI1OWIxZDQ3NTg4OTFjYTVhMzkzM2M0ODU2IiwiaCI6Im11cm11cjY0In0=
```

> ⚠️ **Important**: `.env.local` is already in `.gitignore` and will NOT be committed to Git.

### Step 2: Restart Your Dev Server

```bash
npm run dev
```

The app will now use the API key from `.env.local`.

---

## 🚀 Vercel Deployment Setup

### Step 1: Add Environment Variable in Vercel

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Add the following:

   - **Key**: `ORS_API_KEY`
   - **Value**: `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgxZGM5YzI1OWIxZDQ3NTg4OTFjYTVhMzkzM2M0ODU2IiwiaCI6Im11cm11cjY0In0=`
   - **Environments**: Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

5. Click **Save**

### Step 2: Redeploy

After adding the environment variable, trigger a new deployment:
- Push a new commit, or
- Go to **Deployments** → Click three dots → **Redeploy**

---

## 🔑 About the API Key

### OpenRouteService (ORS)

- **Purpose**: Geocoding (address → coordinates) and routing
- **Provider**: [OpenRouteService](https://openrouteservice.org/)
- **Cost**: Free tier
- **Rate Limit**: 2,000 requests/day (sufficient for personal use)

### Other APIs (No Keys Needed)

The following APIs are used but require **no API keys**:

- ✅ **NHTSA vPIC API** - Vehicle makes/models
- ✅ **EPA FuelEconomy.gov** - Official MPG data
- ✅ **Open Elevation API** - Elevation data (rate-limited)
- ✅ **CarQuery API** - Vehicle specifications (optional)

---

## 🛠️ Troubleshooting

### "Geocoding failed" or "Route not found" errors

**Cause**: Missing or invalid API key

**Solution**:
1. Check that `.env.local` exists in the root directory
2. Verify the API key is correct (no extra spaces or quotes)
3. Restart your dev server: `npm run dev`

### API key not working on Vercel

**Cause**: Environment variable not set or deployment didn't pick it up

**Solution**:
1. Verify the env var is added in Vercel dashboard
2. Make sure all environments are checked (Production, Preview, Development)
3. Redeploy the application

### Still getting errors?

Check the server console for detailed error messages:
```bash
npm run dev
# Look for API errors in the terminal output
```

---

## 📁 File Changes Made

The following files were updated to use environment variables:

- `lib/config.ts` - V1 configuration
- `v2/lib/config.ts` - V2 configuration

**Before:**
```typescript
export const ORS_API_KEY = "hardcoded_key_here";
```

**After:**
```typescript
export const ORS_API_KEY = process.env.ORS_API_KEY || "";
```

---

## 🎯 Quick Reference

### Local Development
```bash
# Create .env.local with:
ORS_API_KEY=your_key_here

# Start dev server
npm run dev
```

### Vercel Production
```
Settings → Environment Variables → Add Variable
Key: ORS_API_KEY
Value: your_key_here
Environments: ✅ All
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit API keys** to Git
2. ✅ `.env.local` is in `.gitignore` (already configured)
3. ✅ Use environment variables for all sensitive data
4. ✅ Different keys for development/production (optional)
5. ✅ Rotate keys if exposed accidentally

---

## 📞 Need a New Key?

If you need to generate a new OpenRouteService API key:

1. Visit [OpenRouteService Sign Up](https://openrouteservice.org/dev/#/signup)
2. Create a free account
3. Generate an API key from your dashboard
4. Update `.env.local` and Vercel environment variables

---

*Last Updated: December 2024*

