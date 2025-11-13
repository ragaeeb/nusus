import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';

const mockWithAuth = mock();
const mockCollection = {
    countDocuments: mock(),
    find: mock(() => ({ sort: mock(() => ({ skip: mock(() => ({ limit: mock(() => ({ toArray: mock() })) })) })) })),
    insertOne: mock(),
    updateOne: mock(),
};

const mockDb = { collection: () => mockCollection };

const mockClient = { db: () => mockDb };

const mockClientPromise = Promise.resolve(mockClient);

mock.module('@workos-inc/authkit-nextjs', () => ({ withAuth: mockWithAuth }));

mock.module('@/lib/mongodb', () => ({ default: mockClientPromise }));

const { GET, POST, PUT } = await import('./route');

describe('api/transcripts/route', () => {
    let originalConsoleError: any;

    beforeEach(() => {
        mockWithAuth.mockReset();
        mockCollection.insertOne.mockReset();
        mockCollection.find.mockReset();
        mockCollection.countDocuments.mockReset();
        mockCollection.updateOne.mockReset();

        originalConsoleError = console.error;
        console.error = mock(() => {});
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('POST', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockWithAuth.mockResolvedValue({ user: null });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: 'subtitles', title: 'Test', videoId: 'test123' }),
                method: 'POST',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return 400 when required fields are missing', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ videoId: 'test123' }),
                method: 'POST',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('Missing required fields');
        });

        it('should create transcript successfully', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            mockCollection.insertOne.mockResolvedValue({ insertedId: 'id1' });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: '1:00: Test subtitle', title: 'Test Video', videoId: 'test123' }),
                method: 'POST',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.videoId).toBe('test123');
            expect(mockCollection.insertOne).toHaveBeenCalledWith({
                en: '1:00: Test subtitle',
                title: 'Test Video',
                videoId: 'test123',
            });
        });

        it('should return 409 when video already exists', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            mockCollection.insertOne.mockRejectedValue({ code: 11000 });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: '1:00: Test', title: 'Test Video', videoId: 'test123' }),
                method: 'POST',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.error).toBe('Video already exists');
        });

        it('should return 500 on internal error', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });
            mockCollection.insertOne.mockRejectedValue('DB error');

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: '1:00: Test', title: 'Test Video', videoId: 'test123' }),
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

            const request = new NextRequest('http://localhost/api/transcripts');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return paginated transcripts with default values', async () => {
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
            mockCollection.countDocuments.mockResolvedValue(2);

            const request = new NextRequest('http://localhost/api/transcripts');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.transcripts).toHaveLength(2);
            expect(data.transcripts[0]).not.toHaveProperty('_id');
            expect(data.pagination).toEqual({ limit: 20, page: 1, total: 2, totalPages: 1 });
            expect(mockFind).toHaveBeenCalledWith({});
            expect(mockSort).toHaveBeenCalledWith({ _id: -1 });
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

            const request = new NextRequest('http://localhost/api/transcripts?page=3&limit=10');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.pagination).toEqual({ limit: 10, page: 3, total: 100, totalPages: 10 });
            expect(mockSkip).toHaveBeenCalledWith(20);
            expect(mockLimit).toHaveBeenCalledWith(10);
        });

        it('should return 500 on internal error', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });
            mockCollection.countDocuments.mockRejectedValue('DB error');

            const request = new NextRequest('http://localhost/api/transcripts');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Internal server error');
        });
    });

    describe('PUT', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockWithAuth.mockResolvedValue({ user: null });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: 'new subs', title: 'Updated', videoId: 'test123' }),
                method: 'PUT',
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return 400 when required fields are missing', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ title: 'Updated', videoId: 'test123' }),
                method: 'PUT',
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('Missing required fields');
        });

        it('should update transcript successfully', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: 'Updated subtitles', title: 'Updated Title', videoId: 'test123' }),
                method: 'PUT',
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.videoId).toBe('test123');
            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                { videoId: 'test123' },
                { $set: { en: 'Updated subtitles', title: 'Updated Title' } },
            );
        });

        it('should return 404 when transcript not found', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: 'subs', title: 'Updated', videoId: 'nonexistent' }),
                method: 'PUT',
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Transcript not found');
        });

        it('should return 500 on internal error', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });
            mockCollection.updateOne.mockRejectedValue(new Error('DB error'));

            const request = new NextRequest('http://localhost/api/transcripts', {
                body: JSON.stringify({ en: 'subs', title: 'Updated', videoId: 'test123' }),
                method: 'PUT',
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Internal server error');
        });
    });
});
