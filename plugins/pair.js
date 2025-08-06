const fetch = require("node-fetch");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { cmd } = require("../command");

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Pairing code",
    category: "download",
    use: ".pair ++923477868XXX",
    filename: __filename
}, 
async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    try {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        if (!q) {
            return await reply("*Example -* .pair +23769690xxxx");
        }

        const response = await fetch(`https://hans-pair-site.onrender.com/code?number=${q}`);
        const pair = await response.json();

        if (!pair || !pair.code) {
            return await reply("Failed to retrieve pairing code. Please check the phone number and try again.");
        }

        const pairingCode = pair.code;
        const doneMessage = "> *HANS BYTE PAIR COMPLETED*";

        // Newsletter context
        const newsletterContext = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
                serverMessageId: 143,
            },
        };

        // Send "done" message
        await conn.sendMessage(from, {
            text: `${doneMessage}\n\n*Your pairing code is:* ${pairingCode}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

        await sleep(2000);

        // Send pairing code separately
        await conn.sendMessage(from, {
            text: `${pairingCode}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        await reply("An error occurred. Please try again later.");
    }
});