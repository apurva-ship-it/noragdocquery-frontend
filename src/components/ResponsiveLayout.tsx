import React from 'react';

interface ResponsiveLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ left, right, className = '' }) => {
  return (
    <div className={`flex flex-col min-[769px]:flex-row gap-6 ${className}`}>
      <div className="w-full min-[769px]:w-1/2 min-w-0">
        {left}
      </div>
      <div className="w-full min-[769px]:w-1/2 min-w-0">
        {right}
      </div>
    </div>
  );
};

export default ResponsiveLayout;
