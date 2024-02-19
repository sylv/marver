import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

export const Pill = ({
  help,
  active,
  children,
  onClick,
}: {
  help: string;
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const classes = clsx(
    `relative rounded-full bg-gray-600/40 text-gray-500 text-sm mr-4 hover:bg-gray-700/40 transition flex items-center`,
    active && 'bg-purple-400/40 text-purple-400 hover:bg-purple-500/40',
  );

  return (
    <div
      className={classes}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick();
        }
      }}
    >
      <span className="pl-2.5 py-1.5 text-sm">{children}</span>
      <span
        className="h-full pl-2 pr-2.5"
        onMouseEnter={() => setShowHelp(true)}
        onMouseLeave={() => setShowHelp(false)}
      >
        <FiHelpCircle />
      </span>
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="absolute top-full right-0 bg-black/80 backdrop-blur p-2 text-white w-48 rounded-lg z-30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          >
            {help}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
