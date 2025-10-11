import { type NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/db';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const language = searchParams.get('language') || 'en';

    if (!videoId) {
        return NextResponse.json({ error: 'videoId parameter is required' }, { status: 400 });
    }

    try {
        const transcript = await getTranscript(videoId);

        if (!transcript) {
            return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
        }

        const subtitleText = language === 'ar' && transcript.ar ? transcript.ar : transcript.en;

        return new NextResponse(subtitleText, { headers: { 'Content-Type': 'text/plain' }, status: 200 });
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
