import React from 'react';
import { AwsLogo } from './AwsLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AwsLogo height={24} />
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF' }}>
                AWS Student Builder Groups — Campus Chapter
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                Learn by building · Connect with peers · Build on AWS
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#D1D5DB' }}>#aws-student-builder-groups</span>
            <span style={{ color: '#D1D5DB' }}>#buildonaws</span>
            <span style={{ color: '#D1D5DB' }}>#amazon-bedrock</span>
            <span style={{ color: '#D1D5DB' }}>#rag-assistant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
