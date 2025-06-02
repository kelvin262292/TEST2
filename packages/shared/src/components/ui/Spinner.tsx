import React from 'react';
import { cn } from '../../utils/cn';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size variant of the spinner
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg';
  
  /**
   * Color variant of the spinner
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'white';
}

/**
 * Spinner component for indicating loading states
 */
export function Spinner({
  className,
  size = 'default',
  variant = 'primary',
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-3 w-3 border-[2px]',
    default: 'h-4 w-4 border-[2px]',
    lg: 'h-6 w-6 border-[3px]',
  };

  const variantClasses = {
    primary: 'border-primary/30 border-t-primary',
    secondary: 'border-secondary/30 border-t-secondary',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}
