# Commute Cost Calculator V2 🚗💰

> **⚡ Enhanced Version with Real-Time Vehicle API Integration**

> **🔐 Security Note**: API keys are stored in environment variables. See [ENV_SETUP.md](../ENV_SETUP.md) for configuration instructions.

## 🆕 What's Different in V2?

This is Version 2 of the Commute Cost Calculator, featuring **dynamic vehicle lookup** capabilities:

- ✅ **Search ANY vehicle** by year/make/model (1990-present)
- ✅ **Real EPA MPG data** from FuelEconomy.gov API
- ✅ **Automatic hybrid detection** and type classification
- ✅ **Optional weight lookup** from CarQuery with manual override
- ✅ **Backwards compatible** with original manual vehicle list

**Want the original?** The original V1 is still available in the parent directory with the static vehicle list.

**Documentation**: See [README_V2.md](./README_V2.md) for complete V2 API integration details.

---

# Commute Cost Calculator (Original README)

A Next.js application that calculates fuel costs and ROI for vehicle upgrades with elevation-aware calculations.

## Features

- **Elevation-aware fuel calculations**: Takes into account hills and elevation changes
- **Hybrid vs ICE comparison**: Compare different vehicle types with realistic efficiency models
- **Speed mix analysis**: Account for different driving speeds (65, 70, 75 mph)
- **Winter conditions**: Factor in winter weather impact on fuel efficiency
- **ROI calculations**: Calculate return on investment and payback periods
- **Interactive elevation profile**: Visualize the route's elevation changes

## Architecture

The application follows a clean separation of concerns:

### Core Libraries (`lib/`)
- `config.ts` - API keys and constants
- `types.ts` - TypeScript interfaces and types
- `math.ts` - Mathematical utilities (haversine distance, path densification)
- `geo.ts` - Geocoding and routing (server-only)
- `elevation.ts` - Elevation data fetching (server-only)
- `energy.ts` - Fuel consumption calculations
- `vehicles.ts` - Default vehicle database
- `utils.ts` - Utility functions

### API Routes (`app/api/`)
- `commute/route.ts` - Main calculation endpoint

### Components (`components/`)
- `CommuteForm.tsx` - Input form for commute parameters
- `ElevationChart.tsx` - Chart component for elevation visualization
- `ui/` - Reusable UI components (Card, Button, Input, etc.)

### Pages (`app/`)
- `page.tsx` - Main application page
- `layout.tsx` - Root layout component

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys

The application uses OpenRouteService (ORS) for geocoding and routing. The API key is currently hardcoded in `lib/config.ts` for development purposes. In production, replace this with an environment variable:

```typescript
export const ORS_API_KEY = process.env.ORS_API_KEY || "your-api-key";
```

## Vehicle Database

The application includes a default set of vehicles with realistic specifications:
- 2017 Toyota RAV4 XLE (ICE)
- Ford Maverick Hybrid variants
- Toyota RAV4 Hybrid AWD
- Ford F-150 Hybrid PowerBoost

You can extend this database by modifying `lib/vehicles.ts`.

## Technical Details

### Fuel Calculation Model
- Base MPG adjusted for speed mix
- Elevation changes factored into energy consumption
- Hybrid regenerative braking efficiency
- Winter weather penalties

### Elevation Data
- Uses Open-Elevation API (free, rate-limited)
- Path densification for accurate elevation sampling
- One-way elevation profile visualization

### Performance Considerations
- Server-side API calls to protect API keys
- Efficient path densification algorithms
- Chunked elevation data requests

## Interactive Showcase

The project includes a professional showcase page (`showcase/index.html`) that demonstrates the application's capabilities:

- **Embedded Application**: Live demo of the calculator
- **Feature Highlights**: Visual cards explaining key capabilities
- **Demo Instructions**: Suggested routes and pro tips
- **Technical Details**: Technology stack and implementation highlights

To use the showcase:
1. Start the main app: `npm run dev`
2. Open `showcase/index.html` in your browser
3. Explore the interactive demonstration

## Technical Documentation

For detailed technical information about the project architecture, implementation details, and development guidelines, see [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md).

## Project Development History

This project was built with a focus on modular architecture and separation of concerns:

### Architecture Decisions
- **Modular Library Structure**: Each concern (math, geo, energy, etc.) is separated into its own file
- **Server-Side API Protection**: All external API calls happen server-side to protect API keys
- **TypeScript Throughout**: Complete type safety from API to UI components
- **Pure Functions**: Mathematical utilities are pure functions for easy testing
- **Component Separation**: UI components are modular and reusable

