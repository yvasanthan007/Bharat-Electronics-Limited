/**
 * Central RBAC role mapping for the BEL Trust Platform.
 *
 * Roles come from the `employees` Firestore collection (imported from the
 * Excel dataset: Role column values "Admin" / "Manager" / "Employee") or from
 * legacy `users/{uid}` profiles. This module is the single source of truth
 * used by the login flow when choosing which existing dashboard to open:
 *
 *   Admin  -> /bel   (existing Admin dashboard)
 *   Manager-> /user  (existing Employee/User portal)
 *   Employee -> /user (existing Employee/User portal)
 */

export type BelRoleKey = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

/** Role strings that unlock the Admin dashboard (/bel). */
const ADMIN_ROLE_KEYS = new Set(['ADMIN', 'ADMINISTRATOR', 'SECURITY OFFICER']);

/** Role strings treated as Manager level (same portal as employees). */
const MANAGER_ROLE_KEYS = new Set(['MANAGER']);

/** Normalize any stored/legacy role string into a canonical BEL role key. */
export function normalizeBelRole(role?: string | null): BelRoleKey {
  const normalized = (role || '').trim().toUpperCase();
  if (ADMIN_ROLE_KEYS.has(normalized)) return 'ADMIN';
  if (MANAGER_ROLE_KEYS.has(normalized)) return 'MANAGER';
  return 'EMPLOYEE';
}

/** True when the role maps to the Admin dashboard. */
export function isRbacAdmin(role?: string | null): boolean {
  return normalizeBelRole(role) === 'ADMIN';
}

/**
 * Route of the correct *existing* dashboard for a role.
 * Visually unchanged: /bel is the Admin dashboard, /user the employee portal.
 */
export function getDashboardRouteForRole(role?: string | null): '/bel' | '/user' {
  return isRbacAdmin(role) ? '/bel' : '/user';
}
