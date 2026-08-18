import React from 'react';

interface AwsLogoProps {
  size?: number | string;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const AwsLogo: React.FC<AwsLogoProps> = ({ size = 36, height, width, className = '', style = {} }) => {
  const actualHeight = height || size;
  const actualWidth = width || size;

  return (
    <img
      src="/aws-logo.png"
      alt="AWS Official Logo"
      className={className}
      style={{
        width: typeof actualWidth === 'number' ? `${actualWidth}px` : actualWidth,
        height: typeof actualHeight === 'number' ? `${actualHeight}px` : actualHeight,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: '6px',
        ...style,
      }}
    />
  );
};
