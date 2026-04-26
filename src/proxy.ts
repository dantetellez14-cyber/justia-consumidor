import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes: welcome page, API analyze (demo), and static assets
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/analyze",
  "/api/complaint-stats",
  "/privacidad",
  "/terminos",
  "/empresa",
  // Cron/admin routes authenticate via CRON_SECRET header, not Clerk
  "/api/admin/(.*)",
  "/api/cron/(.*)",
  // Stripe webhook uses its own signature verification
  "/api/stripe/webhook",
  // Search and public data
  "/api/search-jurisprudencia",
  // Post-payment success page (handles its own auth state)
  "/pro/success",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and Sentry monitoring tunnel
    "/((?!monitoring|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
