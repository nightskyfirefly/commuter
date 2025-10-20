// Simple test endpoint to verify basic functionality
export async function GET() {
  try {
    return Response.json({
      success: true,
      message: "API is working",
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
