import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
    darkMode: 'class',
    plugins: [],
    theme: {
        extend: {
            animation: {
                'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
                shimmer: 'shimmer 8s infinite',
            },
            borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
            colors: {
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                background: 'hsl(var(--background))',
                border: 'hsl(var(--border))',
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                foreground: 'hsl(var(--foreground))',
                input: 'hsl(var(--input))',
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                ring: 'hsl(var(--ring))',
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
            },
            keyframes: {
                'border-beam': { '100%': { 'offset-distance': '100%' } },
                shimmer: {
                    '0%, 90%, 100%': { 'background-position': 'calc(-100% - var(--shimmer-width)) 0' },
                    '30%, 60%': { 'background-position': 'calc(100% + var(--shimmer-width)) 0' },
                },
            },
        },
    },
};

export default config;
