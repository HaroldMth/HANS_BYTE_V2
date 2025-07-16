const { cmd } = require('../command'); // Ensure the path is correct
const fetch = require('node-fetch');

cmd({
    pattern: "calc",
    alias: ["calculate"],
    react: "🧮",
    desc: "Perform mathematical calculations",
    category: "tools",
    use: '.calc <expression>',
    filename: __filename
},
async (conn, mek, m, { from, reply, q, sender }) => {
    if (!q || !q.trim()) {
        return await reply("Please provide a mathematical expression to calculate!");
    }
    
    try {
        const apiUrl = `https://apis.davidcyriltech.my.id/tools/calculate?expr=${encodeURIComponent(q)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.success || data.result === null) {
            return await reply("Invalid mathematical expression or error in calculation!");
        }
        
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
        
        await conn.sendMessage(from, { text: `Result: ${data.result}`, contextInfo: newsletterContext }, { quoted: mek });
        
    } catch (error) {
        console.error(error);
        reply('An error occurred while processing your request. Please try again later.');
    }
});