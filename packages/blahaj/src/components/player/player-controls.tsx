import { useEffect, useState, type FC, type RefObject } from "react";

interface PlayerControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export const PlayerControls: FC<PlayerControlsProps> = ({ videoRef }) => {
  const [, setPosition] = useState(0);

  useEffect(() => {
    if (!videoRef.current) return;
    const videoEl = videoRef.current;
    const listener = () => {
      setPosition(videoEl.currentTime ?? 0);
    };

    videoEl.addEventListener("timeupdate", listener);
    return () => {
      videoEl.removeEventListener("timeupdate", listener);
    };
  }, [videoRef.current]);

  if (!videoRef.current) return null;
  return <div className="absolute bottom-1 left-1 right-1" />;
};
