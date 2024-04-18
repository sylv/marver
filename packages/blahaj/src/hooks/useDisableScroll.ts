import { useEffect, useRef } from "react";

export const useDisableScroll = (enabled: boolean) => {
  const originalStyle = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      originalStyle.current = null;
      return;
    }

    if (!originalStyle.current) originalStyle.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle.current || "";
    };
  }, [enabled]);
};
