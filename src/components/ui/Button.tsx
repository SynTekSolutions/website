import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type BaseProps = {
  variant?: "primary" | "secondary" | "outline" | "outline-light" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
};

export type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      href,
      children,
      disabled,
      type = "button",
      ariaLabel,
      ...props
    },
    ref
  ) => {
    // Base styles for button & link variants
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    // Variant-specific styles
    const variants = {
      primary: "bg-secondary text-white hover:bg-secondary-hover shadow-lg hover:shadow-xl hover:shadow-secondary/25",
      secondary: "bg-white text-dark hover:bg-white/90 shadow-lg hover:shadow-xl font-bold",
      outline: "border-2 border-primary text-primary hover:bg-muted bg-transparent",
      "outline-light": "border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/70 bg-transparent",
      ghost: "text-primary hover:bg-muted bg-transparent",
    };

    // Size-specific styles
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3.5 text-lg",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const spinner = (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // If it's a hash link, render a native anchor tag
    if (href && href.startsWith("#")) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          aria-label={ariaLabel}
          {...(props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">)}
        >
          {children}
        </a>
      );
    }

    // If it's an external link or routing path, render Next.js Link component
    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          aria-label={ariaLabel}
          {...(props as Omit<React.ComponentPropsWithoutRef<typeof Link>, "href">)}
        >
          {children}
        </Link>
      );
    }

    // Otherwise, render a standard HTML button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled || isLoading}
        className={combinedClassName}
        aria-label={ariaLabel}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {isLoading && spinner}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
