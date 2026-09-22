const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../../controllers/auth-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const User = require("../../models/User");
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-auth", authenticateMiddleware, async (req, res) => {
  try {
    // Fetch latest user data from database to get updated role
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User is authenticated",
      data: {
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Temp endpoint to make a user admin (for testing)
router.post("/make-admin/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOneAndUpdate(
      { userEmail: email },
      { role: "admin" },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated to admin",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
});

module.exports = router;
