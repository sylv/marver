import { useEffect, useMemo, useRef, useState, type ComponentProps, type FC, type ReactNode } from "react";
import { PlayerControls } from "./player-controls";

// https://github.com/video-dev/hls.js/issues/5146#issuecomment-1375070955
// @ts-expect-error missing types
import HlsMin from "hls.js/dist/hls.min";
import type HlsType from "hls.js";

const Hls = HlsMin as typeof HlsType;

interface VideoProps extends ComponentProps<"video"> {
  src: string;
  hlsSrc: string;
  hasAudio?: boolean;
  children?: ReactNode;
  durationSeconds?: number;
}

export const Player: FC<VideoProps> = ({ src, children, hlsSrc, hasAudio, durationSeconds, ...rest }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsType>();
  const [useHLS, setUseHLS] = useState(false);

  useEffect(() => {
    if (!Hls.isSupported() || !videoRef.current) return;
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = undefined;
    }

    if (!useHLS) return;

    const hls = new Hls();
    hls.attachMedia(videoRef.current);
    hls.loadSource(hlsSrc);
    hlsRef.current = hls;
  }, [useHLS, hlsSrc, videoRef, src]);

  useEffect(() => {
    // re-determine HLS usage when the source changes
    if (useHLS) setUseHLS(false);
  }, [src]);

  const switchToHls = () => {
    if (useHLS) return;
    setUseHLS(true);
    console.warn(`Failed to load video, switching to HLS transcoding`);
  };

  const checkFailedLoad = () => {
    // todo: check that the audio track loaded properly if the file has audio
    if (!videoRef.current) return;
    if (videoRef.current.readyState < 2) return;
    if (videoRef.current.videoWidth === 0) {
      // the video track failed to load
      switchToHls();
    }
  };

  const loop = useMemo(() => {
    if (!durationSeconds) return true;
    if (durationSeconds > 60) return false;
    return true;
  }, [durationSeconds]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        {...rest}
        muted
        src={useHLS ? undefined : src}
        autoPlay
        loop={loop}
        controls
        onCanPlayThrough={checkFailedLoad}
        onLoadStart={checkFailedLoad}
        onLoadedMetadata={checkFailedLoad}
        onError={() => {
          if (!useHLS) {
            switchToHls();
          }
        }}
      >
        {children}
      </video>
      <PlayerControls videoRef={videoRef} />
    </div>
  );
};
