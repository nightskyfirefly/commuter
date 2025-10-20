# Changelog

All notable changes to the Commute Cost Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### V2 Vehicle Search Implementation (December 2024)

#### Added
- **V2 Directory**: Complete second version with dynamic vehicle search capabilities
- **Vehicle Search Component**: `v2/components/VehicleSearch.tsx` for year/make/model selection
- **API Integration**: 
  - `v2/app/api/vehicles/makes/route.ts` - Vehicle makes endpoint
  - `v2/app/api/vehicles/models/route.ts` - Vehicle models endpoint
  - `v2/app/api/vehicles/lookup/route.ts` - EPA vehicle data lookup
- **Vehicle Lookup Library**: `v2/lib/vehicleLookup.ts` with NHTSA and EPA API integration
- **Aurora Theme**: Complete visual redesign with northern lights color palette
- **Showcase Pages**: 
  - Updated `showcase/index.html` to embed live Vercel app
  - Created `showcase/index-v2.html` with V2 feature highlights

#### Changed
- **Vehicle Makes List**: Replaced comprehensive API queries with curated list of 9 popular manufacturers
  - Includes: BMW, Ford, Honda, Jeep, Rivian, Subaru, Tesla, Toyota, Volkswagen
  - Eliminates non-vehicle companies from dropdown
  - Instant load (no API calls needed)

#### Known Issues
- **CRITICAL**: EPA vehicle lookup returning "No vehicles found matching the criteria"
  - Affects most vehicle searches, even common vehicles like 2024 Toyota Camry
  - Investigation needed: EPA API format may have changed
  - Debugging required: Test EPA API directly and verify response parsing
  - Fallback data source may be needed if EPA API unavailable

#### Technical Details
- **Architecture**: Modular API routes with proper error handling
- **Performance**: Parallel API calls with Promise.all for makes fetching
- **Security**: Server-side API calls protect external API keys
- **UI/UX**: Aurora theme with flowing animations and modern design

## [1.0.1] - 2024-12-17

### Critical Bug Fixes
- **FIXED**: Next.js 14.0.0 middleware manifest bug causing blank white pages
  - Upgraded from Next.js 14.0.0 to 15.5.6
  - Resolved `Cannot find module '.next\server\middleware-manifest.json'` error
  - Application now loads correctly without manifest errors
- **FIXED**: TypeScript compilation error in elevation caching
  - Updated type signature to handle `(number | null)[]` in `lib/elevation.ts`
  - Added null filtering before returning elevation data
- **FIXED**: ESLint configuration format error
  - Converted `.eslintrc.json` from JavaScript syntax to pure JSON
  - Removed `module.exports` syntax that was causing parse errors
- **FIXED**: Removed unused imports causing compilation warnings
  - Cleaned up `app/page.tsx` (removed Card, CardContent, Button, Loader2)
  - Cleaned up `components/CommuteForm.tsx` (removed Input, Label, Select imports)

### Changed
- Upgraded React to 18.3.1 (from ^18)
- Upgraded React DOM to 18.3.1 (from ^18)
- Updated Next.js to 15.5.6 (from 14.0.0)

### Technical Notes
This release addresses a critical bug in Next.js 14.0.0 that prevented the application from rendering. The middleware manifest file was not being generated during compilation, causing all pages to fail silently with a blank white screen. The upgrade to Next.js 15.5.6 resolved this issue completely.

**Debugging Process:**
1. Identified that server compiled but pages showed blank white screens
2. Found `Cannot find module middleware-manifest.json` errors in server logs
3. Attempted manual file creation - failed (deleted on rebuild)
4. Attempted cache clearing and clean builds - failed (bug in Next.js core)
5. Successfully resolved by upgrading to Next.js 15.5.6
6. Fixed resulting TypeScript and ESLint errors
7. Verified full functionality with successful API calls and rendering

### Added
- Initial project setup with Next.js 14 and TypeScript (moved to v1.0.0)
- Modular architecture with separation of concerns
- Elevation-aware fuel consumption calculations
- Hybrid vs ICE vehicle comparison
- Speed distribution analysis (65/70/75 mph)
- Winter weather impact modeling
- ROI and payback period calculations
- Interactive elevation profile visualization
- Server-side API protection for external services
- Comprehensive TypeScript type system
- shadcn/ui component library integration
- Recharts for data visualization
- Interactive showcase page with embedded app
- Professional demonstration and presentation features

### Technical Implementation
- **lib/config.ts**: Centralized configuration management
- **lib/types.ts**: Complete TypeScript interface definitions
- **lib/math.ts**: Pure mathematical functions (haversine, densification)
- **lib/geo.ts**: Server-only geocoding and routing
- **lib/elevation.ts**: Server-only elevation data fetching
- **lib/energy.ts**: Sophisticated fuel consumption modeling
- **lib/vehicles.ts**: Vehicle database with realistic specifications
- **app/api/commute/route.ts**: Main calculation endpoint
- **components/**: Modular React components
- **showcase/**: Interactive demonstration page
- **TECHNICAL_DOCS.md**: Comprehensive technical documentation with lessons learned

### Security
- API keys protected with server-side execution
- Input validation with TypeScript interfaces
- Graceful error handling throughout

### Performance
- Efficient path densification algorithms
- Chunked elevation data requests
- Server-side processing for heavy calculations

## [1.0.0] - 2024-12-19

### Added
- Initial release of Commute Cost Calculator
- Complete feature set as documented in TECHNICAL_DOCS.md
- Comprehensive lessons learned documentation
- Development insights and best practices
- Anti-patterns and common pitfalls documentation
- Future development recommendations

### Fixed
- Removed outdated experimental.appDir from Next.js config (Next.js 14 compatibility)
- Fixed hydration errors in select components by simplifying structure
- Resolved server/client rendering mismatches in UI components
- Fixed elevation API rate limiting issues with retry logic and caching
- Added fallback elevation API for improved reliability
- Reduced elevation point density to minimize API requests

### Enhanced
- **Complete visual redesign** with cybernetic theme and color palette
- **Advanced animations** including cyber-scan effects, data flow animations, and glow effects
- **Modern UI components** with cybernetic styling and hover effects
- **Interactive showcase page** with futuristic design and enhanced user experience
- **Gradient text effects** and cybernetic typography throughout the application
- **Enhanced chart visualization** with cybernetic color schemes and styling

---

## Future Planned Features

### [1.1.0] - Planned
- [ ] Multiple elevation API fallbacks
- [ ] Traffic integration
- [ ] Enhanced weather modeling
- [ ] Electric vehicle support

### [1.2.0] - Planned
- [ ] Route optimization
- [ ] Historical data tracking
- [ ] Export features (CSV/PDF)
- [ ] Mobile responsiveness improvements

### [2.0.0] - Future
- [ ] Multi-route comparison
- [ ] Real-time fuel price integration
- [ ] Advanced analytics dashboard
- [ ] User accounts and saved routes
