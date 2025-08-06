const config = require('../config');
const { cmd } = require('../command');
const { isUrl } = require("../lib/functions");

function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
}

function jidToNumber(jid) {
    if (!jid) return '';
    let base = jid.split('@')[0];
    base = base.split(':')[0];
    return base;
}

async function doReact(emoji, m, conn) {
    try {
        await conn.sendMessage(m.key.remoteJid, {
            react: { text: emoji, key: m.key },
        });
    } catch (e) {
        console.error("❌ Reaction error:", e);
    }
}

const newsletterContext = {
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363292876277898@newsletter",
        newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
        serverMessageId: 143,
    },
};

cmd({
    pattern: "setname",
    alias: ["upname", "groupname", "gn", "name"],
    use: '.setname <new group name>',
    desc: "Change group subject (admins only).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    try {
        if (!isGroup) {
            return reply("❌ This command only works in group chats!");
        }

        const newName = args.join(" ").trim();
        const metadata = await conn.groupMetadata(from);

        // Normalize numbers for accurate comparison
        const groupAdmins = metadata.participants
            .filter(p => p.admin !== null)
            .map(p => jidToNumber(p.id));

        const senderNum = jidToNumber(sender);

        const isSenderAdmin = groupAdmins.includes(senderNum);

        if (!isSenderAdmin) {
            return conn.sendMessage(from, {
                text: "❌ Only *group admins* can update the group name.",
                contextInfo: { ...newsletterContext, mentionedJid: [sender] },
            }, { quoted: mek });
        }

        await doReact("✏️", m, conn);

        if (!newName) {
            return conn.sendMessage(from, {
                text: "❌ Please provide the new group name.\n\n📌 *Example:* `.setname Awesome Tech Group`",
                contextInfo: { ...newsletterContext, mentionedJid: [sender] },
                contextInfo: newsletterContext
            }, { quoted: mek });
        }

        await conn.groupUpdateSubject(from, newName);

        await conn.sendMessage(from, {
            text: `✅ Group name updated successfully to:\n*${newName}*`,
            contextInfo: { ...newsletterContext, mentionedJid: [sender] },
        }, { quoted: mek });

        await doReact("✅", m, conn);

    } catch (error) {
        console.error("UpdateName Error:", error);
        await doReact("❌", m, conn);
        await conn.sendMessage(from, {
            text: "❌ Failed to update group name. Make sure I have admin rights!",
            contextInfo: { ...newsletterContext, mentionedJid: [sender] },
            contextInfo: newsletterContext
        }, { quoted: mek });
    }
});





cmd({
    pattern: "setdesc",
    alias: ["updesc", "groupdesc", "gdesc", "desc"],
    use: '.setdesc <new group description>',
    desc: "Change group description (admins only).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    try {
        if (!isGroup) {
            return reply("❌ This command only works in group chats!");
        }

        const newDesc = args.join(" ").trim();
        const metadata = await conn.groupMetadata(from);

        // Normalize numbers for accurate comparison
        const groupAdmins = metadata.participants
            .filter(p => p.admin !== null)
            .map(p => jidToNumber(p.id));

        const senderNum = jidToNumber(sender);
        const isSenderAdmin = groupAdmins.includes(senderNum);

        if (!isSenderAdmin) {
            return conn.sendMessage(from, {
                text: "❌ Only *group admins* can update the group description.",
                contextInfo: { ...newsletterContext, mentionedJid: [sender] },
            }, { quoted: mek });
        }

        await doReact("📝", m, conn);

        if (!newDesc) {
            return conn.sendMessage(from, {
                text: "❌ Please provide the new group description.\n\n📌 *Example:* `.setdesc Welcome to Awesome Tech Group 🚀`",
                contextInfo: { ...newsletterContext, mentionedJid: [sender] },
            }, { quoted: mek });
        }

        await conn.groupUpdateDescription(from, newDesc);

        await conn.sendMessage(from, {
            text: `✅ Group description updated successfully to:\n*${newDesc}*`,
            contextInfo: { ...newsletterContext, mentionedJid: [sender] },
        }, { quoted: mek });

        await doReact("✅", m, conn);

    } catch (error) {
        console.error("UpdateDesc Error:", error);
        await doReact("❌", m, conn);
        await conn.sendMessage(from, {
            text: "❌ Failed to update group description. Make sure I have admin rights!",
            contextInfo: { ...newsletterContext, mentionedJid: [sender] },
        }, { quoted: mek });
    }
});


