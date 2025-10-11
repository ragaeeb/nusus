import React from 'react';
import type { Subtitle, SubtitlePosition } from '@/types/subtitles';
import { TextAnimate } from './ui/text-animate';

export const SubtitleDisplay = ({ subtitle, position }: { subtitle?: Subtitle; position: SubtitlePosition }) => {
    if (!subtitle) {
        return null;
    }

    const baseClasses = 'text-white text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300';
    const overlayClasses =
        position === 'overlay'
            ? 'absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm shadow-2xl max-w-[90%] z-10'
            : 'mt-6 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500';

    return (
        <TextAnimate animation="blurIn" by="character" once className={`${baseClasses} ${overlayClasses} text-lg`}>
            {subtitle.text}
        </TextAnimate>
    );
};

SubtitleDisplay.displayName = 'SubtitleDisplay';

export default React.memo(SubtitleDisplay);
