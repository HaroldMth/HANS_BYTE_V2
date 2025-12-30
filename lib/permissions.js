const { resolveToJid, loadLidMappings } = require("../lid-utils");

/**
 * Converts number or jid → full lowercase jid
 */
const normalizeToJid = (input) => {
  if (!input) return null;
  
  let s = String(input).trim();
  
  // already a jid
  if (s.includes("@")) return s.toLowerCase();
  
  // number → jid
  if (/^\d{6,15}$/.test(s))
    return `${s}@s.whatsapp.net`;
  
  return null;
};

/**
 * Accepts array OR string
 * Always returns an array of JIDs
 */
const normalizeList = (value) => {
  if (!value) return [];
  
  // case 1: already an array
  if (Array.isArray(value))
    return value.map(normalizeToJid).filter(Boolean);
  
  // case 2: string "237...,243..."
  return String(value)
    .split(",")
    .map(v => normalizeToJid(v))
    .filter(Boolean);
};

/**
 * Main permission resolver
 */
const getPermissionState = (sender, config = {}) => {
  const maps = loadLidMappings();
  
  // resolve sender (handles LID)
  const resolvedJid =
    normalizeToJid(resolveToJid(sender, maps) || sender);
  
  const owners = normalizeList(
    config.OWNER_NUM || process.env.OWNER_NUM
  );
  
  const sudoers = normalizeList(
    config.SUDOERS || process.env.SUDOERS
  );
  
  return {
    jid: resolvedJid,
    isOwner: owners.includes(resolvedJid),
    isSudo: sudoers.includes(resolvedJid),
    isPrivileged:
      owners.includes(resolvedJid) || sudoers.includes(resolvedJid),
  };
};

module.exports = { getPermissionState, normalizeToJid, normalizeList };