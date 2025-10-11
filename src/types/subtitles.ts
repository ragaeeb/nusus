export type Subtitle = { time: string; text: string; seconds: number };

export type SubtitlePosition = 'overlay' | 'outside';

export type VideoData = {
    videoId: string;
    title: string;
    description?: string;
    subtitles: { en: string; ar?: string };
};
