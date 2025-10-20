// Minimal test endpoint to verify basic functionality
export async function GET() {
  try {
    // Test basic EPA API call
    const response = await fetch(
      "https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2024&make=Ford&model=Maverick&format=json"
    );
    
    if (!response.ok) {
      return Response.json({
        success: false,
        error: `EPA API error: ${response.status}`,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    return Response.json({
      success: true,
      message: "EPA API is working",
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
