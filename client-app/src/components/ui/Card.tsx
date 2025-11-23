import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={clsx('bg-white rounded-lg shadow-sm p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
