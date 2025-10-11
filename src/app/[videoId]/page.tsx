import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { getTranscript } from '@/lib/db';
import { extractVideoId } from '@/lib/youtube';

type PageProps = { params: { videoId: string } };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
    const { videoId: rawVideoId } = await params;
    const videoId = extractVideoId(rawVideoId) || rawVideoId;
    const transcript = await getTranscript(videoId);

    if (!transcript) {
        return { description: 'The requested video could not be found.', title: 'Video Not Found - Nuṣūṣ' };
    }

    return {
        description: transcript.description || `Watch ${transcript.title} with enhanced subtitles`,
        openGraph: {
            description: transcript.description || `Watch ${transcript.title} with enhanced subtitles`,
            images: [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`],
            title: transcript.title,
        },
        title: `${transcript.title} - Nuṣūṣ`,
    };
};

export default async function VideoPage({ params }: PageProps) {
    const { videoId: rawVideoId } = await params;
    const extractedId = extractVideoId(rawVideoId);

    if (extractedId && extractedId !== rawVideoId) {
        redirect(`/${extractedId}`);
    }

    const videoId = extractedId || rawVideoId;
    const transcript = await getTranscript(videoId);

    if (!transcript) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
                <div className="text-center">
                    <h1 className="mb-4 font-bold text-4xl text-white">Video Not Found</h1>
                    <p className="text-slate-400">The requested video transcript could not be found.</p>
                    <RainbowButton asChild className="mt-6 inline-block rounded-lg px-6" variant="outline">
                        <a href="/">Go Home</a>
                    </RainbowButton>
                </div>
            </div>
        );
    }

    const cleanTranscript = {
        ar: transcript.ar,
        description: transcript.description,
        en: transcript.en,
        title: transcript.title,
        videoId: transcript.videoId,
    };

    return <VideoPlayer videoId={videoId} transcript={cleanTranscript} />;
}
