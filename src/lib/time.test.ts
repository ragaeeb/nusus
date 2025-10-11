import { describe, expect, it } from 'bun:test';
import { parseSubtitles } from './time';

describe('time', () => {
    describe('parseSubtitles', () => {
        it('should parse the times', () => {
            expect(parseSubtitles('1:00: Text\n10:11: Text2\n1:00:02: Text3')).toEqual([
                { seconds: 60, text: 'Text', time: '1:00' },
                { seconds: 611, text: 'Text2', time: '10:11' },
                { seconds: 3602, text: 'Text3', time: '1:00:02' },
            ]);
        });
    });
});
