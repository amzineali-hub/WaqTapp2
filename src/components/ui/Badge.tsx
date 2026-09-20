import React from 'react';
import clsx from 'clsx';

export type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'success'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'majorelle'
  | 'rose'
  | 'fuchsia'
  | 'sky'
  | 'orange';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-teal-50 text-teal-800 border-teal-200/60',
  accent: 'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  danger: 'bg-rose-100 text-rose-800 border-rose-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  majorelle: 'bg-waqt-majorelle-50 text-waqt-majorelle-800 border-waqt-majorelle-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
  orange: 'bg-orange-50 text-orange-800 border-orange-200',
};

const SIZE_CLASSES: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-[11px] px-2.5 py-1 gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...rest
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-bold rounded-full border whitespace-nowrap',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
};
