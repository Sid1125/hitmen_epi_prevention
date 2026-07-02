const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const IG_FILE = '/data/ig_marks.json';
const MESSAGE_MAPPING_FILE = '/data/message_mappings.json';
const STATS_FILE = '/data/bot_stats.json';

// Enhanced mark structure
const createMark = (username, status = 'ACTIVE') => ({
  username: username.toLowerCase(),
  status: status, // 'ACTIVE' or 'NEUTRALISED'
  threatLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
  dateAdded: new Date().toISOString().split('T')[0],
  lastModified: new Date().toISOString()
});

if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN environment variable is required');
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error('❌ TARGET_CHANNEL_ID environment variable is required');
  process.exit(1);
}

// Ensure data directory exists
const dataDir = path.dirname(IG_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

client.once('ready', () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
  console.log(`📡 Monitoring channel: ${CHANNEL_ID}`);
  console.log(`💾 Saving marks to: ${IG_FILE}`);
});

async function loadJsonFile(filePath, defaultValue = []) {
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}

async function saveJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${filePath}`);
  } catch (error) {
    console.error(`❌ Error saving ${filePath}:`, error);
  }
}

async function updateStats(action, count = 0, usernames = []) {
  const stats = await loadJsonFile(STATS_FILE, {
    messagesProcessed: 0,
    messagesDeleted: 0,
    usernamesAdded: 0,
    usernamesRemoved: 0,
    botStartTime: new Date().toISOString(),
    lastUpdate: new Date().toISOString()
  });

  switch (action) {
    case 'messageProcessed':
      stats.messagesProcessed++;
      stats.usernamesAdded += count;
      break;
    case 'messageDeleted':
      stats.messagesDeleted++;
      stats.usernamesRemoved += count;
      break;
  }

  stats.lastUpdate = new Date().toISOString();
  await saveJsonFile(STATS_FILE, stats);
}

client.on('messageCreate', async message => {
  // Skip if not the target channel or from a bot
  if (message.channel.id !== CHANNEL_ID || message.author.bot) {
    return;
  }

  console.log(`📨 New message from ${message.author.tag}: ${message.content.substring(0, 50)}...`);

  const usernames = extractInstagramUsernames(message.content);
  if (!usernames.length) {
    return;
  }

  console.log(`🎯 Found Instagram usernames: ${usernames.join(', ')}`);

  try {
    // Load existing data
    const marks = await loadJsonFile(IG_FILE, []);
    const messageMappings = await loadJsonFile(MESSAGE_MAPPING_FILE, {});

    // Store message mapping for deletion tracking
    messageMappings[message.id] = {
      usernames: usernames,
      author: message.author.tag,
      timestamp: new Date().toISOString(),
      content: message.content.substring(0, 100) + '...'
    };

    // Process usernames and create/update marks
    let newCount = 0;
    const existingUsernames = marks.map(mark => mark.username || mark);
    
    for (const username of usernames) {
      const existingMarkIndex = marks.findIndex(mark => 
        (mark.username || mark).toLowerCase() === username.toLowerCase()
      );
      
      if (existingMarkIndex === -1) {
        // New username - create new mark
        marks.push(createMark(username, 'ACTIVE'));
        newCount++;
      } else {
        // Existing username - reactivate if neutralised
        if (marks[existingMarkIndex].status === 'NEUTRALISED') {
          marks[existingMarkIndex].status = 'ACTIVE';
          marks[existingMarkIndex].lastModified = new Date().toISOString();
          console.log(`🔄 Reactivated mark: ${username}`);
        }
      }
    }

    // Save updated data
    await saveJsonFile(IG_FILE, marks);
    await saveJsonFile(MESSAGE_MAPPING_FILE, messageMappings);
    
    console.log(`✅ Updated ${IG_FILE} with ${newCount} new marks`);
    console.log(`📊 Total marks: ${marks.length}`);

    // Update statistics
    await updateStats('messageProcessed', newCount, usernames);

    // Send confirmation to Discord
    if (newCount > 0) {
      const activeCount = marks.filter(m => m.status === 'ACTIVE').length;
      await message.reply(`🎯 Added ${newCount} new Instagram mark(s): ${usernames.join(', ')}\n📊 Total active marks: ${activeCount}`);
    } else {
      await message.react('👁️'); // React with eye emoji if usernames already exist
    }

  } catch (error) {
    console.error('❌ Error processing message:', error);
  }
});

// Handle message deletions
client.on('messageDelete', async message => {
  // Skip if not the target channel
  if (message.channel.id !== CHANNEL_ID) {
    return;
  }

  console.log(`🗑️ Message deleted by ${message.author?.tag || 'Unknown'}: ${message.id}`);

  try {
    // Load existing data
    const marks = await loadJsonFile(IG_FILE, []);
    const messageMappings = await loadJsonFile(MESSAGE_MAPPING_FILE, {});

    // Check if this message had tracked usernames
    const messageData = messageMappings[message.id];
    if (!messageData || !messageData.usernames.length) {
      return;
    }

    console.log(`🎯 Neutralising usernames from deleted message: ${messageData.usernames.join(', ')}`);

    // Mark usernames as NEUTRALISED instead of removing them
    let neutralisedCount = 0;

    for (const username of messageData.usernames) {
      // Check if username exists in other messages
      const existsInOtherMessages = Object.entries(messageMappings)
        .some(([msgId, data]) => msgId !== message.id && data.usernames.includes(username));
      
      if (!existsInOtherMessages) {
        // Only neutralise if it doesn't exist in other messages
        const markIndex = marks.findIndex(mark => 
          (mark.username || mark).toLowerCase() === username.toLowerCase()
        );
        
        if (markIndex !== -1) {
          // Handle both old format (strings) and new format (objects)
          if (typeof marks[markIndex] === 'string') {
            // Convert old string format to new object format
            marks[markIndex] = createMark(marks[markIndex], 'NEUTRALISED');
          } else {
            // Update existing object
            marks[markIndex].status = 'NEUTRALISED';
            marks[markIndex].lastModified = new Date().toISOString();
          }
          neutralisedCount++;
          console.log(`🔴 Neutralised mark: ${username}`);
        }
      }
    }

    // Remove message mapping
    delete messageMappings[message.id];

    // Save updated data
    await saveJsonFile(IG_FILE, marks);
    await saveJsonFile(MESSAGE_MAPPING_FILE, messageMappings);

    console.log(`✅ Neutralised ${neutralisedCount} marks after message deletion`);
    const activeCount = marks.filter(m => (m.status || 'ACTIVE') === 'ACTIVE').length;
    const neutralisedTotal = marks.filter(m => (m.status || 'ACTIVE') === 'NEUTRALISED').length;
    console.log(`📊 Active marks: ${activeCount}, Neutralised: ${neutralisedTotal}`);

    // Update statistics
    await updateStats('messageDeleted', neutralisedCount);

    // Send notification if usernames were neutralised
    if (neutralisedCount > 0) {
      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send(`🔴 Neutralised ${neutralisedCount} Instagram mark(s) due to message deletion\n📊 Active: ${activeCount} | Neutralised: ${neutralisedTotal}`);
    }

  } catch (error) {
    console.error('❌ Error handling message deletion:', error);
  }
});

function extractInstagramUsernames(text) {
  const patterns = [
    // Full Instagram URLs
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/g,
    // @username mentions
    /@([a-zA-Z0-9._]+)/g,
    // Just usernames (basic pattern)
    /\b([a-zA-Z0-9._]{3,30})\b/g
  ];

  const usernames = new Set();

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const username = match[1];
      // Basic validation for Instagram usernames
      if (username && 
          username.length >= 3 && 
          username.length <= 30 &&
          !username.includes('..') &&
          !username.startsWith('.') &&
          !username.endsWith('.')) {
        usernames.add(username.toLowerCase());
      }
    }
  });

  return Array.from(usernames);
}

// Error handling
client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

// Login to Discord
client.login(TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
}); 