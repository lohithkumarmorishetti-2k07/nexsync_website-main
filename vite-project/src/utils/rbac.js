// Frontend Centralized Role-Based Access Control (RBAC) Utilities
// NexSync Autonomous Mobility Platform

export const ROLES = {
  COORDINATOR: "Club Coordinator",
  EXECUTIVE: "Executive Member",
  WING_MEMBER: "Wing Member",
  ADMIN: "admin",
  MEMBER: "member",
  USER: "user",
};

export const PERMISSIONS = {
  // Projects
  PROJECTS_CREATE: "projects:create",
  PROJECTS_UPDATE: "projects:update",
  PROJECTS_DELETE: "projects:delete",

  // Events
  EVENTS_CREATE: "events:create",
  EVENTS_UPDATE: "events:update",
  EVENTS_DELETE: "events:delete",

  // Team (Coordinator only)
  TEAM_MANAGE: "team:manage",

  // Permissions (Coordinator only)
  PERMISSIONS_MANAGE: "permissions:manage",
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.PROJECTS_CREATE]: "Create Projects",
  [PERMISSIONS.PROJECTS_UPDATE]: "Edit / Update Projects",
  [PERMISSIONS.PROJECTS_DELETE]: "Archive / Delete Projects",
  [PERMISSIONS.EVENTS_CREATE]: "Create Events",
  [PERMISSIONS.EVENTS_UPDATE]: "Edit / Update Events",
  [PERMISSIONS.EVENTS_DELETE]: "Archive / Delete Events",
};

/**
 * Check if the user is a Club Coordinator or legacy admin
 */
export const isCoordinator = (user) => {
  if (!user) return false;
  return user.role === ROLES.COORDINATOR || user.role === ROLES.ADMIN;
};

/**
 * Check if a user possesses a specific permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (isCoordinator(user)) return true;

  const effective = Array.isArray(user.effectivePermissions)
    ? user.effectivePermissions
    : [];

  // Also check customPermissions array if effectivePermissions isn't precomputed
  const custom = Array.isArray(user.customPermissions)
    ? user.customPermissions
    : [];

  return effective.includes(permission) || custom.includes(permission);
};

/**
 * High-level capability checks
 */
export const canViewAdmin = (user) => {
  if (!user) return false;
  if (isCoordinator(user)) return true;
  if (user.role === ROLES.EXECUTIVE) return true;
  // Wing Member can view admin if they have any permissions assigned
  const effective = Array.isArray(user.effectivePermissions)
    ? user.effectivePermissions
    : [];
  return effective.length > 0;
};

export const canManageTeam = (user) => {
  return isCoordinator(user) || hasPermission(user, PERMISSIONS.TEAM_MANAGE);
};

export const canCreateProjects = (user) => {
  return hasPermission(user, PERMISSIONS.PROJECTS_CREATE);
};

export const canUpdateProjects = (user) => {
  return hasPermission(user, PERMISSIONS.PROJECTS_UPDATE);
};

export const canDeleteProjects = (user) => {
  return hasPermission(user, PERMISSIONS.PROJECTS_DELETE);
};

export const canCreateEvents = (user) => {
  return hasPermission(user, PERMISSIONS.EVENTS_CREATE);
};

export const canUpdateEvents = (user) => {
  return hasPermission(user, PERMISSIONS.EVENTS_UPDATE);
};

export const canDeleteEvents = (user) => {
  return hasPermission(user, PERMISSIONS.EVENTS_DELETE);
};
