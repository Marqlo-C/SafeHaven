/**
 * Seed script — creates fake users, community journal entries, friend
 * relationships, and chat messages for demo.
 * Run with:  node scripts/seed-demo.js
 * Safe to re-run: skips users/entries that already exist.
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

const friendSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pairKey: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  noExpiry: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
});

const chatMessageSchema = new mongoose.Schema({
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'Friend', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry', journalSchema);
const Friend = mongoose.models.Friend || mongoose.model('Friend', friendSchema);
const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

function makePairKey(a, b) {
  return [String(a), String(b)].sort().join(':');
}

// ── Demo users ─────────────────────────────────────────────────────────────────

const DEMO_MAIN = { username: 'demo_main', displayName: 'SoftFern', password: 'demo1234' };

const DEMO_USERS = [
  { username: 'demo_quietriver',   displayName: 'QuietRiver',   password: 'demo1234' },
  { username: 'demo_morninglark',  displayName: 'MorningLark',  password: 'demo1234' },
  { username: 'demo_paperkite',    displayName: 'PaperKite',    password: 'demo1234' },
  { username: 'demo_silverpine',   displayName: 'SilverPine',   password: 'demo1234' },
  { username: 'demo_blueharbor',   displayName: 'BlueHarbor',   password: 'demo1234' },
  { username: 'demo_embermoth',    displayName: 'EmberMoth',    password: 'demo1234' },
];

// ── Demo journals ──────────────────────────────────────────────────────────────

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

// ── Demo chats (main user ↔ accepted friends only) ────────────────────────────
// SilverPine and EmberMoth are pending requests — no chat history for them.
// Each entry: sender is 'main' or the demo username; minutesAgo counts back from now.

const DEMO_CHATS = {
  demo_quietriver: [
    { sender: 'demo_quietriver', text: "Hi. I saw your journal. You seem to get it.", minutesAgo: 2 * 24 * 60 + 30 },
    { sender: 'main', text: "I do. It took me a long time to get here too.", minutesAgo: 2 * 24 * 60 + 20 },
    { sender: 'demo_quietriver', text: "I hid a bag like you wrote. First step feels huge.", minutesAgo: 2 * 24 * 60 + 10 },
    { sender: 'main', text: "It is huge. You did something incredibly brave. How are you holding up?", minutesAgo: 2 * 24 * 60 + 5 },
    { sender: 'demo_quietriver', text: "Scared. But a little lighter.", minutesAgo: 2 * 24 * 60 },
  ],

  demo_morninglark: [
    { sender: 'main', text: "I saw your post about your doctor believing you. That must have been such a relief.", minutesAgo: 24 * 60 + 45 },
    { sender: 'demo_morninglark', text: "It made everything feel real somehow. Like I wasn't imagining it.", minutesAgo: 24 * 60 + 30 },
    { sender: 'main', text: "You weren't. Not even close.", minutesAgo: 24 * 60 + 15 },
    { sender: 'demo_morninglark', text: "Thank you. That means more than you know.", minutesAgo: 24 * 60 },
  ],

  demo_paperkite: [
    { sender: 'demo_paperkite', text: "One year out today. Still feels surreal.", minutesAgo: 3 * 24 * 60 + 20 },
    { sender: 'main', text: "Congratulations. Truly. That took everything.", minutesAgo: 3 * 24 * 60 + 10 },
    { sender: 'demo_paperkite', text: "Some days are still hard. But I have my apartment. My own keys.", minutesAgo: 3 * 24 * 60 + 5 },
    { sender: 'main', text: "Your own keys. That's everything.", minutesAgo: 3 * 24 * 60 },
  ],

  demo_blueharbor: [
    { sender: 'demo_blueharbor', text: "The shelter let me bring my dog. I almost didn't go because of him.", minutesAgo: 4 * 24 * 60 + 90 },
    { sender: 'main', text: "I am so glad you went. Both of you.", minutesAgo: 4 * 24 * 60 + 60 },
    { sender: 'demo_blueharbor', text: "He keeps me going honestly.", minutesAgo: 4 * 24 * 60 + 45 },
    { sender: 'main', text: "That sounds like a very good dog.", minutesAgo: 4 * 24 * 60 + 30 },
    { sender: 'demo_blueharbor', text: "The best. His name is Chester.", minutesAgo: 4 * 24 * 60 },
  ],
};

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected to MongoDB.');

  // ── 1. Create / load all users ──────────────────────────────────────────────
  const userMap = {}; // username → _id

  const allUsers = [DEMO_MAIN, ...DEMO_USERS];
  for (const u of allUsers) {
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

  // ── 2. Create journal entries ───────────────────────────────────────────────
  let journalsCreated = 0;
  for (const j of DEMO_JOURNALS) {
    const userId = userMap[j.username];
    if (!userId) continue;

    const existing = await JournalEntry.findOne({ userId, content: j.content });
    if (existing) {
      console.log(`  Journal for ${j.username} already exists — skipping.`);
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
    journalsCreated++;
    console.log(`  Created journal for ${j.username}`);
  }

  // ── 3. Create friend relationships ─────────────────────────────────────────
  // Accepted:  demo_main ↔ QuietRiver, MorningLark, PaperKite, BlueHarbor
  // Incoming:  SilverPine → demo_main  (pending, noExpiry)
  // Outgoing:  demo_main → EmberMoth   (pending, noExpiry)

  const mainId = userMap['demo_main'];
  if (!mainId) {
    console.error('  demo_main user not found — skipping friend/chat seeding.');
    await mongoose.disconnect();
    return;
  }

  const ACCEPTED_FRIENDS = ['demo_quietriver', 'demo_morninglark', 'demo_paperkite', 'demo_blueharbor'];
  const friendMap = {}; // demo_username → Friend._id

  for (const username of ACCEPTED_FRIENDS) {
    const otherId = userMap[username];
    if (!otherId) continue;

    const pairKey = makePairKey(mainId, otherId);
    const existing = await Friend.findOne({ pairKey });

    if (existing && existing.status === 'accepted') {
      console.log(`  Friendship demo_main ↔ ${username} already accepted — skipping.`);
      friendMap[username] = existing._id;
      continue;
    }

    if (existing) {
      // Wrong status (e.g. from a previous seed run) — fix it.
      await Friend.findByIdAndDelete(existing._id);
    }

    const friendship = await Friend.create({
      requesterId: mainId,
      recipientId: otherId,
      pairKey,
      status: 'accepted',
      noExpiry: true,
    });
    friendMap[username] = friendship._id;
    console.log(`  Created accepted friendship: demo_main ↔ ${username}`);
  }

  // SilverPine → demo_main  (incoming request to demo_main)
  const silverPineId = userMap['demo_silverpine'];
  if (silverPineId) {
    const pairKey = makePairKey(mainId, silverPineId);
    const existing = await Friend.findOne({ pairKey });

    if (existing && existing.status === 'pending') {
      console.log(`  Pending request demo_silverpine → demo_main already exists — skipping.`);
    } else {
      if (existing) await Friend.findByIdAndDelete(existing._id);
      await Friend.create({
        requesterId: silverPineId,
        recipientId: mainId,
        pairKey,
        status: 'pending',
        noExpiry: true,
      });
      console.log(`  Created pending request: demo_silverpine → demo_main`);
    }
  }

  // EmberMoth → demo_main  (second incoming request to demo_main)
  const emberMothId = userMap['demo_embermoth'];
  if (emberMothId) {
    const pairKey = makePairKey(mainId, emberMothId);
    const existing = await Friend.findOne({ pairKey });

    if (existing && existing.status === 'pending' && String(existing.requesterId) === String(emberMothId)) {
      console.log(`  Pending request demo_embermoth → demo_main already exists — skipping.`);
    } else {
      if (existing) await Friend.findByIdAndDelete(existing._id);
      await Friend.create({
        requesterId: emberMothId,
        recipientId: mainId,
        pairKey,
        status: 'pending',
        noExpiry: true,
      });
      console.log(`  Created pending request: demo_embermoth → demo_main`);
    }
  }

  // ── 4. Seed chat messages ───────────────────────────────────────────────────
  let msgsCreated = 0;
  for (const [username, messages] of Object.entries(DEMO_CHATS)) {
    const friendId = friendMap[username];
    if (!friendId) continue;

    const otherId = userMap[username];
    if (!otherId) continue;

    for (const m of messages) {
      const senderId = m.sender === 'main' ? mainId : otherId;
      const createdAt = new Date(Date.now() - m.minutesAgo * 60 * 1000);

      const existing = await ChatMessage.findOne({ friendId, senderId, message: m.text });
      if (existing) {
        console.log(`  Chat message already exists — skipping.`);
        continue;
      }

      await ChatMessage.create({ friendId, senderId, message: m.text, createdAt });
      msgsCreated++;
    }
    console.log(`  Seeded ${messages.length} messages for demo_main ↔ ${username}`);
  }

  console.log(`\nDone.`);
  console.log(`  ${journalsCreated} new journal entries`);
  console.log(`  ${Object.keys(friendMap).length} friend relationships`);
  console.log(`  ${msgsCreated} new chat messages`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
