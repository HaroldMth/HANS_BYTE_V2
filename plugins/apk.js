const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "apk",
    alias: ["app"],
    react: "📲",
    desc: "📥 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗔𝗣𝗞",
    category: "📁 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *𝙋𝙡𝙚𝙖𝙨𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚 𝙩𝙝𝙚 𝙖𝙥𝙥 𝙣𝙖𝙢𝙚!* ❌");

        const res = await fetch(`https://apis.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(q)}`);
        const data = await res.json();
        
        if (!data.success) return reply("❌ *𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙛𝙚𝙩𝙘𝙝 𝘼𝙋𝙆.* ❌");

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 2",
                serverMessageId: 143,
            },
        };

        let desc = `
╔══✦❘༻ *HANS BYTE* ༺❘✦══╗
┃ 📂 *𝘼𝙥𝙥 𝙉𝙖𝙢𝙚:*   ${data.apk_name} 
╰─━──━──━──━─━───━─╯
┃ 📥 *𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙨𝙩𝙖𝙧𝙩𝙚𝙙...*
╰──━─════════════⊷❍
🔰 *HANS BYTE V2 👑*`;

        await conn.sendMessage(
            from, 
            { 
                image: { url: data.thumbnail }, 
                caption: desc,
                contextInfo: newsletterContext
            }, 
            { quoted: mek }
        );
        
        await conn.sendMessage(
            from, 
            { 
                document: { url: data.download_link }, 
                mimetype: "application/vnd.android.package-archive", 
                fileName: `『 ${data.apk_name} 』.apk`, 
                caption: "✅ *𝗔𝗣𝗞 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!* ✅\n🔰 *HANS BYTE V2 👑*",
                contextInfo: newsletterContext
            }, 
            { quoted: mek }
        );
        
    } catch (e) {
        console.error(e);
        reply("❌ *𝘼𝙣 𝙚𝙧𝙧𝙤𝙧 𝙤𝙘𝙘𝙪𝙧𝙧𝙚𝙙 𝙬𝙝𝙞𝙡𝙚 𝙛𝙚𝙩𝙘𝙝𝙞𝙣𝙜 𝙩𝙝𝙚 𝘼𝙋𝙆.* ❌");
    }
});