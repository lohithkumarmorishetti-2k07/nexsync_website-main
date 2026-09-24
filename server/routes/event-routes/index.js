const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth-middleware");
const { requirePermission, PERMISSIONS } = require("../../middleware/rbac-middleware");
const controller = require("../../controllers/event-controller");

// Public routes
router.get("/", controller.listEvents);
router.get("/:id", controller.getEvent);

// Protected Admin/Management routes with granular RBAC
router.get("/admin/all", authenticate, controller.listAdminEvents);

router.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.EVENTS_CREATE),
  controller.createEvent
);

router.put(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.EVENTS_UPDATE),
  controller.updateEvent
);

router.put(
  "/:id/archive",
  authenticate,
  requirePermission(PERMISSIONS.EVENTS_DELETE),
  controller.archiveEvent
);

router.put(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.EVENTS_UPDATE),
  controller.restoreEvent
);

router.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.EVENTS_DELETE),
  controller.deleteEvent
);

module.exports = router;
