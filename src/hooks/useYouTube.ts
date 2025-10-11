import { useEffect, useRef, useState } from 'react';
import type { Subtitle } from '@/types/subtitles';

export const useYouTube = (videoId: string, subtitles: Subtitle[]) => {
    const intervalRef = useRef<number | null>(null);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle>();

    useEffect(() => {
        if (!videoId || subtitles.length === 0) {
            return;
        }

        const onPlayerReady = () => {
            startTimeTracking();
        };

        const onPlayerStateChange = (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
                startTimeTracking();
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                stopTimeTracking();
            }
        };

        const initializePlayer = () => {
            if (containerRef.current && !playerRef.current) {
                playerRef.current = new (window as any).YT.Player(containerRef.current, {
                    events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
                    playerVars: { autoplay: 1 },
                    videoId: videoId,
                });
            }
        };

        const loadYouTubeAPI = () => {
            if (!(window as any).YT) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

                (window as any).onYouTubeIframeAPIReady = initializePlayer;
            } else {
                initializePlayer();
            }
        };

        const startTimeTracking = () => {
            stopTimeTracking();
            intervalRef.current = window.setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const currentTime = playerRef.current.getCurrentTime();
                    const current = subtitles.find((sub, idx) => {
                        const nextSub = subtitles[idx + 1];
                        return currentTime >= sub.seconds && (!nextSub || currentTime < nextSub.seconds);
                    });
                    setCurrentSubtitle(current);
                }
            }, 100);
        };

        const stopTimeTracking = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        loadYouTubeAPI();

        return () => {
            stopTimeTracking();
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [videoId, subtitles]);

    return { containerRef, currentSubtitle };
};
