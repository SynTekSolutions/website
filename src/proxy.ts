import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest, NextFetchEvent } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/dashboard(.*)'
])

const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/clerk(.*)'
])

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isWebhookRoute(req)) {
    await auth.protect()
  }
})

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

  if (isMockEnabled) {
    const mockUserId = req.headers.get("x-mock-user-id") || req.cookies.get("x-mock-user-id")?.value;
    const isProtected = isProtectedRoute(req) && !isWebhookRoute(req);

    if (isProtected && !mockUserId) {
      const redirectUrl = new URL('/sign-in', req.url);
      redirectUrl.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  return clerk(req, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
}

