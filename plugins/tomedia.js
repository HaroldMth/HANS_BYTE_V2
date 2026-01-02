const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

// Ensure temp folder exists
const tempDir = path.join(__dirname, "./temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// helpers
const writeTemp = (prefix, ext, buffer) => {
  const p = path.join(tempDir, `${prefix}_${Date.now()}.${ext}`);
  fs.writeFileSync(p, buffer);
  return p;
};
const tryUnlink = (p) => {
  try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch (e) { /* ignore */ }
};

// ---------- 1. toimg - sticker to image ----------
cmd({
  pattern: "toimg",
  react: "🖼️",
  desc: "Convert sticker to image",
  category: "converter",
  use: ".toimg",
  filename: __filename,
}, async (conn, mek, m, { from }) => {
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    if (!quoted?.msg?.mimetype || !quoted.msg.mimetype.includes("webp")) {
      return conn.sendMessage(mek.key.remoteJid, { text: "🌻 Please reply to a sticker (webp)." }, { quoted: mek });
    }

    const stickerBuffer = await quoted.download();
    if (!stickerBuffer || stickerBuffer.length === 0) {
      return conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to download sticker." }, { quoted: mek });
    }

    const inputPath = writeTemp("sticker_input", "webp", stickerBuffer);
    const outputPath = path.join(tempDir, `sticker_out_${Date.now()}.png`);

    await sharp(inputPath)
      .resize(1024, 1024, { fit: 'inside' })
      .png()
      .toFile(outputPath);

    const imageBuf = fs.readFileSync(outputPath);
    await conn.sendMessage(from, { image: imageBuf, caption: "*Converted to Image ✅*" }, { quoted: mek });

    tryUnlink(inputPath);
    tryUnlink(outputPath);
  } catch (err) {
    console.error("toimg error:", err);
    tryUnlink(); // noop
    conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to convert sticker to image." }, { quoted: mek }).catch(()=>{});
  }
});

// ---------- 2. togif - sticker/video -> gif ----------
cmd({
  pattern: "togif",
  react: "🎞️",
  desc: "Convert video, GIF, or sticker to GIF",
  category: "converter",
  use: ".togif",
  filename: __filename,
}, async (conn, mek, m, { from }) => {
  let inputPath;
  let outputPath;
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    if (!quoted?.msg?.mimetype) {
      return conn.sendMessage(mek.key.remoteJid, { text: "🌻 Please reply to a video, GIF, or sticker." }, { quoted: mek });
    }

    const mime = quoted.msg.mimetype;
    const isVideo = mime.startsWith("video");
    const isGif = mime.includes("gif");
    const isWebp = mime.includes("webp");

    if (!isVideo && !isGif && !isWebp) {
      return conn.sendMessage(mek.key.remoteJid, { text: "🌻 Please reply to a video, GIF, or sticker." }, { quoted: mek });
    }

    const buffer = await quoted.download();
    if (!buffer || buffer.length === 0) return conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to download input." }, { quoted: mek });

    if (isVideo) inputPath = writeTemp("togif_in", "mp4", buffer);
    else if (isGif) inputPath = writeTemp("togif_in", "gif", buffer);
    else inputPath = writeTemp("togif_in", "webp", buffer); // sticker

    outputPath = path.join(tempDir, `togif_out_${Date.now()}.gif`);

    // Try direct conversion
    await new Promise((resolve, reject) => {
      const proc = ffmpeg(inputPath)
        .inputOptions(['-ignore_loop', '0'])
        .outputOptions([
          '-vf', 'fps=15,scale=320:-1:flags=lanczos',
          '-loop', '0',
          '-an',
          '-vsync', '0'
        ])
        .toFormat('gif')
        .save(outputPath);

      proc.on('end', resolve);
      proc.on('error', (err) => {
        console.error("ffmpeg -> gif error (direct):", err);
        reject(err);
      });
    });

    const gifBuf = fs.readFileSync(outputPath);
    // Send as video with gifPlayback or as document/gif to preserve animation
    // Using video + gifPlayback often makes clients play the gif inline
    await conn.sendMessage(from, { video: gifBuf, caption: "*Converted to GIF ✅*", gifPlayback: true }, { quoted: mek });

    tryUnlink(inputPath);
    tryUnlink(outputPath);
  } catch (err) {
    console.error("togif error:", err);

    // fallback: convert input -> mp4 -> gif
    try {
      if (!inputPath) return conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to convert to GIF." }, { quoted: mek });

      const fallbackMp4 = inputPath.replace(path.extname(inputPath), '.mp4');
      const fallbackGif = path.join(tempDir, `togif_fallback_${Date.now()}.gif`);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions(['-movflags', 'faststart'])
          .toFormat('mp4')
          .save(fallbackMp4)
          .on('end', resolve)
          .on('error', (e) => { console.error("ffmpeg -> mp4 fallback error:", e); reject(e); });
      });

      await new Promise((resolve, reject) => {
        ffmpeg(fallbackMp4)
          .outputOptions([
            '-vf', 'fps=15,scale=320:-1:flags=lanczos',
            '-loop', '0',
            '-an',
            '-vsync', '0'
          ])
          .toFormat('gif')
          .save(fallbackGif)
          .on('end', resolve)
          .on('error', (e) => { console.error("ffmpeg mp4->gif error:", e); reject(e); });
      });

      const gifBuf2 = fs.readFileSync(fallbackGif);
      await conn.sendMessage(from, { video: gifBuf2, caption: "*Converted to GIF ✅*", gifPlayback: true }, { quoted: mek });

      tryUnlink(inputPath);
      tryUnlink(fallbackMp4);
      tryUnlink(fallbackGif);
    } catch (fallbackErr) {
      console.error("togif final fallback error:", fallbackErr);
      tryUnlink(inputPath);
      tryUnlink(outputPath);
      conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to convert to GIF." }, { quoted: mek }).catch(()=>{});
    }
  }
});

