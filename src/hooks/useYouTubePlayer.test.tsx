import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'bun:test';
import { JSDOM } from 'jsdom';

import { useYouTubePlayer } from './useYouTubePlayer';

const ensureWindow = () => {
    if (!(globalThis as any).window || !(globalThis as any).document) {
        const { window } = new JSDOM('<!doctype html><html><body></body></html>');
        (globalThis as any).window = window;
        (globalThis as any).document = window.document;
        (globalThis as any).HTMLElement = window.HTMLElement;
        (globalThis as any).Node = window.Node;
        (globalThis as any).navigator = window.navigator;
    }

    return (globalThis as any).window as Window & typeof globalThis;
};

const getDocument = () => ensureWindow().document;

describe('useYouTubePlayer', () => {
    const originalYT = (ensureWindow() as any).YT;
    const originalOnReady = (ensureWindow() as any).onYouTubeIframeAPIReady;
    const originalConsoleError = console.error;

    beforeEach(() => {
        vi.restoreAllMocks();
        const win = ensureWindow() as any;
        win.YT = originalYT;
        win.onYouTubeIframeAPIReady = originalOnReady;
        console.error = originalConsoleError;
        const doc = getDocument();
        doc.head.innerHTML = '';
        doc.body.innerHTML = '';
    });

    afterEach(() => {
        const win = ensureWindow() as any;
        win.YT = originalYT;
        win.onYouTubeIframeAPIReady = originalOnReady;
        console.error = originalConsoleError;
        const doc = getDocument();
        doc.head.innerHTML = '';
        doc.body.innerHTML = '';
    });

    it('should load the YouTube iframe API script when not available', async () => {
        const win = ensureWindow() as any;
        delete win.YT;

        const { unmount } = renderHook(() => useYouTubePlayer('example-video'));

        await waitFor(() => {
            expect(typeof ensureWindow().onYouTubeIframeAPIReady).toBe('function');
        });

        const script = getDocument().querySelector(
            'script[src="https://www.youtube.com/iframe_api"]',
        );
        expect(script).toBeTruthy();

        unmount();
    });

    it('should control playback once the YouTube API is ready', async () => {
        const win = ensureWindow() as any;
        delete win.YT;

        const setIntervalMock = vi
            .spyOn(globalThis, 'setInterval')
            .mockImplementation(((handler: TimerHandler) => {
                if (typeof handler === 'function') {
                    handler();
                }
                return 1 as any;
            }) as any);
        const clearIntervalMock = vi
            .spyOn(globalThis, 'clearInterval')
            .mockImplementation(() => {});

        const seekTo = vi.fn();
        const destroy = vi.fn();
        const loadVideoById = vi.fn();
        let currentState = 2;

        const playerMock = {
            destroy,
            getCurrentTime: vi.fn(() => 42),
            getDuration: vi.fn(() => 120),
            getPlayerState: vi.fn(() => currentState),
            loadVideoById,
            pauseVideo: vi.fn(() => {
                currentState = 2;
            }),
            playVideo: vi.fn(() => {
                currentState = 1;
            }),
            seekTo,
        } as any;

        const doc = getDocument();
        const container = doc.createElement('div');
        doc.body.appendChild(container);

        const { result, unmount } = renderHook(() => useYouTubePlayer('video-id', 5));

        act(() => {
            result.current.containerRef.current = container;
        });

        await waitFor(() => {
            expect(typeof ensureWindow().onYouTubeIframeAPIReady).toBe('function');
        });

        let capturedConfig: any;

        win.YT = {
            Player: vi.fn().mockImplementation((_element: HTMLElement, config: any) => {
                capturedConfig = config;
                return playerMock;
            }),
            PlayerState: { ENDED: 0, PAUSED: 2, PLAYING: 1 },
        } as any;

        act(() => {
            win.onYouTubeIframeAPIReady();
        });

        expect(win.YT.Player).toHaveBeenCalledWith(
            container,
            expect.objectContaining({
                events: expect.objectContaining({ onReady: expect.any(Function) }),
                videoId: 'video-id',
            }),
        );

        act(() => {
            capturedConfig.events.onReady({ target: playerMock } as any);
        });

        expect(seekTo).toHaveBeenCalledWith(5, true);
        expect(setIntervalMock).toHaveBeenCalled();

        await act(async () => {
            result.current.togglePlayPause();
        });
        expect(playerMock.getPlayerState).toHaveBeenCalled();
        expect(playerMock.playVideo).toHaveBeenCalled();

        await act(async () => {
            result.current.togglePlayPause();
        });
        expect(playerMock.pauseVideo).toHaveBeenCalled();

        act(() => {
            capturedConfig.events.onStateChange({
                data: win.YT.PlayerState.PLAYING,
                target: playerMock,
            } as any);
        });
        await waitFor(() => {
            expect(result.current.isPlaying).toBe(true);
        });

        act(() => {
            capturedConfig.events.onStateChange({
                data: win.YT.PlayerState.PAUSED,
                target: playerMock,
            } as any);
        });
        await waitFor(() => {
            expect(result.current.isPlaying).toBe(false);
        });
        expect(clearIntervalMock).toHaveBeenCalled();

        unmount();
        expect(destroy).toHaveBeenCalled();

        setIntervalMock.mockRestore();
        clearIntervalMock.mockRestore();
    });
});
