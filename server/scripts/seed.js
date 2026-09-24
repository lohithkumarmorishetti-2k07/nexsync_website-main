require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TeamMember = require("../models/TeamMember");
const Event = require("../models/Event");
const Project = require("../models/Project");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexsync";

async function runSeed() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    // Ensure database indexes are synchronized
    await TeamMember.syncIndexes();
    await Event.syncIndexes();
    await Project.syncIndexes();
    console.log("Database indexes synchronized.");

    // 1. Seed or Verify the Club Coordinator Account
    let coordinator = await TeamMember.findOne({ role: "Club Coordinator", isArchived: { $ne: true } });
    if (!coordinator) {
      const hashPassword = await bcrypt.hash("Admin@NexSync2026!", 10);
      coordinator = new TeamMember({
        name: "Lohithkumar Morishetti",
        email: "lohithkumar.m25@iiits.in",
        passwordHash: hashPassword,
        role: "Club Coordinator",
        domain: "ELECTRONICS",
        bio: "Club Coordinator & Lead Architect at NexSync Autonomous Mobility.",
        isAlumni: false,
        isArchived: false,
      });
      await coordinator.save();
      console.log("✅ Club Coordinator provisioned: lohithkumar.m25@iiits.in / Admin@NexSync2026!");
    } else {
      console.log(`ℹ️ Club Coordinator already exists: ${coordinator.email} (ID: ${coordinator._id})`);
    }

    // 2. Check team count
    const teamCount = await TeamMember.countDocuments();
    console.log(`Current team roster count: ${teamCount}`);

    // 3. Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log("Seeding initial research builds...");
      await Project.create([
        {
          projectId: "PRJ-01",
          projectName: "AUTONOMOUS ROVER V2",
          description: "4-wheel differential drive autonomous rover navigating GPS-denied indoor environments with RealSense D435i and 2D LiDAR SLAM.",
          techStack: ["ROS2", "SLAM", "Python", "C++", "Jetson"],
          coverImage: "/assets/projects/rover.jpg",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          status: "Active",
          createdBy: coordinator._id,
        },
        {
          projectId: "PRJ-02",
          projectName: "V2X COOPERATIVE PERCEPTION",
          description: "Direct wireless telemetry communication protocol distributing real-time roadside LiDAR point clouds to moving autonomous nodes.",
          techStack: ["C-V2X", "UDP", "ZeroMQ", "PCL", "5G"],
          coverImage: "/assets/projects/v2x.jpg",
          videoUrl: "",
          status: "Future",
          createdBy: coordinator._id,
        },
        {
          projectId: "PRJ-03",
          projectName: "EDGE NEURAL MOTION PLANNER",
          description: "Hardware-accelerated deep reinforcement learning policy running on Jetson Orin Nano for dynamic obstacle evasion at 30 FPS.",
          techStack: ["TensorRT", "PyTorch", "CUDA", "ROS2"],
          coverImage: "/assets/projects/planner.jpg",
          videoUrl: "",
          status: "Completed",
          createdBy: coordinator._id,
        },
      ]);
      console.log("✅ Seeded initial projects.");
    }

    // 4. Events
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log("Seeding initial operational events...");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await Event.create([
        {
          title: "V2X DIRECT PROTOCOL SYMPOSIUM",
          description: "Technical briefing and live telemetry demonstration on connected vehicle communication infrastructure at IIIT Sri City.",
          startDate: tomorrow,
          location: "Lab 304, Academic Block, IIIT Sri City",
          eventType: "SYMPOSIUM",
          status: "Upcoming",
          coverImage: "/assets/events/v2x-symposium.jpg",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          createdBy: coordinator._id,
        },
      ]);
      console.log("✅ Seeded initial events.");
    }

    console.log("✅ Seed process finished successfully.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

runSeed();
