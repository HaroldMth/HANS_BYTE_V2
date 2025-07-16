const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

// Trivia Quiz Command
cmd({
  pattern: "quiz",
  react: "❓",
  desc: "Start a random trivia quiz",
  category: "fun",
  use: ".quiz",
  filename: __filename
}, async (_ctx, msg, _args, { reply, client }) => {
  try {
    const res = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
    const data = res.data.results[0];
    const question = data.question;
    const correct = data.correct_answer;
    const allAnswers = [...data.incorrect_answers, correct].sort(() => Math.random() - 0.5);
    const answerIndex = allAnswers.findIndex(ans => ans === correct) + 1;

    await reply(
      `🧠 *Trivia Time!*\n\n` +
      `❓ ${question}\n\n` +
      allAnswers.map((a, i) => `*${i + 1}.* ${a}`).join("\n") +
      `\n\n_Reply with the correct option number (1-${allAnswers.length}) within *10 seconds*_`
    );

    const filter = m => m.key.fromMe === false && m.message?.conversation;
    const timeout = 10000;

    const collected = await client.waitForMessage(msg.key.remoteJid, filter, { timeout });

    if (!collected) return reply("⏱️ Time's up! You didn't answer in time.");

    const userAnswer = parseInt(collected.message.conversation.trim());

    if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > allAnswers.length) {
      return reply("❌ Invalid answer format. Use the number of the correct choice.");
    }

    if (userAnswer === answerIndex) {
      return reply("✅ *Correct!* You're a quiz master! 🎉");
    } else {
      return reply(`❌ *Wrong!* The correct answer was: *${answerIndex}. ${correct}*`);
    }
  } catch (err) {
    console.error(err);
    reply("❌ Could not fetch quiz question. Try again later.");
  }
});

// Riddle Command
cmd({
  pattern: "riddle",
  react: "🧠",
  desc: "Sends a brain-teasing riddle",
  category: "fun",
  use: ".riddle",
  filename: __filename
}, async (_ctx, _msg, _args, { reply }) => {
  try {
    const { data } = await axios.get("https://riddles-api.vercel.app/random");
    await reply(`*Riddle:* ${data.riddle}\n*Answer:* ||${data.answer}||`);
  } catch (e) {
    console.error(e);
    reply("❌ Could not fetch a riddle.");
  }
});

const GEMINI_API_KEY = config.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Typing Speed Game
cmd({
  pattern: "typegame",
  react: "⌨️",
  desc: "Speed typing mini game",
  category: "fun",
  use: ".typegame",
  filename: __filename
}, async (_ctx, msg, _args, { reply, client }) => {
  try {
    const prompt = {
      contents: [{
        parts: [{
          text: "Generate a challenging sentence for a typing speed game. It should be at least 20 words long, use diverse vocabulary, and be grammatically correct. Output only the sentence, no explanation."
        }]
      }]
    };

    const res = await axios.post(GEMINI_API_URL, prompt, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const geminiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const sentence = geminiText?.replace(/\n/g, " ").trim();

    if (!sentence || sentence.split(" ").length < 10) {
      return reply("❌ Failed to get a valid sentence from Gemini. Try again.");
    }

    await reply(`⌨️ *Typing Speed Challenge!*\n\nType this sentence exactly as shown below:\n\n"${sentence}"\n\n⏱️ _You have 20 seconds!_`);

    const startTime = Date.now();

    const filter = m => m.key.fromMe === false && m.message?.conversation;
    const collected = await client.waitForMessage(msg.key.remoteJid, filter, { timeout: 20000 });

    if (!collected) return reply("⏱️ Time's up! You didn't answer in time.");

    const userInput = collected.message.conversation.trim();
    const endTime = Date.now();

    if (userInput !== sentence) {
      return reply("❌ You typed it incorrectly. Better luck next time!");
    }

    const timeTaken = (endTime - startTime) / 1000;
    const words = sentence.split(" ").length;
    const wpm = Math.round((words / timeTaken) * 60);

    await reply(`✅ *Correct!*\n🕒 Time: ${timeTaken.toFixed(2)} seconds\n📈 Speed: ${wpm} WPM\n🔥 Sentence Length: ${words} words`);
  } catch (e) {
    console.error("TypeGame Error:", e?.response?.data || e.message);
    reply("⚠️ Failed to start the typing game. Please try again later.");
  }
});

// Love Check Command
cmd({
  pattern: "lovecheck",
  react: "❤️",
  desc: "Fun love % between two users",
  category: "fun",
  use: ".lovecheck <@user>",
  filename: __filename
}, async (_ctx, message, args, { reply, sender }) => {
  const mentionedUser = message.mentionedJid?.[0];

  if (!mentionedUser) {
    return reply("❌ Please mention a user to check love compatibility.\nExample: .lovecheck @user");
  }

  const love = Math.floor(Math.random() * 101);
  reply(`💕 Love compatibility between *${sender.split("@")[0]}* and *${mentionedUser.split("@")[0]}*: *${love}%*`);
});

// Match Me Command
cmd({
  pattern: "matchme",
  react: "🤝",
  desc: "Randomly pair 2 members in the group",
  category: "fun",
  use: ".matchme",
  filename: __filename
}, async (_ctx, msg, _args, { reply, groupMetadata }) => {
  const participants = groupMetadata.participants.map(p => p.id);
  if (participants.length < 2)
    return reply("Not enough members to match.");

  const pick = () => participants.splice(Math.floor(Math.random() * participants.length), 1)[0];
  const a = pick();
  const b = pick();

  const aUser = a.split("@")[0];
  const bUser = b.split("@")[0];
  const zeroWidthSpace = "\u200b";

  const text = `Match: @${aUser}${zeroWidthSpace} ❤️ @${bUser}${zeroWidthSpace}`;

  reply(text, { mentions: [{ id: a }, { id: b }] });
});

// Reverse Text Command
cmd({
  pattern: "reverse",
  react: "🔄",
  desc: "Replies with the reversed text",
  category: "fun",
  use: ".reverse <text>",
  filename: __filename
}, (_ctx, _msg, args, { reply }) => {
  const input = args.join(" ");
  if (!input) return reply("❗️ Please provide text to reverse.");
  reply(input.split("").reverse().join(""));
});