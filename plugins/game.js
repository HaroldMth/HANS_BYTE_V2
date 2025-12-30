const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "rcolor",
    desc: "Generate a random color with name and code.",
    category: "utility",
    filename: __filename,
}, async (conn, mek) => {
    try {
        const colorNames = [
            "Red", "Green", "Blue", "Yellow", "Orange", "Purple", "Pink", "Brown", "Black", "White", 
            "Gray", "Cyan", "Magenta", "Violet", "Indigo", "Teal", "Lavender", "Turquoise"
        ];
        const randomColorHex = "#" + Math.floor(Math.random()*16777215).toString(16);
        const randomColorName = colorNames[Math.floor(Math.random() * colorNames.length)];

        await conn.sendMessage(mek.key.remoteJid, {
            text: `🎨 *Random Color:* \nName: ${randomColorName}\nCode: ${randomColorHex}`
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in .rcolor command:", e);
    }
});

cmd({
    pattern: "roll",
    desc: "Roll a dice (1-6).",
    category: "fun",
    filename: __filename,
}, async (conn, mek) => {
    try {
        const result = Math.floor(Math.random() * 6) + 1;

        await conn.sendMessage(mek.key.remoteJid, {
            text: `🎲 You rolled: *${result}*`
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in .roll command:", e);
    }
});

cmd({
    pattern: "coinflip",
    desc: "Flip a coin and get Heads or Tails.",
    category: "fun",
    filename: __filename,
}, async (conn, mek) => {
    try {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";

        await conn.sendMessage(mek.key.remoteJid, {
            text: `🪙 Coin Flip Result: *${result}*`
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in .coinflip command:", e);
    }
});

cmd({
    pattern: "time",
    desc: "Check the current local time.",
    category: "utility",
    filename: __filename,
}, async (conn, mek) => {
    try {
        const now = new Date();
        const localTime = now.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit", 
            hour12: true,
            timeZone: "Africa/Douala"
        });

        await conn.sendMessage(mek.key.remoteJid, {
            text: `🕒 Current Local Time in GMT+1: ${localTime}`
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in .time command:", e);
    }
});

cmd({
    pattern: "date",
    desc: "Check the current date.",
    category: "utility",
    filename: __filename,
}, async (conn, mek) => {
    try {
        const now = new Date();
        const currentDate = now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        await conn.sendMessage(mek.key.remoteJid, {
            text: `📅 Current Date: ${currentDate}`
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in .date command:", e);
    }
});

cmd({
    pattern: "shapar",
    desc: "Send shapar ASCII art with mentions.",
    category: "fun",
    filename: __filename,
}, async (conn, mek) => {
    try {
        if (!mek.key.remoteJid.endsWith('@g.us')) {
            return await conn.sendMessage(mek.key.remoteJid, { text: "This command can only be used in groups." }, { quoted: mek });
        }

        const mentionedUser = mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) {
            return await conn.sendMessage(mek.key.remoteJid, { text: "Please mention a user to send the ASCII art to." }, { quoted: mek });
        }

        const asciiArt = `
          _______
       .-'       '-.
      /           /|
     /           / |
    /___________/  |
    |   _______ |  |
    |  |  \\ \\  ||  |
    |  |   \\ \\ ||  |
    |  |____\\ \\||  |
    |  '._  _.'||  |
    |    .' '.  ||  |
    |   '.___.' ||  |
    |___________||  |
    '------------'  |
     \\_____________\\|
`;

        const message = `😂 @${mentionedUser.split("@")[0]}!\n😂 that for you:\n\n${asciiArt}`;

        await conn.sendMessage(mek.key.remoteJid, {
            text: message,
            mentions: [mentionedUser]
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in .shapar command:", e);
    }
});

cmd({
    pattern: "count",
    desc: "Start a countdown from 1 to the specified number.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { args }) => {
    try {
        const botOwner = conn.user.id.split(":")[0];
        if (m.sender.split("@")[0] !== botOwner) {
            return await conn.sendMessage(mek.key.remoteJid, { text: "❎ Only the bot owner can use this command." }, { quoted: mek });
        }

        if (!args[0]) {
            return await conn.sendMessage(mek.key.remoteJid, { text: "✳️ Use this command like: .count 10" }, { quoted: mek });
        }

        const count = parseInt(args[0]);
        if (isNaN(count) || count <= 0 || count > 50) {
            return await conn.sendMessage(mek.key.remoteJid, { text: "❎ Please specify a valid number between 1 and 50." }, { quoted: mek });
        }

        await conn.sendMessage(mek.key.remoteJid, { text: `⏳ Starting countdown to ${count}...` }, { quoted: mek });

        for (let i = 1; i <= count; i++) {
            await conn.sendMessage(mek.key.remoteJid, { text: `${i}` }, { quoted: mek });
            await sleep(1000);
        }

        await conn.sendMessage(mek.key.remoteJid, { text: `✅ Countdown completed.` }, { quoted: mek });
    } catch (e) {
        console.error(e);
    }
});
