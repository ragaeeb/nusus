'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import SubmittableInput from '@/components/submittable-input';
import { AuroraText } from '@/components/ui/aurora-text';
import { Button } from '@/components/ui/button';
import { Highlighter } from '@/components/ui/highlighter';
import { extractVideoId } from '@/lib/youtube';

export default function Home() {
    const router = useRouter();
    console.log('call useAuth');
    const { user } = useAuth();
    console.log('useAuth', user);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (url: string) => {
            setError('');
            setLoading(true);

            const extractedId = extractVideoId(url);
            if (!extractedId) {
                setError('Invalid YouTube URL');
                setLoading(false);
                return;
            }

            router.push(`/youtube/${extractedId}`);
        },
        [router],
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="w-full max-w-3xl">
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
                    <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-center text-red-400">
                        {error}
                    </div>
                )}

                <SubmittableInput
                    name="youtube-url"
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    onSubmit={handleSubmit}
                    className="mb-6 h-14 bg-slate-800/50 text-lg text-white placeholder:text-slate-500"
                    disabled={loading}
                />

                <div className="flex items-center justify-center gap-4">
                    {user ? (
                        <Button variant="outline" onClick={() => router.push('/dashboard')} className="bg-slate-800/50">
                            Go to Dashboard
                        </Button>
                    ) : (
                        <Button onClick={() => router.push('/api/auth/login')} className="bg-slate-200/50">
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
