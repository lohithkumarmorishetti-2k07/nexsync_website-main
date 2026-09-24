require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexsync";

async function runMigration() {
  console.log("==================================================================");
  console.log("🚀 MIGRATION: CONVERTING TO UNIFIED TEAMMEMBER IDENTITY ARCHITECTURE");
  console.log("==================================================================");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const usersCollection = db.collection("users");
  const teamCollection = db.collection("teammembers");
  const projectsCollection = db.collection("projects");
  const eventsCollection = db.collection("events");

  // Step 1: Cache all existing Users to map credentials and createdBy references
  const allUsers = await usersCollection.find({}).toArray();
  console.log(`Found ${allUsers.length} records in legacy 'users' collection.`);
  
  const userById = new Map();
  const userByEmail = new Map();
  for (const u of allUsers) {
    userById.set(u._id.toString(), u);
    if (u.userEmail) {
      userByEmail.set(u.userEmail.toLowerCase().trim(), u);
    }
  }

  // Step 2: Migrate every TeamMember
  const allMembers = await teamCollection.find({}).toArray();
  console.log(`Auditing and migrating ${allMembers.length} TeamMember records...`);

  // Map to store User._id -> TeamMember._id for migrating createdBy references
  const userToMemberIdMap = new Map();

  for (const member of allMembers) {
    let updateFields = {};
    let unsetFields = {};

    // 1. Determine canonical role from role / memberType
    let targetRole = "Wing Member";
    if (member.isAlumni || member.role === "Alumni" || member.memberType === "Alumni Member") {
      targetRole = "Alumni";
    } else if (member.memberType === "Club Coordinator" || member.role === "Club Coordinator") {
      targetRole = "Club Coordinator";
    } else if (member.memberType === "Executive Member" || member.role === "Executive Member") {
      targetRole = "Executive Member";
    } else if (member.memberType === "Wing Member" || member.role === "Wing Member" || (member.role && member.role.includes("WING"))) {
      targetRole = "Wing Member";
    }

    updateFields.role = targetRole;
    updateFields.isAlumni = (targetRole === "Alumni");

    // 2. Link User credentials
    let linkedUser = null;
    if (member.userId) {
      linkedUser = userById.get(member.userId.toString());
      if (linkedUser) {
        userToMemberIdMap.set(linkedUser._id.toString(), member._id);
      }
    }
    if (!linkedUser && member.email) {
      linkedUser = userByEmail.get(member.email.toLowerCase().trim());
      if (linkedUser) {
        userToMemberIdMap.set(linkedUser._id.toString(), member._id);
      }
    }

    // 3. Migrate passwordHash
    if (targetRole === "Alumni") {
      // Alumni records should not have login passwords or customPermissions
      updateFields.passwordHash = null;
      updateFields.customPermissions = [];
    } else {
      if (linkedUser && linkedUser.password) {
        updateFields.passwordHash = linkedUser.password;
      } else if (!member.passwordHash) {
        // Set default hashed password for active team member
        const defaultHash = await bcrypt.hash("NexSync@2026!", 10);
        updateFields.passwordHash = defaultHash;
      }

      if (linkedUser && Array.isArray(linkedUser.customPermissions)) {
        updateFields.customPermissions = linkedUser.customPermissions;
      } else if (!Array.isArray(member.customPermissions)) {
        updateFields.customPermissions = [];
      }
    }

    // 4. Ensure domain is valid
    const validDomains = [
      "ELECTRONICS",
      "INTEGRATED SYSTEMS",
      "AI AND ML",
      "UI/UX WEBDEV AND DS",
      "PR AND DESIGN",
    ];
    if (!member.domain || !validDomains.includes(member.domain)) {
      updateFields.domain = "ELECTRONICS";
    }

    // 5. Remove legacy userId field
    unsetFields.userId = "";

    const updateDoc = { $set: updateFields };
    if (Object.keys(unsetFields).length > 0) {
      updateDoc.$unset = unsetFields;
    }

    await teamCollection.updateOne({ _id: member._id }, updateDoc);
    console.log(`  ✓ Migrated member: ${member.name} -> role: ${targetRole}, hasPassword: ${Boolean(updateFields.passwordHash)}`);
  }

  // Step 3: Handle legacy admin account if not already in teammembers
  const adminUser = userByEmail.get("lohithkumar.m25@iiits.in") || allUsers.find(u => u.role === "admin");
  if (adminUser) {
    const existingAdminMember = await teamCollection.findOne({ email: adminUser.userEmail.toLowerCase().trim() });
    if (!existingAdminMember) {
      console.log(`Creating authoritative Club Coordinator TeamMember for admin: ${adminUser.userEmail}`);
      const adminMemberResult = await teamCollection.insertOne({
        name: adminUser.userName || "Lohithkumar Morishetti",
        email: adminUser.userEmail.toLowerCase().trim(),
        passwordHash: adminUser.password,
        role: "Club Coordinator",
        domain: "ELECTRONICS",
        customPermissions: [],
        image: "",
        bio: "Club Coordinator & Lead Architect at NexSync Autonomous Mobility.",
        linkedinUrl: "",
        githubUrl: "",
        portfolioUrl: "",
        isAlumni: false,
        isArchived: false,
        createdAt: new Date(),
      });
      userToMemberIdMap.set(adminUser._id.toString(), adminMemberResult.insertedId);
    } else {
      userToMemberIdMap.set(adminUser._id.toString(), existingAdminMember._id);
    }
  }

  // Also map any other coordinator member
  const coordMember = await teamCollection.findOne({ role: "Club Coordinator" });
  if (coordMember && adminUser) {
    if (!userToMemberIdMap.has(adminUser._id.toString())) {
      userToMemberIdMap.set(adminUser._id.toString(), coordMember._id);
    }
  }

  // Step 4: Migrate test users so test suites can run seamlessly
  const testExecUser = userByEmail.get("testexec@nexsync.org");
  if (testExecUser) {
    const execExists = await teamCollection.findOne({ email: "testexec@nexsync.org" });
    if (!execExists) {
      const inserted = await teamCollection.insertOne({
        name: "Test Executive",
        email: "testexec@nexsync.org",
        passwordHash: testExecUser.password,
        role: "Executive Member",
        domain: "AI AND ML",
        customPermissions: [],
        isAlumni: false,
        isArchived: false,
        createdAt: new Date(),
      });
      userToMemberIdMap.set(testExecUser._id.toString(), inserted.insertedId);
      console.log("  ✓ Created testexec TeamMember");
    }
  }

  const testWingUser = userByEmail.get("testwing@nexsync.org");
  if (testWingUser) {
    const wingExists = await teamCollection.findOne({ email: "testwing@nexsync.org" });
    if (!wingExists) {
      const inserted = await teamCollection.insertOne({
        name: "Test Wing Member",
        email: "testwing@nexsync.org",
        passwordHash: testWingUser.password,
        role: "Wing Member",
        domain: "UI/UX WEBDEV AND DS",
        customPermissions: [],
        isAlumni: false,
        isArchived: false,
        createdAt: new Date(),
      });
      userToMemberIdMap.set(testWingUser._id.toString(), inserted.insertedId);
      console.log("  ✓ Created testwing TeamMember");
    }
  }

  // Step 5: Update Projects createdBy references
  const projects = await projectsCollection.find({}).toArray();
  console.log(`\nMigrating ownership references for ${projects.length} Projects...`);
  const defaultCoordinator = await teamCollection.findOne({ role: "Club Coordinator" });

  for (const proj of projects) {
    let newCreatedBy = defaultCoordinator ? defaultCoordinator._id : null;
    if (proj.createdBy) {
      const mappedId = userToMemberIdMap.get(proj.createdBy.toString());
      if (mappedId) {
        newCreatedBy = mappedId;
      }
    }
    await projectsCollection.updateOne(
      { _id: proj._id },
      { $set: { createdBy: newCreatedBy, videoUrl: proj.videoUrl || "" } }
    );
    console.log(`  ✓ Project '${proj.projectName}' -> createdBy: ${newCreatedBy}`);
  }

  // Step 6: Update Events createdBy references
  const events = await eventsCollection.find({}).toArray();
  console.log(`\nMigrating ownership references for ${events.length} Events...`);
  for (const ev of events) {
    let newCreatedBy = defaultCoordinator ? defaultCoordinator._id : null;
    if (ev.createdBy) {
      const mappedId = userToMemberIdMap.get(ev.createdBy.toString());
      if (mappedId) {
        newCreatedBy = mappedId;
      }
    }
    await eventsCollection.updateOne(
      { _id: ev._id },
      { $set: { createdBy: newCreatedBy, videoUrl: ev.videoUrl || "" } }
    );
    console.log(`  ✓ Event '${ev.title}' -> createdBy: ${newCreatedBy}`);
  }

  // Step 7: Drop obsolete 'users' collection
  try {
    console.log("\nDropping obsolete 'users' collection from MongoDB...");
    await usersCollection.drop();
    console.log("  ✅ 'users' collection permanently dropped.");
  } catch (dropErr) {
    console.log("  Note on dropping users collection:", dropErr.message);
  }

  // Step 8: Clean and sync indexes on remaining collections
  const TeamMember = require("../models/TeamMember");
  const Project = require("../models/Project");
  const Event = require("../models/Event");

  await TeamMember.syncIndexes();
  await Project.syncIndexes();
  await Event.syncIndexes();
  console.log("  ✅ Database indexes synchronized successfully.");

  console.log("\n==================================================================");
  console.log("🎉 TEAMMEMBER IDENTITY ARCHITECTURAL MIGRATION COMPLETE!");
  console.log("==================================================================");

  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
