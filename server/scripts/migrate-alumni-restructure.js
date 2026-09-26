require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/nexsync";

async function runAlumniMigration() {
  console.log("==================================================================");
  console.log("🚀 MIGRATION: RESTRUCTURING ALUMNI DATA MODEL (BOOLEAN FLAG)");
  console.log("==================================================================");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const teamCollection = db.collection("teammembers");

  // Step 1: Query all records where role is 'Alumni'
  const alumniRecords = await teamCollection.find({ role: "Alumni" }).toArray();
  console.log(`Found ${alumniRecords.length} records with legacy role === 'Alumni'.`);

  const affectedRecords = [];

  for (const doc of alumniRecords) {
    // Check if any historical role information was preserved in previous fields
    let targetRole = "Wing Member"; // Safest fallback possible
    if (doc.previousRole && ["Club Coordinator", "Executive Member", "Wing Member"].includes(doc.previousRole)) {
      targetRole = doc.previousRole;
    } else if (doc.memberType && doc.memberType !== "Alumni" && doc.memberType !== "Alumni Member") {
      if (["Club Coordinator", "Executive Member", "Wing Member"].includes(doc.memberType)) {
        targetRole = doc.memberType;
      }
    }

    const updateDoc = {
      $set: {
        role: targetRole,
        isAlumni: true,
        passwordHash: null, // Alumni do not have login access or passwords
        customPermissions: [],
      },
    };

    await teamCollection.updateOne({ _id: doc._id }, updateDoc);

    affectedRecords.push({
      id: doc._id.toString(),
      name: doc.name,
      domain: doc.domain,
      email: doc.email,
      oldRole: doc.role,
      newRole: targetRole,
      isAlumni: true,
    });
  }

  // Step 2: Ensure all other active members have isAlumni: false explicitly set
  const activeRecords = await teamCollection.find({ role: { $ne: "Alumni" }, isAlumni: { $ne: true } }).toArray();
  for (const doc of activeRecords) {
    await teamCollection.updateOne({ _id: doc._id }, { $set: { isAlumni: false } });
  }

  // Step 3: Verify all members
  const allMembersAfter = await teamCollection.find({}).toArray();
  console.log(`\nAudit of all ${allMembersAfter.length} team members post-migration:`);
  let alumniCount = 0;
  let activeCount = 0;
  for (const m of allMembersAfter) {
    if (m.isAlumni) alumniCount++;
    else activeCount++;
    console.log(`- ${m.name} | Role: ${m.role} | isAlumni: ${m.isAlumni} | Domain: ${m.domain}`);
  }

  console.log(`\nSummary: Active Members = ${activeCount}, Alumni Members = ${alumniCount}`);
  console.log(`Total Affected Migrated Records: ${affectedRecords.length}`);
  console.log(JSON.stringify(affectedRecords, null, 2));

  // Step 4: Synchronize indexes
  const TeamMember = require("../models/TeamMember");
  await TeamMember.syncIndexes();
  console.log("Database indexes synchronized.");

  await mongoose.disconnect();
  console.log("Migration complete!");
}

runAlumniMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
