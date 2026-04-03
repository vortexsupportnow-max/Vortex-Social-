import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-gray-800 rounded-xl border border-gray-700 p-4 ${className}`}>
    {children}
  </div>
);
