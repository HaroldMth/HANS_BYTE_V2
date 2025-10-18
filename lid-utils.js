// lid-utils.js
const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.resolve(__dirname, 'sessions');

// load and merge lid mapping files
function loadLidMappings() {
  const lidsToJid = new Map();   // lid -> jid
  const jidToLid = new Map();    // jid -> lid

  if (!fs.existsSync(SESSIONS_DIR)) return { lidsToJid, jidToLid };

  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.startsWith('lid-mapping'));
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf8');
      const obj = JSON.parse(raw);

      // file naming/shape might vary. Handle a few plausible shapes:
      // 1) {"<lid>":"<jid>", ...}
      // 2) {"<jid>":"<lid>", ...}  <-- reverse mapping files sometimes
      // 3) nested objects (rare) - attempt to flatten

      for (const [k, v] of Object.entries(obj)) {
        // skip non-string values
        if (typeof k !== 'string' || (typeof v !== 'string' && typeof v !== 'number')) continue;
        const key = String(k);
        const val = String(v);

        // Heuristics: if key looks like a jid (contains '@'), treat as jid->lid
        if (key.includes('@') || key.includes('s.whatsapp')) {
          // key is jid, value is probably lid
          const jid = key;
          const lid = val;
          if (lid) {
            lidsToJid.set(lid, jid);
            jidToLid.set(jid, lid);
          }
        } else if (val.includes('@') || val.includes('s.whatsapp')) {
          // value is jid, key is lid
          const lid = key;
          const jid = val;
          lidsToJid.set(lid, jid);
          jidToLid.set(jid, lid);
        } else {
          // unknown: assume key is lid and value maybe jid-like; still add lid->val
          lidsToJid.set(key, val);
        }
      }
    } catch (e) {
      console.warn(`Failed to parse ${f}:`, e.message);
      continue;
    }
  }

  return { lidsToJid, jidToLid };
}

// normalize incoming "sender" strings and resolve lids to jids
function resolveToJid(sender, maps) {
  // sender examples:
  // - standard JID: "123456789@c.us" or "123456789@s.whatsapp.net"
  // - a lid string like "123456789012345" or "abc123lid"
  // - sometimes Baileys provides 'user@something' or a device id
  if (!sender) return null;
  const { lidsToJid } = maps;

  // If it's already a JID, return as-is
  if (typeof sender === 'string' && sender.includes('@')) return sender;

  // If mapping directly contains sender as lid
  if (lidsToJid.has(sender)) return lidsToJid.get(sender);

  // try stripping common prefixes
  const cleaned = String(sender).replace(/^lid:|^~|^0+/, '');
  if (lidsToJid.has(cleaned)) return lidsToJid.get(cleaned);

  // fallback: nothing resolved
  return null;
}

// returns true if resolved sender is in owners array
function isOwnerResolved(sender, owners = [], maps = null) {
  // owners: array of canonical owner jids like ["12345@s.whatsapp.net"]
  if (!maps) maps = loadLidMappings();
  const maybeJid = resolveToJid(sender, maps);

  // if sender is already a JID (contains '@') treat that as canonical
  const candidateJid = (typeof sender === 'string' && sender.includes('@')) ? sender : maybeJid;

  if (!candidateJid) return false;
  // compare canonicalized forms (lowercase)
  const canon = String(candidateJid).toLowerCase();
  return owners.some(o => String(o).toLowerCase() === canon);
}

// helper to merge and write a single mapping file (optional)
function mergeAndWriteMapping(outputName = 'lid-mapping-merged.json') {
  const maps = loadLidMappings();
  const obj = {};
  for (const [lid, jid] of maps.lidsToJid.entries()) obj[lid] = jid;
  const outPath = path.join(SESSIONS_DIR, outputName);
  fs.writeFileSync(outPath, JSON.stringify(obj, null, 2), 'utf8');
  return outPath;
}

module.exports = {
  loadLidMappings,
  resolveToJid,
  isOwnerResolved,
  mergeAndWriteMapping,
};
