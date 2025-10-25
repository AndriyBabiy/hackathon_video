import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  videoUrl: string;
  onVideoEnd?: () => void;
  autoplay?: boolean;
}

export default function VideoPlayer({ videoUrl, onVideoEnd, autoplay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    // Initialize Video.js player
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: autoplay,
        preload: 'auto',
        fluid: true,
        aspectRatio: '16:9',
        playbackRates: [0.5, 1, 1.5, 2]
      });

      // Listen for video end
      if (onVideoEnd) {
        playerRef.current.on('ended', () => {
          onVideoEnd();
        });
      }

      console.log('[VideoPlayer] Initialized');
    }

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
        console.log('[VideoPlayer] Disposed');
      }
    };
  }, []);

  useEffect(() => {
    // Update video source when URL changes
    const player = playerRef.current;
    if (player && videoUrl) {
      player.src({
        src: videoUrl,
        type: 'video/mp4'
      });

      if (autoplay) {
        player.play()?.catch(err => {
          console.error('[VideoPlayer] Autoplay failed:', err);
        });
      }

      console.log('[VideoPlayer] Source updated:', videoUrl);
    }
  }, [videoUrl, autoplay]);

  return (
    <div style={styles.container}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto'
  }
};
