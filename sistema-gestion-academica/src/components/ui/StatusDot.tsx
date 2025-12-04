import React from 'react';
import clsx from 'clsx';

type Props = { status: 'ok' | 'warning' | 'danger'; className?: string };

export function StatusDot({ status, className }: Props) {
  const bg = {
    ok: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-600',
  }[status];

  return (
    <span
      aria-hidden
      className={clsx('inline-block h-2.5 w-2.5 rounded-full', bg, className)}
    />
  );
}
