'use client';

import { Share2 } from 'lucide-react';
import { formatSecondsToTimestamp } from 'paragrafs';
import { use, useCallback, useMemo, useState } from 'react';
import { SubtitleDisplay } from '@/components/SubtitleDisplay';
import { TypoReportForm } from '@/components/TypoReportForm';
import { AuroraText } from '@/components/ui/aurora-text';
import { Button } from '@/components/ui/button';
import { MagicCard } from '@/components/ui/magic-card';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import type { TranscriptData } from '@/lib/db';
import { parseSubtitles } from '@/lib/time';
import type { Subtitle } from '@/types/subtitles';

type VideoPlayerProps = { transcript: TranscriptData; searchParams: Promise<{ t?: string }> };

const findCurrentSubtitle = (subtitles: Subtitle[], currentTime: number): Subtitle | undefined => {
    return subtitles.find((sub, i) => {
        const nextSub = subtitles[i + 1];
        return sub.seconds <= currentTime && (!nextSub || currentTime < nextSub.seconds);
    });
};

export const VideoPlayer = ({ transcript: { en, videoId, title }, searchParams }: VideoPlayerProps) => {
    const resolvedSearchParams = use(searchParams);
    const [showTypoForm, setShowTypoForm] = useState(false);
    const [reportingSubtitle, setReportingSubtitle] = useState<Subtitle | null>(null);
    const [showShareSuccess, setShowShareSuccess] = useState(false);

    const startTime = useMemo(() => {
        const seconds = Number.parseInt(resolvedSearchParams.t ?? '0', 10);
        return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    }, [resolvedSearchParams]);

    const subtitles = useMemo(() => parseSubtitles(en), [en]);

    const { currentTime, player, containerRef } = useYouTubePlayer(videoId, startTime);

    const currentSubtitle = useMemo(() => findCurrentSubtitle(subtitles, currentTime), [subtitles, currentTime]);

    const handleReportTypo = useCallback(() => {
        if (currentSubtitle) {
            setReportingSubtitle({
                ...currentSubtitle,
                time: formatSecondsToTimestamp(player?.getCurrentTime() || currentSubtitle.seconds),
            });
            setShowTypoForm(true);
        }
    }, [currentSubtitle, player]);

    const handleCloseTypoForm = useCallback(() => {
        setShowTypoForm(false);
        setReportingSubtitle(null);
    }, []);

    const handleShare = useCallback(async () => {
        const url = `${window.location.origin}/youtube/${videoId}${currentTime > 0 ? `?t=${Math.floor(currentTime)}` : ''}`;

        try {
            if (navigator.share) {
                await navigator.share({ text: `Check out "${title}" on Nuṣūṣ`, title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setShowShareSuccess(true);
                setTimeout(() => setShowShareSuccess(false), 2000);
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    }, [videoId, title, currentTime]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="w-full max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <a href="/" className="inline-block transition-transform hover:scale-105">
                        <AuroraText className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-4xl text-transparent">
                            Nuṣūṣ
                        </AuroraText>
                    </a>
                    <div className="relative">
                        <Button onClick={handleShare} variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                        {showShareSuccess && (
                            <div className="-bottom-10 absolute right-0 rounded-lg bg-green-500/20 px-3 py-1 text-green-400 text-sm">
                                Link copied!
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="mb-6 font-semibold text-2xl text-white">{title}</h1>

                <div className="space-y-6">
                    <MagicCard className="relative overflow-hidden border-slate-800 bg-slate-900/50 p-0 backdrop-blur-xl">
                        <div className="relative">
                            <div ref={containerRef} className="aspect-video w-full rounded-t-lg" />
                        </div>
                        <div className="p-6">
                            <SubtitleDisplay subtitle={currentSubtitle} onReportTypo={handleReportTypo} />
                        </div>
                    </MagicCard>

                    {showTypoForm && reportingSubtitle && (
                        <TypoReportForm subtitle={reportingSubtitle} videoId={videoId} onClose={handleCloseTypoForm} />
                    )}
                </div>
            </div>
        </div>
    );
};
