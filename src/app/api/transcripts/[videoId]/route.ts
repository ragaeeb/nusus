import { withAuth } from '@workos-inc/authkit-nextjs';
import { type NextRequest, NextResponse } from 'next/server';
import type { TranscriptData } from '@/lib/db';
import clientPromise from '@/lib/mongodb';

type RouteContext = { params: Promise<{ videoId: string }> };

export const GET = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoId } = await context.params;

        const client = await clientPromise;
        const db = client.db('nusus');
        const collection = db.collection<TranscriptData>('transcripts');

        const transcript = await collection.findOne({ videoId });

        if (!transcript) {
            return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
        }

        const { _id, ...cleanTranscript } = transcript as TranscriptData & { _id: unknown };

        return NextResponse.json(cleanTranscript);
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
