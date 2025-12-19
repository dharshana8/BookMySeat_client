import React from 'react';
import './css/Modal.css';

export default function Modal({ show, onClose, onConfirm, title, message, type = 'info' }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {onConfirm ? (
            <>
              <button onClick={onClose} className="modal-btn cancel">Cancel</button>
              <button onClick={onConfirm} className="modal-btn confirm">Confirm</button>
            </>
          ) : (
            <button onClick={onClose} className="modal-btn ok">OK</button>
          )}
        </div>
      </div>
    </div>
  );
}