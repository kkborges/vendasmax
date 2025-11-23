import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {!loading && icon && icon}
      {children}
    </button>
  );
}
