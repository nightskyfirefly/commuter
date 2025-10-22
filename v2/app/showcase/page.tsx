export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Showcase Page</h1>
        <p className="text-gray-400 mb-6">
          This is a Next.js route that serves the showcase content.
        </p>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">App Integration</h2>
          <p className="text-gray-300 mb-4">
            The showcase will load the main app in an iframe below:
          </p>
          <div className="bg-gray-700 p-4 rounded">
            <iframe 
              src="/" 
              width="100%" 
              height="600" 
              frameBorder="0"
              className="rounded"
              title="Commute Cost Calculator App"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
