const os = require('os')
const config = require('../config')
const { cmd } = require('../command')

let antilinkDB = {
    global: {
        enabled: config.ANTILINK === "true",
        action: config.ANTILINK_ACTION || "warn",
        warnLimit: 3
    },
    groups: {
        // '120xxxx@g.us': { enabled: true, action: "ban", warnLimit: 2 }
    }
}

let warns = {} // { groupId: { userId: count } }

cmd({
    pattern: "antilink",
    react: "🚫",
    desc: "Enable/disable anti-link & set mode + warn limit",
    category: "admin",
    filename: __filename
}, async (conn, mek, m, { from, args, isAdmins, isOwner, reply, sender}) => {


    const senderJid = sender;
  const senderNumber = senderJid.split('@')[0];

  const isBotOwner =
    config.OWNER_NUM.includes(senderNumber) ||
    config.OWNER_NUM.includes(senderJid);

    // Allow if user is owner OR admin, deny if neither
    if (!(isBotOwner || isAdmins)) return reply("🚫 *Owners or Admins only.*")

    if (!args[0]) {
        return reply(`⚙️ *Usage:* .antilink <on/off> <warn/delete/ban> [limit]\n\n` +
                     `📌 Example:\n• .antilink on warn 2\n• .antilink on ban\n• .antilink off`)
    }

    const toggle = args[0]?.toLowerCase()
    const mode = args[1]?.toLowerCase()
    const limit = parseInt(args[2]) || 3

    if (toggle === "off") {
        antilinkDB.groups[from] = { enabled: false, action: "warn", warnLimit: 3 }
        return reply("🚫 *Anti-link has been turned OFF* in this group.")
    }

    if (!["on", "off"].includes(toggle) || !["warn", "delete", "ban"].includes(mode)) {
        return reply(`❗ Invalid usage.\n\n📖 Use: .antilink <on/off> <warn/delete/ban> [limit]`)
    }

    antilinkDB.groups[from] = {
        enabled: toggle === "on",
        action: mode,
        warnLimit: limit
    }

    return reply(`✅ *Anti-link ENABLED*\n🧰 Mode: *${mode.toUpperCase()}*\n🔁 Warn Limit: *${limit}*`)
})

module.exports = {
    antilinkDB,
    warns
}
