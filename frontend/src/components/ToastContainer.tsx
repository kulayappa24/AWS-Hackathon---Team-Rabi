import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { background: '#065f46', color: '#ffffff' };
      case 'error':
        return { background: '#991b1b', color: '#ffffff' };
      case 'warning':
        return { background: '#92400e', color: '#ffffff' };
      default:
        return { background: '#0f172a', color: '#ffffff' };
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" style={getStyle(toast.type)}>
          {toast.type === 'success' && <CheckCircle size={16} />}
          {toast.type === 'error' && <AlertCircle size={16} />}
          {toast.type === 'warning' && <AlertTriangle size={16} />}
          {toast.type === 'info' && <Info size={16} />}
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.8)' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
