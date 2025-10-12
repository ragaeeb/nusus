import { signOut, withAuth } from '@workos-inc/authkit-nextjs';
import { Edit, LogOut } from 'lucide-react';
import Link from 'next/link';
import { AuroraText } from '@/components/ui/aurora-text';
import { Button } from '@/components/ui/button';
import { MagicCard } from '@/components/ui/magic-card';
import { getTranscripts } from './actions';

type PageProps = { searchParams: Promise<{ page?: string }> };

export default async function DashboardPage({ searchParams }: PageProps) {
    const { user } = await withAuth({ ensureSignedIn: true });
    const params = await searchParams;
    const currentPage = Number.parseInt(params.page || '1', 10);

    const { transcripts, pagination } = await getTranscripts(currentPage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/" className="inline-block transition-transform hover:scale-105">
                        <AuroraText className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-4xl text-transparent">
                            Nuṣūṣ
                        </AuroraText>
                    </Link>
                    <div className="flex items-center gap-4">
                        <p className="text-slate-300">
                            Welcome, <span className="font-semibold">{user?.firstName || user?.email}</span>
                        </p>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
                            <Button type="submit" variant="outline" size="sm">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-bold text-3xl text-white">Transcripts</h1>
                    <Link href="/typos">
                        <Button variant="outline">View Typo Reports</Button>
                    </Link>
                </div>

                {transcripts.length === 0 ? (
                    <MagicCard className="border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
                        <p className="text-slate-400">No transcripts available yet.</p>
                    </MagicCard>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {transcripts.map((transcript) => (
                                <MagicCard
                                    key={transcript.videoId}
                                    className="border-slate-800 bg-slate-900/50 backdrop-blur-xl"
                                >
                                    <div className="p-4">
                                        <h3 className="mb-2 font-semibold text-white">{transcript.title}</h3>
                                        <p className="mb-4 font-mono text-slate-400 text-sm">{transcript.videoId}</p>
                                        <div className="flex gap-2">
                                            <Link href={`/youtube/${transcript.videoId}`} className="flex-1">
                                                <Button variant="outline" className="w-full" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/youtube/${transcript.videoId}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </MagicCard>
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                {currentPage > 1 && (
                                    <Link href={`/dashboard?page=${currentPage - 1}`}>
                                        <Button variant="outline">Previous</Button>
                                    </Link>
                                )}
                                <span className="text-slate-300">
                                    Page {currentPage} of {pagination.totalPages}
                                </span>
                                {currentPage < pagination.totalPages && (
                                    <Link href={`/dashboard?page=${currentPage + 1}`}>
                                        <Button variant="outline">Next</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
