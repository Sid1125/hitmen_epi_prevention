const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing HITMEN data files...');

// File paths
const DATA_DIR = '/data';
const BAN_LIST_PATH = path.join(DATA_DIR, 'ban_list.txt');
const IG_MARKS_PATH = path.join(DATA_DIR, 'ig_marks.json');
const STATS_PATH = path.join(DATA_DIR, 'bot_stats.json');
const MESSAGE_MAPPINGS_PATH = path.join(DATA_DIR, 'message_mappings.json');

// Seed data - this should match your current ban_list.txt
const SEED_BAN_LIST = `0f_b9
1.s.u.p.e.r
123fokn
143.editxx
18.plus.videos_
18anything18
18plusfun9
1997mojb
1l.a.d.y
1reeline
26bregafunk
321bbyll
333.oq
333o3oo
3454_xx
34___poster
3_lewd_dood
3stailus.ell0
4044remonsim
4theweebss2
559_3x
56789000sapna
5_8jd
60sec6
60yr_old_fitness
6947desi
69_hub_1
69_hub_11
69_hub_2
69_hub_5
69_hub_6
69_hub_7
6ig6lack6ootyharlots
6jlrjs
7strelixia
8inch.greaser
8ls3y0rolp4
90sec_min
90sec_view
99me_98em
_.dirty_._video._
_.juste._.a._.gacha._
_.sexyboy2.0
_56_rahul
_____ecchi
___ecchi__
__ecchi_
__elisa__.0
__feuchte_fotze_
__prettyteenscollection
__uhhaahhh_
__xx__xx__xx__xx______xx
__zalim_pathan_mard__02
_anime_boobs_
_asexyigacc_
_cheddarpopp
_cute_boy572000
_dultzone
_dultzone2
_feuchte__fotze
_feuchtebitch
_ins_ta___sexy_71__
_lucy_hot01
_luvgalor3_
_mot3a_1
_priyadas1197
_s.at.h_
_soul_eater1
_sports_underboob_
_zalimsumit`;

// Initialize ban list
function initializeBanList() {
  try {
    if (!fs.existsSync(BAN_LIST_PATH)) {
      console.log('📄 Creating initial ban_list.txt...');
      
      // Try to read from the seed file in the container first
      let banListContent = '';
      
      // Check if we have a mounted seed file
      const seedFilePath = '/app/seed_ban_list.txt';
      if (fs.existsSync(seedFilePath)) {
        console.log('📁 Found seed file, reading from:', seedFilePath);
        banListContent = fs.readFileSync(seedFilePath, 'utf8');
      } else {
        console.log('📝 Using embedded seed data');
        banListContent = SEED_BAN_LIST;
      }
      
      fs.writeFileSync(BAN_LIST_PATH, banListContent.trim());
      const lineCount = banListContent.trim().split('\n').length;
      console.log(`✅ Created ban_list.txt with ${lineCount} entries`);
    } else {
      const content = fs.readFileSync(BAN_LIST_PATH, 'utf8');
      const lineCount = content.trim().split('\n').filter(line => line.trim()).length;
      console.log(`✅ ban_list.txt already exists with ${lineCount} entries`);
    }
  } catch (error) {
    console.error('❌ Error initializing ban list:', error);
  }
}

// Initialize IG marks
function initializeIgMarks() {
  try {
    if (!fs.existsSync(IG_MARKS_PATH)) {
      console.log('📄 Creating initial ig_marks.json...');
      const initialMarks = [];
      fs.writeFileSync(IG_MARKS_PATH, JSON.stringify(initialMarks, null, 2));
      console.log('✅ Created ig_marks.json');
    } else {
      console.log('✅ ig_marks.json already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing IG marks:', error);
  }
}

// Initialize bot stats
function initializeBotStats() {
  try {
    if (!fs.existsSync(STATS_PATH)) {
      console.log('📄 Creating initial bot_stats.json...');
      const initialStats = {
        messagesProcessed: 0,
        messagesDeleted: 0,
        usernamesAdded: 0,
        usernamesRemoved: 0,
        botStartTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      };
      fs.writeFileSync(STATS_PATH, JSON.stringify(initialStats, null, 2));
      console.log('✅ Created bot_stats.json');
    } else {
      console.log('✅ bot_stats.json already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing bot stats:', error);
  }
}

// Initialize message mappings
function initializeMessageMappings() {
  try {
    if (!fs.existsSync(MESSAGE_MAPPINGS_PATH)) {
      console.log('📄 Creating initial message_mappings.json...');
      const initialMappings = {};
      fs.writeFileSync(MESSAGE_MAPPINGS_PATH, JSON.stringify(initialMappings, null, 2));
      console.log('✅ Created message_mappings.json');
    } else {
      console.log('✅ message_mappings.json already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing message mappings:', error);
  }
}

// Main initialization
function initializeAll() {
  console.log('📁 Ensuring data directory exists...');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('✅ Created data directory');
  }

  initializeBanList();
  initializeIgMarks();
  initializeBotStats();
  initializeMessageMappings();

  console.log('🎉 Data initialization complete!');
  console.log('📊 Current data files:');
  
  try {
    const files = fs.readdirSync(DATA_DIR);
    files.forEach(file => {
      const filePath = path.join(DATA_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(`   - ${file} (${stats.size} bytes)`);
    });
  } catch (error) {
    console.error('❌ Error listing data files:', error);
  }
}

// Run initialization
initializeAll();
