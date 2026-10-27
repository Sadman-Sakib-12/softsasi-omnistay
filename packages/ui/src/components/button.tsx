import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const variantStyles = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs border border-blue-600 font-medium',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-rose-600 font-medium',
      outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs font-medium',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium border border-slate-200',
      ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
      link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
      glow: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs font-semibold',
    }[variant];

    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm rounded-lg',
      sm: 'h-8 rounded-lg px-3 text-xs',
      xs: 'h-7 rounded-md px-2.5 text-[11px]',
      lg: 'h-11 rounded-lg px-6 text-sm font-semibold',
      icon: 'h-9 w-9 p-0 rounded-lg',
    }[size];

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
          variantStyles,
          sizeStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

