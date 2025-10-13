import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

export const GET = async () => {
    try {
        const signInUrl = await getSignInUrl();
        console.log('Sign-in URL:', signInUrl);
        console.log('Redirect URI env:', process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI);
        return NextResponse.redirect(signInUrl);
    } catch (error) {
        console.error('Failed to get sign-in URL:', error);
        return NextResponse.json({ error: 'Failed to initialize sign-in' }, { status: 500 });
    }
};
