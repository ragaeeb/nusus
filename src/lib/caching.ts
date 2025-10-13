import { cache } from 'react';
import { getTranscript } from '@/lib/db';

export const getCachedTranscript = cache(getTranscript);
