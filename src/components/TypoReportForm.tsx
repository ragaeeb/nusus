'use client';

import { Send, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { MagicCard } from '@/components/ui/magic-card';
import { RainbowButton } from '@/components/ui/rainbow-button';
import type { Subtitle } from '@/types/subtitles';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type TypoReportFormProps = { subtitle: Subtitle; videoId: string; onClose: () => void };

export const TypoReportForm = memo(({ subtitle, videoId, onClose }: TypoReportFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setIsSubmitting(true);

            const formData = new FormData(e.currentTarget);
            const suggestedText = formData.get('suggestedText') as string;

            try {
                const response = await fetch('/api/typos', {
                    body: JSON.stringify({
                        originalText: subtitle.text,
                        suggestedText,
                        timestamp: subtitle.seconds,
                        videoId,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                });

                if (response.ok) {
                    setSuccess(true);
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                }
            } catch (error) {
                console.error('Error submitting typo report:', error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [videoId, subtitle, onClose],
    );

    const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    return (
        <MagicCard className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white text-xl">Report Typo at {subtitle.time}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 transition-colors hover:text-white"
                        type="button"
                        aria-label="Close typo report form"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="suggestedText" className="mb-2 block text-slate-400 text-sm">
                            Suggested Correction:
                        </Label>
                        <Textarea
                            ref={textareaRef}
                            id="suggestedText"
                            name="suggestedText"
                            defaultValue={subtitle.text}
                            onChange={handleTextareaChange}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white transition-colors focus:border-purple-500 focus:outline-none"
                            rows={4}
                            required
                            autoFocus
                        />
                    </div>

                    {success && (
                        <div className="rounded-lg bg-green-500/20 px-4 py-3 text-center text-green-400">
                            Thank you! Your report has been submitted.
                        </div>
                    )}

                    <RainbowButton
                        variant="outline"
                        type="submit"
                        disabled={isSubmitting || success}
                        className="w-full"
                    >
                        {isSubmitting ? (
                            'Submitting...'
                        ) : success ? (
                            'Submitted!'
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Report
                            </>
                        )}
                    </RainbowButton>
                </form>
            </div>
        </MagicCard>
    );
});

TypoReportForm.displayName = 'TypoReportForm';