### Key Implementation Details
- **Elevation-Aware Calculations**: Uses real elevation data to calculate energy consumption
- **Hybrid Vehicle Modeling**: Includes regenerative braking efficiency
- **Speed Distribution**: Accounts for different driving speeds and their MPG impact
- **Winter Weather Modeling**: Factors in seasonal efficiency losses
- **ROI Calculations**: Complete financial analysis including payback periods

### Development Approach
- Started with core business logic (lib/ files)
- Built server-side API endpoint for calculations
- Created modular UI components
- Implemented proper error handling and validation
- Added comprehensive TypeScript types throughout

## Critical Issues & Solutions (December 2024)

### **Issue: Next.js 14.0.0 Middleware Manifest Bug**

**Problem:** 
The application would not load, showing only a blank white page in the browser. The server compiled successfully but threw a critical error:
```
Error: Cannot find module '.next\server\middleware-manifest.json'
```

**Root Cause:**
- Next.js 14.0.0 had a known bug where it failed to generate the `middleware-manifest.json` file during compilation
- This caused all page renders to fail silently, resulting in blank white pages
- The server would start and show "Ready" but would crash when serving any page

**Failed Solutions:**
1. ❌ Manually creating the middleware-manifest.json file (file was deleted on rebuild)
2. ❌ Clearing .next cache and rebuilding (bug persisted)
3. ❌ Removing and reinstalling node_modules (bug was in Next.js itself)

**Successful Solution:**
✅ **Upgraded Next.js from 14.0.0 to 15.5.6**

```bash
npm install next@latest react@latest react-dom@latest
```

This fixed the middleware manifest bug and the app started working immediately.

### **Issue: TypeScript Compilation Errors**

**Problem:**
After upgrading, TypeScript errors in `lib/elevation.ts`:
```
Type '(number | null)[]' is not assignable to type 'number[]'
```

**Root Cause:**
The elevation caching system created an array with potential `null` values, but the return type expected only `number[]`.

**Solution:**
```typescript
// Changed from:
const elevs: number[] = [...cachedElevs];

// To:
const elevs: (number | null)[] = [...cachedElevs];

// And filter nulls before returning:
return elevs.filter((e): e is number => e !== null);
```

### **Issue: Invalid ESLint Configuration**

**Problem:**
Build failed with: `Cannot read config file: .eslintrc.json - not valid JSON`

**Root Cause:**
The `.eslintrc.json` file contained JavaScript syntax instead of pure JSON:
```javascript
// WRONG - JavaScript in .json file
module.exports = {
  extends: ["next/core-web-vitals"],
}
```

**Solution:**
```json
// CORRECT - Pure JSON
{
  "extends": ["next/core-web-vitals"]
}
```

### **Key Takeaways for Future Development**

1. **Version Stability**: Always use stable, tested versions of Next.js. 14.0.0 was an early release with critical bugs.
2. **Blank White Pages**: If the server compiles but shows blank pages, check for middleware/build manifest errors in the console.
3. **JSON vs JavaScript**: Never use `module.exports` in `.json` files - keep configuration files in their proper format.
4. **Type Safety**: When implementing caching, ensure null handling is explicit in TypeScript types.
5. **Debugging Strategy**: Check terminal logs for compilation errors before investigating browser issues.

## Lessons Learned

This project was developed with a focus on learning and documenting what works well in practice:

### What Worked Well
- **Modular Architecture**: Separating concerns into individual files made the codebase highly maintainable
- **Server-Side API Protection**: Keeping external API calls server-side protected API keys and improved security
- **TypeScript Throughout**: Complete type safety prevented runtime errors and improved developer experience
- **Pure Functions**: Mathematical utilities being pure functions made them easy to test and reason about
- **Incremental Development**: Building core logic first, then API, then UI created a solid foundation

### What Didn't Work Well
- **Complex UI Components**: Initially over-engineered select components; simplified approach worked better
- **Unicode Characters**: Smart quotes and special characters caused TypeScript errors; plain ASCII resolved this
- **Rate Limiting**: Open-Elevation API rate limits weren't initially accounted for; chunked requests solved this
- **Coordinate Confusion**: Initially confused about lon/lat vs lat/lon ordering; standardized on [lon, lat] throughout

### Key Technical Decisions
- **Server-Side Processing**: All heavy calculations happen server-side for security and performance
- **Elevation-Aware Calculations**: Real elevation data makes fuel estimates much more accurate
- **Hybrid Vehicle Modeling**: Includes regenerative braking efficiency for realistic comparisons
- **Chunked API Requests**: Processes elevation data in batches to respect API limits

For detailed technical insights and development guidelines, see [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md).
