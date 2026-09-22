const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth-middleware");
const adminOnly = require("../../middleware/admin-middleware");
const controller = require("../../controllers/team-controller");

router.get("/", controller.listTeamMembers);
router.get("/:id", controller.getTeamMember);

router.post("/", authenticate, adminOnly, controller.createTeamMember);
router.put("/:id", authenticate, adminOnly, controller.updateTeamMember);
router.delete("/:id", authenticate, adminOnly, controller.deleteTeamMember);

module.exports = router;
