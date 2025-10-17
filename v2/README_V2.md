# Commute Cost Calculator V2 - Vehicle API Integration

## 🚀 What's New in V2

Version 2 adds **dynamic vehicle lookup** via public APIs, allowing users to search for any vehicle by year/make/model instead of being limited to a pre-defined list.

### Key Features

- **Real-time Vehicle Search**: Look up any vehicle from 1990-present using NHTSA and EPA databases
- **Accurate EPA MPG Data**: Pulls official city/highway/combined MPG from EPA FuelEconomy.gov
- **Automatic 75mph Conversion**: Converts EPA highway MPG to realistic 75mph baseline (15% reduction)
- **Optional Weight Override**: Fetch curb weight from CarQuery or manually override
- **Hybrid Detection**: Automatically identifies hybrid/electric vehicles
- **Backwards Compatible**: Still includes manual vehicle list as fallback

---

## 📚 API Integrations

### 1. **NHTSA vPIC API** (Vehicle Identification)
**Purpose**: Canonicalize vehicle data and get available makes/models  
**Endpoint**: `https://vpic.nhtsa.dot.gov/api/`  
**Rate Limit**: None (government API)  
**Usage**:
- `GET /vehicles/GetAllMakes` - Fetch all vehicle makes
- `GET /vehicles/GetModelsForMakeYear/make/{make}/modelyear/{year}` - Get models for specific make/year

**Implementation**: See `/v2/lib/vehicleLookup.ts` - `fetchVehicleMakes()`, `fetchVehicleModels()`

### 2. **EPA FuelEconomy.gov API** (MPG Data)
**Purpose**: Official U.S. government MPG ratings  
**Endpoint**: `https://www.fueleconomy.gov/ws/rest/`  
**Rate Limit**: None (government API)  
**Usage**:
- `GET /vehicle/menu/options?year={year}&make={make}&model={model}` - Get vehicle option IDs
- `GET /vehicle/{id}` - Get detailed vehicle data including MPG, transmission, drive type

**Response Fields Used**:
- `city08`: City MPG
- `highway08`: Highway MPG  
- `comb08`: Combined MPG
- `trany`: Transmission type
- `drive`: Drive type (2WD/4WD/AWD)
- `VClass`: Vehicle class (for mass estimation)
- `fuelType`: Fuel type (for hybrid detection)

**Implementation**: See `/v2/lib/vehicleLookup.ts` - `fetchEPAVehicles()`, `convertEPAtoVehicle()`

### 3. **CarQuery API** (Optional Weight Data)
**Purpose**: Community-sourced vehicle specifications including curb weight  
**Endpoint**: `https://www.carqueryapi.com/api/0.3/`  
**Rate Limit**: Reasonable use  
**Reliability**: Spot-check recommended (community data)  
**Usage**:
- `GET /?cmd=getTrims&year={year}&make={make}&model={model}` - Returns JSONP with trim data

**Implementation**: See `/v2/lib/vehicleLookup.ts` - `fetchCarQueryWeight()`

---

## 🔢 MPG Conversion Logic

### EPA Highway → 75mph Baseline

EPA highway fuel economy tests average around 48mph. Real-world highway driving at 75mph typically sees 10-20% lower fuel economy due to increased aerodynamic drag.

**Conversion Formula**:
```typescript
baseMpg75 = highwayMPG × 0.85  // 15% reduction (conservative)
```

**Why 15%?**
- **10% reduction**: Optimistic (newer aerodynamic vehicles)
- **15% reduction**: ✅ **Conservative/realistic** (our choice)
- **20% reduction**: Pessimistic (older/less aerodynamic vehicles)

**Example**:
- EPA Highway: 40 MPG
- Our 75mph Baseline: 40 × 0.85 = **34 MPG**

**Implementation**: See `/v2/lib/vehicleLookup.ts` - `convertEPAtoBase75()`

---

## 🏗️ Architecture Changes

### New Files in V2

```
v2/
├── lib/
│   └── vehicleLookup.ts          # Vehicle API utility functions
├── app/api/vehicles/
│   ├── makes/route.ts            # GET /api/vehicles/makes
│   ├── models/route.ts           # GET /api/vehicles/models?make=X&year=Y
│   └── lookup/route.ts           # GET /api/vehicles/lookup?year=X&make=Y&model=Z
├── components/
│   ├── VehicleSearch.tsx         # New vehicle search UI component
│   └── CommuteFormV2.tsx         # Enhanced form with integrated search
└── app/page.tsx                  # Updated to use CommuteFormV2
```

### Updated TypeScript Interfaces

**Extended Vehicle Interface** (`lib/types.ts`):
```typescript
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleKind;
  baseMpg75: number;
  massKg: number;
  // New optional fields from APIs
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  cityMpg?: number;
  highwayMpg?: number;
  combinedMpg?: number;
  source?: 'manual' | 'epa' | 'carquery';
}
```

