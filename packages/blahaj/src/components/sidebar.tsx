import { type FC, type ReactNode } from 'react';
import { FiHome, FiShare2 } from 'react-icons/fi';

export const Sidebar: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <aside className="h-full bg-black px-6 py-6 w-[15em]">
        <div className="flex flex-col justify-between gap-2 h-full">
          <div className="sidebar-top">
            <div className="flex items-center gap-2">
              <FiHome className="opacity-60" /> Files
            </div>
            <div className="flex items-center gap-2">
              <FiShare2 className="opacity-60" /> Shared
            </div>
          </div>
        </div>
      </aside>
      <main className="relative flex-grow rounded-tl-3xl overflow-hidden overflow-y-auto shadow-inner p-3">
        {children}
      </main>
    </div>
  );
};
