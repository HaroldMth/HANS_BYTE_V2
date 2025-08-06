// lib/antilink.js
const fs = require('fs');
const path = require('path');

const antilinkDBPath = path.join(__dirname, '../db/antilink.json');

// Load or initialize config DB
let antilinkDB = fs.existsSync(antilinkDBPath)
  ? JSON.parse(fs.readFileSync(antilinkDBPath))
  : {};

// Save changes to DB
const saveDB = () => fs.writeFileSync(antilinkDBPath, JSON.stringify(antilinkDB, null, 2));

// Regex to detect links
const isLink = (text) => /https?:\/\/[^\s]+|www\.[^\s]+/i.test(text);

// Get group settings or default
const getSettings = (jid) => antilinkDB[jid] || { enabled: false, action: 'warn', maxWarnings: 3 };

// Update settings
const setSettings = (jid, settings) => {
  antilinkDB[jid] = settings;
  saveDB();
};

// Track user warnings
const incrementWarning = (jid, user) => {
  antilinkDB[jid].warnings = antilinkDB[jid].warnings || {};
  antilinkDB[jid].warnings[user] = (antilinkDB[jid].warnings[user] || 0) + 1;
  saveDB();
  return antilinkDB[jid].warnings[user];
};

// Reset user warning
const resetWarning = (jid, user) => {
  if (antilinkDB[jid]?.warnings?.[user]) {
    delete antilinkDB[jid].warnings[user];
    saveDB();
  }
};

module.exports = {
  isLink,
  getSettings,
  setSettings,
  incrementWarning,
  resetWarning,
};
