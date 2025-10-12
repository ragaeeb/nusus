import { type NextRequest, NextResponse } from 'next/server';
import type { TranscriptData } from '@/lib/db';
import clientPromise from '@/lib/mongodb';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const body = await request.json();
        const { videoId, title, en } = body;

        if (!videoId || !title || !en) {
            return NextResponse.json(
                { error: 'Missing required fields: videoId, title, and en are required' },
                { status: 400 },
            );
        }

        const client = await clientPromise;
        const db = client.db('nusus');
        const collection = db.collection<TranscriptData>('transcripts');

        await collection.createIndex({ videoId: 1 }, { unique: true });

        const document: TranscriptData = { en: en.trim(), title: title.trim(), videoId: videoId.trim() };

        await collection.insertOne(document);

        return NextResponse.json({ success: true, videoId }, { status: 201 });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Video already exists' }, { status: 409 });
        }
        console.error('Error creating transcript:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
