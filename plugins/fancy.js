const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "fancy",
    desc: "Generate fancy text",
    category: "text",
    react: "✨",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const sender = m.sender;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 200,
            },
        };

        async function fetchFonts(text) {
            try {
                const response = await axios.get(`https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(text)}`);
                return response.data;
            } catch (error) {
                console.error('Axios fetch error:', error.message);
                return null;
            }
        }

        if (args.length === 0) {
            const res = await fetchFonts("HANS BYTE V");
            if (!res || !res.status || !res.result) {
                return reply("Failed to fetch font list.", newsletterContext);
            }

            const fontList = res.result
                .map((f, i) => `${i + 1}. ${f.result}`)
                .join("\n");

            return reply(`*Available Fancy Fonts:*\n\n${fontList}\n\nUsage: .fancy <font_id> <text>`, newsletterContext);
        }

        if (args.length < 2) {
            return reply("Usage: .fancy <font_id> <text>", newsletterContext);
        }

        const fontId = parseInt(args[0]);
        if (isNaN(fontId) || fontId < 1) {
            return reply("Invalid font ID.", newsletterContext);
        }

        const text = args.slice(1).join(" ");
        const res = await fetchFonts(text);

        if (!res || !res.status || !res.result || fontId > res.result.length) {
            return reply("Invalid font ID or failed to fetch fancy text.", newsletterContext);
        }

        const fancyText = res.result[fontId - 1].result || "";
        return reply(`*Fancy Text:*\n\n${fancyText}`, newsletterContext);

    } catch (e) {
        console.error(e);
        return reply(`Error: ${e.message || e}`, newsletterContext);
    }
});
