import React from 'react';
import clsx from 'clsx';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          'w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm',
          'focus:ring-2 focus:ring-teal-500 focus:outline-hidden focus:bg-white transition',
          className
        )}
        {...rest}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
