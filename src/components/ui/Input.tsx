import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className, ...rest }, ref) => {
    if (!icon) {
      return (
        <input
          ref={ref}
          className={clsx(
            'w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm',
            'focus:ring-2 focus:ring-teal-500 focus:outline-hidden focus:bg-white transition',
            className
          )}
          {...rest}
        />
      );
    }
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
          {icon}
        </span>
        <input
          ref={ref}
          className={clsx(
            'w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm',
            'focus:ring-2 focus:ring-teal-500 focus:outline-hidden focus:bg-white transition',
            className
          )}
          {...rest}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
