import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const cardVariants = cva(
  "rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-shadow",
  {
    variants: {
      variant: {
        default: "overflow-hidden",
        product: "overflow-hidden hover:shadow-md",
        order: "border-l-4 border-l-primary",
        stat: "text-center p-4",
      },
      elevation: {
        0: "shadow-none",
        1: "shadow-sm",
        2: "shadow-md",
        3: "shadow-lg",
      },
      fullWidth: {
        true: "w-full",
      },
      clickable: {
        true: "cursor-pointer hover:shadow-md transition-all duration-200",
      },
    },
    defaultVariants: {
      variant: "default",
      elevation: 1,
      fullWidth: false,
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * If true, the card will take the full width of its container
   */
  fullWidth?: boolean;
  /**
   * If true, the card will have a pointer cursor and hover effect
   */
  clickable?: boolean;
  /**
   * Optional ref to the card element
   */
  ref?: React.ForwardedRef<HTMLDivElement>;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, elevation, fullWidth, clickable, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, elevation, fullWidth, clickable, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
