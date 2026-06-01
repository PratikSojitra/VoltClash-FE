import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20',
      secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
      outline: 'bg-transparent border border-border hover:bg-muted text-foreground',
      ghost: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-8 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider text-[10px]">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
            error && "border-red-500/50 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-widest">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
