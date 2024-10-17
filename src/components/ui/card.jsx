import React from 'react';

export const Card = ({ className, children, ...props }) => (
  <div className={`bg-white shadow-md rounded-lg ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div className={`px-6 py-4 border-b ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h2 className={`text-xl font-semibold ${className}`} {...props}>
    {children}
  </h2>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);