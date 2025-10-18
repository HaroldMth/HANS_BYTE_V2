// wastalk.js
const { cmd } = require("../command");

cmd({
  pattern: "wastalk",
  alias: ["channelstalk", "chinfo"],
  react: "🔎",
  desc: "Get WhatsApp Channel info from URL/JID (Baileys-only)",
  category: "stalk",
  filename: __filename,
}, async (robin, mek, m, { from, q, reply, sender, pushname }) => {
  try {
    // get input text (supports `.wastalk <url|jid|code>` or message body)
    const raw = (q && q.trim()) || (m && m.text && m.text.trim().split(/\s+/).slice(1).join(" ")) || "";
    if (!raw) {
      return reply("❌ Provide a channel URL, invite code or JID.\n\nExamples:\n`.wastalk https://whatsapp.com/channel/0029VaF5s07J5WqW`\n`.wastalk 120363422794491778@newsletter`\n`.wastalk 0029VaF5s07J5WqW`");
    }

    // normalize input -> either inviteCode or JID
    let target = raw;
    // match URL form
    const urlMatch = raw.match(/whatsapp\.com\/channel\/([0-9A-Za-z-_]+)/i);
    if (urlMatch) target = urlMatch[1];

    // if they pasted the full newsletter JID, keep it as is
    const isJid = /@newsletter$/i.test(target);

    // candidate Baileys method names (try each safely)
    const candidates = [
      "newsletterMeta",
      "newsletterMetadata",
      "getNewsletterMeta",
      "getNewsletterMetadata",
      "getNewsletter",
      "newsletterQuery",
      "queryNewsletter",
    ];

    let meta = null;
    let usedMethod = null;

    for (const name of candidates) {
      if (typeof robin[name] === "function") {
        try {
          // call with JID or invite code depending on what we have
          meta = await robin[name](isJid ? target : target);
          usedMethod = name;
          if (meta) break;
        } catch (err) {
          // method exists but threw — log and continue to next candidate
          console.error(`wastalk: method ${name} threw:`, err && err.message ? err.message : err);
          // continue trying other method names
        }
      }
    }

    // If not found via helper methods, try passing invite code as <invite>@newsletter
    if (!meta && !isJid) {
      const maybeJid = `${target}@newsletter`;
      // try same candidates with constructed JID
      for (const name of candidates) {
        if (typeof robin[name] === "function") {
          try {
            meta = await robin[name](maybeJid);
            usedMethod = name;
            if (meta) break;
          } catch (err) {
            console.error(`wastalk: method ${name} with constructed JID threw:`, err && err.message ? err.message : err);
          }
        }
      }
    }

    // If still no meta, give helpful message (no external APIs used)
    if (!meta) {
      // also show which methods are available on this robin instance (for debugging)
      const available = candidates.filter(n => typeof robin[n] === "function");
      let debug = available.length ? `Available Baileys methods: ${available.join(", ")}` : "No newsletter-related methods found on this Baileys instance.";
      debug += `\nTip: upgrade Baileys to a recent release (npm i @whiskeysockets/baileys@latest or baileys@latest) to get channel/newsletter APIs.`;

      return reply(
        `❌ Could not fetch newsletter/channel metadata via Baileys on this instance.\n\n${debug}`
      );
    }

    // Normalise meta fields (different versions return different shapes)
    const name = meta.name || meta.title || meta.displayName || meta.subject || "Unknown";
    const jid = meta.id || meta.jid || meta.channelJid || meta.newsletterJid || (isJid ? target : `${target}@newsletter`);
    const owner = meta.ownerJid || meta.owner || meta.admin || "Unknown";
    const description = meta.description || meta.about || meta.subtitle || "No description";
    const subscribers = meta.subscriberCount || meta.subscribers || meta.members || "N/A";
    const verified = (typeof meta.verified !== "undefined") ? meta.verified : (meta.isVerified ? meta.isVerified : false);
    const picture = (meta.picture && (meta.picture.url || meta.picture)) || (meta.profilePic && (meta.profilePic.url || meta.profilePic)) || null;

    let caption = `📡 *WhatsApp Channel Info*\n\n`;
    caption += `📛 *Name:* ${name}\n`;
    caption += `🆔 *JID:* ${jid}\n`;
    caption += `👤 *Owner:* ${owner}\n`;
    caption += `📌 *Description:* ${description}\n`;
    caption += `👥 *Subscribers:* ${subscribers}\n`;
    caption += `✔️ *Verified:* ${verified ? "Yes ✅" : "No ❌"}\n\n`;
    caption += `🔧 Retrieved with Baileys method: ${usedMethod || "unknown"}\n`;

    // send result (if picture exists send image, else plain text)
    if (picture) {
      await robin.sendMessage(from, {
        image: { url: picture },
        caption,
      }, { quoted: mek });
    } else {
      await robin.sendMessage(from, { text: caption }, { quoted: mek });
    }
  } catch (err) {
    console.error("wastalk - unexpected error:", err);
    reply(`❌ Error while running wastalk: ${err && err.message ? err.message : String(err)}`);
  }
});
