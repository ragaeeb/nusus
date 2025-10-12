'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import type { TranscriptData } from '@/lib/db';
import clientPromise from '@/lib/mongodb';

type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };

type TranscriptsResponse = { transcripts: TranscriptData[]; pagination: PaginationInfo };

export const getTranscripts = async (page: number): Promise<TranscriptsResponse> => {
    const { user } = await withAuth();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const limit = 20;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('nusus');
    const collection = db.collection<TranscriptData>('transcripts');

    const [transcripts, total] = await Promise.all([
        collection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(),
    ]);

    const cleanTranscripts = transcripts.map(({ _id, ...rest }) => rest);

    return {
        pagination: { limit, page, total, totalPages: Math.ceil(total / limit) },
        transcripts: cleanTranscripts as TranscriptData[],
    };
};
