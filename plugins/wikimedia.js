const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "wikimedia",
  alias: ["wikiimg", "wikifetch"],
  desc: "Search Wikimedia images with style 🖼️✨",
  category: "search",
  react: "📸",
  use: ".wikimedia <title>",
  filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
  try {
    if (!q) return reply("⚠️ *Please provide a search title!*\n\nUsage: .wikimedia Elon Musk");

    reply("🔍 *Fetching Wikimedia images...*");

    const apiUrl = `https://api.giftedtech.web.id/api/search/wikimedia?apikey=gifted&title=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !Array.isArray(data.results) || data.results.length === 0) {
      return reply("😕 *No images found for your query.*");
    }

    // Build formatted reply text (only 5 results)
    let txt = `✨ 𝑾𝒊𝒌𝒊𝒎𝒆𝒅𝒊𝒂 𝐈𝐦𝐚𝐠𝐞𝐬 𝐟𝐨𝐫: *${q}* ✨\n\n`;

    data.results.slice(0, 5).forEach((item, i) => {
      txt += `🌟 *${i + 1}. ${item.title}*\n`;
      txt += `🔗 Source: ${item.source}\n`;
      txt += `🖼 Preview: ${item.image}\n\n`;
    });

    txt += "💡 *Powered by HANS BYTE 𝟐*";

    const newsletterContext = {
      mentionedJid: [sender],
      forwardingScore: 1000,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363292876277898@newsletter",
        newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
        serverMessageId: 143,
      },
    };

    await conn.sendMessage(mek.chat, {
      text: txt.trim(),
      contextInfo: newsletterContext
    }, { quoted: mek });

  } catch (e) {
    console.error("Wikimedia Search Error:", e);
    reply("❌ *Failed to fetch Wikimedia images.*\nTry again later!");
  }
});
