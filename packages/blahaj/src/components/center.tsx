import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

export const Center: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const classes = clsx(
    'container absolute left-0 right-0 flex flex-col items-center justify-center mx-auto pointer-events-none bottom-20 top-20',
    className
  );
  return (
    <div className={classes}>
      <span className="flex flex-col items-center justify-center pointer-events-auto">{children}</span>
    </div>
  );
};
