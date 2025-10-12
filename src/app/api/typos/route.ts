import { withAuth } from '@workos-inc/authkit-nextjs';
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
        const collection = db.collection<TypoReport>('typo_reports');

        const [reports, total] = await Promise.all([
            collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            collection.countDocuments(),
        ]);

        const cleanReports = reports.map(({ _id, ...rest }) => rest);

        return NextResponse.json({
            pagination: { limit, page, total, totalPages: Math.ceil(total / limit) },
            reports: cleanReports,
        });
    } catch (error) {
        console.error('Error fetching typo reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
