import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
  "/offline",
  // Cron/admin API routes authenticate via CRON_SECRET or ADMIN_SECRET header
  "/api/admin/(.*)",
  "/api/cron/(.*)",
  // Stripe webhook uses its own signature verification
  "/api/stripe/webhook",
  // Search and public data
  "/api/search-jurisprudencia",
  // Post-payment success page (handles its own auth state)
  "/pro/success",
]);

// Admin UI pages require both authentication AND admin role
const isAdminPage = createRouteMatcher(["/admin(.*)"]);

function isAdminUser(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminIds.includes(userId);
}

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  // Require Clerk session for all non-public routes
  await auth.protect();

  // Admin pages: redirect non-admin users to home instead of showing the UI
  if (isAdminPage(request)) {
    const { userId } = await auth();
    if (!userId || !isAdminUser(userId)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
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
