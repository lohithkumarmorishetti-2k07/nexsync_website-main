require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

const MONGO_URI = process.env.MONGO_URI;

const defaultProjects = [
  {
    projectId: 'SYS-01',
    projectName: 'GeoGuide',
    description: 'Routing & Discovery Assistant',
    techStack: ['Flask', 'SQL', 'React'],
    status: 'COMPLETED',
  },
  {
    projectId: 'SYS-02',
    projectName: 'Crowd Density AI',
    description: 'CV-based Safety Analytics',
    techStack: ['YOLO', 'OpenCV', 'Python'],
    status: 'IN PROGRESS',
  },
];

const seedProjects = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing projects (optional)
    await Project.deleteMany({});
    console.log('Cleared existing projects');

    // Insert default projects
    const created = await Project.insertMany(defaultProjects);
    console.log('Default projects seeded successfully:', created);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding projects:', error);
    process.exit(1);
  }
};

seedProjects();
