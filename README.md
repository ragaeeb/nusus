# Nusus

[https://nusus.netlify.app](Demo)

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/ed234cdd-0063-4e9d-a56a-0cd6d944b633.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/ed234cdd-0063-4e9d-a56a-0cd6d944b633)
[![Netlify Status](https://api.netlify.com/api/v1/badges/d4e114c7-92ce-4f4a-837f-a9583e0dc1aa/deploy-status)](https://app.netlify.com/projects/nusus/deploys)
[![codecov](https://codecov.io/gh/ragaeeb/nusus/graph/badge.svg?token=Y6VM7I9VL9)](https://codecov.io/gh/ragaeeb/nusus)
[![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)](https://www.typescriptlang.org)
[![Node.js CI](https://github.com/ragaeeb/nusus/actions/workflows/build.yml/badge.svg)](https://github.com/ragaeeb/nusus/actions/workflows/build.yml)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![GitHub License](https://img.shields.io/github/license/ragaeeb/nusus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A NextJS 15 app for YouTube videos with enhanced subtitle overlays.

## Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Features

- YouTube URL input with validation
- Real-time subtitle synchronization
- Toggle subtitle position (overlay/below video)
- Beautiful UI with MagicUI components
- Optimized re-renders

## Structure

```
app/
├── page.tsx              # Main page
├── layout.tsx            # Root layout
├── globals.css           # Global styles
└── api/
    └── subtitles/
        └── route.ts      # Subtitle API
components/
└── ui/
    ├── border-beam.tsx   # MagicUI component
    └── shimmer-button.tsx # MagicUI component
lib/
└── utils.ts              # Utilities
```

## ShadCN Components Required

Install the following ShadCN components:

```bash
npx shadcn@latest add input button card label radio-group
```

## Tech Stack

- Next.js 15.5
- React 19
- TypeScript
- Tailwind CSS v4
- ShadCN UI
- MagicUI
- Framer Motion
