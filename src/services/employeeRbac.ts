/**
 * Central RBAC role mapping for the BEL Trust Platform.
 *
 * Roles come from the `employees` Firestore collection (imported from the
 * Excel dataset: Role column values "Admin" / "Manager" / "Auditor" /
 * "Employee") or from legacy `users/{uid}` profiles. This module is the
 * single source of truth used by the login flow when choosing which
 * dashboard every one of the 500 employees lands on:
 *
 *   Admin / Administrator / Security Officer -> /bel     (Admin dashboard)
 *   Manager                                  -> /manager (Manager dashboard)
 *   Auditor                                  -> /auditor (Auditor dashboard)
 *   Employee / Engineer / User / Default     -> /user    (User dashboard)
 */

export type BelRoleKey = 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'EMPLOYEE';

/** Role strings that unlock the Admin dashboard (/bel). */
const ADMIN_ROLE_KEYS = new Set(['ADMIN', 'ADMINISTRATOR', 'SECURITY OFFICER']);

/** Role strings that unlock the Manager dashboard (/manager). */
const MANAGER_ROLE_KEYS = new Set(['MANAGER', 'OPERATIONS MANAGER']);

/** Role strings that unlock the Auditor dashboard (/auditor). */
const AUDITOR_ROLE_KEYS = new Set(['AUDITOR']);

/** Normalize any stored/legacy role string into a canonical BEL role key. */
export function normalizeBelRole(role?: string | null): BelRoleKey {
  const normalized = (role || '').trim().toUpperCase();
  if (ADMIN_ROLE_KEYS.has(normalized)) return 'ADMIN';
  if (MANAGER_ROLE_KEYS.has(normalized)) return 'MANAGER';
  if (AUDITOR_ROLE_KEYS.has(normalized)) return 'AUDITOR';
  return 'EMPLOYEE';
}

/** True when the role maps to the Admin dashboard. */
export function isRbacAdmin(role?: string | null): boolean {
  return normalizeBelRole(role) === 'ADMIN';
}

/** True when the role maps to the Manager dashboard. */
export function isRbacManager(role?: string | null): boolean {
  return normalizeBelRole(role) === 'MANAGER';
}

/** True when the role maps to the Auditor dashboard. */
export function isRbacAuditor(role?: string | null): boolean {
  return normalizeBelRole(role) === 'AUDITOR';
}

/** True when the role resolves to the standard User/Employee portal. */
export function isRbacEmployee(role?: string | null): boolean {
  return normalizeBelRole(role) === 'EMPLOYEE';
}

export type DashboardRoute = '/bel' | '/manager' | '/auditor' | '/user';

/** Map a canonical role key to its dashboard route. */
export function getRouteForRoleKey(roleKey: BelRoleKey): DashboardRoute {
  switch (roleKey) {
    case 'ADMIN':
      return '/bel';
    case 'MANAGER':
      return '/manager';
    case 'AUDITOR':
      return '/auditor';
    default:
      return '/user';
  }
}

/**
 * Route of the correct dashboard for a role.
 *   Admin      -> /bel      (Admin dashboard)
 *   Manager    -> /manager  (Manager dashboard)
 *   Auditor    -> /auditor  (Auditor dashboard)
 *   everything -> /user     (User/Employee portal)
 */
export function getDashboardRouteForRole(role?: string | null): DashboardRoute {
  return getRouteForRoleKey(normalizeBelRole(role));
}

/** Human-readable label describing which portal a role lands on. */
export function getDashboardLabelForRole(role?: string | null): string {
  switch (normalizeBelRole(role)) {
    case 'ADMIN':
      return 'Admin dashboard (/bel)';
    case 'MANAGER':
      return 'Manager dashboard (/manager)';
    case 'AUDITOR':
      return 'Auditor dashboard (/auditor)';
    default:
      return 'User dashboard (/user)';
  }
}
