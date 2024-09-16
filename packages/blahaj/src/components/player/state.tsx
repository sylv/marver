import { share } from "shared-zustand";
import { create } from "zustand";

const usePlayerState = create(() => ({
  volume: 100,
  loop: true,
  muted: false,
  autoplay: true,
  preferredQuality: "auto",
}));

export const setVolume = (volume: number) => {
  if (volume === 0) {
    usePlayerState.setState({ muted: true });
    return;
  }

  usePlayerState.setState({ muted: false, volume });
};

if ("BroadcastChannel" in globalThis && typeof window !== "undefined") {
  share("loop", usePlayerState);
  share("volume", usePlayerState);
  console.debug("Shared player state");
}
