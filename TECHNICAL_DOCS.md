# Commute Cost Calculator - Technical Documentation

## ⚡ Quick Start for Future AI Agents

**Current Status:** ✅ Fully functional application running on Next.js 15.5.6

### Critical Information
- **Framework:** Next.js 15.5.6 (App Router)
- **Node Version Required:** 18.x or higher
- **Key Dependencies:** React 18.3.1, TypeScript, Tailwind CSS, Recharts
- **⚠️ IMPORTANT:** Never downgrade to Next.js 14.0.0 - it has critical middleware manifest bugs

### Quick Commands
```bash
npm install              # Install dependencies
npm run dev             # Start dev server on localhost:3000
npm run build           # Production build
npm run lint            # Run ESLint
```

### If You See Blank White Pages
1. Check terminal for `middleware-manifest.json` errors
2. Upgrade Next.js: `npm install next@latest`
3. Clear cache: `Remove-Item -Recurse -Force .next`
4. See "Critical Production Issues" section below for detailed troubleshooting

### Architecture Overview
- **`/app`** - Next.js pages and API routes
- **`/lib`** - Core business logic (server-only: geo.ts, elevation.ts)
- **`/components`** - React UI components
- **`/showcase`** - Standalone demo page

---

## Project Overview

This is a Next.js application that calculates fuel costs and ROI for vehicle upgrades with elevation-aware calculations. The application uses real-world routing data, elevation profiles, and sophisticated fuel consumption models to provide accurate cost comparisons between different vehicles.

## Complete Project Structure

```
commuter/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── commute/
│   │       └── route.ts          # POST /api/commute - Main calculation endpoint
│   ├── globals.css               # Global Tailwind CSS styles
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main client-side page component
├── components/                    # React components
│   ├── CommuteForm.tsx           # Input form for commute parameters
│   ├── ElevationChart.tsx        # Recharts-based elevation visualization
│   └── ui/                       # Reusable UI components (shadcn/ui style)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── select.tsx
├── lib/                          # Core business logic (modular)
│   ├── config.ts                 # API keys, constants, configuration
│   ├── types.ts                  # TypeScript interfaces and types
│   ├── math.ts                   # Mathematical utilities (haversine, densification)
│   ├── geo.ts                    # Geocoding and routing (server-only)
│   ├── elevation.ts              # Elevation data fetching (server-only)
│   ├── energy.ts                 # Fuel consumption calculations
│   ├── vehicles.ts               # Vehicle database with specifications
│   └── utils.ts                  # Utility functions (cn for className merging)
├── showcase/                     # Interactive demonstration page
│   ├── index.html                # Standalone showcase with embedded app
│   └── README.md                 # Showcase documentation
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
├── postcss.config.js             # PostCSS configuration
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
└── README.md                     # User-facing documentation
```

## Core Architecture & Separation of Concerns

### 1. Configuration Layer (`lib/config.ts`)
**Purpose**: Centralized configuration management
**Contents**:
- OpenRouteService API key (currently hardcoded for development)
- Open Elevation API endpoint
- Physical constants (Joules per gallon of gas, gravitational acceleration)
**Security**: API keys are server-only, never exposed to client

### 2. Type System (`lib/types.ts`)
**Purpose**: TypeScript interfaces for type safety
**Key Types**:
- `VehicleKind`: "ice" | "hybrid"
- `Vehicle`: Complete vehicle specification with mass, MPG, type
- `SpeedShares`: Distribution of driving speeds (65/70/75 mph)
- `ComputeInput`: All user inputs for calculations
- `ComputeResult`: Complete calculation results with costs and ROI

### 3. Mathematical Utilities (`lib/math.ts`)
**Purpose**: Pure mathematical functions
**Functions**:
- `haversine()`: Calculate distance between two lat/lon points
- `densify()`: Add intermediate points along a route for elevation sampling
**Characteristics**: Pure functions, no side effects, highly testable

