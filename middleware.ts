import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register'
]

// Function to convert JWT_SECRET to CryptoKey
async function getSecretKey(): Promise<CryptoKey> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);  // UTF-8 encoding is crucial
    return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },  // HMAC algorithm for JWT
        true,
        ['verify', 'sign'] // Allowed usages for key. Needed sign for jwtSign if needed
    )
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    const isPublicPath = publicPaths.some(pp =>
        path === pp || path.startsWith(`${pp}/`)
    )

    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Handle Preflight Request (CORS)
    if (request.method === "OPTIONS") {
        return response
    }

    if (isPublicPath) {
        return NextResponse.next()
    }

    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;

    // If no token, redirect to login
    if (!token) {
        return NextResponse.redirect(
            new URL('/login?callbackUrl=' + encodeURIComponent(path), request.url)
        )
    }

    try {
        const secretKey = await getSecretKey()
        await jwtVerify(token, secretKey)

        return NextResponse.next()
    } catch (error) {
        console.error('Invalid token:', error)
        return NextResponse.redirect(
            new URL('/login?callbackUrl=' + encodeURIComponent(path), request.url)
        )
    }
}

export const config = {
    matcher: [
        // Protect these paths
        '/dashboard/:path*',
        '/api/auth/:path*',
        '/api/tasks/:path*',
        // Exclude static files
        '/((?!_next/static|favicon.ico).*)'
    ]
}