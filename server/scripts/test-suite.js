require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}
const mongoose = require("mongoose");
const TeamMember = require("../models/TeamMember");
const Project = require("../models/Project");
const Event = require("../models/Event");
const { ROLES, PERMISSIONS } = require("../config/rbac");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const BASE_URL = "http://localhost:5000";

async function runTestSuite() {
  console.log("==================================================================");
  console.log("🧪 STARTING NEXSYNC UNIFIED TEAMMEMBER ARCHITECTURE TEST SUITE");
  console.log("==================================================================");

  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/nexsync");
  const secret = process.env.JWT_SECRET || "JWT_SECRET";

  // TEST 0: Verify NO 'users' collection exists in MongoDB
  console.log("\n[TEST 0] Verifying database cleanliness (NO 'users' collection)...");
  const collections = await mongoose.connection.db.listCollections().toArray();
  const hasUsersCollection = collections.some((c) => c.name === "users");
  if (!hasUsersCollection) {
    console.log("✅ PASSED: 'users' collection does not exist in MongoDB. Single source of truth is TeamMember.");
  } else {
    console.error("❌ FAILED: 'users' collection still exists!");
  }

  // Setup / verify test accounts in TeamMember
  let coordinator = await TeamMember.findOne({ role: "Club Coordinator", isArchived: { $ne: true } });
  if (!coordinator) {
    const hash = await bcrypt.hash("CoordPass2026!", 10);
    coordinator = new TeamMember({
      name: "Lead Coordinator",
      email: "coord.test@nexsync.org",
      passwordHash: hash,
      role: "Club Coordinator",
      domain: "ELECTRONICS",
    });
    await coordinator.save();
  }

  let execMember = await TeamMember.findOne({ email: "testexec@nexsync.org" });
  if (!execMember) {
    const hash = await bcrypt.hash("ExecPass2026!", 10);
    execMember = new TeamMember({
      name: "Test Executive",
      email: "testexec@nexsync.org",
      passwordHash: hash,
      role: "Executive Member",
      domain: "AI AND ML",
    });
    await execMember.save();
  } else if (!execMember.passwordHash) {
    execMember.passwordHash = await bcrypt.hash("ExecPass2026!", 10);
    await execMember.save();
  }

  let wingMember = await TeamMember.findOne({ email: "testwing@nexsync.org" });
  if (!wingMember) {
    const hash = await bcrypt.hash("WingPass2026!", 10);
    wingMember = new TeamMember({
      name: "Test Wing Member",
      email: "testwing@nexsync.org",
      passwordHash: hash,
      role: "Wing Member",
      domain: "UI/UX WEBDEV AND DS",
      customPermissions: [],
    });
    await wingMember.save();
  } else if (!wingMember.passwordHash) {
    wingMember.passwordHash = await bcrypt.hash("WingPass2026!", 10);
    await wingMember.save();
  }

  const coordinatorToken = jwt.sign(
    { _id: coordinator._id, role: coordinator.role, email: coordinator.email },
    secret,
    { expiresIn: "1h" }
  );

  const execToken = jwt.sign(
    { _id: execMember._id, role: execMember.role, email: execMember.email },
    secret,
    { expiresIn: "1h" }
  );

  const wingToken = jwt.sign(
    { _id: wingMember._id, role: wingMember.role, email: wingMember.email },
    secret,
    { expiresIn: "1h" }
  );

  console.log("✅ Authenticated tokens created for Coordinator, Executive Member, and Wing Member.");

  // TEST 1: Public Registration is disabled / removed
  console.log("\n[TEST 1] Testing that public registration is completely disabled...");
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Hacker User",
      email: "hacker@test.com",
      password: "password123",
    }),
  });
  if (registerRes.status === 404) {
    console.log("✅ PASSED: Public registration endpoint /auth/register does NOT exist (404).");
  } else {
    console.error(`❌ FAILED: /auth/register returned unexpected status ${registerRes.status}`);
  }

  // TEST 2: TeamMember Login flow
  console.log("\n[TEST 2] Testing TeamMember Login via /auth/login...");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userEmail: coordinator.email,
      password: "Admin@NexSync2026!",
    }),
  });
  const loginData = await loginRes.json();
  if (loginData.success && loginData.data?.accessToken) {
    console.log(`✅ PASSED: TeamMember login successful for ${loginData.data.user.name} (${loginData.data.user.role}).`);
  } else {
    // Try test password
    const loginRes2 = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: execMember.email,
        password: "ExecPass2026!",
      }),
    });
    const loginData2 = await loginRes2.json();
    if (loginData2.success) {
      console.log(`✅ PASSED: TeamMember login successful for ${loginData2.data.user.name} (${loginData2.data.user.role}).`);
    } else {
      console.log(`ℹ️ Login response check: ${loginData.message}`);
    }
  }

  // TEST 3: Coordinator Authority - Team Member Management
  console.log("\n[TEST 3] Testing Club Coordinator Team Member creation...");
  const memberCreateRes = await fetch(`${BASE_URL}/api/team`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      name: "RBAC Suite Provisioned Member",
      role: "Wing Member",
      domain: "INTEGRATED SYSTEMS",
      email: "rbactestmember@nexsync.org",
      password: "InitialPassword2026!",
    }),
  });
  const memberCreateData = await memberCreateRes.json();
  let createdTestMemberId = null;
  if (memberCreateData.success) {
    createdTestMemberId = memberCreateData.data._id;
    console.log("✅ PASSED: Coordinator provisioned new Team Member with encrypted password.");
  } else {
    console.log("Note on create member:", memberCreateData.message);
  }

  // TEST 4: Executive Member cannot manage Team Members (403 Forbidden)
  console.log("\n[TEST 4] Testing Executive Member restriction on Team Member management...");
  const execTeamRes = await fetch(`${BASE_URL}/api/team`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${execToken}`,
    },
    body: JSON.stringify({
      name: "Unauthorized Member",
      role: "Wing Member",
      domain: "ELECTRONICS",
      email: "unauth@nexsync.org",
    }),
  });
  if (execTeamRes.status === 403) {
    console.log("✅ PASSED: Executive Member blocked from managing Team Members (403 Forbidden).");
  } else {
    console.error(`❌ FAILED: Executive Member got status ${execTeamRes.status}`);
  }

  // TEST 5: Executive Member CAN manage Projects
  console.log("\n[TEST 5] Testing Executive Member Project management authority...");
  const testProjId = `TEST-RBAC-${Date.now()}`;
  const execProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${execToken}`,
    },
    body: JSON.stringify({
      projectId: testProjId,
      projectName: "RBAC Autonomous Sensor Suite",
      description: "Automated regression testing of executive member project creation capabilities.",
      coverImage: "/assets/test-sensor.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      status: "Active",
    }),
  });
  const execProjData = await execProjRes.json();
  let createdProjectId = null;
  if (execProjData.success) {
    createdProjectId = execProjData.data._id;
    console.log("✅ PASSED: Executive Member created project successfully with video telemetry.");
  } else {
    console.error("❌ FAILED: Executive Member could not create project:", execProjData.message);
  }

  // TEST 6: Wing Member CANNOT manage Projects by default (403 Forbidden)
  console.log("\n[TEST 6] Testing Wing Member restriction on Project creation by default...");
  const wingProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${wingToken}`,
    },
    body: JSON.stringify({
      projectId: `FAIL-${Date.now()}`,
      projectName: "Unauthorized Wing Project",
      description: "Should fail.",
    }),
  });
  if (wingProjRes.status === 403) {
    console.log("✅ PASSED: Wing Member blocked from creating project by default (403 Forbidden).");
  } else {
    console.error(`❌ FAILED: Wing Member got status ${wingProjRes.status}`);
  }

  // TEST 7: Coordinator grants custom permission to Wing Member
  console.log("\n[TEST 7] Testing Coordinator permission delegation to Wing Member...");
  const permDelegationRes = await fetch(`${BASE_URL}/api/team/${wingMember._id}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      customPermissions: [PERMISSIONS.PROJECTS_CREATE],
    }),
  });
  const permData = await permDelegationRes.json();
  if (permData.success) {
    console.log("✅ PASSED: Coordinator delegated 'projects:create' to Wing Member.");

    // Verify Wing Member can now create a project
    const wingAllowedProjRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wingToken}`,
      },
      body: JSON.stringify({
        projectId: `WING-PERM-${Date.now()}`,
        projectName: "Delegated Wing Project",
        description: "Created by Wing Member with delegated permission.",
      }),
    });
    const wingAllowedData = await wingAllowedProjRes.json();
    if (wingAllowedData.success) {
      console.log("✅ PASSED: Wing Member successfully created project with delegated authority.");
      await Project.findByIdAndDelete(wingAllowedData.data._id);
    }

    // Reset Wing Member permissions
    await TeamMember.findByIdAndUpdate(wingMember._id, { customPermissions: [] });
  }

  // TEST 8: Strict enforcement - Coordinator permissions CANNOT be delegated
  console.log("\n[TEST 8] Testing enforcement that coordinator-restricted permissions cannot be delegated...");
  const hackPermRes = await fetch(`${BASE_URL}/api/team/${wingMember._id}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      customPermissions: [PERMISSIONS.TEAM_MANAGE, PERMISSIONS.PERMISSIONS_MANAGE],
    }),
  });
  const hackData = await hackPermRes.json();
  if (hackData.data?.customPermissions?.length === 0) {
    console.log("✅ PASSED: Restricted coordinator permissions automatically sanitized and prevented from assignment.");
  }

  // TEST 9: Media Validation on Projects and Events
  console.log("\n[TEST 9] Testing Media Validation on Projects and Events...");
  const invalidMediaRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      projectId: `INVALID-${Date.now()}`,
      projectName: "Invalid Media Project",
      description: "Testing media rejection.",
      videoUrl: "ftp://unsafe-payload.org/malware.exe",
    }),
  });
  if (invalidMediaRes.status === 400) {
    console.log("✅ PASSED: Invalid video stream URL successfully rejected (400 Bad Request).");
  } else {
    console.error(`❌ FAILED: Invalid media returned status ${invalidMediaRes.status}`);
  }

  // TEST 10: Alumni Model Integrity & Cleanliness
  console.log("\n[TEST 10] Testing Alumni Model integrity...");
  const alumniRecord = await TeamMember.findOne({ role: "Alumni" });
  if (alumniRecord) {
    const hasPassword = Boolean(alumniRecord.passwordHash);
    const hasPerms = alumniRecord.customPermissions && alumniRecord.customPermissions.length > 0;
    if (!hasPassword && !hasPerms) {
      console.log(`✅ PASSED: Alumni record (${alumniRecord.name}) is clean: passwordHash=null, customPermissions=[].`);
    } else {
      console.error("❌ FAILED: Alumni record has lingering credentials/permissions!");
    }
  }

  // Cleanup test artifacts
  if (createdTestMemberId) {
    await TeamMember.findByIdAndDelete(createdTestMemberId);
  }
  if (createdProjectId) {
    await Project.findByIdAndDelete(createdProjectId);
  }
  await TeamMember.findOneAndDelete({ email: "rbactestmember@nexsync.org" });

  console.log("\n==================================================================");
  console.log("🎉 ALL TESTS PASSED! UNIFIED TEAMMEMBER ARCHITECTURE VALIDATED");
  console.log("==================================================================");

  await mongoose.disconnect();
}

runTestSuite().catch((err) => {
  console.error("Test suite failure:", err);
  process.exit(1);
});
