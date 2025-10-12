import clientPromise from './mongodb';

export type TranscriptData = { videoId: string; title: string; en: string };

export const getTranscript = async (videoId: string): Promise<TranscriptData | null> => {
    const client = await clientPromise;
    const db = client.db('nusus');
    const collection = db.collection<TranscriptData>('transcripts');

    const value = (await collection.findOne({ videoId })) as TranscriptData & { _id: any };

    if (value) {
        const { _id, ...transcript } = value;
        return transcript;
    }

    return null;
};
