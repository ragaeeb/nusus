# Nuṣūṣ - Enhanced YouTube Subtitles

[Demo](https://nusus.netlify.app)

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/ed234cdd-0063-4e9d-a56a-0cd6d944b633.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/ed234cdd-0063-4e9d-a56a-0cd6d944b633)
[![Netlify Status](https://api.netlify.com/api/v1/badges/d4e114c7-92ce-4f4a-837f-a9583e0dc1aa/deploy-status)](https://app.netlify.com/projects/nusus/deploys)
[![codecov](https://codecov.io/gh/ragaeeb/nusus/graph/badge.svg?token=Y6VM7I9VL9)](https://codecov.io/gh/ragaeeb/nusus)
[![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)](https://www.typescriptlang.org)
[![Node.js CI](https://github.com/ragaeeb/nusus/actions/workflows/build.yml/badge.svg)](https://github.com/ragaeeb/nusus/actions/workflows/build.yml)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![GitHub License](https://img.shields.io/github/license/ragaeeb/nusus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Experience YouTube videos with beautiful, synchronized subtitles and advanced transcript management.

## Features

- **Enhanced Subtitle Viewing**: Watch YouTube videos with elegant, synchronized subtitles
- **Timestamp Deep Linking**: Share videos with specific timestamps using `?t=` query parameter
- **Transcript Management**: Create, edit, and manage video transcripts
- **Typo Reporting**: Report and track subtitle corrections
- **User Authentication**: Secure access with WorkOS AuthKit
- **Dashboard**: Browse and manage all transcripts with pagination
- **Share Functionality**: Easily share videos with timestamps

## Tech Stack

- **Framework**: Next.js 15 (App Router with Typed Routes)
- **Language**: TypeScript
- **Authentication**: WorkOS AuthKit
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion
- **Deployment**: Netlify

## Prerequisites

- Node.js 18+ or Bun 1.3+
- MongoDB instance
- WorkOS account and API credentials

## Installation

```bash
npm install
# or
bun install
```

## Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_COOKIE_PASSWORD=your-32-character-password-here
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

Generate a secure cookie password:
```bash
openssl rand -base64 24
```

## WorkOS Configuration

1. Go to [WorkOS Dashboard](https://dashboard.workos.com)
2. Navigate to **Redirects** section
3. Add redirect URI: `http://localhost:3000/api/auth/callback`
4. Set logout redirect: `http://localhost:3000`
5. For production, add your production URLs

## Development

```bash
npm run dev
# or
bun run dev
```

Visit `http://localhost:3000`

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication routes
│   │   ├── transcripts/    # Transcript CRUD APIs
│   │   └── typos/          # Typo report APIs
│   ├── dashboard/          # Admin dashboard
│   ├── typos/              # Typo reports viewer
│   ├── youtube/
│   │   └── [videoId]/
│   │       ├── new/        # Create transcript
│   │       ├── edit/       # Edit transcript
│   │       └── page.tsx    # Video player
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # UI components
│   ├── VideoPlayer.tsx     # YouTube player component
│   └── ...
├── hooks/
│   └── useYouTubePlayer.ts # YouTube IFrame API hook
├── lib/
│   ├── db.ts               # Database utilities
│   ├── mongodb.ts          # MongoDB connection
│   └── youtube.ts          # YouTube utilities
└── types/                  # TypeScript definitions
```

## Routes

### Public Routes
- `/` - Home page with URL input
- `/youtube/:videoId` - Video player with subtitles
- `/youtube/:videoId?t=123` - Video player starting at 123 seconds

### Protected Routes (Authentication Required)
- `/dashboard` - Browse all transcripts with pagination
- `/youtube/:videoId/new` - Create new transcript
- `/youtube/:videoId/edit` - Edit existing transcript
- `/typos` - View typo reports

## API Endpoints

### Transcripts
- `POST /api/transcripts` - Create transcript (authenticated)
- `GET /api/transcripts?page=1&limit=20` - List transcripts (authenticated)
- `PUT /api/transcripts` - Update transcript (authenticated)
- `GET /api/transcripts/:videoId` - Get single transcript (authenticated)

### Typo Reports
- `POST /api/typos` - Submit typo report (public)
- `GET /api/typos?page=1&limit=20` - List typo reports (authenticated)

## Database Schema

### Transcripts Collection
```typescript
{
  videoId: string;
  title: string;
  en: string; // SRT format subtitles
}
```

### Typo Reports Collection
```typescript
{
  videoId: string;
  timestamp: number;
  originalText: string;
  suggestedText: string;
  createdAt: Date;
}
```

## Deployment

### Netlify

1. Connect your repository to Netlify
2. Configure environment variables in Netlify dashboard
3. The `netlify.toml` is already configured
4. Deploy

Update WorkOS redirect URIs with your production domain:
```text
https://yourdomain.com/api/auth/callback
```

## Features in Detail

### Timestamp Sharing
Videos can be shared with specific timestamps using the `t` query parameter:
```text
/youtube/VIDEO_ID?t=123
```
The player will automatically start at the specified second.

### Typo Reporting
Users can report subtitle errors which are stored for review by authenticated users in the `/typos` dashboard.

### Authentication Flow
- WorkOS AuthKit handles authentication
- Middleware protects routes using middleware auth mode
- Sessions are encrypted in HTTP-only cookies
- MongoDB dependency works with Edge Functions via external bundling

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run linter
npm run format    # Format code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Submit a pull request

## Tech Stack

- Next.js 15.5
- React 19
- TypeScript
- Tailwind CSS v4
- ShadCN UI
- MagicUI
- Framer Motion

## License

MIT

## Author

Ragaeeb Haq

## Support

For issues and questions, visit [GitHub Issues](https://github.com/ragaeeb/nusus/issues)