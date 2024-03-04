import type { FC, ReactNode } from 'react';

export const FileLabel: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="bg-zinc-800 p-3 rounded-md flex-grow flex items-center gap-2 text-gray-400 justify-between">
      {children}
    </div>
  );
};