// ---------- 3. tostick - any media (image/video/gif/webp) to sticker with HANS BYTE metadata ----------
cmd({
  pattern: "tostick",
  react: "🎴",
  desc: "Convert media (image, video, GIF, sticker) to sticker",
  category: "converter",
  use: ".tostick",
  filename: __filename,
}, async (conn, mek, m, { from }) => {
  let tmpIn;
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    if (!quoted?.msg?.mimetype) {
      return conn.sendMessage(mek.key.remoteJid, { text: "🌻 Please reply to an image, video, GIF, or sticker." }, { quoted: mek });
    }

    const mime = quoted.msg.mimetype;
    const buffer = await quoted.download();
    if (!buffer || buffer.length === 0) return conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to download media." }, { quoted: mek });

    if (mime.startsWith("image")) tmpIn = writeTemp("tostick_in", "png", buffer);
    else if (mime.startsWith("video")) tmpIn = writeTemp("tostick_in", "mp4", buffer);
    else if (mime.includes("gif")) tmpIn = writeTemp("tostick_in", "gif", buffer);
    else if (mime.includes("webp")) tmpIn = writeTemp("tostick_in", "webp", buffer);
    else tmpIn = writeTemp("tostick_in", "bin", buffer);

    // If it's an image: prepare a png resized to 512 box
    if (mime.startsWith("image")) {
      const prepared = path.join(tempDir, `tostick_ready_${Date.now()}.png`);
      await sharp(tmpIn)
        .resize(512, 512, { fit: 'inside' })
        .png()
        .toFile(prepared);
      tryUnlink(tmpIn);
      tmpIn = prepared;
    }

    // Read final input buffer
    const inputBuffer = fs.readFileSync(tmpIn);

    const isAnimated = mime.startsWith("video") || mime.includes("gif") || (mime.includes("webp") && buffer && buffer.length > 0);

    // Build sticker with wa-sticker-formatter (adds EXIF pack/author)
    const sticker = new Sticker(inputBuffer, {
      pack: "HANS BYTE",
      author: "HANS BYTE",
      type: isAnimated ? StickerTypes.ANIMATED : StickerTypes.FULL,
      quality: 80,
      animated: !!isAnimated,
    });

    const outBuffer = await sticker.toBuffer(); // webp with exif

    await conn.sendMessage(from, { sticker: outBuffer }, { quoted: mek });

    tryUnlink(tmpIn);
  } catch (err) {
    console.error("tostick error:", err);
    try { if (tmpIn) tryUnlink(tmpIn); } catch (e) {}
    conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to convert media to sticker." }, { quoted: mek }).catch(()=>{});
  }
});

// ---------- 4. tovV - view-once media ----------
cmd({
  pattern: "tovv",
  react: "👁️",
  desc: "Send media as view once",
  category: "utility",
  use: ".vv",
  filename: __filename,
}, async (conn, mek, m, { from }) => {
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    if (!quoted?.msg?.mimetype || (!quoted.msg.mimetype.startsWith("image") && !quoted.msg.mimetype.startsWith("video"))) {
      return conn.sendMessage(mek.key.remoteJid, { text: "🌻 Please reply to an image or video." }, { quoted: mek });
    }

    const mediaBuffer = await quoted.download();
    if (!mediaBuffer || mediaBuffer.length === 0) {
      return conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to download media." }, { quoted: mek });
    }

    const mediaType = quoted.msg.mimetype.startsWith("image") ? "image" : "video";

    // Baileys supports viewOnce key on the message object
    await conn.sendMessage(from, {
      [mediaType]: mediaBuffer,
      viewOnce: true,
      caption: "*Sent as View Once 👁️*"
    }, { quoted: mek });

  } catch (err) {
    console.error("tovv error:", err);
    conn.sendMessage(mek.key.remoteJid, { text: "❌ Failed to send media as view once." }, { quoted: mek }).catch(()=>{});
  }
});
