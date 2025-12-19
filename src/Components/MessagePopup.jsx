import React from 'react';
import './css/MessagePopup.css';

export default function MessagePopup({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className={`popup-header ${type}`}>
          <span className="popup-icon">
            {type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
          </span>
          <span className="popup-title">
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}
          </span>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          <p>{message}</p>
        </div>
        <div className="popup-footer">
          <button className="popup-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}