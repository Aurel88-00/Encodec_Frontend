import ToastItem from './ToastItem';
import './style.css'
import { Toast } from '../../lib/types/toast.type';
import { UUIDTypes } from 'uuid';

type ToastContainerProps = {
    toasts: Toast[],
    removeToast: (id: UUIDTypes | number) => void
}

const ToastContainer = ({ toasts, removeToast } : ToastContainerProps) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={String(toast.id)} {...toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;