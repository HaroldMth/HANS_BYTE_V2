const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/antilink.json");

let db = {
  groups: {}, // groupJid: { mode: "warn" | "delete" | "kick" }
  warns: {}   // groupJid: { userJid: count }
};

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function load() {
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH));
  } else {
    save();
  }
}
load();

// ===== GROUP CONFIG =====
function setAntiLink(group, mode) {
  db.groups[group] = { mode };
  save();
}

function disableAntiLink(group) {
  delete db.groups[group];
  delete db.warns[group];
  save();
}

function getAntiLink(group) {
  return db.groups[group] || null;
}

// ===== WARNS =====
function addWarn(group, user) {
  if (!db.warns[group]) db.warns[group] = {};
  db.warns[group][user] = (db.warns[group][user] || 0) + 1;
  save();
  return db.warns[group][user];
}

function resetWarn(group, user) {
  if (db.warns[group]) {
    delete db.warns[group][user];
    save();
  }
}

module.exports = {
  antilinkDB: {
    setAntiLink,
    disableAntiLink,
    getAntiLink
  },
  warns: {
    addWarn,
    resetWarn
  }
};
