const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");
const { banUser, isBanned, unbanUser } = require("../lib/banManager");
const { normalizeJid } = require("../lib/jid");

cmd({
  pattern: "ban",
  react: "⛔",
  desc: "Ban a user from using the bot",
  category: "owner",
  use: ".ban (reply / mention)",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, sender, reply, config } = extra;

  try {
    const maps = loadLidMappings();

    // resolve sender
    const resolvedSender = normalizeJid(resolveToJid(sender, maps) || sender);

    // resolve owners (same logic as system-test)
    const rawOwners = Array.isArray(config?.OWNER_NUM)
      ? config.OWNER_NUM
      : String(config?.OWNER_NUM ?? process.env.OWNER_NUM ?? "")
          .split(",")
          .map(s => s.trim());

    const ownerJids = rawOwners
      .filter(Boolean)
      .map(o => normalizeJid(String(o).trim()));

    if (!ownerJids.includes(resolvedSender))
      return reply("❌ Owner only command");

    // target (reply > mention)
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    let target =
      ctx?.participant ||
      ctx?.mentionedJid?.[0];

    if (!target) return reply("❌ Reply to a user or mention them");

    target = normalizeJid(resolveToJid(target, maps) || target);

    if (isBanned(target))
      return reply("⚠️ User is already banned");

    banUser(target);
    reply(`⛔ User banned successfully\n\n🆔 ${target}`);

  } catch (err) {
    console.error("[BAN ERROR]:", err);
    reply("❌ Failed to ban user");
  }
});

cmd({
    pattern: "unban",
    react: "✅",
    desc: "Unban a user",
    category: "owner",
    use: ".unban (reply / mention)",
    filename: __filename
  }, async (conn, msg, m, extra) => {
    const { from, sender, reply, config } = extra;
  
    try {
      const maps = loadLidMappings();
  
      const resolvedSender = normalizeJid(resolveToJid(sender, maps) || sender);
  
      const rawOwners = Array.isArray(config?.OWNER_NUM)
        ? config.OWNER_NUM
        : String(config?.OWNER_NUM ?? process.env.OWNER_NUM ?? "")
            .split(",")
            .map(s => s.trim());
  
      const ownerJids = rawOwners
        .filter(Boolean)
        .map(o => normalizeJid(String(o).trim()));
  
      if (!ownerJids.includes(resolvedSender))
        return reply("❌ Owner only command");
  
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      let target =
        ctx?.participant ||
        ctx?.mentionedJid?.[0];
  
      if (!target) return reply("❌ Reply to a user or mention them");
  
      target = normalizeJid(resolveToJid(target, maps) || target);
  
      if (!isBanned(target))
        return reply("⚠️ User is not banned");
  
      unbanUser(target);
      reply(`✅ User unbanned successfully\n\n🆔 ${target}`);
  
    } catch (err) {
      console.error("[UNBAN ERROR]:", err);
      reply("❌ Failed to unban user");
    }
  });