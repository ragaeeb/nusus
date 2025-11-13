# AI Agent Guidelines for Nuṣūṣ

This document outlines conventions and best practices for AI agents working with the Nuṣūṣ codebase.

## Project Overview

Nuṣūṣ is a Next.js 15 application for enhanced YouTube subtitle viewing, built with:
- **Runtime**: Bun (>=1.3.0)
- **Framework**: Next.js 15 with App Router and Typed Routes
- **Language**: TypeScript with strict typing
- **Database**: MongoDB
- **Authentication**: WorkOS AuthKit
- **Styling**: Tailwind CSS v4
- **Testing**: Bun test runner

## Code Style & Conventions

### TypeScript

1. **Strict Type Safety**
   - Always use explicit types, avoid `any`
   - Prefer type inference where obvious
   - Use `type` over `interface` for consistency
   - Example pattern:
     ```typescript
     type User = { id: string; email: string };
     type PageProps = { params: Promise<{ videoId: string }> };
     ```

2. **Naming Conventions**
   - Components: PascalCase (`VideoPlayer`, `SubtitleDisplay`)
   - Files: kebab-case for utilities (`use-youtube-player.ts`), PascalCase for components
   - Variables/functions: camelCase (`getCurrentTime`, `isPlaying`)
   - Constants: UPPER_SNAKE_CASE only for true constants
   - Private refs: suffix with `Ref` (`playerRef`, `intervalRef`)

3. **Import Organization**
   - External packages first
   - Internal absolute imports (`@/...`) second
   - Relative imports last
   - Group by: React/Next, third-party libraries, UI components, utilities, types

### React Patterns

1. **Server Components by Default**
   - Use Server Components unless client interactivity is needed
   - Add `'use client'` directive only when necessary
   - Prefer server actions over client-side API calls

2. **Client Components**
   - Always use `'use client'` directive at top of file
   - Memoize expensive components with `memo()`
   - Use `useCallback` for event handlers passed as props
   - Use `useMemo` for expensive computations
   - Example:
     ```typescript
     export const SubtitleDisplay = memo(({ subtitle, onReportTypo }: Props) => {
       // component logic
     });
     ```

3. **Hooks**
   - Custom hooks prefix: `use` (e.g., `useYouTubePlayer`)
   - Store cleanup functions in refs
   - Return stable references (use `useCallback`)
   - Document complex hook behavior

### API Routes

1. **Structure**
   - Use route handlers (not pages)
   - Export named HTTP method functions: `GET`, `POST`, `PUT`, `DELETE`
   - Always validate authentication first
   - Return consistent error format: `{ error: string }`

2. **Error Handling Pattern**
   ```typescript
   try {
     const { user } = await withAuth();
     if (!user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     // business logic
   } catch (error) {
     console.error('Error description:', error);
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
   ```

3. **Authentication**
   - Use `withAuth()` from WorkOS for protected routes
   - Check `user` existence before proceeding
   - Use `{ ensureSignedIn: true }` in pages for automatic redirect

### Database Patterns

1. **MongoDB Access**
   - Always use `clientPromise` singleton
   - Database name: `'nusus'`
   - Remove `_id` before returning to client:
     ```typescript
     const { _id, ...cleanData } = document;
     return cleanData;
     ```

2. **Collections**
   - `transcripts`: Video subtitles
   - `typo_reports`: User-reported corrections
   - Use consistent field names across codebase

3. **Pagination**
   - Default limit: 20
   - Calculate skip: `(page - 1) * limit`
   - Return pagination metadata:
     ```typescript
     { page, limit, total, totalPages: Math.ceil(total / limit) }
     ```

## Testing Conventions

### Test Structure

1. **File Naming**
   - Test files: `*.test.ts` or `*.test.tsx`
   - Co-locate tests with source files

2. **Test Organization**
   ```typescript
   describe('module-name', () => {
     beforeEach(() => {
       // reset mocks
     });

     describe('functionName', () => {
       it('should handle specific case', () => {
         // arrange
         // act
         // assert
       });
     });
   });
   ```

3. **Test Naming**
   - Use `it('should ...')` convention
   - Be specific about behavior being tested
   - One assertion per test when possible

### Mocking Patterns

1. **Module Mocks**
   ```typescript
   const mockFunction = mock();
   mock.module('module-name', () => ({
     export: mockFunction,
   }));
   ```

