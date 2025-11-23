import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={clsx(
        'px-2 py-1 text-xs font-medium rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
