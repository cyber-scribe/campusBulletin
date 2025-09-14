export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const NOTICE_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
} as const;

export type NoticeStatus = typeof NOTICE_STATUS[keyof typeof NOTICE_STATUS];

export const hasRole = (userRoles: string[], role: Role): boolean => {
  return userRoles.includes(role);
};

export const hasAnyRole = (userRoles: string[], roles: Role[]): boolean => {
  return userRoles.some(role => roles.includes(role as Role));
};