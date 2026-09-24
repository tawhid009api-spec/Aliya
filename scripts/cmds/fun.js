// Banner Image: https://files.catbox.moe/ixj7u8.jpg

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const FOLDER_ID = "1YxVOIOKLkUdV9aatf4SAeey_T6ZbCPQX";
const CACHE_DIR = path.join(__dirname, "cache");

// Cache folder না থাকলে তৈরি করবে
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

module.exports = {
  config: {
    name: "fun",
    aliases: ["👀"],
    version: "1.0.3",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 0,
    category: "media",
    shortDescription: {
      en: "Random videos from drive and sync folder"
    },
    guide: {
      en: "{pn} | {pn} sync | 👀"
    }
  },

  onChat: async function ({ api, event }) {
    if (event.senderID == api.getCurrentUserID()) return;

    if (event.body && event.body.trim() === "👀") {
      return sendRandomVideo(api, event);
    }
  },

  onStart: async function ({ api, event, args }) {
    if (args[0] === "sync") {
      return handleSync(api, event);
    }

    return sendRandomVideo(api, event);
  }
};


// ===============================
// DRIVE SYNC
// ===============================

async function handleSync(api, event) {
  const { threadID, messageID } = event;

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const response = await axios.get(
      `https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`,
      {
        timeout: 20000
      }
    );

    const matches = [
      ...response.data.matchAll(
        /\/file\/d\/([a-zA-Z0-9_-]+)\/view/g
      )
    ];

    if (matches.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);

      return api.sendMessage(
        "📁 No files found in the drive folder.",
        threadID,
        messageID
      );
    }

    const report =
      `📊 Drive Sync Report\n\n` +
      `• Total files detected: ${matches.length}\n` +
      `• Folder ID: ${FOLDER_ID}\n\n` +
      `✅ Everything is synced and ready!`;

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage(report, threadID, messageID);

  } catch (err) {
    console.error("Sync Error:", err);

    api.setMessageReaction("❌", messageID, () => {}, true);

    return api.sendMessage(
      "❌ Error syncing drive folder.",
      threadID,
      messageID
    );
  }
}


// ===============================
// RANDOM VIDEO
// ===============================

async function sendRandomVideo(api, event) {
  const { threadID, messageID } = event;

  let filePath = null;

  try {
    // Loading reaction
    api.setMessageReaction("⏳", messageID, () => {}, true);

    // Get Drive folder
    const response = await axios.get(
      `https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`,
      {
        timeout: 20000
      }
    );

    // Find files
    const matches = [
      ...response.data.matchAll(
        /\/file\/d\/([a-zA-Z0-9_-]+)\/view/g
      )
    ];

    if (matches.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);

      return api.sendMessage(
        "❌ No videos found in drive.",
        threadID
      );
    }

    // Random file
    const randomFile =
      matches[Math.floor(Math.random() * matches.length)][1];

    const downloadUrl =
      `https://docs.google.com/uc?export=download&id=${randomFile}`;

    filePath = path.join(
      CACHE_DIR,
      `fun_${randomFile}.mp4`
    );

    // Download video
    const downloadResponse = await axios({
      url: downloadUrl,
      method: "GET",
      responseType: "stream",
      timeout: 120000
    });

    // Save video
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);

      downloadResponse.data.pipe(writer);

      writer.on("finish", resolve);
      writer.on("error", reject);
      downloadResponse.data.on("error", reject);
    });

    // Send video
    await new Promise((resolve, reject) => {
      api.sendMessage(
        {
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // =========================================
    // VIDEO SUCCESSFULLY SENT
    // এখন original message-এ 🪶 reaction
    // =========================================

    api.setMessageReaction(
      "🪶",
      messageID,
      () => {},
      true
    );

  } catch (err) {
    console.error("Fun Video Error:", err);

    api.setMessageReaction(
      "❌",
      messageID,
      () => {},
      true
    );

  } finally {
    // Cache file delete
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Cache Delete Error:", e);
      }
    }
  }
}

Flow এখন হবে:

"👀" → "⏳" → Drive থেকে random video → ভিডিও send complete → original "👀" message-এ 🪶 🪶

আর ভিডিও send না হলে 🪶 দেবে না, "❌" দেবে।
