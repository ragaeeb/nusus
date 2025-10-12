import { HyperText } from '@/components/ui/hyper-text';
import { RainbowButton } from '@/components/ui/rainbow-button';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="text-center">
                <HyperText className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text font-bold text-6xl text-transparent">
                    404
                </HyperText>
                <h1 className="mb-4 font-bold text-4xl text-white">Video Not Found</h1>
                <p className="mb-6 text-lg text-slate-400">The requested video transcript could not be found.</p>
                <RainbowButton variant="outline" asChild className="inline-block rounded-lg px-6">
                    <a href="/">Go Home</a>
                </RainbowButton>
            </div>
        </div>
    );
}
