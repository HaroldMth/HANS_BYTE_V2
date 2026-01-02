// lib/jid.js
function normalizeJid(jid = "") {
  if (!jid || typeof jid !== "string") return "";
  
  // Handle @lid domains and other weird formats
  if (jid.includes("@")) return jid.toLowerCase();
  
  // Extract phone number from any JID format
  // Handles: 1234567890@s.whatsapp.net, 1234567890-123456@g.us, 1234567890, etc.
  return jid.replace(/\D/g, "") + "@s.whatsapp.net";
}

module.exports = { normalizeJid };