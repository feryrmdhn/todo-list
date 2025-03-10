import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function getAuthUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return null;
        }

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        // Verify token
        const decoded = verify(token, process.env.JWT_SECRET) as { id: string };

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: Number(decoded.id) }
        });

        return user;
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}