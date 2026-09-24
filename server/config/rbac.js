// Centralized Role-Based Access Control (RBAC) System
// NexSync Autonomous Mobility Platform

const ROLES = {
  COORDINATOR: "Club Coordinator",
  EXECUTIVE: "Executive Member",
  WING_MEMBER: "Wing Member",
  ALUMNI: "Alumni",
};

const PERMISSIONS = {
  // Projects permissions
  PROJECTS_CREATE: "projects:create",
  PROJECTS_UPDATE: "projects:update",
  PROJECTS_DELETE: "projects:delete",

  // Events permissions
  EVENTS_CREATE: "events:create",
  EVENTS_UPDATE: "events:update",
  EVENTS_DELETE: "events:delete",

  // Team management (STRICT: Club Coordinator only)
  TEAM_MANAGE: "team:manage",

  // Permission assignment (STRICT: Club Coordinator only)
  PERMISSIONS_MANAGE: "permissions:manage",
};

// Default permission presets per role
const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.COORDINATOR]: [
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.PERMISSIONS_MANAGE,
  ],
  [ROLES.EXECUTIVE]: [
    // Executive Members: default project and event management
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.EVENTS_DELETE,
  ],
  [ROLES.WING_MEMBER]: [
    // Wing Members: read-only by default, 0 default management permissions
  ],
  [ROLES.ALUMNI]: [
    // Alumni: read-only
  ],
};

// Coordinator-only permissions that CANNOT be granted to Executive or Wing Members
const RESTRICTED_COORDINATOR_PERMISSIONS = [
  PERMISSIONS.TEAM_MANAGE,
  PERMISSIONS.PERMISSIONS_MANAGE,
];

/**
 * Check if a role is Club Coordinator (supports legacy 'admin' during transition)
 */
const isCoordinatorRole = (role) => {
  return role === ROLES.COORDINATOR || role === "admin";
};

/**
 * Compute the effective permissions for a team member given their role and custom overrides.
 */
const getEffectivePermissions = (member) => {
  if (!member) return [];

  const role = member.role || ROLES.WING_MEMBER;

  // Club Coordinator always has all permissions
  if (isCoordinatorRole(role)) {
    return Object.values(PERMISSIONS);
  }

  const basePermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
  const customPermissions = Array.isArray(member.customPermissions)
    ? member.customPermissions
    : [];

  // Union base and custom permissions, but filter out coordinator-exclusive permissions
  const combined = new Set([...basePermissions, ...customPermissions]);

  // Enforce restriction: never allow non-coordinators to have coordinator permissions
  RESTRICTED_COORDINATOR_PERMISSIONS.forEach((p) => combined.delete(p));

  return Array.from(combined);
};

/**
 * Verify whether a member possesses a specific permission
 */
const hasPermission = (member, requiredPermission) => {
  if (!member) return false;
  if (isCoordinatorRole(member.role)) return true;

  const effective = getEffectivePermissions(member);
  return effective.includes(requiredPermission);
};

/**
 * Validate permission assignment to ensure non-coordinators cannot receive restricted permissions.
 */
const filterAssignablePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter(
    (p) =>
      Object.values(PERMISSIONS).includes(p) &&
      !RESTRICTED_COORDINATOR_PERMISSIONS.includes(p)
  );
};

module.exports = {
  ROLES,
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  RESTRICTED_COORDINATOR_PERMISSIONS,
  isCoordinatorRole,
  getEffectivePermissions,
  hasPermission,
  filterAssignablePermissions,
};