### 4. Geospatial Services (`lib/geo.ts`)
**Purpose**: Server-only geocoding and routing
**Functions**:
- `geocodeORS()`: Convert address strings to lat/lon coordinates
- `routeORS()`: Get driving route between two points
**API**: Uses OpenRouteService for accurate routing data
**Security**: Server-only execution protects API keys

### 5. Elevation Data (`lib/elevation.ts`)
**Purpose**: Server-only elevation data fetching
**Functions**:
- `sampleOpenElevation()`: Get elevation data for route points
**Features**: Chunked requests (100 points per request) for efficiency
**API**: Uses Open-Elevation API (free but rate-limited)

### 6. Energy Calculations (`lib/energy.ts`)
**Purpose**: Sophisticated fuel consumption modeling
**Key Functions**:
- `mpgAtSpeedMix()`: Adjust base MPG for speed distribution
- `computeOneWayFuelGallons()`: Calculate fuel consumption with elevation
**Model Features**:
- Speed-based MPG adjustments (65mph: +15%, 70mph: +8%, 75mph: baseline)
- Elevation energy calculations (climbing vs descending)
- Hybrid regenerative braking efficiency (15% recovery)
- Engine efficiency differences (ICE: 27%, Hybrid: 33%)

### 7. Vehicle Database (`lib/vehicles.ts`)
**Purpose**: Default vehicle specifications
**Contents**: 6 realistic vehicles with accurate specifications:
- 2017 Toyota RAV4 XLE (ICE, 25 MPG, 1650kg)
- Ford Maverick Hybrid variants (29-33 MPG, 1700kg)
- Toyota RAV4 Hybrid AWD (32 MPG, 1700kg)
- Ford F-150 Hybrid PowerBoost (20 MPG, 2450kg)

### 8. API Endpoint (`app/api/commute/route.ts`)
**Purpose**: Server-side calculation orchestration
**Process Flow**:
1. Validate input and find vehicles
2. Geocode home/work addresses
3. Get driving route coordinates
4. Densify route for elevation sampling
5. Fetch elevation data
6. Calculate fuel consumption (outbound + return)
7. Apply winter weather penalties
8. Compute weekly/yearly costs and ROI
9. Return complete results

### 9. Showcase Page (`showcase/index.html`)
**Purpose**: Professional demonstration and presentation
**Features**:
- Embedded application via iframe
- Feature highlights with visual cards
- Demo instructions and pro tips
- Technical stack overview
- Responsive design with modern styling
- Graceful error handling for offline scenarios

### 10. UI Components
**CommuteForm.tsx**: Comprehensive input form with:
- Address inputs (home/work)
- Vehicle selection dropdowns
- Cost parameters (gas price, upgrade cost)
- Schedule parameters (days/week, weeks/year)
- Weather parameters (winter fraction, MPG penalty)
- Speed distribution inputs (must sum to 1.0)

**ElevationChart.tsx**: Recharts-based visualization:
- Line chart showing elevation profile
- Responsive container
- Custom tooltips and axis formatting

**UI Components**: shadcn/ui style components:
- Consistent styling with Tailwind CSS
- Proper accessibility attributes
- TypeScript support

## Calculation Logic Deep Dive

### Fuel Consumption Model
1. **Base MPG Adjustment**: `baseMpg75 * (s65*1.15 + s70*1.08 + s75*1.0)`
2. **Distance Calculation**: Sum of haversine distances between route points
3. **Elevation Energy**: `mass * gravity * elevation_change`
4. **Fuel Conversion**: `energy / (J_per_gallon * engine_efficiency)`
5. **Regenerative Recovery**: `descending_energy * regen_efficiency * engine_efficiency`
6. **Winter Penalty**: `total_cost * (1 + winter_fraction * winter_penalty)`

### ROI Calculations
- **Annual Savings**: `yearly_current - yearly_new`
- **ROI**: `savings / upgrade_cost` (if upgrade_cost > 0)
- **Payback Period**: `upgrade_cost / savings` (if savings > 0)

## Technology Stack

### Frontend
- **Next.js 14**: App Router, React Server Components
- **React 18**: Client-side interactivity
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Lucide React**: Icons

