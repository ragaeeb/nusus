'use client';

import { useCallback, useState } from 'react';
import { SubtitleDisplay } from '@/components/SubtitleDisplay';
import SubmittableInput from '@/components/submittable-input';
import { AuroraText } from '@/components/ui/aurora-text';
import { Highlighter } from '@/components/ui/highlighter';
import { Label } from '@/components/ui/label';
import { MagicCard } from '@/components/ui/magic-card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useYouTube } from '@/hooks/useYouTube';
import { parseSubtitles } from '@/lib/time';
import { extractVideoId } from '@/lib/youtube';
import type { Subtitle, SubtitlePosition } from '@/types/subtitles';

export default function Home() {
    const [videoId, setVideoId] = useState('');
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [position, setPosition] = useState<SubtitlePosition>('overlay');
    const { containerRef, currentSubtitle } = useYouTube(videoId, subtitles);

    const handleSubmit = useCallback(async (url: string) => {
        setError('');
        setLoading(true);

        const extractedId = extractVideoId(url);
        if (!extractedId) {
            setError('Invalid YouTube URL');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/subtitles?videoId=${extractedId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch subtitles');
            }

            const data = await response.text();
            const parsedSubtitles = parseSubtitles(data);

            setSubtitles(parsedSubtitles);
            setVideoId(extractedId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="w-full max-w-5xl">
                <div className="mb-12 text-center">
                    <AuroraText className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-6xl text-transparent">
                        Nuṣūṣ
                    </AuroraText>
                    <p className="text-lg text-slate-400">
                        Experience{' '}
                        <Highlighter action="underline" color="">
                            YouTube
                        </Highlighter>{' '}
                        with enhanced{' '}
                        <Highlighter action="highlight" color="#87CEFA">
                            subtitles
                        </Highlighter>
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
                        {error}
                    </div>
                )}

                <SubmittableInput
                    name="youtube-url"
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    onSubmit={handleSubmit}
                    className="h-12 bg-slate-800/50 text-lg text-white placeholder:text-slate-500"
                    disabled={loading}
                />
                {videoId && (
                    <div className="space-y-6">
                        <MagicCard className="relative overflow-hidden border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
                            <div className="space-y-4">
                                <RadioGroup
                                    value={position}
                                    onValueChange={(value) => setPosition(value as SubtitlePosition)}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="overlay" id="overlay" />
                                        <Label htmlFor="overlay" className="cursor-pointer text-slate-300">
                                            On Video
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="outside" id="outside" />
                                        <Label htmlFor="outside" className="cursor-pointer text-slate-300">
                                            Below Video
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </MagicCard>

                        <MagicCard className="relative overflow-hidden border-slate-800 bg-slate-900/50 p-0 backdrop-blur-xl">
                            <div className="relative">
                                <div ref={containerRef} className="aspect-video w-full rounded-t-lg" />
                                {position === 'overlay' && (
                                    <SubtitleDisplay subtitle={currentSubtitle} position={position} />
                                )}
                            </div>
                            {position === 'outside' && (
                                <div className="p-6">
                                    <SubtitleDisplay subtitle={currentSubtitle} position={position} />
                                </div>
                            )}
                        </MagicCard>
                    </div>
                )}
            </div>
        </div>
    );
}