// ─── Promote Command ─────────────────────────────
cmd({
  pattern: "promote",
  use: ".promote @user (or reply)",
  desc: "Promote a member to admin (admins only).",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply, args }) => {
  if (!isGroup) return reply("❌ This command works only in groups!");
  const metadata = await conn.groupMetadata(from);

  // Build list of admin numbers
  const adminNums = metadata.participants
    .filter(p => p.admin !== null)
    .map(p => jidToNumber(p.id));

  const senderNum = jidToNumber(sender);
  if (!adminNums.includes(senderNum))
    return reply("⚠️ Only group admins can promote!");

  // Determine target: mention -> args[0] -> reply
  let targetJid =
    m.mentionedJid?.[0] ||
    (args[0] && `${args[0].replace(/\D/g, "")}@s.whatsapp.net`) ||
    (m.message.extendedTextMessage?.contextInfo?.participant);

  if (!targetJid)
    return reply("🔎 Please mention, pass number, or reply to the user you want to promote!");

  const targetNum = jidToNumber(targetJid);
  if (adminNums.includes(targetNum))
    return reply(`⚠️ @${targetNum} is already an admin!`, {}, { mentions: [targetJid] });

  await conn.groupParticipantsUpdate(from, [targetJid], "promote");

  const out = `
━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *HANS BYTE V2 – PROMOTE* 🛡️
━━━━━━━━━━━━━━━━━━━━━━━

👤 *User:* @${targetNum}
📌 *Action:* Promoted to Admin
⚡ *By:* @${senderNum}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
  `;
  await conn.sendMessage(from, { text: out, mentions: [targetJid, sender], contextInfo: newsletterContext }, { quoted: mek });
  await doReact("🔼", m, conn);
});


// ─── Demote Command ─────────────────────────────
cmd({
  pattern: "demote",
  use: ".demote @user (or reply)",
  desc: "Demote an admin to member (admins only).",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply, args }) => {
  if (!isGroup) return reply("❌ This command works only in groups!");
  const metadata = await conn.groupMetadata(from);

  const adminNums = metadata.participants
    .filter(p => p.admin !== null)
    .map(p => jidToNumber(p.id));

  const senderNum = jidToNumber(sender);
  if (!adminNums.includes(senderNum))
    return reply("⚠️ Only group admins can demote!");

  // Determine target: mention -> args[0] -> reply
  let targetJid =
    m.mentionedJid?.[0] ||
    (args[0] && `${args[0].replace(/\D/g, "")}@s.whatsapp.net`) ||
    (m.message.extendedTextMessage?.contextInfo?.participant);

  if (!targetJid)
    return reply("🔎 Please mention, pass number, or reply to the user you want to demote!");

  const targetNum = jidToNumber(targetJid);
  if (!adminNums.includes(targetNum))
    return reply(`⚠️ @${targetNum} is not an admin!`, {}, { mentions: [targetJid] });

  await conn.groupParticipantsUpdate(from, [targetJid], "demote");

  const out = `
━━━━━━━━━━━━━━━━━━━━━━━
⚔️ *HANS BYTE V2 – DEMOTE* ⚔️
━━━━━━━━━━━━━━━━━━━━━━━

👤 *User:* @${targetNum}
📌 *Action:* Demoted to Member
⚡ *By:* @${senderNum}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
  `;
  await conn.sendMessage(from, { text: out, mentions: [targetJid, sender], contextInfo: newsletterContext }, { quoted: mek });
  await doReact("🔽", m, conn);
});
//=========== MUTE GROUP ==========
cmd({
    pattern: "mute",
    use: ".mute",
    desc: "Mute the group (only admins can message).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    const metadata = await conn.groupMetadata(from);

    const admins = metadata.participants.filter(p => p.admin).map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("❌ Only admins can mute group!");

    await conn.groupSettingUpdate(from, "announcement");
    await doReact("🔇", m, conn);
    reply("✅ Group muted. Only admins can message now.");
});

// ========== UNMUTE GROUP ==========
cmd({
    pattern: "unmute",
    use: ".unmute",
    desc: "Unmute the group (everyone can message).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    const metadata = await conn.groupMetadata(from);

    const admins = metadata.participants.filter(p => p.admin).map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("❌ Only admins can unmute group!");

    await conn.groupSettingUpdate(from, "not_announcement");
    await doReact("🔊", m, conn);
    reply("✅ Group unmuted. Everyone can message now.");
});

