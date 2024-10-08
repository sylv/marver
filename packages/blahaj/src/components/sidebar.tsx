import { LucideHash, LucideHeart, LucideListTodo, LucideTv, type LucideIcon } from "lucide-react";
import type { FC } from "react";
import { cn } from "../helpers/cn";
import { usePageContext } from "../renderer/usePageContext";
import { ModeToggle } from "./theme/theme-switcher";

const SIDEBAR_WIDTH = "15rem";

const SidebarTab: FC<{ href: string; icon: LucideIcon; children: React.ReactNode }> = ({
  href,
  icon: Icon,
  children,
}) => {
  const { urlParsed } = usePageContext();
  const isActive = href === "/" ? urlParsed.pathname === href : urlParsed.pathname.startsWith(href);
  return (
    <a
      href={href}
      className={cn(
        "flex gap-2 px-4 py-1.5 rounded-lg items-center text-zinc-200 hover:bg-zinc-700/60 text-[0.9125rem]",
        isActive && "bg-zinc-700/60",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </a>
  );
};

export const Sidebar: FC = () => (
  <nav className="min-h-dvh bottom-0 top-0 relative flex-shrink-0" style={{ width: SIDEBAR_WIDTH }}>
    <div className="fixed h-dvh flex flex-col justify-between" style={{ width: SIDEBAR_WIDTH }}>
      <div className="h-full p-2 py-6">
        <div className="space-y-1">
          <SidebarTab href="/" icon={LucideTv}>
            All Media
          </SidebarTab>
          <SidebarTab href="/favourites" icon={LucideHeart}>
            Favourites
          </SidebarTab>
        </div>
        <div className="text-gray-400 uppercase text-xs px-4 mt-4 mb-2">Admin</div>
        <SidebarTab href="/tags" icon={LucideHash}>
          Tags
        </SidebarTab>
        <SidebarTab href="/tasks" icon={LucideListTodo}>
          Tasks
        </SidebarTab>
      </div>
      <div className="bg-zinc-750 min-w-full p-2">
        <ModeToggle />
      </div>
    </div>
  </nav>
);
