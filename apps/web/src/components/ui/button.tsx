import React from "react";
import { cn } from "@/lib/utils";
import { BeatLoader } from "react-spinners";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#00a8ff] text-white hover:bg-[#008ecc] focus:ring-[#00a8ff] shadow-sm hover:shadow",
      secondary:
        "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900",
      outline:
        "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
      gold:
        "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <BeatLoader color="currentColor" size={size === "sm" ? 6 : size === "lg" ? 10 : 8} speedMultiplier={1.2} />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

