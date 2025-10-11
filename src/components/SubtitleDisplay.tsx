import { memo } from 'react';
import type { Subtitle } from '@/types/subtitles';

type SubtitleDisplayProps = { subtitle?: Subtitle };

export const SubtitleDisplay = memo(({ subtitle }: SubtitleDisplayProps) => {
    if (!subtitle) {
        return null;
    }

    const baseClasses = 'text-white text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 w-full ';
    const languageClasses = 'text-lg';
    const overlayClasses =
        'mt-6 bg-gradient-to-r from-purple-600/90 to-blue-600/90 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500';

    return <div className={`${baseClasses} ${overlayClasses} ${languageClasses}`}>{subtitle.text}</div>;
});

SubtitleDisplay.displayName = 'SubtitleDisplay';
