const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth-middleware");
const adminOnly = require("../../middleware/admin-middleware");
const controller = require("../../controllers/project-controller");

// Public routes
router.get("/", controller.listProjects);
router.get("/:id", controller.getProject);

// Admin routes
router.post("/", authenticate, adminOnly, controller.createProject);
router.put("/:id", authenticate, adminOnly, controller.updateProject);
router.delete("/:id", authenticate, adminOnly, controller.deleteProject);

module.exports = router;
