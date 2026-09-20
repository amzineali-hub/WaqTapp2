import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ icon, className, children, ...rest }, ref) => {
    if (!icon) {
      return (
        <select
          ref={ref}
          className={clsx(
            'w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm',
            'focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition appearance-none',
            className
          )}
          {...rest}
        >
          {children}
        </select>
      );
    }
    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">{icon}</span>
        <select
          ref={ref}
          className={clsx(
            'w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm',
            'focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition appearance-none',
            className
          )}
          {...rest}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
