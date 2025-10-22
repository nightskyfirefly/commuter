@echo off
echo Starting local server for EV Dashboard...
echo.
echo The dashboard will be available at: http://localhost:8000/ev_dashboard_dynamic.html
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server
pause
