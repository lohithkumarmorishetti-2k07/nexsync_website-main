const express = require("express");
const { loginUser } = require("../../controllers/auth-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const TeamMember = require("../../models/TeamMember");
const { getEffectivePermissions } = require("../../config/rbac");

const router = express.Router();

// Authentication endpoints (Registration completely removed; accounts are created by Coordinator only)
router.post("/login", loginUser);

router.get("/check-auth", authenticateMiddleware, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.user._id);
    if (!member || member.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Authenticated team member record not found or inactive",
      });
    }

    const effectivePermissions = getEffectivePermissions(member);

    res.status(200).json({
      success: true,
      message: "Team member is authenticated",
      data: {
        user: {
          _id: member._id,
          name: member.name,
          email: member.email,
          userName: member.name, // backward compatibility
          userEmail: member.email, // backward compatibility
          role: member.role,
          domain: member.domain,
          image: member.image || "",
          customPermissions: member.customPermissions || [],
          effectivePermissions,
        },
      },
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication check",
    });
  }
});

module.exports = router;
