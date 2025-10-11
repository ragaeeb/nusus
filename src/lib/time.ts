import type { Subtitle } from '@/types/subtitles';

const parseTimestamp = (parts: string[]): { totalSeconds: number; time: string; textIndex: number } => {
    const isThreePartTime = parts.length > 3 && !Number.isNaN(parseInt(parts[2], 10)) && parts[2].trim().length <= 2;

    if (isThreePartTime) {
        const [hours, minutes, seconds] = parts.slice(0, 3).map((p) => parseInt(p, 10));
        return { textIndex: 3, time: parts.slice(0, 3).join(':'), totalSeconds: hours * 3600 + minutes * 60 + seconds };
    }

    const [minutes, seconds] = parts.slice(0, 2).map((p) => parseInt(p, 10));
    return { textIndex: 2, time: parts.slice(0, 2).join(':'), totalSeconds: minutes * 60 + seconds };
};

export const parseSubtitles = (text: string): Subtitle[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    return lines.map((line) => {
        const parts = line.split(':');
        const { totalSeconds, time, textIndex } = parseTimestamp(parts);
        const text = parts.slice(textIndex).join(':').trim();
        return { seconds: totalSeconds, text, time };
    });
};