### Backend
- **Next.js API Routes**: Server-side endpoints
- **OpenRouteService**: Geocoding and routing
- **Open-Elevation API**: Elevation data

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **clsx + tailwind-merge**: Conditional styling

## Data Flow

1. **User Input** → CommuteForm component
2. **Form State** → React useState hook
3. **API Request** → POST /api/commute with ComputeInput
4. **Server Processing**:
   - Geocoding (address → coordinates)
   - Routing (coordinates → route)
   - Densification (route → detailed points)
   - Elevation (points → elevation data)
   - Energy calculation (route + elevation → fuel consumption)
   - Cost calculation (fuel + parameters → costs)
5. **Response** → ComputeResult with all calculations
6. **UI Update** → Display results and elevation chart

## Security Considerations

- **API Keys**: Server-only execution prevents client-side exposure
- **Input Validation**: TypeScript interfaces ensure data integrity
- **Error Handling**: Graceful failure with user-friendly messages
- **Rate Limiting**: Chunked elevation requests respect API limits

## Performance Optimizations

- **Path Densification**: Efficient algorithm for adding intermediate points
- **Chunked Requests**: Elevation data fetched in batches of 100 points
- **Server-Side Processing**: Heavy calculations on server, not client
- **Caching**: Appropriate cache headers for API responses

## Extensibility Points

### Adding New Vehicles
1. Update `lib/vehicles.ts` with new vehicle specifications
2. Ensure proper `VehicleKind` type ("ice" or "hybrid")
3. Include realistic mass and MPG values

### Modifying Calculations
1. **Energy Model**: Update functions in `lib/energy.ts`
2. **Speed Adjustments**: Modify factors in `mpgAtSpeedMix()`
3. **Efficiency Values**: Update `engineEff()` and `regenEff()` functions

### Adding New Features
1. **New Input Parameters**: Extend `ComputeInput` interface
2. **New Calculations**: Add functions to appropriate lib files
3. **New Visualizations**: Create components in `components/` directory

## Development Workflow

### Local Development
1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. `npm run build` - Production build
4. `npm run lint` - Code linting

### Environment Variables
For production, create `.env.local`:
```
ORS_API_KEY=your_openrouteservice_api_key
```

### Testing Strategy
- **Unit Tests**: Test individual functions in `lib/` files
- **Integration Tests**: Test API endpoint with mock data
- **E2E Tests**: Test complete user workflow

## Known Limitations

1. **API Rate Limits**: Open-Elevation API has rate limits
2. **Route Accuracy**: Depends on OpenRouteService data quality
3. **Elevation Resolution**: Limited by API data granularity
4. **Weather Modeling**: Simple winter penalty model
5. **Traffic**: Not accounted for in calculations

## Future Enhancements

1. **Multiple Elevation APIs**: Fallback options for better reliability
2. **Traffic Integration**: Real-time traffic data
3. **Weather API**: More sophisticated weather modeling
4. **Electric Vehicles**: Support for EV calculations
5. **Route Optimization**: Multiple route options comparison
6. **Historical Data**: Track fuel costs over time
7. **Export Features**: CSV/PDF report generation

## Troubleshooting

### Common Issues
1. **Geocoding Failures**: Check address format and API key
2. **Routing Errors**: Verify coordinates are valid
3. **Elevation Timeouts**: API rate limiting, implement retry logic
4. **Calculation Errors**: Check input validation and type safety

### Debug Information
- API responses logged in server console
- Client-side errors shown in UI
- TypeScript compilation errors in development

---

## Critical Production Issues (December 2024)

### 🚨 **Next.js 14.0.0 Middleware Manifest Bug - CRITICAL**

**Date Encountered:** December 17, 2024

**Severity:** Critical - Application completely non-functional

**Symptoms:**
- Server compiles successfully and shows "Ready" status
- Browser shows only blank white page
- No JavaScript errors in browser console
- Only HTML/CSS loads, React doesn't hydrate
- Terminal shows error: `Cannot find module '.next\server\middleware-manifest.json'`

