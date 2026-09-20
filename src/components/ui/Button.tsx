import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'danger' | 'success' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

// "3D keycap" effect: a solid offset shadow simulates depth, which flattens
// and the button drops by a few px on press — like a physical button.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-teal-500 to-teal-600 text-white border border-teal-700/40 ' +
    'shadow-[0_4px_0_0_#115e59,0_6px_14px_-4px_rgba(13,148,136,0.45)] ' +
    'hover:from-teal-400 hover:to-teal-500 ' +
    'active:from-teal-600 active:to-teal-600 active:translate-y-[3px] active:shadow-[0_1px_0_0_#115e59,0_2px_4px_-1px_rgba(13,148,136,0.35)] ' +
    'focus-visible:ring-teal-500',
  accent:
    'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-900 border border-amber-600/40 ' +
    'shadow-[0_4px_0_0_#b45309,0_6px_14px_-4px_rgba(245,158,11,0.45)] ' +
    'hover:from-amber-300 hover:to-amber-400 ' +
    'active:from-amber-500 active:to-amber-500 active:translate-y-[3px] active:shadow-[0_1px_0_0_#b45309,0_2px_4px_-1px_rgba(245,158,11,0.35)] ' +
    'focus-visible:ring-amber-500',
  secondary:
    'bg-white text-slate-700 border border-slate-300 ' +
    'shadow-[0_3px_0_0_#cbd5e1,0_4px_10px_-3px_rgba(15,23,42,0.12)] ' +
    'hover:bg-slate-50 hover:text-slate-900 ' +
    'active:translate-y-[3px] active:shadow-[0_0px_0_0_#cbd5e1,0_1px_3px_-1px_rgba(15,23,42,0.1)] ' +
    'focus-visible:ring-slate-400',
  danger:
    'bg-gradient-to-b from-rose-500 to-rose-600 text-white border border-rose-700/40 ' +
    'shadow-[0_4px_0_0_#9f1239,0_6px_14px_-4px_rgba(225,29,72,0.45)] ' +
    'hover:from-rose-400 hover:to-rose-500 ' +
    'active:translate-y-[3px] active:shadow-[0_1px_0_0_#9f1239,0_2px_4px_-1px_rgba(225,29,72,0.35)] ' +
    'focus-visible:ring-rose-500',
  success:
    'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border border-emerald-700/40 ' +
    'shadow-[0_4px_0_0_#065f46,0_6px_14px_-4px_rgba(16,185,129,0.45)] ' +
    'hover:from-emerald-400 hover:to-emerald-500 ' +
    'active:translate-y-[3px] active:shadow-[0_1px_0_0_#065f46,0_2px_4px_-1px_rgba(16,185,129,0.35)] ' +
    'focus-visible:ring-emerald-500',
  ghost:
    'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900 ' +
    'active:translate-y-px focus-visible:ring-slate-400',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[32px]',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2 min-h-[40px]',
  lg: 'px-6 py-3 text-base rounded-xl gap-2 min-h-[48px]',
  icon: 'p-2.5 rounded-xl min-h-[40px] min-w-[40px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'relative inline-flex items-center justify-center font-bold whitespace-nowrap select-none',
          'transition-all duration-150 ease-out touch-manipulation',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
