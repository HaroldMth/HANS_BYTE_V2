const fs = require('fs');
const path = require('path');
const { normalizeJid } = require('./jid');

const BAN_FILE = path.join(__dirname, '../data/banned.json');

function loadBans() {
  if (!fs.existsSync(BAN_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(BAN_FILE));
  } catch {
    return [];
  }
}

function saveBans(bans) {
  fs.writeFileSync(BAN_FILE, JSON.stringify([...new Set(bans)], null, 2));
}

function isBanned(jid) {
  const bans = loadBans();
  return bans.includes(normalizeJid(jid));
}

function banUser(jid) {
  const bans = loadBans();
  const j = normalizeJid(jid);
  if (!bans.includes(j)) {
    bans.push(j);
    saveBans(bans);
  }
}

function unbanUser(jid) {
  const j = normalizeJid(jid);
  saveBans(loadBans().filter(x => x !== j));
}

module.exports = {
  isBanned,
  banUser,
  unbanUser,
  loadBans
};