**New API Response Types**:
- `VehicleMake`: NHTSA make data
- `VehicleModel`: NHTSA model data
- `EPAVehicle`: EPA fuel economy data

---

## 🎮 User Experience Flow

1. **User clicks "Search Vehicle"** on either Current or Upgrade vehicle field
2. **Select Year** from dropdown (current year + 1 down to 1990)
3. **Select Make** from NHTSA database (Ford, Toyota, etc.)
4. **Select Model** for chosen make/year (Maverick, Prius, etc.)
5. **Select Trim** from EPA database (transmission, drive type, etc.)
6. **Vehicle Details Displayed**:
   - EPA City/Highway/Combined MPG
   - Calculated 75mph baseline MPG
   - Vehicle type (ICE/Hybrid)
   - Estimated mass (with override option)
7. **Optional: Override Weight** in kg
8. **Click "Use This Vehicle"** to add to calculation

---

## 🧮 Mass Estimation Logic

When CarQuery doesn't return weight data, we estimate based on EPA vehicle class:

| Vehicle Class | Estimated Mass | Example |
|--------------|----------------|---------|
| Compact/Subcompact | 1,300 kg (~2,866 lbs) | Honda Civic |
| Midsize | 1,600 kg (~3,527 lbs) | Toyota Camry |
| Large/Full Sedan | 1,800 kg (~3,968 lbs) | Chevrolet Impala |
| SUV/Crossover | 2,000 kg (~4,409 lbs) | Ford Explorer |
| Truck/Pickup | 2,200 kg (~4,850 lbs) | Ford F-150 |
| Minivan/Van | 2,100 kg (~4,630 lbs) | Honda Odyssey |

**Users can always override** the estimated weight manually.

**Implementation**: See `/v2/lib/vehicleLookup.ts` - `estimateMassByClass()`

---

## 🔍 Hybrid Detection Logic

Vehicles are automatically classified as hybrid if any of these conditions are met:

1. **Fuel Type** contains "hybrid" or "electric"
2. **Model Name** contains "hybrid", "prime", or "plug-in"

**Implementation**: See `/v2/lib/vehicleLookup.ts` - `determineVehicleType()`

---

## 🚀 Setup & Usage

### Running V2

```bash
cd v2
npm install
npm run dev
```

Open `http://localhost:3000` to see the enhanced app with vehicle search.

### API Endpoints

All endpoints support CORS for cross-origin requests:

- **`GET /api/vehicles/makes`** - Fetch all vehicle makes
- **`GET /api/vehicles/models?make={make}&year={year}`** - Fetch models for make/year
- **`GET /api/vehicles/lookup?year={year}&make={make}&model={model}&includeWeight=true`** - Fetch vehicle details

---

## 🐛 Known Limitations

1. **EPA Data Availability**: Not all vehicles have EPA data (especially very old or rare models)
2. **CarQuery Weight Reliability**: Community-sourced data may be incomplete or inaccurate
3. **API Rate Limits**: While government APIs have no hard limits, excessive requests may be throttled
4. **Mass Estimates**: Vehicle class-based estimates are approximate
5. **Trim Variations**: Multiple trims for same model may have different MPG/weight

**Mitigations**:
- Fall back to manual vehicle list if API fails
- Allow manual weight override for all vehicles
- Cache API responses where appropriate
- Provide clear source labels (EPA/CarQuery/Manual)

---

## 🔮 Future Enhancements

### Potential Improvements

1. **VIN Decoder**: Add VIN lookup for exact vehicle specifications
2. **Better Weight Data**: Integrate paid APIs (JATO, AutoData) for accurate weight
3. **Aerodynamic Data**: Factor in drag coefficient (Cd) for better speed-mpg modeling
4. **Historical Data**: Show MPG trends across years for same model
5. **Save Favorites**: Allow users to save frequently-compared vehicles
6. **Database Caching**: Cache API responses in database for faster lookups
7. **Offline Mode**: Pre-populate common vehicles for offline use

---

## 📖 References

- [NHTSA vPIC API Documentation](https://vpic.nhtsa.dot.gov/api/)
- [EPA FuelEconomy.gov Web Services](https://www.fueleconomy.gov/feg/ws/index.shtml)
- [CarQuery API Documentation](https://www.carqueryapi.com/documentation/)
- [EPA Fuel Economy Test Procedures](https://www.epa.gov/fueleconomy/how-vehicles-are-tested)

---

## 👥 Contributing

When adding new API integrations:

1. **Document the API** in this README
2. **Add TypeScript interfaces** in `lib/types.ts`
3. **Create utility functions** in `lib/vehicleLookup.ts`
4. **Expose as API route** in `app/api/vehicles/`
5. **Update VehicleSearch component** if UI changes needed
6. **Test with real vehicles** before deploying

---

## 📝 License

Same as V1 - see main README.md

---

*Version 2.0 - Vehicle API Integration - December 2024*

