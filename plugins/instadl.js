const { cmd, commands } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ig",
    alias: ["instagram", "igdl", "insta"],
    react: "📹",
    desc: "Download Instagram reels",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply("*❌ Please provide an Instagram reel URL!*\nExample: .ig <URL>");

        // Validate URL (basic check)
        if (!q.startsWith("https://www.instagram.com/reel/")) {
            return reply("*❌ Invalid Instagram reel URL!*");
        }

        const apiUrl = `https://itzpire.com/download/instagram?url=${encodeURIComponent(q)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status !== "success") return reply("❌ Failed to fetch Instagram reel.");

        const media = data.data.media[0];
        const postInfo = data.data.postInfo;

        if (!media || !media.downloadUrl) return reply("❌ No media found in this post.");

        // Newsletter context info
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
                serverMessageId: 143,
            },
        };

        let desc = `
╔══✦❘༻ *HANS BYTE* ༺❘✦══╗
┇  🌀 *𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* 🌀
┇╭───────────────────
┇│•🎭 𝗧𝘆𝗽𝗲: ${media.type?.toUpperCase() || '𝗨𝗡𝗞𝗡𝗢𝗪𝗡'} 
┇│•🎯 𝗔𝘂𝘁𝗵𝗼𝗿: ${postInfo.author || '𝗔𝗻𝗼𝗻𝘆𝗺𝗼𝘂𝘀'}
┇│•🌐 𝗟𝗶𝗻𝗸: ${q}
╰─・─・─・─・─・─・─・─╯
╭━✦❘༻ 𝗣𝗢𝗦𝗧 𝗜𝗡𝗙𝗢 ༺❘✦━╮
│•📝 𝗖𝗮𝗽𝘁𝗶𝗼𝗻: ${postInfo.caption?.slice(0, 50) || '𝗡𝗼 𝗖𝗮𝗽𝘁𝗶𝗼𝗻'}...
│•📅 𝗗𝗮𝘁𝗲: ${postInfo.timePosted || '𝗨𝗻𝗸𝗻𝗼𝘄𝗻'}
│•❤️ 𝗟𝗶𝗸𝗲𝘀: ${postInfo.likesCount || '0'} 
│•💬 𝗖𝗼𝗺𝗺𝗲𝗻𝘁𝘀: ${postInfo.commentsCount || '0'}
╰━✦❘༻ *HANS BYTE* ༺❘✦━╯
> POWERED BY HANS BYTE MD `;

        // Send video
        if (media.type === "video") {
            await conn.sendMessage(from, { 
                video: { url: media.downloadUrl }, 
                caption: desc,
                contextInfo: newsletterContext 
            }, { quoted: mek });
        } else {
            return reply("❌ No video found in this post.");
        }
    } catch (e) {
        console.error("Error fetching Instagram reel:", e);
        reply("⚠️ Error fetching the Instagram reel.");
    }
});