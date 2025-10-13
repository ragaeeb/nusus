'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useState } from 'react';
import { AuroraText } from '@/components/ui/aurora-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MagicCard } from '@/components/ui/magic-card';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Textarea } from '@/components/ui/textarea';

type PageProps = { params: Promise<{ videoId: string }> };

export default function CreateVideoPage({ params }: PageProps) {
    const { videoId } = use(params);
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [subtitles, setSubtitles] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError('');
            setIsSubmitting(true);

            try {
                const response = await fetch('/api/transcripts', {
                    body: JSON.stringify({ en: subtitles, title, videoId }),
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                });

                if (response.ok) {
                    router.push(`/youtube/${videoId}`);
                } else {
                    const data = await response.json();
                    setError(data.error || 'Failed to create transcript');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while creating the transcript');
            } finally {
                setIsSubmitting(false);
            }
        },
        [videoId, title, subtitles, router],
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="w-full max-w-4xl">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block transition-transform hover:scale-105">
                        <AuroraText className="mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-4xl text-transparent">
                            Nuṣūṣ
                        </AuroraText>
                    </Link>
                    <h1 className="mt-4 font-semibold text-2xl text-white">Create New Transcript</h1>
                    <p className="mt-2 text-slate-400">Add subtitles for video: {videoId}</p>
                </div>

                <MagicCard className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="mb-2 block font-medium text-slate-300 text-sm">Video ID</Label>
                                <Input
                                    type="text"
                                    value={videoId}
                                    disabled
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-500"
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block font-medium text-slate-300 text-sm">Title *</Label>
                                <Input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white transition-colors focus:border-purple-500 focus:outline-none"
                                    required
                                    placeholder="Enter video title"
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block font-medium text-slate-300 text-sm">Subtitles</Label>
                                <Textarea
                                    value={subtitles}
                                    onChange={(e) => setSubtitles(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 font-mono text-sm text-white transition-colors focus:border-purple-500 focus:outline-none"
                                    rows={16}
                                    required
                                    placeholder="1&#10;00:00:00,000 --> 00:00:05,000&#10;Your subtitle text here"
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-center text-red-400">
                                    {error}
                                </div>
                            )}

                            <RainbowButton type="submit" disabled={isSubmitting} className="w-full" variant="outline">
                                {isSubmitting ? 'Creating...' : 'Save'}
                            </RainbowButton>
                        </form>
                    </div>
                </MagicCard>
            </div>
        </div>
    );
}
