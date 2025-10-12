'use client';

import { formatSecondsToTimestamp } from 'paragrafs';
import { useCallback, useMemo, useState } from 'react';
import { SubtitleDisplay } from '@/components/SubtitleDisplay';
import { TypoReportForm } from '@/components/TypoReportForm';
import { AuroraText } from '@/components/ui/aurora-text';
import { MagicCard } from '@/components/ui/magic-card';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import type { TranscriptData } from '@/lib/db';
import { parseSubtitles } from '@/lib/time';
import type { Subtitle } from '@/types/subtitles';

type VideoPlayerProps = { transcript: TranscriptData };

const findCurrentSubtitle = (subtitles: Subtitle[], currentTime: number): Subtitle | undefined => {
    return subtitles.find((sub, i) => {
        const nextSub = subtitles[i + 1];
        return sub.seconds <= currentTime && (!nextSub || currentTime < nextSub.seconds);
    });
};

export const VideoPlayer = ({ transcript: { en, videoId, title } }: VideoPlayerProps) => {
    const [showTypoForm, setShowTypoForm] = useState(false);
    const [reportingSubtitle, setReportingSubtitle] = useState<Subtitle | null>(null);

    const subtitles = useMemo(() => parseSubtitles(en), [en]);

    const { currentTime, player, containerRef } = useYouTubePlayer(videoId);

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

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="w-full max-w-7xl">
                <div className="mb-8 text-center">
                    <a href="/" className="inline-block transition-transform hover:scale-105">
                        <AuroraText className="mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-4xl text-transparent">
                            Nuṣūṣ
                        </AuroraText>
                    </a>
                    <h1 className="mt-4 font-semibold text-2xl text-white">{title}</h1>
                </div>

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
