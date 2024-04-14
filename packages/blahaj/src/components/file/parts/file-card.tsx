import { useState, type FC, type ReactNode } from 'react';
import { Card } from '../../ui/card';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '../../../helpers/cn';
import { motion } from 'framer-motion';

export const FileCard: FC<{ children: ReactNode; title: string }> = ({ children, title }) => (
  <Card className="bg-zinc-900 p-3">
    <div className="ml-2 text-xs uppercase text-zinc-500 font-bold">{title}</div>
    <div className="flex flex-wrap gap-2 mt-2">{children}</div>
  </Card>
);

export const FileCardToggle: FC<{ children: ReactNode; title: string }> = ({ children, title }) => {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className="rounded-lg border bg-card text-card-foreground shadow-sm bg-zinc-900 p-3 w-full"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between text-zinc-500">
        <div className="ml-2 text-xs uppercase font-bold">{title}</div>
        <FiChevronDown className={cn('h-4 w-4 transition', open && 'transform rotate-180')} />
      </div>
      <motion.div
        className="overflow-hidden cursor-default"
        initial={{ height: 0 }}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: 0.075, ease: 'easeInOut' }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex flex-wrap gap-2 mt-2">{children}</div>
      </motion.div>
    </button>
  );
};
