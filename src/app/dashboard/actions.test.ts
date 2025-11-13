import { beforeEach, describe, expect, it, mock } from 'bun:test';

const mockWithAuth = mock();
const mockCollection = {
    countDocuments: mock(),
    find: mock(() => ({ sort: mock(() => ({ skip: mock(() => ({ limit: mock(() => ({ toArray: mock() })) })) })) })),
};

const mockDb = { collection: () => mockCollection };
const mockClient = { db: () => mockDb };

mock.module('@workos-inc/authkit-nextjs', () => ({ withAuth: mockWithAuth }));

mock.module('@/lib/mongodb', () => ({ default: Promise.resolve(mockClient) }));

const { getTranscripts } = await import('./actions');

describe('actions', () => {
    beforeEach(() => {
        mockWithAuth.mockReset();
        mockCollection.find.mockReset();
        mockCollection.countDocuments.mockReset();
    });

    describe('getTranscripts', () => {
        it('should throw error when user is not authenticated', async () => {
            mockWithAuth.mockResolvedValue({ user: null });

            await expect(getTranscripts(1)).rejects.toThrow('Unauthorized');
        });

        it('should return transcripts for first page', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockTranscripts = [
                { _id: 'id1', en: 'subs1', title: 'Video 1', videoId: 'vid1' },
                { _id: 'id2', en: 'subs2', title: 'Video 2', videoId: 'vid2' },
            ];

            const mockToArray = mock().mockResolvedValue(mockTranscripts);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(42);

            const result = await getTranscripts(1);

            expect(result.transcripts).toHaveLength(2);
            expect(result.transcripts[0]).not.toHaveProperty('_id');
            expect(result.transcripts[0].videoId).toBe('vid1');
            expect(result.pagination).toEqual({ limit: 20, page: 1, total: 42, totalPages: 3 });
            expect(mockFind).toHaveBeenCalledWith({});
            expect(mockSort).toHaveBeenCalledWith({ _id: -1 });
            expect(mockSkip).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(20);
        });

        it('should return transcripts for page 3', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockToArray = mock().mockResolvedValue([]);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(100);

            const result = await getTranscripts(3);

            expect(result.pagination).toEqual({ limit: 20, page: 3, total: 100, totalPages: 5 });
            expect(mockSkip).toHaveBeenCalledWith(40);
            expect(mockLimit).toHaveBeenCalledWith(20);
        });

        it('should handle empty results', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockToArray = mock().mockResolvedValue([]);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(0);

            const result = await getTranscripts(1);

            expect(result.transcripts).toHaveLength(0);
            expect(result.pagination).toEqual({ limit: 20, page: 1, total: 0, totalPages: 0 });
        });
    });
});
