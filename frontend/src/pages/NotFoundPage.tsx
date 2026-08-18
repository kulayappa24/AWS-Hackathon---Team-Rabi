import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, MessageSquare } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '4rem 1.5rem',
      textAlign: 'center'
    }}>
      <div className="card" style={{ maxWidth: '480px', padding: '2.5rem 2rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <AlertTriangle size={28} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
          The portal resource or page you requested could not be located.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} />
            <span>Return Home</span>
          </Link>
          <Link to="/chat" className="btn btn-primary">
            <MessageSquare size={16} />
            <span>Open AI Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
