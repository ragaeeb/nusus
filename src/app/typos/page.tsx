import { withAuth } from '@workos-inc/authkit-nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuroraText } from '@/components/ui/aurora-text';
import { Button } from '@/components/ui/button';
import { MagicCard } from '@/components/ui/magic-card';
import { getTypoReports } from './actions';

type PageProps = { searchParams: Promise<{ page?: string }> };

export default async function TyposPage({ searchParams }: PageProps) {
    await withAuth({ ensureSignedIn: true });
    const params = await searchParams;
    const currentPage = Number.parseInt(params.page || '1', 10);

    const { reports, pagination } = await getTypoReports(currentPage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-block transition-transform hover:scale-105">
                        <AuroraText className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-4xl text-transparent">
                            Nuṣūṣ
                        </AuroraText>
                    </Link>
                </div>

                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="font-bold text-3xl text-white">Typo Reports</h1>
                </div>

                {reports.length === 0 ? (
                    <MagicCard className="border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
                        <p className="text-slate-400">No typo reports available yet.</p>
                    </MagicCard>
                ) : (
                    <>
                        <div className="space-y-4">
                            {reports.map((report, index) => (
                                <MagicCard
                                    key={`${report.videoId}-${report.timestamp}-${index}`}
                                    className="border-slate-800 bg-slate-900/50 backdrop-blur-xl"
                                >
                                    <div className="p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div>
                                                <Link
                                                    href={`/youtube/${report.videoId}?t=${Math.floor(report.timestamp)}`}
                                                    className="font-semibold text-purple-400 hover:text-purple-300"
                                                >
                                                    {report.videoId}
                                                </Link>
                                                <p className="text-slate-400 text-sm">
                                                    Timestamp: {Math.floor(report.timestamp)}s
                                                </p>
                                            </div>
                                            <p className="text-slate-500 text-xs">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="mb-1 font-medium text-slate-300 text-sm">Original:</p>
                                                <p className="rounded bg-slate-800/50 p-2 text-slate-200">
                                                    {report.originalText}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 font-medium text-slate-300 text-sm">Suggested:</p>
                                                <p className="rounded bg-slate-800/50 p-2 text-slate-200">
                                                    {report.suggestedText}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </MagicCard>
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                {currentPage > 1 && (
                                    <Link href={`/typos?page=${currentPage - 1}`}>
                                        <Button variant="outline">Previous</Button>
                                    </Link>
                                )}
                                <span className="text-slate-300">
                                    Page {currentPage} of {pagination.totalPages}
                                </span>
                                {currentPage < pagination.totalPages && (
                                    <Link href={`/typos?page=${currentPage + 1}`}>
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
