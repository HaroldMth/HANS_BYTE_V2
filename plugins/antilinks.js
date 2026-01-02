const config = require("../config");
const { cmd } = require("../command");
const { antilinkDB } = require("../plugins/antilink");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");
const {
  jidNormalizedUser,
  areJidsSameUser
} = require("@whiskeysockets/baileys");

cmd({
  pattern: "antilink",
  desc: "Enable or disable antilink system",
  category: "group",
  use: ".antilink on warn/delete/kick | .antilink off",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, sender, reply, isGroup, groupMetadata } = extra;

  if (!isGroup) return reply("🏘️ This command works only in groups.");

  try {
    const maps = loadLidMappings();

    /* -------------------- RESOLVE SENDER -------------------- */
    const resolvedSender = jidNormalizedUser(
      resolveToJid(sender, maps) || sender
    );

    /* -------------------- BOT JID -------------------- */
    const botJid = jidNormalizedUser(conn.user.id);

    /* -------------------- ADMIN CHECKS -------------------- */
    let isSenderAdmin = false;
    let isBotAdmin = false;

    if (isGroup && groupMetadata?.participants?.length) {
      for (const p of groupMetadata.participants) {
        const pid = jidNormalizedUser(
          resolveToJid(p.id, maps) || p.id
        );

        const admin = p.admin === "admin" || p.admin === "superadmin";

        if (areJidsSameUser(pid, resolvedSender) && admin)
          isSenderAdmin = true;

        if (areJidsSameUser(pid, botJid) && admin)
          isBotAdmin = true;
      }
    }

    console.log(`[ANTILINK] sender: ${sender} → resolved: ${resolvedSender}`);
    console.log(`[ANTILINK] isSenderAdmin=${isSenderAdmin}, isBotAdmin=${isBotAdmin}`);

    if (!isSenderAdmin) return reply("👮 Admins only, my friend.");
    if (!isBotAdmin) return reply("🤖 I need to be admin to manage links.");

    /* -------------------- COMMAND LOGIC -------------------- */
    const args = msg.body.split(" ").slice(1);
    const action = args[0]?.toLowerCase();
    const mode = args[1]?.toLowerCase();

    if (action === "on") {
      if (!["warn", "delete", "kick"].includes(mode)) {
        return reply(
          "❌ Invalid mode!\n\n" +
          "Use:\n" +
          ".antilink on warn\n" +
          ".antilink on delete\n" +
          ".antilink on kick"
        );
      }

      antilinkDB.setAntiLink(from, mode);
      return reply(
        `✅ Antilink enabled!\nMode: *${mode.toUpperCase()}* 🔥`
      );
    }

    if (action === "off") {
      antilinkDB.disableAntiLink(from);
      return reply("❌ Antilink disabled. Links are free again 🕊️");
    }

    reply(
      "❓ Usage:\n" +
      ".antilink on warn/delete/kick\n" +
      ".antilink off"
    );

  } catch (err) {
    console.error("[ANTILINK ERROR]", err);
    return reply("❌ Error: " + String(err));
  }
});