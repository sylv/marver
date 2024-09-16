import clsx from "clsx";
import { motion } from "framer-motion";
import { produce } from "immer";
import type { FC, ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AccordionStore = Record<string, boolean | undefined>;

const useAccordionStore = create(
  persist<AccordionStore>(() => ({}), {
    name: "accordion-states",
    storage: createJSONStorage(() => {
      if (import.meta.env.DEV) return sessionStorage;
      return localStorage;
    }),
  }),
);

interface AccordionProps {
  id: string;
  name: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export const Accordion: FC<AccordionProps> = ({ id, name, children, defaultOpen = true }) => {
  const isOpen = useAccordionStore((states) => states[id]) ?? defaultOpen;
  const toggle = () => {
    useAccordionStore.setState((states) =>
      produce(states, (draft) => {
        draft[id] = !isOpen;
      }),
    );
  };

  return (
    <button type="button" className="w-full bg-zinc-950 border border-zinc-900 rounded p-2" onClick={toggle}>
      <div className="flex items-center justify-between w-full">
        <h2 className="font-mono text-xs text-zinc-400 font-semibold">{name}</h2>
        <span>
          <FiChevronDown className={clsx("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
        </span>
      </div>
      <motion.div
        className="space-y-2 overflow-hidden"
        transition={{ duration: 0.1 }}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto", paddingTop: "0.5rem" },
          closed: { opacity: 0, height: 0, paddingTop: 0 },
        }}
      >
        {children}
      </motion.div>
    </button>
  );
};
