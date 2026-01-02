const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");

async function getAdminState({ sender, conn, from, groupMetadata }) {
  const maps = loadLidMappings();

  const resolvedSender =
    String(resolveToJid(sender, maps) || sender).toLowerCase();

  const botJid =
    String(resolveToJid(conn.user.id, maps) || conn.user.id).toLowerCase();

  let isAdmin = false;
  let isBotAdmin = false;

  if (groupMetadata?.participants?.length) {
    for (const p of groupMetadata.participants) {
      const pid =
        String(resolveToJid(p.id, maps) || p.id).toLowerCase();

      if (
        pid === resolvedSender &&
        (p.admin === "admin" || p.admin === "superadmin")
      ) {
        isAdmin = true;
      }

      if (
        pid === botJid &&
        (p.admin === "admin" || p.admin === "superadmin")
      ) {
        isBotAdmin = true;
      }
    }
  }

  return { isAdmin, isBotAdmin };
}

/* ===================== REQUEST LIST ===================== */

cmd({
  pattern: "requestlist",
  desc: "Shows pending group join requests",
  category: "group",
  react: "📋",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, isGroup, sender, reply, groupMetadata } = extra;

  try {
    if (!isGroup)
      return reply("❌ This command can only be used in groups.");

    const { isAdmin, isBotAdmin } = await getAdminState({
      sender,
      conn,
      from,
      groupMetadata
    });

    if (!isAdmin)
      return reply("❌ Only group admins can use this command.");

    if (!isBotAdmin)
      return reply("❌ I must be an admin to view join requests.");

    const requests = await conn.groupRequestParticipantsList(from);

    if (!requests.length)
      return reply("ℹ️ No pending join requests.");

    let text = `📋 *Pending Join Requests (${requests.length})*\n\n`;
    const mentions = [];

    requests.forEach((u, i) => {
      const jid = u.jid;
      mentions.push(jid);
      text += `${i + 1}. @${jid.split("@")[0]}\n`;
    });

    await conn.sendMessage(from, {
      text,
      mentions
    }, { quoted: m });

  } catch (err) {
    console.error("[REQUESTLIST ERROR]:", err);
    reply("❌ Failed to fetch join requests.");
  }
});

/* ===================== ACCEPT ALL ===================== */

cmd({
  pattern: "acceptall",
  desc: "Accepts all pending group join requests",
  category: "group",
  react: "✅",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, isGroup, sender, reply, groupMetadata } = extra;

  try {
    if (!isGroup)
      return reply("❌ This command can only be used in groups.");

    const { isAdmin, isBotAdmin } = await getAdminState({
      sender,
      conn,
      from,
      groupMetadata
    });

    if (!isAdmin)
      return reply("❌ Only group admins can use this command.");

    if (!isBotAdmin)
      return reply("❌ I must be an admin to accept requests.");

    const requests = await conn.groupRequestParticipantsList(from);

    if (!requests.length)
      return reply("ℹ️ No pending join requests.");

    const jids = requests.map(u => u.jid);

    await conn.groupRequestParticipantsUpdate(from, jids, "approve");

    reply(`✅ Accepted ${jids.length} join requests.`);

  } catch (err) {
    console.error("[ACCEPTALL ERROR]:", err);
    reply("❌ Failed to accept join requests.");
  }
});

/* ===================== REJECT ALL ===================== */

cmd({
  pattern: "rejectall",
  desc: "Rejects all pending group join requests",
  category: "group",
  react: "❌",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, isGroup, sender, reply, groupMetadata } = extra;

  try {
    if (!isGroup)
      return reply("❌ This command can only be used in groups.");

    const { isAdmin, isBotAdmin } = await getAdminState({
      sender,
      conn,
      from,
      groupMetadata
    });

    if (!isAdmin)
      return reply("❌ Only group admins can use this command.");

    if (!isBotAdmin)
      return reply("❌ I must be an admin to reject requests.");

    const requests = await conn.groupRequestParticipantsList(from);

    if (!requests.length)
      return reply("ℹ️ No pending join requests.");

    const jids = requests.map(u => u.jid);

    await conn.groupRequestParticipantsUpdate(from, jids, "reject");

    reply(`❌ Rejected ${jids.length} join requests.`);

  } catch (err) {
    console.error("[REJECTALL ERROR]:", err);
    reply("❌ Failed to reject join requests.");
  }
});
