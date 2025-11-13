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

const { getTypoReports } = await import('./actions');

describe('actions', () => {
    beforeEach(() => {
        mockWithAuth.mockReset();
        mockCollection.find.mockReset();
        mockCollection.countDocuments.mockReset();
    });

    describe('getTypoReports', () => {
        it('should throw error when user is not authenticated', async () => {
            mockWithAuth.mockResolvedValue({ user: null });

            await expect(getTypoReports(1)).rejects.toThrow('Unauthorized');
        });

        it('should return typo reports for first page', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockReports = [
                {
                    _id: 'id1',
                    createdAt: new Date('2025-01-15T10:30:00Z'),
                    originalText: 'text1',
                    suggestedText: 'corrected1',
                    timestamp: 60,
                    videoId: 'vid1',
                },
                {
                    _id: 'id2',
                    createdAt: new Date('2025-01-16T14:45:00Z'),
                    originalText: 'text2',
                    suggestedText: 'corrected2',
                    timestamp: 120,
                    videoId: 'vid2',
                },
            ];

            const mockToArray = mock().mockResolvedValue(mockReports);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(35);

            const result = await getTypoReports(1);

            expect(result.reports).toHaveLength(2);
            expect(result.reports[0]).not.toHaveProperty('_id');
            expect(result.reports[0].videoId).toBe('vid1');
            expect(result.reports[0].createdAt).toBe('2025-01-15T10:30:00.000Z');
            expect(result.pagination).toEqual({ limit: 20, page: 1, total: 35, totalPages: 2 });
            expect(mockFind).toHaveBeenCalledWith({});
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockSkip).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(20);
        });

        it('should return typo reports for page 2', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockToArray = mock().mockResolvedValue([]);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(50);

            const result = await getTypoReports(2);

            expect(result.pagination).toEqual({ limit: 20, page: 2, total: 50, totalPages: 3 });
            expect(mockSkip).toHaveBeenCalledWith(20);
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

            const result = await getTypoReports(1);

            expect(result.reports).toHaveLength(0);
            expect(result.pagination).toEqual({ limit: 20, page: 1, total: 0, totalPages: 0 });
        });

        it('should convert Date objects to ISO strings', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const testDate = new Date('2025-03-20T08:15:30.500Z');
            const mockReports = [
                {
                    _id: 'id1',
                    createdAt: testDate,
                    originalText: 'test',
                    suggestedText: 'fixed',
                    timestamp: 30,
                    videoId: 'vid1',
                },
            ];

            const mockToArray = mock().mockResolvedValue(mockReports);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(1);

            const result = await getTypoReports(1);

            expect(result.reports[0].createdAt).toBe('2025-03-20T08:15:30.500Z');
            expect(typeof result.reports[0].createdAt).toBe('string');
        });
    });
});
