require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");

const LOCAL_URI = "mongodb://localhost:27017/nexsync";
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI || ATLAS_URI.includes("localhost")) {
  console.error("Please supply a valid remote ATLAS MONGO_URI");
  process.exit(1);
}

async function syncToAtlas() {
  console.log("==================================================================");
  console.log("🚀 SYNCHRONIZING LOCAL DATABASE ROSTER -> MONGODB ATLAS CLUSTER");
  console.log("==================================================================");

  // 1. Read from Local
  console.log("Reading from local database:", LOCAL_URI);
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  const localTeam = await localConn.collection("teammembers").find({}).toArray();
  const localProjects = await localConn.collection("projects").find({}).toArray();
  const localEvents = await localConn.collection("events").find({}).toArray();
  console.log(`Read ${localTeam.length} members, ${localProjects.length} projects, ${localEvents.length} events from local.`);
  await localConn.close();

  // 2. Connect to Atlas
  console.log("Connecting to Atlas cluster...");
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log("Connected to Atlas!");

  // 3. Sync Team Members
  const atlasTeamCol = atlasConn.collection("teammembers");
  for (const member of localTeam) {
    const { _id, ...rest } = member;
    await atlasTeamCol.updateOne(
      { email: member.email },
      { $set: rest, $setOnInsert: { _id } },
      { upsert: true }
    );
  }
  console.log(`✅ Upserted ${localTeam.length} team members to Atlas.`);

  // 4. Sync Projects
  const atlasProjectsCol = atlasConn.collection("projects");
  for (const project of localProjects) {
    const { _id, ...rest } = project;
    await atlasProjectsCol.updateOne(
      { projectName: project.projectName },
      { $set: rest, $setOnInsert: { _id } },
      { upsert: true }
    );
  }
  console.log(`✅ Upserted ${localProjects.length} projects to Atlas.`);

  // 5. Sync Events
  const atlasEventsCol = atlasConn.collection("events");
  for (const event of localEvents) {
    const { _id, ...rest } = event;
    await atlasEventsCol.updateOne(
      { title: event.title },
      { $set: rest, $setOnInsert: { _id } },
      { upsert: true }
    );
  }
  console.log(`✅ Upserted ${localEvents.length} events to Atlas.`);

  const atlasFinalCount = await atlasTeamCol.countDocuments();
  console.log(`Total Team Members in Atlas now: ${atlasFinalCount}`);
  await atlasConn.close();
  console.log("🎉 Atlas Synchronization Complete!");
  process.exit(0);
}

syncToAtlas().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
