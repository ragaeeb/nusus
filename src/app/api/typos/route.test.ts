import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';

const mockWithAuth = mock();
const mockCollection = {
    countDocuments: mock(),
    find: mock(() => ({ sort: mock(() => ({ skip: mock(() => ({ limit: mock(() => ({ toArray: mock() })) })) })) })),
    insertOne: mock(),
};

const mockDb = { collection: () => mockCollection };
const mockClient = { db: () => mockDb };

mock.module('@workos-inc/authkit-nextjs', () => ({ withAuth: mockWithAuth }));

mock.module('@/lib/mongodb', () => ({ default: Promise.resolve(mockClient) }));

const { GET, POST } = await import('./route');

describe('route', () => {
    let originalConsoleError: any;

    beforeEach(() => {
        mockWithAuth.mockReset();
        mockCollection.insertOne.mockReset();
        mockCollection.find.mockReset();
        mockCollection.countDocuments.mockReset();

        originalConsoleError = console.error;
        console.error = mock(() => {});
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('POST', () => {
        it('should return 400 when required fields are missing', async () => {
            const request = new NextRequest('http://localhost/api/typos', {
                body: JSON.stringify({ videoId: 'test123' }),
                method: 'POST',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Missing required fields');
        });

        it('should create typo report successfully', async () => {
            mockCollection.insertOne.mockResolvedValue({ insertedId: 'id1' });

            const request = new NextRequest('http://localhost/api/typos', {
                body: JSON.stringify({
                    originalText: 'Original text',
                    suggestedText: 'Corrected text',
                    timestamp: 60,
                    videoId: 'test123',
                }),
                method: 'POST',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(mockCollection.insertOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    createdAt: expect.any(Date),
                    originalText: 'Original text',
                    suggestedText: 'Corrected text',
                    timestamp: 60,
                    videoId: 'test123',
                }),
            );
        });

        it('should return 500 on internal error', async () => {
            mockCollection.insertOne.mockRejectedValue('DB error');

            const request = new NextRequest('http://localhost/api/typos', {
                body: JSON.stringify({
                    originalText: 'text',
                    suggestedText: 'corrected',
                    timestamp: 60,
                    videoId: 'test123',
                }),
                method: 'POST',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Internal server error');
        });
    });

    describe('GET', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockWithAuth.mockResolvedValue({ user: null });

            const request = new NextRequest('http://localhost/api/typos');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return paginated typo reports with default values', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockReports = [
                {
                    _id: 'id1',
                    createdAt: new Date('2025-01-01'),
                    originalText: 'text1',
                    suggestedText: 'corrected1',
                    timestamp: 60,
                    videoId: 'vid1',
                },
                {
                    _id: 'id2',
                    createdAt: new Date('2025-01-02'),
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
            mockCollection.countDocuments.mockResolvedValue(2);

            const request = new NextRequest('http://localhost/api/typos');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.reports).toHaveLength(2);
            expect(data.reports[0]).not.toHaveProperty('_id');
            expect(data.pagination).toEqual({ limit: 20, page: 1, total: 2, totalPages: 1 });
            expect(mockFind).toHaveBeenCalledWith({});
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockSkip).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(20);
        });

        it('should handle custom page and limit parameters', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockToArray = mock().mockResolvedValue([]);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(100);

            const request = new NextRequest('http://localhost/api/typos?page=2&limit=15');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.pagination).toEqual({ limit: 15, page: 2, total: 100, totalPages: 7 });
            expect(mockSkip).toHaveBeenCalledWith(15);
            expect(mockLimit).toHaveBeenCalledWith(15);
        });

        it('should enforce maximum limit of 100', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockToArray = mock().mockResolvedValue([]);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(200);

            const request = new NextRequest('http://localhost/api/typos?limit=150');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.pagination.limit).toBe(100);
            expect(mockLimit).toHaveBeenCalledWith(100);
        });

        it('should handle invalid pagination parameters', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockToArray = mock().mockResolvedValue([]);
            const mockLimit = mock(() => ({ toArray: mockToArray }));
            const mockSkip = mock(() => ({ limit: mockLimit }));
            const mockSort = mock(() => ({ skip: mockSkip }));
            const mockFind = mock(() => ({ sort: mockSort }));

            mockCollection.find = mockFind;
            mockCollection.countDocuments.mockResolvedValue(0);

            const request = new NextRequest('http://localhost/api/typos?page=-1&limit=invalid');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.pagination.page).toBe(1);
            expect(data.pagination.limit).toBe(20);
            expect(data.pagination.totalPages).toBe(1);
        });

        it('should return 500 on internal error', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });
            mockCollection.countDocuments.mockRejectedValue('DB error');

            const request = new NextRequest('http://localhost/api/typos');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Internal server error');
        });
    });
});