// ========== LOCK SETTINGS ==========
cmd({
    pattern: "lock",
    use: ".lock",
    desc: "Lock group settings (only admins can edit info).",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    const metadata = await conn.groupMetadata(from);

    const admins = metadata.participants.filter(p => p.admin).map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("❌ Only admins can lock!");

    await conn.groupSettingUpdate(from, "locked");
    await doReact("🔒", m, conn);
    reply("✅ Group settings locked.");
});

// ========== UNLOCK SETTINGS ==========
cmd({
    pattern: "unlock",
    use: ".unlock",
    desc: "Unlock group settings (members can edit info).",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    const metadata = await conn.groupMetadata(from);

    const admins = metadata.participants.filter(p => p.admin).map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("❌ Only admins can unlock!");

    await conn.groupSettingUpdate(from, "unlocked");
    await doReact("🔓", m, conn);
    reply("✅ Group settings unlocked.");
});

// ========== ADD MEMBER ==========
cmd({
    pattern: "add",
    use: ".add <number>",
    desc: "Add a member to group.",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    const metadata = await conn.groupMetadata(from);

    const admins = metadata.participants.filter(p => p.admin).map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("❌ Only admins can add!");

    const number = args[0];
    if (!number) return reply("❌ Provide a number. Example: `.add 237696xxxxxx`");

    const userJid = `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    await conn.groupParticipantsUpdate(from, [userJid], "add");
    await doReact("➕", m, conn);
    reply(`✅ Added ${number} to the group.`);
});

// ========== LEAVE GROUP ==========
cmd({
  pattern: "leave",
  use: ".leave",
  desc: "Bot leaves the group (owner/sudo only).",
  category: "owner",
  filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
  const senderJid = sender;
  const senderNumber = senderJid.split('@')[0];

  const isBotOwner =
    config.OWNER_NUM.includes(senderNumber) ||
    config.OWNER_NUM.includes(senderJid);
  
  console.log("== LEAVE CMD DEBUG ==");
  console.log("Sender:", sender);
  console.log("Sender Number:", senderNumber);
  console.log("isBotOwner:", isBotOwner);
  console.log("config.OWNER_NUM:", config.OWNER_NUM);

  if (!isBotOwner) {
    await reply("❌ Only Owner/Sudo can use this!");
    return;
  }

  try {
    if (typeof doReact === "function") {
      await doReact("👋", m, conn);
    }
    await conn.sendMessage(from, { text: "👋 Goodbye everyone!" }, { quoted: mek });
    await conn.groupLeave(from);
  } catch (e) {
    console.error(e);
    await reply("❌ Error while leaving the group.");
  }
});


// ========== TAG ALL ==========
cmd({
    pattern: "tagall",
    use: ".tagall <msg>",
    desc: "Mention everyone in the group with a cool HANS BYTE V2 style.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return reply("❌ This command works only in groups!");
    
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin)
        .map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("⚠️ Only group admins can use this command!");

    // Custom message or default
    const text = args.join(" ") || "✨ Hey fam! Let’s gather up ✨";

    // Mentions
    const mentions = metadata.participants.map(p => p.id);

    // Cool HANS BYTE V2 Style Message
    const hansTag = `
━━━━━━━━━━━━━━━━━━━━━━━
🌐 *HANS BYTE V2 BROADCAST* 🌐
━━━━━━━━━━━━━━━━━━━━━━━

${text}

👥 *Group:* ${metadata.subject}
📣 *Tagged Members:* ${mentions.length}

${mentions.map(u => `⚡ @${jidToNumber(u)}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
`;

    await conn.sendMessage(from, {
        text: hansTag,
        mentions,
    }, { quoted: mek });

    await doReact("📣", m, conn);
});
// ========== DELETE MESSAGE ==========
cmd({
    pattern: "del",
    use: ".del",
    desc: "Delete a quoted message.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    const metadata = await conn.groupMetadata(from);

    const admins = metadata.participants.filter(p => p.admin).map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("❌ Only admins can delete!");

    if (!mek.message?.extendedTextMessage?.contextInfo?.stanzaId)
        return reply("❌ Reply to the message you want to delete.");

    const msgId = mek.message.extendedTextMessage.contextInfo.stanzaId;
    const participant = mek.message.extendedTextMessage.contextInfo.participant;

    await conn.sendMessage(from, { delete: { id: msgId, remoteJid: from, fromMe: false, participant } });
    await doReact("🗑️", m, conn);
});

// ─── Welcome New Member ─────────────────────────────
cmd({
    pattern: "welcome",
    desc: "Greet new members automatically.",
    category: "group",
    filename: __filename
},
async (conn, mek, m) => {
    const from = m.key.remoteJid;
    if (!m.message || !m.message.groupParticipantAdded) return;
    const added = m.message.groupParticipantAdded.participants;
    const metadata = await conn.groupMetadata(from);

    // Retrieve saved welcome message for this group
    const template = `👋 Hello @user, welcome to *${metadata.subject}*! \nFeel free to introduce yourself.`;

    for (let user of added) {
        const text = template.replace(/@user/, `@${jidToNumber(user)}`);
        await conn.sendMessage(from, { text, mentions: [user] });
    }
});

// ─── Get Group Invite Link ─────────────────────────────
cmd({
    pattern: "getlink",
    alias: ["link", "gclink", "grouplink"],
    use: ".getlink",
    desc: "Retrieve the current group invite link.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ This command works only in groups!");
    const metadata = await conn.groupMetadata(from);
    const link = await conn.groupInviteCode(from);
    await doReact("🔗", m, conn);
    await conn.sendMessage(from, { text: `🔗 Group Invite Link:\nhttps://chat.whatsapp.com/${link}` }, { quoted: mek });
});

// ─── Revoke Group Invite Link ─────────────────────────────
cmd({
    pattern: "revokelink",
    use: ".revokelink",
    desc: "Revoke and regenerate group invite link (admins only).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Groups only!");
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => jidToNumber(p.id));
    if (!admins.includes(jidToNumber(sender)))
        return reply("❌ Only group admins can revoke the invite link.");

    await conn.groupRevokeInvite(from);
    const newLink = await conn.groupInviteCode(from);
    await doReact("♻️", m, conn);
    await conn.sendMessage(from, { text: `✅ Invite link revoked. New link:\nhttps://chat.whatsapp.com/${newLink}` }, { quoted: mek });
});

