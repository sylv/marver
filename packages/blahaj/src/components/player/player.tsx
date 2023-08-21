import React, {
  type FC,
  type ReactNode,
  type VideoHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

// https://github.com/video-dev/hls.js/issues/5146#issuecomment-1375070955
import type HlsType from 'hls.js';
// @ts-expect-error missing types
import HlsMin from 'hls.js/dist/hls.min';
import { PlayerControls } from './player-controls';
import { useBackgroundColours } from '../background';

const Hls = HlsMin as typeof HlsType;

export interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  hlsSrc: string;
  hasAudio?: boolean;
  children?: ReactNode;
}

export const Player: FC<VideoProps> = ({ src, children, hlsSrc, hasAudio, ...rest }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsType>();
  const [useHLS, setUseHLS] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPending, startTransition] = useTransition();

  useBackgroundColours(backgroundImage);

  const setBackground = useCallback(
    (video: HTMLVideoElement) => {
      startTransition(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth * 0.2;
        canvas.height = video.videoHeight * 0.2;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/jpeg');
        if (url === 'data:,') return;
        setBackgroundImage(url);
      });
    },
    [startTransition],
  );

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
  }, [useHLS, videoRef.current, src]);

  useEffect(() => {
    if (useHLS) setUseHLS(false);
  }, [src]);

  useEffect(() => {
    // every 30 seconds, take a screenshot of the video and set it as the background
    if (!videoRef.current) return;
    if (isPaused) return;
    const video = videoRef.current;
    setBackground(video);
    const interval = setInterval(() => setBackground(video), 5000);
    return () => {
      clearInterval(interval);
    };
  }, [videoRef.current, isPaused, setBackground]);

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

  return (
    <div className="relative">
      <video
        ref={videoRef}
        {...rest}
        muted
        src={useHLS ? undefined : src}
        autoPlay
        loop
        controls
        onCanPlayThrough={checkFailedLoad}
        onLoadStart={checkFailedLoad}
        onLoadedMetadata={checkFailedLoad}
        onPause={() => setIsPaused(true)}
        onPlay={() => setIsPaused(false)}
        onSeeked={(event) => {
          setBackground(event.currentTarget);
        }}
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
