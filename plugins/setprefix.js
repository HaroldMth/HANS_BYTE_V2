const fs = require('fs');
const { cmd } = require("../command");
const config = require("../config");
const { loadLidMappings, isOwnerResolved } = require('../lid-utils');
const { getEnvFilePath } = require('../lib/env-utils');

cmd({
    pattern: "setprefix",
    use: ".setprefix <newprefix>",
    desc: "Change the bot command prefix (Owner only).",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { sender, args, isOwner }) => {

    const chat = mek.key.remoteJid;

    // 🔹 Resolve owner properly (normal + LID)
    if (!isOwner) {
        const maps = loadLidMappings();
        const resolvedIsOwner = isOwnerResolved(sender, maps);
        if (!resolvedIsOwner) {
            return conn.sendMessage(chat, {
                text: "🚫 Only bot owners can change the prefix!"
            }, { quoted: mek });
        }
    }

    if (!args[0]) {
        return conn.sendMessage(chat, {
            text: "❌ Please provide a new prefix.\nExample: .setprefix !"
        }, { quoted: mek });
    }

    const newPrefix = args[0];

    // 🔹 Update runtime config
    config.PREFIX = newPrefix;

    // 🔹 Update .env
    const envPath = getEnvFilePath();
    let envContent = fs.existsSync(envPath)
        ? fs.readFileSync(envPath, 'utf-8')
        : '';

    if (/^PREFIX\s*=.*$/m.test(envContent)) {
        envContent = envContent.replace(
            /^PREFIX\s*=.*$/m,
            `PREFIX=${newPrefix}`
        );
    } else {
        envContent += `\nPREFIX=${newPrefix}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');

    return conn.sendMessage(chat, {
        text: `✅ Command prefix updated to: *${newPrefix}*`
    }, { quoted: mek });
});
