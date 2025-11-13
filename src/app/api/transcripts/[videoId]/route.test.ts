import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';

const mockWithAuth = mock();
const mockCollection = { findOne: mock() };

const mockDb = { collection: () => mockCollection };

const mockClient = { db: () => mockDb };

const mockClientPromise = Promise.resolve(mockClient);

mock.module('@workos-inc/authkit-nextjs', () => ({ withAuth: mockWithAuth }));

mock.module('@/lib/mongodb', () => ({ default: mockClientPromise }));

const { GET } = await import('./route');

describe('route', () => {
    let originalConsoleError: any;

    beforeEach(() => {
        mockWithAuth.mockReset();
        mockCollection.findOne.mockReset();

        originalConsoleError = console.error;
        console.error = mock(() => {});
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('GET', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockWithAuth.mockResolvedValue({ user: null });

            const request = new NextRequest('http://localhost/api/transcripts/test123');
            const context = { params: Promise.resolve({ videoId: 'test123' }) };

            const response = await GET(request, context);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return transcript when found', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });

            const mockTranscript = {
                _id: 'objectId',
                en: '1:00: Test subtitle',
                title: 'Test Video',
                videoId: 'test123',
            };

            mockCollection.findOne.mockResolvedValue(mockTranscript);

            const request = new NextRequest('http://localhost/api/transcripts/test123');
            const context = { params: Promise.resolve({ videoId: 'test123' }) };

            const response = await GET(request, context);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ en: '1:00: Test subtitle', title: 'Test Video', videoId: 'test123' });
            expect(data).not.toHaveProperty('_id');
            expect(mockCollection.findOne).toHaveBeenCalledWith({ videoId: 'test123' });
        });

        it('should return 404 when transcript not found', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });
            mockCollection.findOne.mockResolvedValue(null);

            const request = new NextRequest('http://localhost/api/transcripts/nonexistent');
            const context = { params: Promise.resolve({ videoId: 'nonexistent' }) };

            const response = await GET(request, context);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Transcript not found');
        });

        it('should return 500 on internal error', async () => {
            mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });
            mockCollection.findOne.mockRejectedValue(new Error('DB error'));

            const request = new NextRequest('http://localhost/api/transcripts/test123');
            const context = { params: Promise.resolve({ videoId: 'test123' }) };

            const response = await GET(request, context);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Internal server error');
        });
    });
});
