import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

type TypoReport = { videoId: string; timestamp: number; originalText: string; suggestedText: string; createdAt: Date };

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const body = await request.json();
        const { videoId, timestamp, originalText, suggestedText } = body;

        if (!videoId || timestamp === undefined || !originalText || !suggestedText) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('nusus');
        const collection = db.collection<TypoReport>('typo_reports');

        const report: TypoReport = { createdAt: new Date(), originalText, suggestedText, timestamp, videoId };

        await collection.insertOne(report);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error saving typo report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
