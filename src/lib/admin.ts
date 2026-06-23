export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Administrator',
  SECURITY_ADMIN: 'Security Administrator',
  READ_ONLY: 'Read-only Analyst',
} as const;

export type AdminRoleType = keyof typeof ROLE_LABELS;

export const STATUS_LABELS = {
  ACTIVE: 'Active',
  LOCKED: 'Locked',
  DISABLED: 'Disabled',
} as const;

export type AdminStatusType = keyof typeof STATUS_LABELS;

export const STATUS_COLORS = {
  ACTIVE: 'bg-green-50 text-green-700 border border-green-200/50',
  LOCKED: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  DISABLED: 'bg-red-50 text-red-700 border border-red-200/50',
} as const;

/**
 * Returns a relative time string (e.g. "10 mins ago", "3 hours ago", "Never")
 * for a given date.
 */
export function formatLastLogin(lastLoginAt: string | Date | null | undefined): string {
  if (!lastLoginAt) {
    return 'Never';
  }

  const date = new Date(lastLoginAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(diffMs)) {
    return 'Never';
  }

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) {
    return 'just now';
  }

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}
