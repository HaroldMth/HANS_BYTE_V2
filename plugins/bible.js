const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
  pattern: 'bible',
  desc: 'Receive a blessing from the Holy Scriptures',
  category: 'religion',
  react: '✝️',
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    const reference = args.join(' ').trim();
    if (!reference) {
      return reply('🙏 Please provide a Bible reference. Example: `bible John 3:16`');
    }

    // Parse "Book chapter:verse[-end]" (simple)
    const refMatch = reference.match(/^(.+?)\s+(\d+)(?::(\d+(?:-\d+)?))?$/i);
    if (!refMatch) return reply('⚠️ Could not parse that reference. Use format like `John 3:16` or `Genesis 1`.');

    const book = refMatch[1].trim();
    const chapter = parseInt(refMatch[2], 10);
    const versePart = refMatch[3] || null;

    let verseStart = null, verseEnd = null;
    if (versePart) {
      if (versePart.includes('-')) {
        const [s, e] = versePart.split('-').map(Number);
        verseStart = s; verseEnd = e;
      } else {
        verseStart = parseInt(versePart, 10);
        verseEnd = verseStart;
      }
    }

    // Build API URL
    let apiUrl = `https://hanstech-api.zone.id/api/bible?book=${encodeURIComponent(book)}&chapter=${chapter}&key=hans%7EUfvyXEb`;
    if (verseStart) apiUrl += `&verse=${verseStart}`;

    const res = await fetchJson(apiUrl);
    if (!res || res.status !== 'success' || !res.data) {
      return reply('⚠️ Could not fetch the verse. Please check your reference.');
    }

    let message = `✝️ *${res.data.book} ${chapter}${verseStart ? ':' + verseStart + (verseEnd && verseEnd !== verseStart ? '-' + verseEnd : '') : ''}* — *${res.data.version}*\n\n`;
    message += `${res.data.text}\n\n🕊️ *May God bless you as you meditate on His Word.*`;

    await conn.sendMessage(from, { text: message }, { quoted: mek });

  } catch (err) {
    console.error(err);
    return reply(`⚠️ Error: ${err.message || err}\n\n🙏 Try again later.`);
  }
});
