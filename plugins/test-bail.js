const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");
const {
  jidNormalizedUser,
  areJidsSameUser
} = require("@whiskeysockets/baileys");

cmd({
  pattern: "system-test",
  alias: ["sysdiag"],
  react: "🛠",
  desc: "Check permissions, chat context, JIDs, and admin states",
  category: "utility",
  use: ".system-test",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, isGroup, sender, groupMetadata, config } = extra;

  try {
    const maps = loadLidMappings();

    /* -------------------- RESOLVE SENDER -------------------- */
    const resolvedSender = jidNormalizedUser(
      resolveToJid(sender, maps) || sender
    );

    /* -------------------- OWNERS -------------------- */
    const rawOwners = Array.isArray(config?.OWNER_NUM)
      ? config.OWNER_NUM
      : String(config?.OWNER_NUM ?? process.env.OWNER_NUM ?? "")
          .split(",")
          .map(s => s.trim());

    const ownerJids = rawOwners
      .filter(Boolean)
      .map(o => {
        if (!o.includes("@") && /^\d{6,15}$/.test(o))
          o = `${o}@s.whatsapp.net`;
        return jidNormalizedUser(o);
      });

    const isOwner = ownerJids.some(o =>
      areJidsSameUser(o, resolvedSender)
    );

    /* -------------------- BOT JID (FIXED) -------------------- */
    const botJid = jidNormalizedUser(conn.user.id);

    /* -------------------- ADMIN CHECKS -------------------- */
    let isSenderAdmin = false;
    let isOwnerAdmin = false;
    let isBotAdmin = false;

    if (isGroup && groupMetadata?.participants?.length) {
      for (const p of groupMetadata.participants) {
        const pid = jidNormalizedUser(
          resolveToJid(p.id, maps) || p.id
        );

        const admin = p.admin === "admin" || p.admin === "superadmin";

        if (areJidsSameUser(pid, resolvedSender) && admin)
          isSenderAdmin = true;

        if (ownerJids.some(o => areJidsSameUser(pid, o)) && admin)
          isOwnerAdmin = true;

        if (areJidsSameUser(pid, botJid) && admin)
          isBotAdmin = true;
      }
    }

    /* -------------------- REPORT -------------------- */
    const report = `
🛠 *System Test Report*

• Chat Type        : ${isGroup ? "Group" : "DM"}
• Sender JID       : ${resolvedSender}

👤 *Sender*
• Is Owner         : ${isOwner ? "✅ Yes" : "❌ No"}
• Is Admin         : ${isSenderAdmin ? "✅ Yes" : "❌ No"}

👑 *Owner*
• Is Admin         : ${isOwnerAdmin ? "✅ Yes" : "❌ No"}

🤖 *Bot*
• Is Admin         : ${isBotAdmin ? "✅ Yes" : "❌ No"}
`.trim();

    await conn.sendMessage(from, { text: report }, { quoted: m });

  } catch (err) {
    console.error("[SYSTEM-TEST ERROR]", err);
    try {
      await conn.sendMessage(
        from,
        { text: "❌ Error:\n" + String(err) },
        { quoted: m }
      );
    } catch {}
  }
});
