import { describe, expect, it } from 'bun:test';
import { extractVideoId } from './youtube';

describe('youtube', () => {
    describe('parseSubtitles', () => {
        it.each([
            'https://youtu.be/RTbISAMfulc?si=x',
            'https://youtu.be/RTbISAMfulc',
            'https://www.youtube.com/watch?v=RTbISAMfulc',
        ])('should parse the time for %s', (url) => {
            [''];
            expect(extractVideoId(url)).toEqual('RTbISAMfulc');
        });
    });
});
