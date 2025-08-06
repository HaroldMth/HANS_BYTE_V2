const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { tmpdir } = require("os");

cmd({
    pattern: "web2zip",
    alias: ["site2zip", "html2zip", "saveweb"],
    desc: "Download an entire website as a ZIP archive 📦",
    category: "download",
    react: "🌐",
    use: ".web2zip <url>",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
    try {
        if (!q) return reply("🌐 *Missing URL!*\n\nUsage: .web2zip https://example.com");

        if (!/^https?:\/\/.+/i.test(q)) {
            return reply("🚫 *Invalid URL!*\nMake sure it starts with http:// or https://");
        }

        reply("📦 *Generating ZIP archive of the site...*\nHold on tight! ⚙️");

        const apiUrl = `https://api.giftedtech.web.id/api/tools/web2zip?apikey=gifted&url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result?.download_url) {
            return reply("❌ *API Error!* Could not generate the ZIP.\nTry again later or check the URL.");
        }

        const { siteUrl, copiedFilesAmount, mimetype, download_url } = data.result;

        // Newsletter mention
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 143,
            },
        };

        await conn.sendMessage(mek.chat, {
            text:
                `✅ *Website Saved!*\n\n` +
                `🌐 *Site:* ${siteUrl}\n` +
                `📁 *Files Copied:* ${copiedFilesAmount}\n` +
                `📦 *MIME:* ${mimetype}\n\n` +
                `⬇️ *Uploading the ZIP file...*`,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Download file to a temp path
        const tempPath = path.join(tmpdir(), `web2zip_${Date.now()}.zip`);
        const response = await axios.get(download_url, {
            responseType: 'stream',
            timeout: 2 * 60 * 1000, // 2 minutes
            headers: {
                'User-Agent': 'Mozilla/5.0',
            }
        });

        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Send the ZIP file
        await conn.sendMessage(mek.chat, {
            document: fs.readFileSync(tempPath),
            mimetype: 'application/zip',
            fileName: `website-archive.zip`,
            caption: `🎁 *Download complete!*\n\n💡 Site: ${siteUrl}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Clean up
        fs.unlinkSync(tempPath);

    } catch (e) {
        console.error("Web2Zip Error:", e.message);

        let errorMsg = "💥 *Something went wrong while downloading or uploading the ZIP.*";

        if (e.response?.data?.message) {
            errorMsg += `\n\n🔧 *API Message:* ${e.response.data.message}`;
        } else if (e.message.includes("timeout")) {
            errorMsg += "\n\n⏱️ *Timeout:* The request took too long.";
        } else {
            errorMsg += `\n\n🧪 *Error:* ${e.message}`;
        }

        errorMsg += "\n\nTry again later or with another URL.";
        reply(errorMsg);
    }
});
