import { useCallback, useEffect, useRef, useState } from 'react';

type YouTubePlayer = {
    playVideo: () => void;
    pauseVideo: () => void;
    getPlayerState: () => number;
    getCurrentTime: () => number;
    getDuration: () => number;
    loadVideoById: (videoId: string) => void;
    destroy: () => void;
};

declare global {
    interface Window {
        YT: {
            Player: new (element: HTMLElement, config: any) => YouTubePlayer;
            PlayerState: { PAUSED: number; PLAYING: number };
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

export const useYouTubePlayer = (videoId: string) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isReadyRef = useRef(false);

    const clearTimeUpdateInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        const onYouTubeIframeAPIReady = () => {
            if (!containerRef.current || playerRef.current) {
                return;
            }

            playerRef.current = new window.YT.Player(containerRef.current, {
                events: {
                    onReady: (event: any) => {
                        isReadyRef.current = true;
                        intervalRef.current = setInterval(() => {
                            const time = event.target.getCurrentTime();
                            setCurrentTime(time);
                        }, 100);
                    },
                    onStateChange: (event: any) => {
                        setIsPlaying(event.data === window.YT.PlayerState.PLAYING);

                        if (event.data === window.YT.PlayerState.PAUSED) {
                            clearTimeUpdateInterval();
                        }
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            clearTimeUpdateInterval();
                            intervalRef.current = setInterval(() => {
                                const time = event.target.getCurrentTime();
                                setCurrentTime(time);
                            }, 100);
                        }
                    },
                },
                height: '100%',
                playerVars: { autoplay: 0, controls: 1, modestbranding: 1 },
                videoId,
                width: '100%',
            });
        };

        if (!window.YT && videoId) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        } else if (videoId && containerRef.current && !playerRef.current) {
            onYouTubeIframeAPIReady();
        }

        return () => {
            clearTimeUpdateInterval();
            isReadyRef.current = false;
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [videoId, clearTimeUpdateInterval]);

    const togglePlayPause = useCallback(() => {
        if (!playerRef.current || !isReadyRef.current) {
            return;
        }

        try {
            const state = playerRef.current.getPlayerState();
            if (state === window.YT.PlayerState.PLAYING) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    }, []);

    return { containerRef, currentTime, isPlaying, player: playerRef.current, togglePlayPause };
};
