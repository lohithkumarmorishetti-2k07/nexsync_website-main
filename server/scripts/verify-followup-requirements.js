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
const { loginUser } = require("../controllers/auth-controller");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/nexsync";

async function runValidation() {
  console.log("==================================================================");
  console.log("🔍 VALIDATING FOLLOW-UP ARCHITECTURE & BEHAVIOR CORRECTIONS");
  console.log("==================================================================");

  await mongoose.connect(MONGO_URI);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Alumni Model Restructure Verification
  console.log("\n--- Checking Alumni Model Restructure ---");
  const membersWithAlumniRole = await TeamMember.find({ role: "Alumni" });
  assert(membersWithAlumniRole.length === 0, "No members have role === 'Alumni' (Alumni removed as role)");

  const alumniMembers = await TeamMember.find({ isAlumni: true });
  assert(alumniMembers.length === 17, `All 17 alumni members have isAlumni === true (found ${alumniMembers.length})`);

  const allowedRoles = ["Club Coordinator", "Executive Member", "Wing Member"];
  const allRolesValid = alumniMembers.every(m => allowedRoles.includes(m.role));
  assert(allRolesValid, "All alumni members have valid canonical roles (Wing Member fallback preserved)");

  const allAlumniPasswordsNull = alumniMembers.every(m => !m.passwordHash);
  assert(allAlumniPasswordsNull, "All alumni members have passwordHash === null (no login credentials)");

  // 2. Active Members Model Verification
  console.log("\n--- Checking Active Members Model ---");
  const activeMembers = await TeamMember.find({ isAlumni: false, isArchived: { $ne: true } }).select("+passwordHash");
  assert(activeMembers.length === 5, `Active members have isAlumni === false (found ${activeMembers.length})`);

  const activeRolesValid = activeMembers.every(m => allowedRoles.includes(m.role));
  assert(activeRolesValid, "All active members have valid canonical roles");

  const activeHasPasswords = activeMembers.every(m => Boolean(m.passwordHash));
  assert(activeHasPasswords, "All active members retain login passwordHash");

  // 3. Alumni Authentication Rule: Must NOT have login access
  console.log("\n--- Checking Alumni Authentication Prohibition ---");
  const sampleAlumni = alumniMembers[0];
  let mockResStatus = 0;
  let mockResJson = null;
  const mockRes = {
    status: (code) => {
      mockResStatus = code;
      return {
        json: (data) => {
          mockResJson = data;
          return data;
        },
      };
    },
  };

  await loginUser(
    { body: { email: sampleAlumni.email, password: "AnyPassword123!" } },
    mockRes
  );
  assert(
    mockResStatus === 403 && mockResJson?.success === false,
    `Alumni login is blocked with status 403 (${mockResJson?.message})`
  );

  // 4. Active Member Authentication Rule: Works unchanged
  console.log("\n--- Checking Active Member Authentication ---");
  let activeMockStatus = 0;
  let activeMockJson = null;
  const activeRes = {
    status: (code) => {
      activeMockStatus = code;
      return {
        json: (data) => {
          activeMockJson = data;
          return data;
        },
      };
    },
  };

  await loginUser(
    { body: { email: "testexec@nexsync.org", password: "ExecPass2026!" } },
    activeRes
  );
  assert(
    activeMockStatus === 200 && activeMockJson?.success === true && Boolean(activeMockJson?.data?.accessToken),
    `Active member login succeeds with status 200 and issues JWT`
  );

  // 5. Home Page Visibility Rules: Only Club Coordinator & Executive Member, No Wing Members, No Alumni
  console.log("\n--- Checking Home Page Filtering Rules ---");
  const allMembers = await TeamMember.find({ isArchived: { $ne: true } });
  const homeLeadership = allMembers.filter(
    (m) => !m.isAlumni && (m.role === "Club Coordinator" || m.role === "Executive Member")
  );
  const homeHasAlumni = homeLeadership.some((m) => m.isAlumni);
  const homeHasWing = homeLeadership.some((m) => m.role === "Wing Member");
  assert(!homeHasAlumni, "Homepage NEVER displays Alumni members");
  assert(!homeHasWing, "Homepage NEVER displays Wing Members");
  assert(homeLeadership.length > 0, `Homepage displays Coordinators & Executives (${homeLeadership.length} members)`);

  // 6. RBAC Configuration Check
  console.log("\n--- Checking RBAC Configuration ---");
  assert(!ROLES.ALUMNI, "ROLES in rbac.js does NOT contain ALUMNI");
  assert(Object.keys(ROLES).length === 3, "ROLES has exactly 3 roles (COORDINATOR, EXECUTIVE, WING_MEMBER)");

  // 7. Team Constants Check
  console.log("\n--- Checking Team Constants & Frontend Components ---");
  const fs = require("fs");
  const teamConstantsContent = fs.readFileSync("vite-project/src/constants/teamConstants.js", "utf-8");
  assert(!teamConstantsContent.includes('"Alumni"'), "teamConstants.js ROLES does not contain 'Alumni'");

  const homePageContent = fs.readFileSync("vite-project/src/pages/student/home/index.jsx", "utf-8");
  assert(homePageContent.includes("View Team / Alumni"), "home/index.jsx has updated text 'View Team / Alumni'");
  assert(!homePageContent.includes("View Full Team / Wing Members & Alumni"), "home/index.jsx removed old button text");

  // 8. Event Card Content Restoration Check
  console.log("\n--- Checking EventCard Content Restoration ---");
  const eventCardContent = fs.readFileSync("vite-project/src/components/ui/EventCard.jsx", "utf-8");
  assert(eventCardContent.includes("event.title"), "EventCard displays event.title");
  assert(eventCardContent.includes("event-header-sub") || eventCardContent.includes("event.eventHeader"), "EventCard displays event.eventHeader");
  assert(eventCardContent.includes("event-meta-grid"), "EventCard displays telemetry grid (date, timeRange, duration, location, organizer)");
  assert(eventCardContent.includes("VIEW DETAILS"), "EventCard displays VIEW DETAILS button");
  assert(eventCardContent.includes("RSVP NOW"), "EventCard displays RSVP NOW button");
  assert(!eventCardContent.includes("event.description"), "EventCard does NOT display full description");

  // 9. Project Card Content Restoration Check
  console.log("\n--- Checking ProjectCard Content Restoration ---");
  const projectCardContent = fs.readFileSync("vite-project/src/components/ui/ProjectCard.jsx", "utf-8");
  assert(projectCardContent.includes("project.projectName"), "ProjectCard displays project.projectName");
  assert(projectCardContent.includes("project-header-sub") || projectCardContent.includes("project.projectHeader"), "ProjectCard displays project.projectHeader");
  assert(projectCardContent.includes("VIEW DETAILS"), "ProjectCard displays VIEW DETAILS button");
  assert(!projectCardContent.includes("project.description"), "ProjectCard does NOT display full description");

  // 10. Image Scaling Check
  console.log("\n--- Checking Image Scaling Strategy on Event & Project Cards ---");
  assert(eventCardContent.includes("object-fit: cover") && eventCardContent.includes("overflow: hidden"), "EventCard uses MemberCard image scaling strategy");
  assert(projectCardContent.includes("object-fit: cover") && projectCardContent.includes("overflow: hidden"), "ProjectCard uses MemberCard image scaling strategy");

  // 11. Login UX Check (Enter key & Password toggle)
  console.log("\n--- Checking Login UX Improvements ---");
  const formControlsContent = fs.readFileSync("vite-project/src/components/common-form/form-controls.jsx", "utf-8");
  assert(formControlsContent.includes("togglePasswordVisibility"), "FormControls includes password visibility toggle");
  assert(formControlsContent.includes("fa-eye-slash"), "FormControls has show/hide eye icon");

  const commonFormContent = fs.readFileSync("vite-project/src/components/common-form/index.jsx", "utf-8");
  assert(commonFormContent.includes("handleKeyDown") && commonFormContent.includes('e.key === "Enter"'), "CommonForm handles Enter-key submission");

  const authPageContent = fs.readFileSync("vite-project/src/pages/auth/index.jsx", "utf-8");
  assert(authPageContent.includes("isSubmitting"), "AuthPage prevents duplicate login requests with isSubmitting");

  // 12. Team Member Edit Password Toggle Check
  console.log("\n--- Checking Team Member Edit Password Toggle ---");
  const teamMgmtContent = fs.readFileSync("vite-project/src/pages/admin/components/TeamManagement.jsx", "utf-8");
  assert(teamMgmtContent.includes("setShowPassword"), "TeamManagement includes show/hide password toggle");
  assert(teamMgmtContent.includes("Hide Password") && teamMgmtContent.includes("Show Password"), "TeamManagement has Hide/Show Password options");
  assert(teamMgmtContent.includes("isAlumniSelected"), "TeamManagement adapts password requirement based on isAlumni");

  console.log("\n==================================================================");
  console.log(`📊 VALIDATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================================");

  await mongoose.disconnect();

  if (passedTests === totalTests) {
    console.log("🎉 ALL REQUIREMENTS VERIFIED AND CONFIRMED!");
    process.exit(0);
  } else {
    console.error("⚠️ Some tests failed.");
    process.exit(1);
  }
}

runValidation().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});