// ─── List Group Admins ─────────────────────────────
cmd({
    pattern: "admins",
    use: ".admins",
    desc: "Display a list of all group admins.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ Use this only in groups!");
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const list = admins.map(a => `@${jidToNumber(a)}`).join("\n");
    await conn.sendMessage(from, { text: `👑 Group Admins:\n${list}`, mentions: admins }, { quoted: mek });
});

// ─── Group Info ─────────────────────────────
// ─── Group Info ─────────────────────────────
cmd({
    pattern: "ginfo",
    alias: ["groupinfo"],
    use: ".ginfo",
    desc: "Show detailed group information with profile pic.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ This command works only in groups!");
    const metadata = await conn.groupMetadata(from);
    const total = metadata.participants.length;
    const adminCount = metadata.participants.filter(p => p.admin).length;
    const desc = metadata.desc || "No description set.";

    // Attempt to fetch group profile picture
    let pfpUrl;
    try {
        pfpUrl = await conn.profilePictureUrl(from, 'image');
    } catch {
        pfpUrl = null;
    }

    // Decorative borders and icons
    const header = `╔═〘 *${metadata.subject}* 〙═╗`;
    const footer = `╚═══ Powered by 🔥 HANS BYTE V2 ═══╝`;
    const info = `
⦿ *ID:* ${from}
⦿ *Members:* ${total}
⦿ *Admins:* ${adminCount}
⦿ *Description:* ${desc}`;

    // Send either image with caption or plain text
    if (pfpUrl) {
        await conn.sendMessage(from, {
            image: { url: pfpUrl },
            caption: `${header}${info}\n${footer}`
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: `${header}${info}\n${footer}` }, { quoted: mek });
    }
});

// ─── Hidetag ─────────────────────────────
cmd({
    pattern: "hidetag",
    use: ".hidetag <message>",
    desc: "Mention everyone without showing numbers.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return reply("❌ Groups only!");
    const metadata = await conn.groupMetadata(from);
    const text = args.join(" ").trim() || " ";
    const mentions = metadata.participants.map(p => p.id);
    await conn.sendMessage(from, { text, mentions }, { quoted: mek });
});

