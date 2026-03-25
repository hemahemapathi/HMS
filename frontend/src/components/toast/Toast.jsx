import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`position-fixed top-0 end-0 m-3 alert alert-${type === 'success' ? 'success' : 'danger'} d-flex align-items-center`}
      style={{ zIndex: 9999, minWidth: '300px' }}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="me-2" />
      ) : (
        <AlertCircle size={20} className="me-2" />
      )}
      <span className="flex-grow-1">{message}</span>
      <button 
        type="button" 
        className="btn-close ms-2" 
        onClick={onClose}
      ></button>
    </div>
  );
};

export default Toast;