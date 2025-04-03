import { useEffect, useState } from 'react';
import './style.css'
import { Toast } from '../../lib/types/toast.type';
import { UUIDTypes } from 'uuid';

type ToastItemProps = Toast & { removeToast: (id: UUIDTypes | number) => void };

const ToastItem = ({ id, message, type, duration, removeToast } : ToastItemProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(id), 300);
  };

  return (
    <div
      className={`toast-item ${type} ${isExiting ? 'exiting' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="message">{message}</div>
      <button
        onClick={handleClose}
        className="close-button"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default ToastItem;