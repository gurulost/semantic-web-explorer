
import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-primary animate-pulse-soft">Building semantic map...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
