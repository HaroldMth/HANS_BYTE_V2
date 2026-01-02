const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "creator",
    alias: ["creator", "coder", "dev"],
    desc: "Show bot creator information",
    category: "info",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        // Owner information (you can modify these values)
        const ownerInfo = {
            name: "HANS BYT3 T3CH",
            number: "+237694668970",
            photo: "https://files.catbox.moe/kzqia3.jpeg",
            bio: "HANS BYTE MD"
        };

        // Beautiful formatted message
        const creatorMessage = `
╭─「 👑 CREATOR INFO 👑 」─╮
│
│ 🪪 Name
│ ${ownerInfo.name}
│
│ 📞 Number
│ ${ownerInfo.number}
│
│ 📝 Bio
│ ${ownerInfo.bio}
│
│ 🤖 Bot
│ ${config.BOT_NAME}
│
│ ⚡ Version
│ ${config.VERSION || "2.1.3"}
│
╰────────────────╯

💡 Contact for support or bot-related help
`;

        // Send message with owner photo
        await conn.sendMessage(from, {
            image: { url: ownerInfo.photo },
            caption: creatorMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Creator Command Error:", e);
        // Fallback text if image fails
        await reply(`Something went wrong while fetching creator info.`);
    }
});

