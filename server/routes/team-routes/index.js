const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth-middleware");
const { requirePermission, requireCoordinator, PERMISSIONS } = require("../../middleware/rbac-middleware");
const controller = require("../../controllers/team-controller");

// Public routes
router.get("/", controller.listTeamMembers);
router.get("/:id", controller.getTeamMember);

// Protected Coordinator-only routes (Strictly Club Coordinator)
router.get(
  "/admin/all",
  authenticate,
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  controller.listAdminTeamMembers
);

router.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  controller.createTeamMember
);

router.put(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  controller.updateTeamMember
);

router.put(
  "/:id/archive",
  authenticate,
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  controller.archiveTeamMember
);

router.put(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  controller.restoreTeamMember
);

router.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  controller.deleteTeamMember
);

// Coordinator permission management for Executive & Wing Members
router.put(
  "/:id/permissions",
  authenticate,
  requirePermission(PERMISSIONS.PERMISSIONS_MANAGE),
  controller.updateMemberPermissions
);

module.exports = router;
