const { hasPermission, isCoordinatorRole, PERMISSIONS } = require("../config/rbac");
const TeamMember = require("../models/TeamMember");

/**
 * Middleware generator: requires the authenticated team member to possess a specific permission.
 * Resolves fresh team member state and custom permissions from database.
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Fetch fresh team member profile to ensure up-to-date role & custom permissions
      const freshMember = await TeamMember.findById(req.user._id).select(
        "role customPermissions name email domain isArchived"
      );

      if (!freshMember || freshMember.isArchived) {
        return res.status(401).json({
          success: false,
          message: "Team member account no longer exists or is archived",
        });
      }

      req.currentUser = freshMember;

      if (!hasPermission(freshMember, permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires '${permission}' permission.`,
        });
      }

      next();
    } catch (error) {
      console.error("RBAC middleware authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check error",
      });
    }
  };
};

/**
 * Strict Club Coordinator middleware
 * Ensures ONLY Club Coordinators (or system admin during migration) can access
 */
const requireCoordinator = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const freshMember = await TeamMember.findById(req.user._id).select(
      "role customPermissions name email domain isArchived"
    );

    if (!freshMember || freshMember.isArchived) {
      return res.status(401).json({
        success: false,
        message: "Team member account no longer exists or is archived",
      });
    }

    req.currentUser = freshMember;

    if (!isCoordinatorRole(freshMember.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Exclusive Club Coordinator authority required.",
      });
    }

    next();
  } catch (error) {
    console.error("Coordinator check error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check error",
    });
  }
};

module.exports = {
  requirePermission,
  requireCoordinator,
  PERMISSIONS,
};
