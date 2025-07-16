const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'ephoto',
    alias: ['ephoto360', 'photoeffect', 'textstyle'],
    desc: 'Generate stylish text image effects like Ephoto360',
    category: 'tools',
    react: '🎨',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const robin = conn;
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

    try {
        if (!args[0]) return reply('✏️ Please provide text. Example: .ephoto hello');
        const inputText = args.join(' ');

        // Initial reaction
        await conn.sendMessage(from,
            { react: { text: '⏳', key: m.key }, contextInfo: newsletterContext },
            { quoted: m }
        );
        await robin.sendPresenceUpdate('recording', from);

        const effects = [
            { number: '1', name: 'Logo Maker', endpoint: 'logomaker' },
            { number: '2', name: 'Advanced Glow', endpoint: 'advancedglow' },
            { number: '3', name: 'Write Text', endpoint: 'writetext' },
            { number: '4', name: 'Glitch Text', endpoint: 'glitchtext' },
            { number: '5', name: 'Pixel Glitch', endpoint: 'pixelglitch' },
            { number: '6', name: 'Neon Glitch', endpoint: 'neonglitch' },
            { number: '7', name: 'Flag Text', endpoint: 'flagtext' },
            { number: '8', name: '3D Flag Text', endpoint: 'flag3dtext' },
            { number: '9', name: 'Deleting Text', endpoint: 'deletingtext' },
            { number: '10', name: 'Sand Summer', endpoint: 'sandsummer' },
            { number: '11', name: 'Making Neon', endpoint: 'makingneon' },
            { number: '12', name: 'Royal Text', endpoint: 'royaltext' }
        ];

        // Send menu prompt
        let menu = '╭━━━〔 *Ephoto360 MODELS* 〕━━━⊷\n';
        effects.forEach(e => menu += `┃▸ ${e.number}. ${e.name}\n`);
        menu += '╰━━━⪼\n\n📌 Reply with the number to select an effect.';

        await conn.sendMessage(from,
            { text: menu, contextInfo: newsletterContext },
            { quoted: m }
        );
        await robin.sendPresenceUpdate('recording', from);

        let active = true;
        const timeout = setTimeout(() => { active = false; }, 120000);

        conn.ev.on('messages.upsert', async msgData => {
            if (!active) return;
            const recv = msgData.messages[0];
            if (!recv.message || recv.key.fromMe) return;

            const text = recv.message.conversation || recv.message.extendedTextMessage?.text;
            if (recv.key.remoteJid !== from || !text) return;
            const effect = effects.find(e => e.number === text.trim());
            if (!effect) return;

            active = false;
            clearTimeout(timeout);

            // Acknowledge selection react
            await conn.sendMessage(from,
                { react: { text: '⬇️', key: recv.key }, contextInfo: newsletterContext },
                { quoted: recv }
            );
            await robin.sendPresenceUpdate('recording', from);

            // Inform user generation started
            await conn.sendMessage(from,
                { text: `🖌️ Generating *${effect.name}*...`, contextInfo: newsletterContext },
                { quoted: recv }
            );
            await robin.sendPresenceUpdate('recording', from);

            try {
                // Directly use the API URL since it returns an image
                const apiUrl = `https://vapis.my.id/api/${effect.endpoint}?q=${encodeURIComponent(inputText)}`;

                await conn.sendMessage(from,
                    { image: { url: apiUrl }, caption: `✅ *${effect.name}* generated successfully!`, contextInfo: newsletterContext },
                    { quoted: recv }
                );
                await robin.sendPresenceUpdate('recording', from);
            } catch (err) {
                console.error('API Error:', err);
                await conn.sendMessage(from,
                    { text: `❌ Failed to fetch image: ${err.message}`, contextInfo: newsletterContext },
                    { quoted: recv }
                );
                await robin.sendPresenceUpdate('recording', from);
            }
        });
    } catch (e) {
        console.error('Command Error:', e);
        await conn.sendMessage(from,
            { text: '❌ An error occurred. Please try again.', contextInfo: newsletterContext },
            { quoted: m }
        );
        await robin.sendPresenceUpdate('recording', from);
    }
});