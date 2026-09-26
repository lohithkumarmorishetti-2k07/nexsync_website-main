const TeamMember = require("../../models/TeamMember");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getEffectivePermissions } = require("../../config/rbac");

/**
 * Team Member Login
 * Authoritative authentication solely against TeamMember records.
 * Public registration is disabled; accounts are provisioned exclusively by Club Coordinator.
 */
const loginUser = async (req, res) => {
  try {
    const { userEmail, email, password } = req.body;
    const inputEmail = userEmail || email;

    if (!inputEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = inputEmail.toLowerCase().trim();

    // Query active team member including passwordHash (which is select: false by default)
    const member = await TeamMember.findOne({
      email: normalizedEmail,
      isArchived: { $ne: true },
    }).select("+passwordHash");

    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (member.isAlumni) {
      return res.status(403).json({
        success: false,
        message: "Alumni records do not possess dashboard login access.",
      });
    }

    if (!member.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Account has no login credentials assigned. Please contact the Club Coordinator.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, member.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const effectivePermissions = getEffectivePermissions(member);
    const secret = process.env.JWT_SECRET || "JWT_SECRET";

    const accessToken = jwt.sign(
      {
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        domain: member.domain,
        effectivePermissions,
      },
      secret,
      { expiresIn: "120m" }
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        accessToken,
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
    console.error("Team member login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login authentication",
    });
  }
};

module.exports = {
  loginUser,
};
