import { type NextRequest } from 'next/server';
import updateSession from '../../middleware';

export async function middleware(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
