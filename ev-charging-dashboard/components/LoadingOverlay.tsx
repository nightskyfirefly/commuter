'use client';

export default function LoadingOverlay() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-aurora-blue via-aurora-dark to-aurora-darker">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-5"></div>
        <div className="text-lg text-aurora-text">Loading EV charging stations...</div>
      </div>
    </div>
  );
}