**Root Cause:**
Next.js 14.0.0 has a critical bug where it fails to generate the `middleware-manifest.json` file during the build process. This file is essential for the dev server to handle page routing correctly. Without it, all page renders fail silently.

**Failed Attempts:**
1. ❌ Manually creating empty `middleware-manifest.json` file - deleted on rebuild
2. ❌ Clearing `.next` cache and rebuilding - bug persists
3. ❌ Removing and reinstalling `node_modules` - problem in Next.js core
4. ❌ Creating temporary test pages - same error on all routes
5. ❌ Modifying `next.config.js` - no effect on manifest generation

**Successful Solution:**
```bash
# Stop all Node processes
Stop-Process -Name node -Force

# Upgrade Next.js and React
npm install next@latest react@latest react-dom@latest

# Clear build cache
Remove-Item -Recurse -Force .next

# Restart dev server
npm run dev
```

**Result:** Upgraded to Next.js 15.5.6, which has the bug fixed. Application immediately started working.

**Follow-up Issues & Fixes:**
After upgrading, two additional issues needed resolution:

1. **TypeScript Error in `lib/elevation.ts`:**
   ```typescript
   // Problem: Type mismatch with cached nulls
   const elevs: number[] = [...cachedElevs]; // Error: (number | null)[] not assignable
   
   // Solution: Explicit null handling
   const elevs: (number | null)[] = [...cachedElevs];
   return elevs.filter((e): e is number => e !== null);
   ```

2. **ESLint Configuration Error in `.eslintrc.json`:**
   ```json
   // Problem: JavaScript syntax in JSON file
   module.exports = { extends: ["next/core-web-vitals"] }
   
   // Solution: Pure JSON format
   { "extends": ["next/core-web-vitals"] }
   ```

**Prevention for Future Development:**
- ⚠️ **NEVER use Next.js 14.0.0** - it has critical bugs
- ✅ Use Next.js 15.5.6 or later for new projects
- ✅ If you see blank white pages with "Ready" server status, check for middleware manifest errors
- ✅ Always verify terminal logs for build errors, not just browser console
- ✅ Keep `.eslintrc.json` in pure JSON format (no `module.exports`)
- ✅ Handle `null` values explicitly in TypeScript when implementing caching

**Debugging Timeline:**
- **T+0min:** User reports blank white page on localhost:3000
- **T+10min:** Confirmed server running but pages not rendering
- **T+15min:** Found `middleware-manifest.json` missing error in logs
- **T+20min:** Attempted manual file creation - failed
- **T+30min:** Attempted cache clearing - failed
- **T+45min:** Researched Next.js 14.0.0 bugs - identified known issue
- **T+50min:** Upgraded to Next.js 15.5.6
- **T+55min:** Fixed TypeScript and ESLint errors
- **T+60min:** ✅ Application fully functional

**Version History:**
- Next.js: 14.0.0 → 15.5.6
- React: ^18 → 18.3.1
- React DOM: ^18 → 18.3.1

---

## Lessons Learned & Development Insights

This section documents what worked well and what didn't during the initial development, to help future agents avoid repeating mistakes and build on successful patterns.

### ✅ What Worked Well

#### Architecture & Organization
- **Modular Library Structure**: Separating concerns into individual files (`lib/math.ts`, `lib/geo.ts`, etc.) made the codebase highly maintainable and testable
- **Server-Side API Protection**: Keeping all external API calls server-side in `/api/commute/route.ts` successfully protected API keys and improved security
- **TypeScript Throughout**: Complete type safety from API to UI prevented many runtime errors and improved developer experience
- **Pure Functions**: Mathematical utilities in `lib/math.ts` being pure functions made them easy to test and reason about
- **Component Separation**: UI components being modular and reusable (CommuteForm, ElevationChart) improved maintainability

