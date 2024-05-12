import React from 'react';

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      <div className="ml-4 text-xl font-bold">Loading Satva Homes...</div>
    </div>
  );
}

export default Loader;
