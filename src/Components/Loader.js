import React from 'react';

function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading Satva Homes...</div>
      </div>
    </div>
  );
}

export default Loader;