// ─── Tag Admins ─────────────────────────────
cmd({
    pattern: "tagadmins",
    use: ".tagadmins",
    desc: "Ping all admins.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ Groups only!");
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const text = admins.map(a => `@${jidToNumber(a)}`).join(" ");
    await conn.sendMessage(from, { text, mentions: admins }, { quoted: mek });
});

// ─── SetWelcome Command ─────────────────────────────//
cmd({
  pattern: 'setwelcome',
  use: '.setwelcome on/off',
  desc: 'Enable or disable welcome/leave messages.',
  category: 'group',
  filename: __filename
},
async (conn, mek, m, { args, reply, isAdmins, sender }) => {
  // Helper: resolve real phone number even when `sender` is in @lid form
  async function resolveNumber(jid) {
    const [id, domain] = jid.split('@')
    if (domain === 'lid') {
      // fetch the group metadata for this chat
      const chatId = m.key.remoteJid
      const metadata = await conn.groupMetadata(chatId)
      // find the participant whose lid matches
      const p = metadata.participants.find(p => p.lid === jid)
      if (p && p.jid) {
        return p.jid.split('@')[0]    // e.g. "237650123456"
      }
      return id                      // fallback: numeric part
    }
    // not a lid JID, just strip the domain
    return id
  }

  // 1) get the numeric phone number of the sender
  const senderNum = await resolveNumber(sender)

  // 2) check bot owner
  const isBotOwner = senderNum === config.OWNER_NUM

  console.log({ isAdmins, isBotOwner, senderNum, owner: config.OWNER_NUM })

  // 3) only admins or bot owner may toggle
  if (!(isAdmins)) {
    return reply('❌ Only group admins can toggle welcome messages.')
  }

  // 4) validate argument
  const option = (args[0] || '').toLowerCase()
  if (option !== 'on' && option !== 'off') {
    return reply('⚙️ Use `.setwelcome on` or `.setwelcome off`')
  }

  // 5) update config.json
  try {
    const configPath = path.join(__dirname, 'config.json')  // adjust path if needed
    const raw = fs.readFileSync(configPath, 'utf8')
    const updated = raw.replace(
      /"welcome"\s*:\s*"(true|false)"/,
      `"welcome": "${option === 'on'}"`
    )
    fs.writeFileSync(configPath, updated, 'utf8')

    reply(`✅ Welcome messages are now *${option.toUpperCase()}*`)
  } catch (e) {
    console.error('❌ Failed to update config:', e)
    reply('❌ Failed to update welcome setting.')
  }
})
//============ SPAM COMMAND ============

cmd({
  pattern: "spam",
  react: "⚠️",
  desc: "Spam a message multiple times with warnings",
  category: "group",
  use: ".spam <count> <text>",
  filename: __filename
},
async (conn, mek, m, { from, sender, args, reply, isAdmins }) => {
  // Extract number from sender JID (e.g., 2376xxxxxxx@lid)
  const senderJid = sender;
  const senderNumber = senderJid.split('@')[0];

  // Independent checks
  const isBotOwner = config.OWNER_NUM.includes(senderNumber);
  const isGroupAdmin = isAdmins === true;

  // Log all relevant variables
  console.log("== SPAM CMD DEBUG ==");
  console.log("Sender:", sender);
  console.log("Sender Number:", senderNumber);
  console.log("isAdmins:", isAdmins);
  console.log("isBotOwner:", isBotOwner);
  console.log("isGroupAdmin:", isGroupAdmin);

  // Enforce independent check
  if (!isBotOwner && !isGroupAdmin)
    return reply("⚠️ Only group admins or bot owner can use this command.");

  if (args.length < 2)
    return reply("Usage: .spam <count> <text>");

  let count = parseInt(args[0]);
  if (isNaN(count) || count < 1)
    return reply("⚠️ Please provide a valid number greater than 0.");
  if (count > 10)
    return reply("⚠️ Spam count too high! Max is 10.");

  let text = args.slice(1).join(" ");
  if (!text)
    return reply("⚠️ Please provide a message to spam.");

  for (let i = 0; i < count; i++) {
    await conn.sendMessage(from, { text });
    await new Promise(resolve => setTimeout(resolve, 300)); // Delay between messages
  }
});


