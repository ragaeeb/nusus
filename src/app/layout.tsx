import type { Metadata } from 'next';
import './globals.css';
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    description: 'Experience YouTube with beautiful, synchronized subtitles',
    title: 'Nusus - Enhanced YouTube Subtitles',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="dark">
            <body className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
                <AuthKitProvider>
                    <div className="flex min-h-screen flex-col">
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                </AuthKitProvider>
            </body>
        </html>
    );
}
