import Link from 'next/link';
import pkg from '@/../package.json';

const version = pkg.version;
const homepage = pkg.homepage;
const versionUrl = `${homepage}/releases/tag/v${version}`;

export const Footer = () => {
    return (
        <footer className="border-slate-800/50 bg-slate-950/80">
            <div className="mt-3 mb-3 border-slate-800/50 text-center text-slate-500 text-sm">
                <p>
                    © 2025 IlmTest. All rights reserved.{' '}
                    <Link href={versionUrl} className="underline" target="_blank">
                        v{version}
                    </Link>
                </p>
            </div>
        </footer>
    );
};
