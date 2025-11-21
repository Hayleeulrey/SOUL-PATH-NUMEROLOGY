import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sacred-science",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    return
  }

  // Protect all other routes (especially /lineage and /api)
  await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
