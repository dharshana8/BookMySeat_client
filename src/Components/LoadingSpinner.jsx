import React from 'react';
import './css/LoadingSpinner.css';

export default function LoadingSpinner({ size = 'medium' }) {
  return (
    <div className={`loading-container ${size}`}>
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}