#### Technical Implementation
- **Path Densification Algorithm**: The efficient densification in `lib/math.ts` worked well for elevation sampling
- **Chunked Elevation Requests**: Processing elevation data in batches of 100 points prevented API timeouts
- **Error Handling Strategy**: Graceful error handling with user-friendly messages improved user experience
- **State Management**: Simple React useState for form state was sufficient and didn't require complex state management

#### Development Process
- **Incremental Development**: Building core logic first, then API, then UI components created a solid foundation
- **Documentation-First Approach**: Creating comprehensive documentation alongside code improved project understanding
- **Separation of Concerns**: Each file having a single responsibility made debugging and modification easier

### ❌ What Didn't Work Well

#### Initial Challenges
- **Complex Select Component**: The initial select component implementation was overly complex and caused hydration errors; simplified to basic HTML select with proper styling
- **Hydration Errors**: Select components with nested structure caused server/client mismatch; fixed by simplifying to single select elements
- **Unicode Character Issues**: Initial attempts with smart quotes and en-dashes caused TypeScript compilation errors; sticking to plain ASCII resolved this
- **Over-Engineering UI**: Initially considered complex state management libraries, but simple React state was sufficient

#### API Integration Challenges
- **Rate Limiting**: Open-Elevation API has rate limits that weren't initially accounted for; solved with retry logic, caching, and fallback APIs
- **Error Propagation**: Initial error handling didn't properly propagate API failures to the UI; improved with try-catch blocks
- **Coordinate System**: Initially confused about lon/lat vs lat/lon ordering; standardized on [lon, lat] throughout
- **API Reliability**: Free elevation APIs can be unreliable; implemented fallback APIs and caching

#### Performance Considerations
- **Synchronous Processing**: Initial API route was synchronous, causing timeouts; async/await pattern improved reliability
- **Memory Usage**: Large elevation arrays could cause memory issues; chunked processing helped
- **Client-Side Calculations**: Initially considered client-side calculations; server-side proved more secure and reliable

### 🔧 Technical Decisions That Paid Off

#### Server-Side Processing
- **Decision**: Keep all heavy calculations server-side
- **Benefit**: Protected API keys, better performance, more reliable
- **Implementation**: Single API endpoint orchestrates all calculations

#### Elevation-Aware Calculations
- **Decision**: Include real elevation data in fuel calculations
- **Benefit**: Much more accurate than flat-road estimates
- **Implementation**: Densify route, fetch elevation, calculate energy consumption

#### Hybrid Vehicle Modeling
- **Decision**: Include regenerative braking efficiency
- **Benefit**: Realistic comparison between ICE and hybrid vehicles
- **Implementation**: Different efficiency factors and regen recovery

#### TypeScript Interfaces
- **Decision**: Comprehensive type definitions
- **Benefit**: Caught many errors at compile time, improved IDE support
- **Implementation**: Separate `types.ts` file with all interfaces

### 🚫 Anti-Patterns to Avoid

#### Don't Do This
- **Hardcode API Keys in Client Code**: Always keep API keys server-side
- **Mix Concerns in Single Files**: Keep math, geo, energy calculations separate
- **Skip Error Handling**: Always handle API failures gracefully
- **Ignore Rate Limits**: Chunk requests to respect API limits
- **Use Complex State Management**: Simple React state is often sufficient
- **Skip TypeScript Types**: Always define interfaces for data structures

#### Common Pitfalls
- **Coordinate Confusion**: Be consistent with [lon, lat] vs [lat, lon] ordering
- **Unicode Characters**: Avoid smart quotes and special characters in code
- **Synchronous API Calls**: Use async/await for external API calls
- **Missing Input Validation**: Always validate user inputs
- **Poor Error Messages**: Provide user-friendly error messages
- **Hydration Mismatches**: Avoid complex nested components that differ between server and client rendering
- **Outdated Next.js Config**: Remove experimental flags that are no longer needed in stable versions

### 🎯 Best Practices Established

#### Code Organization
1. **Single Responsibility**: Each file has one clear purpose
2. **Pure Functions**: Mathematical utilities should be pure
3. **Server-Side Security**: Keep sensitive operations server-side
4. **Type Safety**: Use TypeScript interfaces throughout
5. **Error Handling**: Graceful failure with user feedback

