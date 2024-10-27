// Components/CircularLoader.js
import React from 'react';

const CircularLoader = () => {
  return (
    <div className="flex items-center justify-center h-full">
      {/* Loader with animate-spin class */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
};

export default CircularLoader;
