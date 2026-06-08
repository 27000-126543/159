export type UserRole = 'supplier' | 'buyer' | 'manager' | 'director' | 'ceo' | 'finance' | 'quality' | 'admin';

export interface PermissionConfig {
  role: UserRole;
  level: number;
  name: string;
  permissions: string[];
}

export const ROLE_LEVELS: Record<UserRole, number> = {
  supplier: 1,
  buyer: 2,
  finance: 2,
  quality: 2,
  manager: 3,
  director: 4,
  ceo: 5,
  admin: 6,
};

export const ROLE_NAMES: Record<UserRole, string> = {
  supplier: '供应商',
  buyer: '采购员',
  manager: '采购经理',
  director: '采购总监',
  ceo: 'CEO',
  finance: '财务专员',
  quality: '质量专员',
  admin: '系统管理员',
};

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['buyer', 'manager', 'director', 'ceo', 'admin'],
  '/suppliers': ['buyer', 'manager', 'director', 'ceo', 'admin'],
  '/suppliers/register': ['supplier', 'admin'],
  '/suppliers/:id': ['buyer', 'manager', 'director', 'ceo', 'admin'],
  '/inquiries': ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance', 'admin'],
  '/inquiries/:id': ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance', 'admin'],
  '/orders': ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance', 'admin'],
  '/orders/:id': ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance', 'admin'],
  '/approval': ['manager', 'director', 'ceo', 'finance', 'admin'],
  '/customs': ['buyer', 'manager', 'director', 'ceo', 'admin'],
  '/logistics': ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance', 'admin'],
  '/quality': ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance', 'admin'],
  '/settlement': ['finance', 'manager', 'director', 'ceo', 'supplier', 'admin'],
  '/settings': ['ceo', 'admin'],
};

export function hasPermission(
  userRole: UserRole | undefined,
  requiredPermission: string | string[],
): boolean {
  if (!userRole) return false;

  const userLevel = ROLE_LEVELS[userRole];
  if (!userLevel) return false;

  const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

  return permissions.every((permission) => {
    const requiredRole = permission as UserRole;
    const requiredLevel = ROLE_LEVELS[requiredRole];
    if (requiredLevel) {
      return userLevel >= requiredLevel;
    }
    return false;
  });
}

function matchRoutePattern(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, index) => {
    if (part.startsWith(':')) return true;
    return part === pathParts[index];
  });
}

export function canAccessRoute(
  userRole: UserRole | undefined,
  routePath: string,
): boolean {
  if (!userRole) return false;

  const matchedPattern = Object.keys(ROUTE_PERMISSIONS).find((pattern) =>
    matchRoutePattern(pattern, routePath),
  );

  if (!matchedPattern) {
    return true;
  }

  const allowedRoles = ROUTE_PERMISSIONS[matchedPattern];
  return allowedRoles.includes(userRole);
}

export function getHigherRoles(role: UserRole): UserRole[] {
  const currentLevel = ROLE_LEVELS[role];
  return (Object.keys(ROLE_LEVELS) as UserRole[]).filter(
    (r) => ROLE_LEVELS[r] > currentLevel,
  );
}

export function getLowerRoles(role: UserRole): UserRole[] {
  const currentLevel = ROLE_LEVELS[role];
  return (Object.keys(ROLE_LEVELS) as UserRole[]).filter(
    (r) => ROLE_LEVELS[r] < currentLevel,
  );
}

export function canApproveOrder(
  userRole: UserRole | undefined,
  orderAmount: number,
): boolean {
  if (!userRole) return false;

  const level = ROLE_LEVELS[userRole];

  if (level >= ROLE_LEVELS.ceo) return true;
  if (level >= ROLE_LEVELS.director && orderAmount > 100000) return true;
  if (level >= ROLE_LEVELS.manager) return orderAmount <= 100000;

  return false;
}

export function getApprovalRole(amount: number): UserRole {
  if (amount > 100000) return 'ceo';
  return 'manager';
}
