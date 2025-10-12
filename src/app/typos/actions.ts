'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import clientPromise from '@/lib/mongodb';

type TypoReport = { videoId: string; timestamp: number; originalText: string; suggestedText: string; createdAt: Date };

type TyposResponse = {
    reports: Array<Omit<TypoReport, 'createdAt'> & { createdAt: string }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const getTypoReports = async (page: number): Promise<TyposResponse> => {
    const { user } = await withAuth();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const limit = 20;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('nusus');
    const collection = db.collection<TypoReport>('typo_reports');

    const [reports, total] = await Promise.all([
        collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(),
    ]);

    const cleanReports = reports.map(({ _id, createdAt, ...rest }) => ({
        ...rest,
        createdAt: createdAt.toISOString(),
    }));

    return { pagination: { limit, page, total, totalPages: Math.ceil(total / limit) }, reports: cleanReports };
};
