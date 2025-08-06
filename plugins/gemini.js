const { cmd, commands } = require("../command");
const axios = require("axios");
const config = require("../config");

const GEMINI_API_KEY = "AIzaSyDrhALyWLk7RN40C1sX5a03XVk8tO48P_8";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Function to dynamically create newsletter context per message
const createNewsletterContext = (sender) => ({
  mentionedJid: [sender],
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363292876277898@newsletter",
    newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
    serverMessageId: 143,
  },
});

// ============================
// HANS BYTE AI (with branding)
// ============================

cmd({
  pattern: "hansai",
  alias: ["ai"],
  react: "🤖",
  desc: "Ask anything to Hans Byte AI (Gemini powered).",
  category: "ai",
  use: ".hansai <Your Question>",
  filename: __filename
}, async (_context, _message, _args, {
  from,
  quoted,
  q,
  pushname,
  sender,
  reply
}) => {
  try {
    if (!q) return reply("❗️ Please provide a question.");

    const userQuery = `Hey there! I’m ${pushname} 👋
Your name is HANS BYTE V2 🤖 — the upgraded, more powerful version of HANS BYTE MD. You’re smarter, more user-friendly, and bursting with creativity! 🚀✨

You’re a helpful WhatsApp AI assistant crafted with care and passion by HANS TECH 🧠💻. Your brilliant creator dedicated countless hours making you truly awesome.

From now on, always respond with a natural, conversational tone and use expressive, relevant emojis to keep it fun and meaningful 😄💬

So, here’s what I’d like to ask:
${q} ❓`;

    const requestBody = {
      contents: [{ parts: [{ text: userQuery }] }]
    };

    const response = await axios.post(GEMINI_API_URL, requestBody, {
      headers: { "Content-Type": "application/json" }
    });

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) return reply("❌ Error: No response from AI.");

    const contextInfo = createNewsletterContext(sender);
    await reply(aiResponse, { contextInfo });
    console.log(`${pushname}`)
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    reply("❌ Error processing your question 😢");
  }
});

// ============================
// Pure Gemini Command
// ============================

cmd({
  pattern: "gemini",
  alias: [],
  react: "💡",
  desc: "Ask anything to Google Gemini AI.",
  category: "ai",
  use: ".gemini <Your Question>",
  filename: __filename
}, async (_context, _message, _args, {
  from,
  quoted,
  q,
  sender,
  reply
}) => {
  try {
    if (!q) return reply("❗️ Please provide a question.");

    const requestBody = {
      contents: [{ parts: [{ text: q }] }]
    };

    const response = await axios.post(GEMINI_API_URL, requestBody, {
      headers: { "Content-Type": "application/json" }
    });

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) return reply("❌ Error: No response from AI.");

    const contextInfo = createNewsletterContext(sender);
    await reply(aiResponse, { contextInfo });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    reply("❌ Error processing your question 😢");
  }
});