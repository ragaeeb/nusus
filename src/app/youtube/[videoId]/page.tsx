import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MorphingText } from '@/components/ui/morphing-text';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { getTranscript } from '@/lib/db';
import { extractVideoId, isValidYouTubeId } from '@/lib/youtube';

type PageProps = { params: Promise<{ videoId: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
    const { videoId: rawVideoId } = await params;
    const videoId = extractVideoId(rawVideoId) || rawVideoId;
    const transcript = await getTranscript(videoId);

    if (!transcript) {
        return { description: 'The requested video could not be found.', title: 'Video Not Found - Nuṣūṣ' };
    }

    return {
        description: `Watch ${transcript.title} with enhanced subtitles`,
        openGraph: {
            description: `Watch ${transcript.title} with enhanced subtitles`,
            images: [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`],
            title: transcript.title,
        },
        title: `${transcript.title} - Nuṣūṣ`,
    };
};

const CreateNewTranscript = ({ videoId }: { videoId: string }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="text-center">
                <MorphingText className="mb-4 font-bold text-4xl text-white" texts={['Video', 'Not', 'Found']} />
                <p className="mb-6 text-lg text-slate-400">This video doesn't have subtitles yet.</p>
                <div className="flex items-center justify-center gap-4">
                    <Link href={`/youtube/${videoId}/new`}>
                        <ShimmerButton background="rgba(18,18,19,0.6)">Create Transcript</ShimmerButton>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default async function VideoPage({ params }: PageProps) {
    const { videoId: rawVideoId } = await params;
    const videoId = extractVideoId(rawVideoId) || rawVideoId;
    const transcript = await getTranscript(videoId);

    if (!transcript) {
        if (isValidYouTubeId(videoId)) {
            return <CreateNewTranscript videoId={videoId} />;
        }

        notFound();
    }

    const cleanTranscript = { en: transcript.en, title: transcript.title, videoId: transcript.videoId };

    return <VideoPlayer transcript={cleanTranscript} />;
}
