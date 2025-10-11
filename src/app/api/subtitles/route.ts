import { type NextRequest, NextResponse } from 'next/server';

type SubtitleData = { [key: string]: string };

const mockSubtitles: SubtitleData = {
    dQw4w9WgXcQ: `0:00: Never gonna give you up
0:12: Never gonna let you down
0:17: Never gonna run around and desert you
0:25: Never gonna make you cry
0:29: Never gonna say goodbye
0:33: Never gonna tell a lie and hurt you`,
    jNQXAC9IVRw: `0:00: We're no strangers to love
0:05: You know the rules and so do I
0:12: A full commitment's what I'm thinking of
0:18: You wouldn't get this from any other guy
0:25: I just wanna tell you how I'm feeling
0:32: Gotta make you understand`,
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json({ error: 'videoId parameter is required' }, { status: 400 });
    }

    const subtitles =
        mockSubtitles[videoId] ||
        `0:00: Welcome to this video
0:05: This is a sample subtitle
0:10: Demonstrating the subtitle feature
0:15: You can see subtitles appear in real-time
0:20: Both overlay and below video modes are available
0:25: Enjoy your viewing experience
0:30: Thank you for watching`;

    return new NextResponse(subtitles, { headers: { 'Content-Type': 'text/plain' }, status: 200 });
};
