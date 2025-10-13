import { withAuth } from '@workos-inc/authkit-nextjs';
import { type NextRequest, NextResponse } from 'next/server';
import type { TranscriptData } from '@/lib/db';
import clientPromise from '@/lib/mongodb';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = Number.parseInt(searchParams.get('page') || '1', 10);
        const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
        const skip = (page - 1) * limit;

        const client = await clientPromise;
        const db = client.db('nusus');
        const collection = db.collection<TranscriptData>('transcripts');

        const [transcripts, total] = await Promise.all([
            collection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray(),
            collection.countDocuments(),
        ]);

        const cleanTranscripts = transcripts.map(({ _id, ...rest }) => rest);

        return NextResponse.json({
            pagination: { limit, page, total, totalPages: Math.ceil(total / limit) },
            transcripts: cleanTranscripts,
        });
    } catch (error) {
        console.error('Error fetching transcripts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};

export const PUT = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        const result = await collection.updateOne(
            { videoId: videoId.trim() },
            { $set: { en: en.trim(), title: title.trim() } },
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, videoId }, { status: 200 });
    } catch (error) {
        console.error('Error updating transcript:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
