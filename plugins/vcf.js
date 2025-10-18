const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "vcf",
  alias: ["exportvcf", "contactsvcf"],
  react: "📇",
  desc: "Export all group members as VCF",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isGroup, senderNumber }) => {
  try {
    if (!isGroup) {
      return await client.sendMessage(from, { text: "❌ This command only works in groups." }, { quoted: message });
    }

    // Get group metadata
    const groupMetadata = await client.groupMetadata(from);
    const participants = groupMetadata.participants;

    if (!participants || participants.length === 0) {
      return await client.sendMessage(from, { text: "❌ No participants found." }, { quoted: message });
    }

    // Build VCF content
    let vcfContent = "";
    participants.forEach(p => {
      const number = p.id.split("@")[0];
      const name = p.notify || number;
      vcfContent += `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${number}
END:VCARD
`;
    });

    // Save to ./temp/hans-byte.vcf
    const tempDir = path.join(__dirname, "./temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const vcfPath = path.join(tempDir, "hans-byte.vcf");
    fs.writeFileSync(vcfPath, vcfContent, "utf-8");

    // Newsletter-style message
    const newsletterText = `📬 *Hans Byte Newsletter* 📬

Hello everyone!  
Attached is the latest contact list of our group.  
You can save it directly to your phone.  
Stay connected and enjoy! ✨`;

    await client.sendMessage(from, {
      text: newsletterText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363422794491778@newsletter",
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
          serverMessageId: 500
        },
        externalAdReply: {
          title: "HANS BYTE MD",
          body: "BY HANS TECH",
          mediaType: 2,
          thumbnail: null, // optional: can put Buffer or URL
          showAdAttribution: true,
          sourceUrl: "https://hansbtt.com"
        }
      }
    }, { quoted: message });

    // Send the VCF file
    await client.sendMessage(from, {
      document: fs.readFileSync(vcfPath),
      mimetype: "text/vcard",
      fileName: "hans-byte.vcf"
    }, { quoted: message });

  } catch (err) {
    console.error("VCF Error:", err);
    await client.sendMessage(from, { text: "❌ Error creating VCF:\n" + err.message }, { quoted: message });
  }
});
