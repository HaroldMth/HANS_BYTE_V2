const { cmd } = require("../command");
const axios = require('axios');
const path = require('path');

// Register the command 'dl'
cmd({
  pattern: 'dl',
  react: '📤',
  desc: 'Download files',
  category: 'file operations',
  filename: __filename,
}, async (_0x3272f1, _0x2f7c14, _0x5a7199, {
  from: _0x3b46fc,
  quoted: _0x2737c7,
  body: _0xfd7458,
  isCmd: _0x2bfe14,
  command: _0x8f6d37,
  args: _0x5d338d,
  q: _0x33f745,
  isGroup: _0x100944,
  sender: _0x4de8d6,
  reply: _0x4fd724
}) => {
  try {
    if (!_0x33f745) return _0x4fd724('Please provide a download link');
    
    const downloadUrl = _0x33f745;
    const filePath = path.basename(downloadUrl);
    const fileExtension = path.extname(filePath).substring(1);
    
    // Fetch the file data
    const fileData = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    let mimeType = 'application/octet-stream'; // Default MIME type
    
    // Set MIME type based on the file extension
    if (fileExtension === 'mp4') {
      mimeType = 'video/mp4';
    } else if (fileExtension === 'apk') {
      mimeType = 'application/vnd.android.package-archive';
    } else if (fileExtension === 'jpeg' || fileExtension === 'jpg' || fileExtension === 'png') {
      mimeType = 'image/jpeg';
    } else if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    }

    // Send the file to the user
    await _0x3272f1.sendMessage(_0x3b46fc, {
      document: { url: downloadUrl },
      mimetype: mimeType,
      fileName: filePath,
      caption: `Here is your ${fileExtension.toUpperCase()} file!`
    }, { quoted: _0x2f7c14 });

    // Notify user
    _0x4fd724(`Your ${fileExtension.toUpperCase()} file has been sent!`);
  } catch (error) {
    console.error(error);
    _0x4fd724(`❌ Error: ${error.message}`);
  }
});