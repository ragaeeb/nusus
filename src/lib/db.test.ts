import { beforeEach, describe, expect, it, mock } from 'bun:test';

const mockCollection = { createIndex: mock(), findOne: mock() };
const mockDb = { collection: () => mockCollection };

mock.module('./mongodb', () => ({ default: Promise.resolve({ db: () => mockDb }) }));

const { getTranscript } = await import('./db');

describe('db', () => {
    beforeEach(() => {
        mockCollection.findOne.mockReset();
        mockCollection.createIndex.mockReset();
    });

    describe('getTranscript', () => {
        it('should return transcript without _id field', async () => {
            const mockTranscript = {
                _id: 'objectId123',
                en: '1:00: Test subtitle',
                title: 'Test Video',
                videoId: 'test123',
            };

            mockCollection.findOne.mockResolvedValue(mockTranscript);

            const result = await getTranscript('test123');

            expect(result).toEqual({ en: '1:00: Test subtitle', title: 'Test Video', videoId: 'test123' });
            expect(result).not.toHaveProperty('_id');
            expect(mockCollection.findOne).toHaveBeenCalledWith({ videoId: 'test123' });
        });

        it('should return null when transcript not found', async () => {
            mockCollection.findOne.mockResolvedValue(null);

            const result = await getTranscript('nonexistent');

            expect(result).toBeNull();
            expect(mockCollection.findOne).toHaveBeenCalledWith({ videoId: 'nonexistent' });
        });

        it('should query correct database and collection', async () => {
            const mockDbFn = mock((dbName: string) => mockDb);
            const customClient = { db: mockDbFn };

            // Temporarily replace the client
            mock.module('./mongodb', () => ({ default: Promise.resolve(customClient) }));

            mockCollection.findOne.mockResolvedValue(null);

            await getTranscript('test123');

            expect(mockDbFn).toHaveBeenCalledWith('nusus');
        });
    });

    describe('initDB', () => {
        it('should create indexes for both collections', async () => {
            const transcriptsCollection = { createIndex: mock().mockResolvedValue('videoId_1') };

            const typoReportsCollection = { createIndex: mock().mockResolvedValue('createdAt_-1') };

            const collectionMap: Record<string, any> = {
                transcripts: transcriptsCollection,
                typo_reports: typoReportsCollection,
            };

            const customDb = { collection: (name: string) => collectionMap[name] };

            const customClient = { db: () => customDb };

            mock.module('./mongodb', () => ({ default: Promise.resolve(customClient) }));

            // Reimport to get the new mock
            const { initDB: newInitDB } = await import(`./db?t=${Date.now()}`);

            await newInitDB();

            expect(transcriptsCollection.createIndex).toHaveBeenCalledWith({ videoId: 1 }, { unique: true });
            expect(typoReportsCollection.createIndex).toHaveBeenCalledWith({ createdAt: -1 });
        });

        it('should create indexes in parallel', async () => {
            const startTimes: number[] = [];
            const transcriptsCollection = {
                createIndex: mock(async () => {
                    startTimes.push(Date.now());
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    return 'videoId_1';
                }),
            };

            const typoReportsCollection = {
                createIndex: mock(async () => {
                    startTimes.push(Date.now());
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    return 'createdAt_-1';
                }),
            };

            const collectionMap: Record<string, any> = {
                transcripts: transcriptsCollection,
                typo_reports: typoReportsCollection,
            };

            const customDb = { collection: (name: string) => collectionMap[name] };

            const customClient = { db: () => customDb };

            mock.module('./mongodb', () => ({ default: Promise.resolve(customClient) }));

            const { initDB: newInitDB } = await import(`./db?t=${Date.now()}`);

            await newInitDB();

            expect(transcriptsCollection.createIndex).toHaveBeenCalled();
            expect(typoReportsCollection.createIndex).toHaveBeenCalled();
            const timeDiff = Math.abs(startTimes[0] - startTimes[1]);
            expect(timeDiff).toBeLessThan(5);
        });
    });
});