2. **MongoDB Mocks**
   - Mock chain methods: `find().sort().skip().limit().toArray()`
   - Reset all mocks in `beforeEach()`
   - Example:
     ```typescript
     const mockToArray = mock().mockResolvedValue([]);
     const mockLimit = mock(() => ({ toArray: mockToArray }));
     const mockSkip = mock(() => ({ limit: mockLimit }));
     ```

3. **Authentication Mocks**
   ```typescript
   mockWithAuth.mockResolvedValue({ user: { id: 'user1' } });
   // or for unauthorized
   mockWithAuth.mockResolvedValue({ user: null });
   ```

## Component Patterns

### UI Components

1. **Styling**
   - Use Tailwind utility classes exclusively
   - No custom CSS unless absolutely necessary
   - Gradient backgrounds: `bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950`
   - Card styling: `bg-slate-900/50 backdrop-blur-xl border-slate-800`

2. **MagicUI Components**
   - Use MagicCard for elevated content blocks
   - Use AuroraText for main headings
   - Use RainbowButton for primary actions

3. **Accessibility**
   - Always include ARIA labels for icon-only buttons
   - Use semantic HTML elements
   - Ensure keyboard navigation works

### Forms

1. **Pattern**
   ```typescript
   const handleSubmit = useCallback(async (e: React.FormEvent) => {
     e.preventDefault();
     // validation
     // API call
     // navigation/feedback
   }, [dependencies]);
   ```

2. **Error Handling**
   - Show error messages inline
   - Use controlled components for form fields
   - Disable submit button while loading

## File Organization

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── transcripts/   # Transcript CRUD
│   │   └── typos/         # Typo reports
│   ├── dashboard/         # Admin pages
│   ├── youtube/           # Video viewer pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and core logic
└── types/                 # TypeScript type definitions
```

## Common Tasks

### Adding a New API Route

1. Create route handler in `app/api/[name]/route.ts`
2. Export HTTP method functions
3. Add authentication check
4. Validate input
5. Handle errors consistently
6. Create corresponding test file
7. Add types to `types/` if needed

### Adding a New Page

1. Create page in appropriate `app/` directory
2. Use Server Components when possible
3. Add `'use client'` only if needed
4. Implement proper loading states
5. Add error boundaries if needed
6. Test with different auth states

### Modifying Database Schema

1. Update types in `lib/db.ts`
2. Create/update indexes in `initDB()`
3. Update API routes that use the collection
4. Add migration logic if needed for existing data
5. Update tests

## Performance Considerations

1. **Caching**
   - Use React's `cache()` for server-side data fetching
   - Example: `getCachedTranscript` in `lib/caching.ts`

2. **Optimization**
   - Lazy load heavy components
   - Use dynamic imports for large dependencies
   - Minimize client-side JavaScript
   - Prefer server components over client components

3. **Database**
   - Create indexes for frequently queried fields
   - Use projection to limit returned fields
   - Implement pagination for large datasets

## Common Pitfalls to Avoid

1. **Authentication**
   - Don't skip authentication checks in protected routes
   - Always verify user exists before proceeding
   - Remember middleware doesn't protect API routes by default

2. **MongoDB**
   - Don't forget to remove `_id` from responses
   - Always handle connection errors
   - Don't expose raw error messages to clients

3. **React**
   - Don't use client components unnecessarily
   - Avoid inline function definitions in render
   - Remember to cleanup effects (intervals, listeners)

4. **TypeScript**
   - Don't use `any` type
   - Don't ignore type errors with `@ts-ignore`
   - Use Promise types for async params

## Code Quality

### Before Committing

1. Run tests: `bun test`
2. Run linter: `bun run lint`
3. Format code: `bun run format`
4. Verify build: `bun run build`

### Writing Clean Code

1. Functions should be small and focused
2. Use descriptive variable names
3. Extract magic numbers into named constants
4. Add comments only for complex logic
5. Keep components under 200 lines
6. Prefer composition over inheritance

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [WorkOS AuthKit](https://workos.com/docs/authkit)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Bun Documentation](https://bun.sh/docs)

## Getting Help

When encountering issues:
1. Check existing tests for patterns
2. Review similar components/routes in codebase
3. Consult documentation links above
4. Ensure environment variables are set correctly
5. Check MongoDB connection status
