import React, { FC, ReactNode } from 'react';

export const Label: FC<{ children: ReactNode }> = ({ children }) => {
  return <label className="text-xs font-semibold uppercase text-gray-500 select-none">{children}</label>;
};
