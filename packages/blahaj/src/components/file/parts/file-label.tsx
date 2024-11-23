import type { FC, ReactNode } from "react";

interface FileLabelProps {
  children: ReactNode;
  onClick?: () => void;
}

export const FileLabel: FC<FileLabelProps> = ({ children, onClick }) => {
  const Type = onClick ? "button" : "div";
  return (
    <Type
      className="bg-zinc-800 p-3 rounded-md flex-grow flex items-center gap-2 text-gray-400 justify-between"
      onClick={onClick}
    >
      {children}
    </Type>
  );
};
