const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth-middleware");
const { requirePermission, PERMISSIONS } = require("../../middleware/rbac-middleware");
const controller = require("../../controllers/project-controller");

// Public routes
router.get("/", controller.listProjects);
router.get("/:id", controller.getProject);

// Protected Admin/Management routes with granular RBAC
router.get("/admin/all", authenticate, controller.listAdminProjects);

router.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.PROJECTS_CREATE),
  controller.createProject
);

router.put(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PROJECTS_UPDATE),
  controller.updateProject
);

router.put(
  "/:id/archive",
  authenticate,
  requirePermission(PERMISSIONS.PROJECTS_DELETE),
  controller.archiveProject
);

router.put(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.PROJECTS_UPDATE),
  controller.restoreProject
);

router.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PROJECTS_DELETE),
  controller.deleteProject
);

module.exports = router;
