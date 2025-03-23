import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-50 text-gray-600 border-gray-200',
  primary: 'bg-blue-50 text-blue-700 border-blue-200',
  secondary: 'bg-purple-50 text-purple-700 border-purple-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  outline: 'bg-transparent border-current',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border';
  const variantClass = variantStyles[variant];
  const combinedClassName = [baseClasses, variantClass, className].filter(Boolean).join(' ');
  
  return <div className={combinedClassName} {...props} />;
} 