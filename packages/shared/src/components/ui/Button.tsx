import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-600 shadow-sm",
        secondary: "bg-secondary text-white hover:bg-secondary-600 shadow-sm",
        outline: "border border-neutral-400 bg-transparent hover:bg-neutral-200 text-neutral-700",
        ghost: "bg-transparent hover:bg-neutral-200 text-neutral-700",
        link: "bg-transparent underline-offset-4 hover:underline text-primary p-0 h-auto",
        danger: "bg-error hover:bg-error/90 text-white",
      },
      size: {
        sm: "h-9 px-3 rounded-md text-xs",
        md: "h-11 px-4 rounded-md",
        lg: "h-12 px-6 rounded-md text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * If true, the button will show a loading spinner and be disabled
   */
  isLoading?: boolean;
  /**
   * Optional text to display next to the loading spinner
   */
  loadingText?: string;
  /**
   * If true, the loading spinner will be shown on the left side
   */
  leftLoadingIcon?: boolean;
  /**
   * Optional left icon
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional right icon
   */
  rightIcon?: React.ReactNode;
}

/**
 * Primary UI component for user interaction
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftLoadingIcon = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // When loading, button should be disabled
    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && leftLoadingIcon && (
          <Spinner className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        
        {!isLoading && leftIcon && (
          <span className="mr-2 -ml-1">{leftIcon}</span>
        )}
        
        {children}
        
        {isLoading && !leftLoadingIcon && !loadingText && (
          <Spinner className="ml-2 h-4 w-4" aria-hidden="true" />
        )}
        
        {isLoading && !leftLoadingIcon && loadingText && (
          <>
            <span className="sr-only">Loading</span>
            <Spinner className="mr-2 h-4 w-4" aria-hidden="true" />
            {loadingText}
          </>
        )}
        
        {!isLoading && rightIcon && (
          <span className="ml-2 -mr-1">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
