import React from 'react';
import { LoaderIcon } from '@/components/ui/icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm focus-visible:ring-[#4F46E5]',
  secondary:
    'bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#334155] shadow-sm focus-visible:ring-[#64748B]',
  outline:
    'bg-transparent hover:bg-slate-50 border border-[#CBD5E1] text-[#334155] focus-visible:ring-[#64748B]',
  danger:
    'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm focus-visible:ring-[#E11D48]',
  ghost:
    'bg-transparent hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] focus-visible:ring-[#64748B]',
  success:
    'bg-[#059669] hover:bg-[#047857] text-white shadow-sm focus-visible:ring-[#059669]',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-[11px] px-2.5 py-1 gap-1.5 rounded-md font-semibold',
  sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-lg font-semibold',
  md: 'text-xs px-4 py-2 gap-2 rounded-lg font-semibold',
  lg: 'text-sm px-5 py-2.5 gap-2.5 rounded-lg font-bold',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';
    const variantClass = variantStyles[variant] || variantStyles.primary;
    const sizeClass = sizeStyles[size] || sizeStyles.md;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <LoaderIcon className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

