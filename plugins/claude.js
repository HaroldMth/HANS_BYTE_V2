const { cmd, commands } = require('../command');
const axios = require('axios');

cmd(
  {
    pattern: "claude",
    alias: ["claudeai", "sonnet", "ai3"],
    react: "🧠",
    desc: "Get AI responses from Claude AI API.",
    category: "ai",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      // Default message if no input
      q = q || "Hey";

      // Newsletter context info
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

      // API URL for Claude AI
      let apiUrl = `https://apis.davidcyriltech.my.id/ai/claudeSonnet?text=${encodeURIComponent(q)}`;

      // Fetch AI response from Claude API
      let { data } = await axios.get(apiUrl);

      if (!data || !data.response) {
        return reply("❌ Claude AI response error! Please try again.");
      }

      // Send Claude AI response with newsletter context
      await robin.sendMessage(
        from,
        { 
          text: `🧠 **Claude AI:**\n\n${data.response}`,
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);