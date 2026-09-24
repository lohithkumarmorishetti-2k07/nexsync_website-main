require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');

async function inspect() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexsync';
  await mongoose.connect(uri);
  console.log('Connected to:', uri);
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }
  
  if (collections.some(c => c.name === 'users')) {
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`\nUsers (${users.length}):`);
    users.forEach(u => console.log(`  id: ${u._id}, name: ${u.userName}, email: ${u.userEmail}, role: ${u.role}, customPerms: ${JSON.stringify(u.customPermissions)}`));
  }
  
  if (collections.some(c => c.name === 'teammembers')) {
    const members = await mongoose.connection.db.collection('teammembers').find({}).toArray();
    console.log(`\nTeamMembers (${members.length}):`);
    members.forEach(m => console.log(`  id: ${m._id}, name: ${m.name}, role: ${m.role}, memberType: ${m.memberType}, isAlumni: ${m.isAlumni}, email: ${m.email}, userId: ${m.userId}`));
  }

  if (collections.some(c => c.name === 'projects')) {
    const projects = await mongoose.connection.db.collection('projects').find({}).toArray();
    console.log(`\nProjects (${projects.length}):`);
    projects.slice(0, 3).forEach(p => console.log(`  id: ${p._id}, name: ${p.projectName}, createdBy: ${p.createdBy}, videoUrl: ${p.videoUrl}`));
  }

  if (collections.some(c => c.name === 'events')) {
    const events = await mongoose.connection.db.collection('events').find({}).toArray();
    console.log(`\nEvents (${events.length}):`);
    events.slice(0, 3).forEach(e => console.log(`  id: ${e._id}, title: ${e.title}, createdBy: ${e.createdBy}, videoUrl: ${e.videoUrl}`));
  }

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error('Error inspecting:', err);
  process.exit(1);
});
