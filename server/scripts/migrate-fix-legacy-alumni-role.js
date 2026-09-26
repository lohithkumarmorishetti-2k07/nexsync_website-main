/**
 * One-time migration: Fix legacy TeamMember records with role:"Alumni"
 * Converts them to role:"Wing Member" + isAlumni:true + passwordHash:null
 * Safe to re-run (only touches records where role === "Alumni")
 * Usage: node server/scripts/migrate-fix-legacy-alumni-role.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("MONGO_URI not set"); process.exit(1); }

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  const col = mongoose.connection.db.collection("teammembers");
  const legacyAlumni = await col.find({ role: "Alumni" }).toArray();
  console.log(`Found ${legacyAlumni.length} records with legacy role:"Alumni"`);
  if (legacyAlumni.length === 0) {
    console.log("No legacy records to migrate. Database is clean.");
    await mongoose.disconnect(); return;
  }
  let updated = 0, errors = 0;
  for (const member of legacyAlumni) {
    try {
      await col.updateOne({ _id: member._id }, { $set: { role: "Wing Member", isAlumni: true, passwordHash: null } });
      console.log(`  Migrated: ${member.name} (${member.email})`);
      updated++;
    } catch (err) { console.error(`  Failed for ${member.name}: ${err.message}`); errors++; }
  }
  console.log(`Updated: ${updated} | Errors: ${errors}`);
  await mongoose.disconnect();
}
run().catch(err => { console.error("Migration failed:", err); process.exit(1); });
