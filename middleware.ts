import { NextResponse, NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register'
];

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Check if path is public
    const isPublicPath = publicPaths.some(pp =>
        path === pp || path.startsWith(`${pp}/`)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;

    // If no token, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(path), request.url));
    }

    try {
        // Verify token, check if JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        verify(token, process.env.JWT_SECRET);
        return NextResponse.next();
    } catch (error) {
        console.error('Invalid token:', error);
        return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(path), request.url));
    }
}


export const config = {
    matcher: [
        // Protect these paths
        '/dashboard/:path*',
        '/tasks/:path*',
        '/api/tasks/:path*',
        // Exclude static files
        '/((?!_next/static|favicon.ico).*)'
    ]
};