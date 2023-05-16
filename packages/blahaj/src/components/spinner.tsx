import clsx from 'clsx';
import React, { FC } from 'react';
import { Center } from './center';

export enum SpinnerSize {
  Small = 'w-4',
  Medium = 'w-6',
  Large = 'w-9',
}

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ className, size = SpinnerSize.Medium }) => {
  const classes = clsx('animate-spin', className, size);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={classes}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export const SpinnerCenter: React.FC<SpinnerProps> = (props) => (
  <Center>
    <Spinner {...props} />
  </Center>
);
