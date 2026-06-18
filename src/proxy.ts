import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/dashboard(.*)'
])

const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/clerk(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");
  const mockUserId = req.headers.get("x-mock-user-id") || req.cookies.get("x-mock-user-id")?.value;

  if (isMockEnabled && mockUserId) {
    return;
  }

  if (isProtectedRoute(req) && !isWebhookRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
}
