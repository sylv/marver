import { useEffect } from "react";

interface UseOnClickOutsideOptions {
  ref: React.MutableRefObject<any>;
  mouseup?: boolean;
}

export function useOnClickOutside(opts: UseOnClickOutsideOptions, handler: () => void) {
  useEffect(() => {
    const onClick = (event: Event) => {
      if (!opts.ref.current || opts.ref.current.contains(event.target)) return;
      handler();
    };

    const onKeyPress = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      handler();
    };

    if (opts.mouseup) document.addEventListener("mouseup", onClick);
    else document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    document.addEventListener("keydown", onKeyPress);
    return () => {
      if (opts.mouseup) document.removeEventListener("mouseup", onClick);
      else document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
      document.removeEventListener("keydown", onKeyPress);
    };
  }, [opts.ref, opts.mouseup, handler]);
}