#### API Design
1. **Single Endpoint**: One API route handles complete calculation
2. **Input Validation**: Validate all inputs with TypeScript
3. **Error Propagation**: Proper error handling and user feedback
4. **Rate Limiting**: Respect external API limits
5. **Async Processing**: Use async/await for external calls

#### UI Development
1. **Component Separation**: Modular, reusable components
2. **Simple State**: React useState is often sufficient
3. **Consistent Styling**: Use Tailwind CSS consistently
4. **Accessibility**: Include proper ARIA attributes
5. **Responsive Design**: Mobile-friendly layouts

### 🔮 Future Development Recommendations

#### Immediate Improvements
1. **Add Unit Tests**: Test individual functions in `lib/` files
2. **Add Integration Tests**: Test API endpoint with mock data
3. **Improve Error Handling**: More specific error messages
4. **Add Loading States**: Better UX during API calls
5. **Validate Speed Shares**: Ensure they sum to 1.0

#### Medium-Term Enhancements
1. **Multiple Elevation APIs**: Fallback options for reliability
2. **Caching Strategy**: Cache elevation data to reduce API calls
3. **Input Validation**: Client-side validation before API calls
4. **Performance Monitoring**: Track API response times
5. **Mobile Optimization**: Better mobile experience

#### Long-Term Considerations
1. **Database Integration**: Store user routes and preferences
2. **Real-Time Data**: Live fuel prices and traffic data
3. **Advanced Analytics**: Historical data and trends
4. **Multi-User Support**: User accounts and saved routes
5. **API Versioning**: Support for multiple API versions

### 📝 Development Notes for Future Agents

#### When Starting a New Session
1. **Read TECHNICAL_DOCS.md First**: Understand the complete architecture
2. **Check CHANGELOG.md**: See what's been implemented and planned
3. **Review lib/ Files**: Understand the core business logic
4. **Test the API**: Ensure `/api/commute` endpoint works
5. **Check Dependencies**: Verify all packages are installed

#### When Making Changes
1. **Update Types First**: Modify interfaces in `lib/types.ts`
2. **Test Core Logic**: Ensure mathematical functions work correctly
3. **Update Documentation**: Keep TECHNICAL_DOCS.md current
4. **Add Changelog Entry**: Document changes in CHANGELOG.md
5. **Test End-to-End**: Verify complete user workflow

#### Common Debugging Steps
1. **Check API Keys**: Verify OpenRouteService key is valid
2. **Test Geocoding**: Ensure addresses resolve to coordinates
3. **Check Elevation Data**: Verify elevation API responses
4. **Validate Inputs**: Ensure all form inputs are valid
5. **Check Console**: Look for client-side errors
6. **Check Server Logs**: Look for API errors
7. **Use Debug Page**: Visit `/debug` to test API functionality directly
8. **Check CORS**: Ensure proper CORS headers for iframe embedding

---

## Documentation Maintenance

This technical documentation should be updated whenever significant changes are made to the project:

### When to Update
- New features are added
- Architecture changes are made
- New dependencies are added
- API endpoints are modified
- Calculation logic is changed
- Security considerations change
- New lessons learned or development insights
- Anti-patterns or best practices are discovered
- Common issues or debugging steps are identified

### How to Update
1. Update the relevant sections in this document
2. Update the "Last Updated" date below
3. Add entries to CHANGELOG.md
4. Update README.md if user-facing features change
5. Add new lessons learned to the "Lessons Learned & Development Insights" section
6. Update anti-patterns and best practices as needed
7. Document new debugging steps or common issues

### Documentation Files
- **README.md**: User-facing documentation and quick start guide
- **TECHNICAL_DOCS.md**: This file - comprehensive technical reference
- **CHANGELOG.md**: Version history and planned features
- **update-docs.sh**: Script to help with documentation updates

---

**Last Updated**: Initial creation - 2024-12-19
**Version**: 1.0.0
**Maintainer**: AI Assistant
