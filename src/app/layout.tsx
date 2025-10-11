import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    description: 'Experience YouTube with beautiful, synchronized subtitles',
    title: 'Nusus - Enhanced YouTube Subtitles',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
                <div className="flex min-h-screen flex-col">
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
