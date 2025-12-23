const fs = require('fs');
const path = require('path');
const { cmd, commands } = require('../command');
const config = require('../config');
const envPath = path.join(__dirname, '../config.env');

// Helper to read env as object
function readEnvFile() {
    if (!fs.existsSync(envPath)) return {};
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    const env = {};
    lines.forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) env[match[1]] = match[2];
    });
    return env;
}

// Helper to write env object to file
function writeEnvFile(env) {
    const content = Object.entries(env).map(([k,v]) => `${k}=${v}`).join('\n');
    fs.writeFileSync(envPath, content, 'utf-8');
}

// =================== readenv ===================
cmd({
    pattern: "readenv",
    use: ".readenv <KEY>",
    desc: "Read a value from config.env (Owner only).",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { sender, reply, args, isOwner }) => {
    if (!isOwner) return reply("🚫 Owner only!");
    if (!args[0]) return reply("❌ Provide a KEY to read. eg: .readenv PREFIX");

    const env = readEnvFile();
    const key = args[0].toUpperCase();
    if (!(key in env)) return reply(`⚠️ Key "${key}" not found.`);
    
    reply(`📄 ${key} = ${env[key]}`);
});

// =================== setenv ===================
cmd({
    pattern: "setenv",
    use: ".setenv <KEY> <VALUE>",
    desc: "Set/update a value in config.env (Owner only).",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { sender, reply, args, isOwner }) => {
    if (!isOwner) return reply("🚫 Owner only!");
    if (args.length < 2) return reply("❌ Usage: .setenv <KEY> <VALUE> eg: .setenv MODE private");

    const key = args[0].toUpperCase();
    const value = args.slice(1).join(' ');

    const env = readEnvFile();
    env[key] = value;
    writeEnvFile(env);

    // Update in-memory config if key exists
    if (key in config) config[key] = value;

    reply(`✅ Updated ${key} = ${value}`);
});

// =================== env ===================
cmd({
    pattern: "env",
    use: ".env",
    desc: "List all variables in config.env (Owner only).",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { sender, reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Owner only!");

    const env = readEnvFile();
    if (!Object.keys(env).length) return reply("⚠️ config.env is empty.");

    let text = "📄 *Environment Variables:*\n\n";
    for (const [k,v] of Object.entries(env)) {
        text += `${k} = ${v}\n`;
    }

    reply(text);
});
