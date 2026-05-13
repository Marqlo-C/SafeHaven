/**
 * Seed script — creates fake users and community journal entries for demo.
 * Run with:  node scripts/seed-demo.js
 * Safe to re-run: skips users/entries that already exist by username.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

// ── Inline schema definitions (avoids Next.js module issues) ─────────────────

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  duressPasswordHash: { type: String, default: null },
  anonymousDisplayName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: '' },
  content: { type: String, required: true },
  incidentDate: { type: Date, default: null },
  mediaData: { type: String, default: null },
  mediaType: { type: String, default: null },
  mediaName: { type: String, default: null },
  isPrivate: { type: Boolean, default: false },
  hearts: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry', journalSchema);

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_USERS = [
  { username: 'demo_quietriver',   displayName: 'QuietRiver',   password: 'demo1234' },
  { username: 'demo_morninglark',  displayName: 'MorningLark',  password: 'demo1234' },
  { username: 'demo_paperkite',    displayName: 'PaperKite',    password: 'demo1234' },
  { username: 'demo_silverpine',   displayName: 'SilverPine',   password: 'demo1234' },
  { username: 'demo_blueharbor',   displayName: 'BlueHarbor',   password: 'demo1234' },
  { username: 'demo_embermoth',    displayName: 'EmberMoth',    password: 'demo1234' },
];

const DEMO_JOURNALS = [
  {
    username: 'demo_quietriver',
    content: "Today I packed a small bag and hid it at my sister's. It felt like the first real breath I have taken in months. I don't know what comes next, but I know I took a step.",
    hearts: 24,
    daysAgo: 0,
  },
  {
    username: 'demo_morninglark',
    content: "I told my doctor what was happening. She believed me. I did not realize how much I needed someone to believe me. She helped me find a number to call.",
    hearts: 41,
    daysAgo: 0,
  },
  {
    username: 'demo_paperkite',
    content: "One year out today. I painted my apartment the color I always wanted. It is a soft yellow. My daughter said it looks like sunshine. She's right.",
    hearts: 112,
    daysAgo: 1,
  },
  {
    username: 'demo_silverpine',
    content: "I do not know if I am ready to leave. But I am writing it down so I remember why I want to. Some days the words are all I have.",
    hearts: 18,
    daysAgo: 1,
  },
  {
    username: 'demo_blueharbor',
    content: "The shelter let me bring my dog. I cried in the parking lot for an hour. Not because I was sad — just because I was finally somewhere safe enough to cry.",
    hearts: 67,
    daysAgo: 2,
  },
  {
    username: 'demo_embermoth',
    content: "Court was today. My voice did not shake. I am proud of me. My advocate squeezed my hand after and said 'you did it.' I keep hearing that.",
    hearts: 89,
    daysAgo: 3,
  },
  {
    username: 'demo_quietriver',
    content: "Called the hotline for the first time. The woman on the other end was so calm. She didn't rush me. I talked for 40 minutes. I feel less alone tonight.",
    hearts: 33,
    daysAgo: 4,
  },
  {
    username: 'demo_morninglark',
    content: "My kids slept through the night for the first time in months. I sat in the hallway outside their door and just listened to the quiet. This is what peace feels like.",
    hearts: 55,
    daysAgo: 5,
  },
  {
    username: 'demo_paperkite',
    content: "Started a new journal. The old one I had to leave behind. This one is mine. Nobody else has ever touched it.",
    hearts: 29,
    daysAgo: 7,
  },
  {
    username: 'demo_silverpine',
    content: "A neighbor I barely know left groceries at my door with a note: 'No questions. Just here.' I don't know how she knew. I cried the good kind of tears.",
    hearts: 78,
    daysAgo: 8,
  },
  {
    username: 'demo_blueharbor',
    content: "Went to a support group for the first time. I didn't say a word. I just sat and listened. But I went. And I'll go again.",
    hearts: 44,
    daysAgo: 10,
  },
  {
    username: 'demo_embermoth',
    content: "My therapist asked me what I want my life to look like in two years. I couldn't answer. Then later on the bus I thought: quiet mornings, coffee, my own keys. That's a start.",
    hearts: 61,
    daysAgo: 12,
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected to MongoDB.');

  const userMap = {};

  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      console.log(`  User ${u.username} already exists — skipping.`);
      userMap[u.username] = existing._id;
      continue;
    }
    const hash = await bcrypt.hash(u.password, 12);
    const user = await User.create({
      username: u.username,
      passwordHash: hash,
      anonymousDisplayName: u.displayName,
    });
    userMap[u.username] = user._id;
    console.log(`  Created user: ${u.username} (${u.displayName})`);
  }

  let created = 0;
  for (const j of DEMO_JOURNALS) {
    const userId = userMap[j.username];
    if (!userId) continue;

    const existing = await JournalEntry.findOne({ userId, content: j.content });
    if (existing) {
      console.log(`  Entry for ${j.username} already exists — skipping.`);
      continue;
    }

    const createdAt = new Date(Date.now() - j.daysAgo * 24 * 60 * 60 * 1000);
    await JournalEntry.create({
      userId,
      content: j.content,
      isPrivate: false,
      mediaData: null,
      hearts: j.hearts,
      createdAt,
      updatedAt: createdAt,
    });
    created++;
    console.log(`  Created journal for ${j.username}`);
  }

  console.log(`\nDone. ${created} new journal entries created.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
