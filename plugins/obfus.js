const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "obfs",
    alias: ["obfuscate", "obfuscator"],
    react: "🔒",
    desc: "🔐 Obfuscate JavaScript code with levels: low, medium, high",
    category: "🛠️ Tools",
    filename: __filename
}, async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        if (!args || args.length === 0) 
            return reply("❌ *Please provide the JavaScript code to obfuscate.*\n\nUsage:\n.obfs <code> [low|medium|high]\n\nExample:\n.obfs console.log('Hello') high");

        // Extract level if provided as last argument
        let level = 'low';
        const possibleLevels = ['low', 'medium', 'high'];

        if (possibleLevels.includes(args[args.length - 1].toLowerCase())) {
            level = args.pop().toLowerCase();
        }

        const codeToObfuscate = args.join(' ');
        if (!codeToObfuscate) 
            return reply("❌ *No JavaScript code provided after parsing level.*");

        // Call your obfuscation API
        const apiUrl = `https://apis.davidcyriltech.my.id/obfuscate?code=${encodeURIComponent(codeToObfuscate)}&level=${level}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.result?.obfuscated_code?.code) {
            return reply("🚫 *Failed to obfuscate the code. Please try again with valid JavaScript code.*");
        }

        const obfuscatedCode = json.result.obfuscated_code.code;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 202,
            },
        };

        const caption = `
╭━[ *OBFUSCATOR* ]━╮
┃ 🔐 *Level:* ${level.toUpperCase()}
┃ 🔹 *Original Code:* 
┃ ${codeToObfuscate.length > 50 ? codeToObfuscate.slice(0, 47) + "..." : codeToObfuscate}
┃
┃ 🛠️ *Obfuscated Code:*
┃ ${obfuscatedCode.length > 200 ? obfuscatedCode.slice(0, 197) + "..." : obfuscatedCode}
╰━━━━━━━━━━━━━━━━━━╯

⚠️ *Use responsibly!*
        `.trim();

        // Convert obfuscated code string into a buffer
        const buffer = Buffer.from(obfuscatedCode, 'utf-8');

        // Send obfuscated code as a document buffer
        await conn.sendMessage(
            from,
            {
                document: buffer,
                fileName: `obfuscated_code_${level}.js`,
                mimetype: "text/javascript",
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (error) {
        console.error(error);
        reply("⚠️ *An error occurred while obfuscating the code.*");
    }
});
