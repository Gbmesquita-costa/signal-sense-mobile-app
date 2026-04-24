import type { Router } from "expo-router";

/**
 * Navigate to a route without creating duplicate screens.
 *
 * Uses router.navigate which, unlike router.push, reuses an existing
 * screen in the stack instead of pushing a new instance on top.
 * This natively prevents the "settings on top of settings" problem
 * without any locks or timeouts.
 */
function safePush(router: Router, path: string): void {
  router.navigate(path as never);
}

export { safePush };
