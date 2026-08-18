import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={18} />;
      case 'error': return <AlertCircle size={18} />;
      case 'warning': return <AlertTriangle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      <span style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon()}</span>
      <div>
        {title && <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>}
        <div>{message}</div>
      </div>
    </div>
  );
};
