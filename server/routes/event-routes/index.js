const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth-middleware");
const adminOnly = require("../../middleware/admin-middleware");
const controller = require("../../controllers/event-controller");

router.get("/", controller.listEvents);
router.get("/:id", controller.getEvent);

router.post("/", authenticate, adminOnly, controller.createEvent);
router.put("/:id", authenticate, adminOnly, controller.updateEvent);
router.delete("/:id", authenticate, adminOnly, controller.deleteEvent);

module.exports = router;
