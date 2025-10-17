# Installing and Running Commute Cost Calculator V2

## 🚀 Quick Start

### 1. Navigate to V2 Directory
```bash
cd v2
```

### 2. Install Dependencies
```bash
npm install
```

> **Note**: V2 uses the same dependencies as V1 (Next.js 15.5.6, React 18.3.1, TypeScript, Tailwind CSS, Recharts)

### 3. Run Development Server
```bash
npm run dev
```

The app will start on `http://localhost:3000`

### 4. Build for Production (Optional)
```bash
npm run build
npm start
```

---

## 🔧 Configuration

### No API Keys Required!

V2 uses **public, free APIs** that don't require API keys:
- ✅ NHTSA vPIC API (vehicle makes/models)
- ✅ EPA FuelEconomy.gov API (MPG data)
- ✅ CarQuery API (optional weight data)

The only API key needed is the **OpenRouteService** key for geocoding and routing, which is already configured in `lib/config.ts`.

---

## 📋 System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Operating System**: Windows, macOS, or Linux
- **Browser**: Modern browser with JavaScript enabled

---

## 🌐 Accessing the App

### Development Mode
- **Main App**: `http://localhost:3000`
- **Debug Page**: `http://localhost:3000/debug`
- **Showcase**: Open `showcase/index.html` in a browser

### Production Mode
After building with `npm run build`:
```bash
npm start
```

The app will run in production mode on `http://localhost:3000`

---

## 🧪 Testing Vehicle Search

### Test Vehicles to Try

1. **2024 Ford Maverick Hybrid**
   - Year: 2024
   - Make: Ford
   - Model: Maverick
   - Expected: Multiple trims with high MPG

2. **2023 Toyota Prius**
   - Year: 2023
   - Make: Toyota
   - Model: Prius
   - Expected: Hybrid vehicle with excellent MPG

3. **2022 Tesla Model 3**
   - Year: 2022
   - Make: Tesla
   - Model: Model 3
   - Expected: Electric vehicle (EPA MPGe data)

4. **2020 Honda Civic**
   - Year: 2020
   - Make: Honda
   - Model: Civic
   - Expected: Multiple trim options, sedan class

---

## 🐛 Troubleshooting

### Issue: "No vehicles found"
**Cause**: The year/make/model combination doesn't exist in EPA database  
**Solution**: Try a different year or verify the spelling of make/model

### Issue: "Failed to fetch makes"
**Cause**: NHTSA API is temporarily unavailable  
**Solution**: Wait a moment and refresh, or use the manual vehicle list as fallback

### Issue: Vehicle weight seems incorrect
**Cause**: CarQuery data may be incomplete or inaccurate  
**Solution**: Use the "Vehicle Weight Override" field to manually enter the correct weight in kg

### Issue: Blank white page on localhost:3000
**Cause**: Next.js build issue or port conflict  
**Solution**:
```bash
# Stop all Node processes
# Windows:
Stop-Process -Name node -Force

# macOS/Linux:
killall node

# Delete build cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

### Issue: API calls failing with CORS errors
**Cause**: Running from file:// instead of http://localhost  
**Solution**: Always use `npm run dev` to run the app, don't open HTML files directly

---

## 📊 Performance Notes

### API Response Times

- **NHTSA Make List**: ~500ms (cached after first load)
- **NHTSA Model List**: ~300-500ms per year/make combination
- **EPA Vehicle Lookup**: ~200-400ms per vehicle + ~200ms per trim detail
- **CarQuery Weight**: ~300-800ms (optional, only when requested)

### Caching Strategy

- **Makes List**: Cached with `force-cache` (static data, rarely changes)
- **Model Lists**: Cached with `force-cache` (per year/make combo)
- **Vehicle Details**: No cache (`no-store`) - allows for EPA database updates
- **Elevation Data**: In-memory cache for session (from V1)

---

## 🔐 Security Notes

### Server-Side API Protection

All external API calls happen server-side via Next.js API routes:
- `/api/vehicles/makes`
- `/api/vehicles/models`
- `/api/vehicles/lookup`

This protects against:
- ✅ Rate limiting bypass attempts
- ✅ API abuse
- ✅ CORS issues
- ✅ Direct API access from client

---

## 📦 Dependencies

V2 adds **zero new dependencies** compared to V1. All vehicle API integrations use native `fetch` API.

### Existing Dependencies (from V1)
```json
{
  "next": "^15.5.6",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "typescript": "^5",
  "tailwindcss": "^3.3.0",
  "recharts": "^2.9.0",
  "lucide-react": "^0.292.0"
}
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd v2
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Static Hosting (Note: Limited Functionality)
V2 requires server-side API routes, so static hosting (GitHub Pages, Netlify static, etc.) is **not recommended**. Use platforms that support Next.js:
- ✅ Vercel
- ✅ Netlify (with Next.js plugin)
- ✅ AWS Amplify
- ✅ Google Cloud Run
- ✅ Any Node.js hosting

---

## 📞 Support

### Getting Help

1. **Check the documentation**:
   - [README_V2.md](./README_V2.md) - API integration details
   - [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md) - Architecture and troubleshooting

2. **Common Issues**: See "Troubleshooting" section above

3. **Report Bugs**: Create an issue on GitHub (if applicable)

---

## 🎯 Next Steps

After installation:

1. ✅ Test the vehicle search with a few known vehicles
2. ✅ Try the manual vehicle list fallback
3. ✅ Test weight override functionality
4. ✅ Run a complete commute calculation
5. ✅ Check the elevation chart rendering
6. ✅ Review the ROI calculations

---

*Happy Analyzing! 🚗💨*

