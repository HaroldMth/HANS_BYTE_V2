const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "block",
    desc: "Block a user.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted) return reply("❌ Please reply to the user's message you want to block.");

    const user = quoted.sender;
    if (!user || !user.endsWith('@s.whatsapp.net')) {
        return reply("❌ Invalid user JID.");
    }

    try {
        reply(`⏳ Blocking @${user.split('@')[0]}...`, { mentions: [user] });

        // Use Promise.race to avoid indefinite timeout
        const result = await Promise.race([
            conn.updateBlockStatus(user, 'block'),
            new Promise((_, reject) => setTimeout(() => reject(new Error("⏱️ Timeout while blocking user")), 7000))
        ]);

        reply(`✅ Successfully blocked @${user.split('@')[0]}`, { mentions: [user] });
    } catch (error) {
        console.error("❌ Block error:", error);
        reply('❌ Failed to block user: ' + error.message);
    }
});
