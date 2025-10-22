# EV Charging Stations Dashboard

An interactive dashboard showing electric vehicle charging stations across the United States.

## Features

- **Interactive Map**: Visualize EV charging stations on a US map
- **Real-time Filtering**: Filter by state, access type (public/private), and charging cost (free/paid)
- **Live Statistics**: Dynamic counters showing total stations, public stations, free stations, and states covered
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful dark theme with glowing effects

## Quick Start

### Option 1: Demo Mode (Limited Data)
Simply open `ev_dashboard_dynamic.html` in your web browser. This will show a sample dataset with ~50 stations for demonstration purposes.

### Option 2: Full Dataset (Recommended)
For the complete dataset with 80,000+ stations:

1. **Using Python** (if installed):
   ```bash
   cd v2/showcase
   python -m http.server
   ```
   Then open: http://localhost:8000/ev_dashboard_dynamic.html

2. **Using the batch file** (Windows):
   Double-click `start-server.bat` in the showcase folder

3. **Using Node.js** (if installed):
   ```bash
   cd v2/showcase
   npx http-server
   ```

## Data Source

The dashboard uses data from `ev_stations_clean.csv` which contains:
- Latitude and longitude coordinates
- State and county information
- Access type (public/private)
- Free/paid charging status
- Station details for hover tooltips

## Technical Details

- **Plotly.js**: Version 2.35.2 for interactive mapping
- **Responsive Design**: CSS Grid layout with mobile sidebar
- **CORS Handling**: Graceful fallback to sample data when CSV can't be loaded
- **Performance**: Efficient filtering and rendering for large datasets

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Responsive design supported

## Troubleshooting

**CORS Error**: If you see a CORS error, it means you're opening the HTML file directly. Use one of the server options above to serve the files properly.

**No Data Loading**: Ensure `ev_stations_clean.csv` is in the same directory as the HTML file when using a local server.