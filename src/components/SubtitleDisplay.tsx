'use client';

import { MessageSquare } from 'lucide-react';
import { memo } from 'react';
import type { Subtitle } from '@/types/subtitles';
import { Button } from './ui/button';

type SubtitleDisplayProps = { subtitle?: Subtitle; onReportTypo: () => void };

export const SubtitleDisplay = memo(({ subtitle, onReportTypo }: SubtitleDisplayProps) => {
    if (!subtitle) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="fade-slide-in rounded-lg bg-gradient-to-r from-purple-600/90 to-blue-600/90 px-6 py-4 shadow-xl duration-500">
                <p className="text-center font-semibold text-lg text-white">{subtitle.text}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
                <Button
                    onClick={onReportTypo}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800/70 px-4 py-2 font-medium text-white transition-all hover:scale-105 hover:bg-slate-700/70"
                    type="button"
                >
                    <MessageSquare className="h-4 w-4" />
                    Report Issue
                </Button>
            </div>
        </div>
    );
});

SubtitleDisplay.displayName = 'SubtitleDisplay';
