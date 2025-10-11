'use client';

import { useMemo } from 'react';
import { SubtitleDisplay } from '@/components/SubtitleDisplay';
import { AuroraText } from '@/components/ui/aurora-text';
import { MagicCard } from '@/components/ui/magic-card';
import { useYouTube } from '@/hooks/useYouTube';
import type { TranscriptData } from '@/lib/db';
import { parseSubtitles } from '@/lib/time';

type VideoPlayerProps = { videoId: string; transcript: TranscriptData };

export const VideoPlayer = ({ videoId, transcript }: VideoPlayerProps) => {
    const subtitles = useMemo(
        () => ({ ar: transcript.ar ? parseSubtitles(transcript.ar) : undefined, en: parseSubtitles(transcript.en) }),
        [transcript.en, transcript.ar],
    );

    const { containerRef, currentSubtitle } = useYouTube(videoId, subtitles.en);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="w-full max-w-7xl">
                <div className="mb-8 text-center">
                    <a href="/" className="inline-block transition-transform hover:scale-105">
                        <AuroraText className="mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-4xl text-transparent">
                            Nuṣūṣ
                        </AuroraText>
                    </a>
                    <h1 className="mt-4 font-semibold text-2xl text-white">{transcript.title}</h1>
                    {transcript.description && <p className="mt-2 text-slate-400">{transcript.description}</p>}
                </div>

                <div className="space-y-6">
                    <MagicCard className="relative overflow-hidden border-slate-800 bg-slate-900/50 p-0 backdrop-blur-xl">
                        <div className="relative">
                            <div ref={containerRef} className="aspect-video w-full rounded-t-lg" />
                        </div>
                        <div className="p-6">{currentSubtitle && <SubtitleDisplay subtitle={currentSubtitle} />}</div>
                    </MagicCard>
                </div>
            </div>
        </div>
    );
};
