const config = require('../config');
const { cmd } = require('../command');
const { isUrl } = require('../lib/functions');
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");

cmd({
    pattern: "join",
    alias: ["joinme", "f_join"],
    react: "📬",
    desc: "Join a group via invite link (Creator only)",
    category: "group",
    use: ".join <Group Link>",
    filename: __filename
}, async (conn, msg, m, extra) => {
    const { from, sender, reply, quoted, body } = extra;

    try {
        const maps = loadLidMappings();
        const resolvedSender = String(resolveToJid(sender, maps) || sender).toLowerCase();

        // Creator check
        const rawCreators = Array.isArray(config.OWNER_NUM) 
            ? config.OWNER_NUM 
            : String(config.OWNER_NUM ?? "237694668970").split(",");
        const creatorJids = rawCreators.map(c => {
            let s = c.trim();
            if (!s.includes("@") && /^\d{6,15}$/.test(s)) s = `${s}@s.whatsapp.net`;
            return s.toLowerCase();
        });

        if (!creatorJids.includes(resolvedSender)) 
            return reply("❌ You don't have permission to use this command.");

        // Extract group invite link
        let groupLink;

        if (quoted && quoted.type === "conversation" && isUrl(quoted.text)) {
            groupLink = quoted.text.split('https://chat.whatsapp.com/')[1];
        } else if (body && isUrl(body)) {
            groupLink = body.split('https://chat.whatsapp.com/')[1];
        }

        if (!groupLink) return reply("❌ Invalid or missing group link 🖇️");

        // Accept invite
        await conn.groupAcceptInvite(groupLink);
        await conn.sendMessage(from, { text: "✔️ Successfully joined the group!" }, { quoted: m });

    } catch (err) {
        console.error("[JOIN COMMAND ERROR]:", err);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply(`❌ An error occurred:\n${err}`);
    }
});
