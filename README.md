# EV Charging Stations Dashboard

A modern, interactive Next.js dashboard for visualizing electric vehicle charging stations across the United States.

## Features

- 🗺️ **Interactive Map**: Plotly.js-powered geographic visualization
- 🔍 **Real-time Filtering**: Filter by state, access type, and charging cost
- 📊 **Live Statistics**: Dynamic counters and metrics
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎨 **Modern UI**: Beautiful dark theme with Aurora-inspired design
- ⚡ **Fast Performance**: Optimized for large datasets (80,000+ stations)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Plotly.js with React integration
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd ev-charging-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Deploy automatically** - Vercel will detect Next.js and configure everything
3. **Your app will be live** at `https://your-app.vercel.app`

### Manual Vercel Deployment

```bash
npm install -g vercel
vercel
```

## Project Structure

```
ev-charging-dashboard/
├── app/
│   ├── api/stations/     # API routes for station data
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard page
├── components/
│   ├── LoadingOverlay.tsx
│   └── Sidebar.tsx
├── lib/
│   └── types.ts          # TypeScript type definitions
├── public/
│   └── ev_stations_clean.csv  # Station data
└── ...config files
```

## Data Source

The dashboard uses `ev_stations_clean.csv` containing:
- **83,680+ charging stations** across the US
- **Geographic coordinates** (lat/lon)
- **State and county** information
- **Access type** (public/private)
- **Charging cost** (free/paid)
- **Station details** for tooltips

## API Endpoints

### `GET /api/stations`

Returns all charging station data with filtering capabilities.

**Response**:
```json
{
  "stations": [...],
  "states": ["CA", "NY", "TX", ...],
  "total": 83680
}
```

## Customization

### Colors and Theme
Modify `tailwind.config.js` to customize the Aurora theme colors:

```javascript
colors: {
  'aurora-blue': '#030c18',
  'aurora-accent': '#ffd700',
  // ... other colors
}
```

### Adding New Filters
1. Update `StationFilters` interface in `lib/types.ts`
2. Add filter UI in `components/Sidebar.tsx`
3. Update filtering logic in `app/page.tsx`

## Performance

- **Optimized rendering** for large datasets
- **Client-side filtering** for instant response
- **Dynamic imports** to reduce bundle size
- **Responsive design** for all screen sizes

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own applications.
