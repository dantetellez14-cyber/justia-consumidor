import type { Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";

/**
 * Sign in to the app as the configured E2E test user.
 *
 * Requires environment variables:
 *   - TEST_USER_EMAIL
 *   - TEST_USER_PASSWORD
 *
 * Setup steps (one-time):
 *   1. In Clerk dashboard (Test mode), create a user with a known email/
 *      password (e.g. test+e2e@justia.local).
 *   2. Add TEST_USER_EMAIL and TEST_USER_PASSWORD to GitHub repository
 *      Secrets.
 *   3. Inject them into the e2e job env (already wired in
 *      .github/workflows/e2e.yml).
 *   4. Remove the `test.fixme` markers from the tests that should run
 *      (search for "TODO(auth-tests)").
 *
 * Usage:
 *   import { signInAsTestUser } from "../helpers/auth";
 *
 *   test("...", async ({ page }) => {
 *     await signInAsTestUser(page);
 *     await page.goto("/mis-casos");
 *     // ...
 *   });
 *
 * Why this is needed:
 *   `setupClerkTestingToken` alone only bypasses Clerk's bot-detection —
 *   it does NOT establish a session. Authenticated tests need an actual
 *   sign-in. This helper wraps both calls so callers always do the right
 *   thing.
 */
export async function signInAsTestUser(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "signInAsTestUser: TEST_USER_EMAIL and TEST_USER_PASSWORD must be set. " +
        "See e2e/helpers/auth.ts for setup instructions."
    );
  }

  await setupClerkTestingToken({ page });
  // Navigate to a page that mounts Clerk before signing in.
  await page.goto("/");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password,
    },
  });
}
