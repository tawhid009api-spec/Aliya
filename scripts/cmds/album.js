const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://masterjiraya738_db_user:JVb4hYse5phlRoM8@cluster0.gdb5tbb.mongodb.net/?appName=Cluster0";

// --- MongoDB Connection ---
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGO_URI).catch(err => console.error("MongoDB Connection Error:", err));
}

// --- Mongoose Schema & Model ---
const AlbumSchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  folderId: { type: String, required: true },
  isLocked: { type: Boolean, default: false }
});

const AlbumModel = mongoose.models.AliyaAlbum || mongoose.model("AliyaAlbum", AlbumSchema);

module.exports = {
  config: {
    name: "album",
    version: "5.1.0",
    author: "Roni & King",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Fetch cute videos from Drive categories directly via MongoDB" },
    longDescription: { en: "Manage pookie video album categories in MongoDB." },
    category: "media",
    guide: {
      en: "{p}album [page]\n" +
          "Admin Commands:\n" +
          "{p}album -c \"Category Name\": \"Folder ID\"\n" +
          "{p}album -r \"Category Name\"\n" +
          "{p}album -l \"Category Name\""
    }
  },

  onChat: async function ({ api, event }) {
    if (event.senderID == api.getCurrentUserID()) return;
    const msg = event.body ? event.body.trim() : "";
    
    // "🗂️" Emoji trigger
    if (msg === "🗂️") {
      return this.onStart({ api, event, args: [], role: 0 });
    }
  },

  onStart: async function ({ api, event, args, role }) {
    const { threadID, messageID, senderID } = event;
    const isAdmin = role >= 2; 

    // ───────────────── ADMIN COMMANDS ─────────────────
    
    // 1. ADD / CREATE CATEGORY (-c)
    if (args[0] === "-c" || args[0] === "add") {
      if (!isAdmin) return api.sendMessage("🎀 𝒪𝑜𝓅𝓈! 𝒪𝓃𝓁𝓎 𝒷𝑜𝓉 𝒶𝒹𝓂𝒾𝓃 𝒸𝒶𝓃 𝒶𝒹𝒹 𝒸𝒶𝓉𝑒𝑔𝑜𝓇𝒾𝑒𝓈 𝓅𝑜𝑜𝓀𝒾𝑒~ ✨", threadID, messageID);

      const input = args.slice(1).join(" ");
      const match = input.match(/"([^"]+)"\s*:\s*"([^"]+)"/);

      if (!match) {
        return api.sendMessage("🥺 𝐹𝑜𝓇𝓂𝒶𝓉 𝒾𝓃𝒸𝑜𝓇𝓇𝑒𝒸𝓉!\n📌 𝒰𝓈𝑒: album -c \"Category Name\": \"Drive Folder ID\"", threadID, messageID);
      }

      const categoryName = match[1].trim();
      const folderId = match[2].trim();

      try {
        await AlbumModel.findOneAndUpdate(
          { categoryName: new RegExp(`^${categoryName}$`, "i") },
          { categoryName, folderId },
          { upsert: true, new: true }
        );
        return api.sendMessage(`🌸 𝒞𝒶𝓉𝑒𝑔𝑜𝓇𝓎 "${categoryName}" 𝓈𝓊𝒸𝒸𝑒𝓈𝓈𝒻𝓊𝓁𝓁𝓎 𝒶𝒹𝒹𝑒𝒹/𝓊𝓅𝒹𝒶𝓉𝑒𝒹! 𝒫𝑜𝑜𝓀𝒾𝑒! 🎉`, threadID, messageID);
      } catch (err) {
        return api.sendMessage(`❌ 𝐹𝒶𝒾𝓁𝑒𝒹 𝓉𝑜 𝓈𝒶𝓋𝑒: ${err.message}`, threadID, messageID);
      }
    }

    // 2. REMOVE CATEGORY (-r)
    if (args[0] === "-r" || args[0] === "remove") {
      if (!isAdmin) return api.sendMessage("🎀 𝒪𝑜𝓅𝓈! 𝒪𝓃𝓁𝓎 𝒷𝑜𝓉 𝒶𝒹𝓂𝒾𝓃 𝒸𝒶𝓃 𝓇𝑒𝓂𝑜𝓋𝑒 𝒸𝒶𝓉𝑒𝑔𝑜𝓇𝒾𝑒𝓈! ✨", threadID, messageID);

      const input = args.slice(1).join(" ").replace(/"/g, "").trim();
      if (!input) return api.sendMessage("🥺 𝒫𝓁𝑒𝒶𝓈𝑒 𝓅𝓇𝑜𝓋𝒾𝒹𝑒 𝒶 𝒸𝒶𝓉𝑒𝑔𝑜𝓇𝓎 𝓃𝒶𝓂𝑒!\n📌 𝒰𝓈𝑒: album -r \"Category Name\"", threadID, messageID);

      try {
        const deleted = await AlbumModel.findOneAndDelete({ categoryName: new RegExp(`^${input}$`, "i") });
        if (!deleted) return api.sendMessage(`🥺 𝒞𝒶𝓉𝑒𝑔𝑜𝓇𝓎 "${input}" 𝓃𝑜𝓉 𝒻𝑜𝓊𝓃𝒹, 𝓅𝑜𝑜𝓀𝒾𝑒!`, threadID, messageID);
        
        return api.sendMessage(`🗑️ 𝒞𝒶𝓉𝑒𝑔𝑜𝓇𝓎 "${deleted.categoryName}" 𝒽𝒶𝓈 𝒷𝑒𝑒𝓃 𝓇𝑒𝓂𝑜𝓋𝑒𝒹 𝓈𝓊𝒸𝒸𝑒𝓈𝓈𝒻𝓊𝓁𝓁𝓎! ✨`, threadID, messageID);
      } catch (err) {
        return api.sendMessage(`❌ 𝐹𝒶𝒾𝓁𝑒𝒹 𝓉𝑜 𝓇𝑒𝓂𝑜𝓋𝑒: ${err.message}`, threadID, messageID);
      }
    }

    // 3. LOCK / UNLOCK CATEGORY (-l)
    if (args[0] === "-l" || args[0] === "lock") {
      if (!isAdmin) return api.sendMessage("🎀 𝒪𝑜𝓅𝓈! 𝒪𝓃𝓁𝓎 𝒷𝑜𝓉 𝒶𝒹𝓂𝒾𝓃 𝒸𝒶𝓃 𝓁𝑜𝒸𝓀/𝓊𝓃𝓁𝑜𝒸𝓀 𝒸𝒶𝓉𝑒𝑔𝑜𝓇𝒾𝑒𝓈! ✨", threadID, messageID);

      const input = args.slice(1).join(" ").replace(/"/g, "").trim();
      if (!input) return api.sendMessage("🥺 𝒫𝓁𝑒𝒶𝓈𝑒 𝓅𝓇𝑜𝓋𝒾𝒹𝑒 𝒶 𝒸𝒶𝓉𝑒𝑔𝑜𝓇𝓎 𝓃𝒶𝓂𝑒!\n📌 𝒰𝓈𝑒: album -l \"Category Name\"", threadID, messageID);

      try {
        const cat = await AlbumModel.findOne({ categoryName: new RegExp(`^${input}$`, "i") });
        if (!cat) return api.sendMessage(`🥺 𝒞𝒶𝓉𝑒𝑔𝑜𝓇𝓎 "${input}" 𝓃𝑜𝓉 𝒻𝑜𝓊𝓃𝒹!`, threadID, messageID);

        cat.isLocked = !cat.isLocked;
        await cat.save();

        const status = cat.isLocked ? "🔒 𝐿𝑜𝒸𝓀𝑒𝒹 (𝒜𝒹𝓂𝒾𝓃 𝒪𝓃𝓁𝓎)" : "🔓 𝒰𝓃𝓁𝑜𝒸𝓀𝑒𝒹 (𝐸𝓋𝑒𝓇𝓎𝑜𝓃𝑒)";
        return api.sendMessage(`🎀 𝒮𝓉𝒶𝓉𝓊𝓈 𝓊𝓅𝒹𝒶𝓉𝑒𝒹 𝒻𝑜𝓇 "${cat.categoryName}": ${status} ✨`, threadID, messageID);
      } catch (err) {
        return api.sendMessage(`❌ 𝐸𝓇𝓇𝑜𝓇: ${err.message}`, threadID, messageID);
      }
    }

    // ───────────────── PUBLIC LISTING ─────────────────
    try {
      const categories = await AlbumModel.find({});
      if (!categories || categories.length === 0) {
        return api.sendMessage("🥺 𝒩𝑜 𝒶𝒸𝓉𝒾𝓋𝑒 𝓅𝑜𝑜𝓀𝒾𝑒 𝒶𝓁𝒷𝓊𝓂 𝒸𝒶𝓉𝑒𝑔𝑜𝓇𝒾𝑒𝓈 𝒻𝑜𝓊𝓃𝒹!", threadID, messageID);
      }

      const itemsPerPage = 10;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(categories.length / itemsPerPage);

      if (page < 1 || page > totalPages) {
        return api.sendMessage(`🥺 𝐼𝓃𝓋𝒶𝓁𝒾𝒹 𝓅𝒶𝑔𝑒! 𝒞𝒽𝑜𝑜𝓈𝑒 𝒷𝑒𝓉𝓌𝑒𝑒𝓃 𝟣 - ${totalPages} ✨`, threadID, messageID);
      }

      const startIndex = (page - 1) * itemsPerPage;
      const displayedCategories = categories.slice(startIndex, startIndex + itemsPerPage);

      let message = `—͟͞Aliya_𝒜𝓁𝒷𝓊𝓂_ᥫ᭡—͟͞🌷\n` +
        `𝒜𝓋𝒶𝒾𝓁𝒶𝒷𝓁𝑒 𝒱𝒾𝒹𝑒𝑜 𝒞𝒶𝓉𝑒𝑔𝑜𝓇𝒾𝑒𝓈 🎀\n` +
        `𐙚━━━━━━━━━━━━━━━━━━━━ᡣ𐭩\n` +
        displayedCategories.map((cat, index) => {
          const lockIcon = cat.isLocked ? " 🔒" : "";
          return `╭‣ ${startIndex + index + 1}. ${cat.categoryName}${lockIcon}`;
        }).join("\n") +
        `\n𐙚━━━━━━━━━━━━━━━━━━━━ᡣ𐭩\n` +
        `♻️ | 𝒫𝒶𝑔𝑒 [${page}/${totalPages}]\n` +
        `ℹ️ | 𝑅𝑒𝓅𝓁𝓎 𝓌𝒾𝓉𝒽 𝒶 𝓃𝓊𝓂𝒷𝑒𝓇 𝓉𝑜 𝑔𝑒𝓉 𝓋𝒾𝒹𝑒𝑜! 🌸`;

      if (page < totalPages) {
        message += `\nℹ️ | 𝒯𝓎𝓅𝑒 (album ${page + 1}) 𝒻𝑜𝓇 𝓃𝑒𝓍𝓉 𝓅𝒶𝑔𝑒 ✨`;
      }

      return api.sendMessage(message, threadID, (error, info) => {
        if (error) return;

        const replyData = {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          displayedCategories: displayedCategories
        };

        if (global.GoatBot && global.GoatBot.onReply) {
          global.GoatBot.onReply.set(info.messageID, replyData);
        } else if (global.client && global.client.handleReply) {
          global.client.handleReply.push({
            messageID: info.messageID,
            name: this.config.name,
            author: senderID,
            displayedCategories: displayedCategories
          });
        }
      }, messageID);

    } catch (err) {
      return api.sendMessage(`❌ 𝐸𝓇𝓇𝑜𝓇: ${err.message}`, threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply, handleReply, role }) {
    const replyData = Reply || handleReply;
    const { threadID, messageID, body } = event;
    const isAdmin = role >= 2;

    if (replyData.messageID) {
      api.unsendMessage(replyData.messageID);
    }

    const replyIndex = parseInt(body.trim()) - 1;
    const displayedCategories = replyData.displayedCategories;

    if (isNaN(replyIndex) || replyIndex < 0 || replyIndex >= displayedCategories.length) {
      return api.sendMessage(`🥺 𝐼𝓃𝓋𝒶𝓁𝒾𝒹 𝒸𝒽𝑜𝒾𝒸𝑒! 𝑅𝑒𝓅𝓁𝓎 𝒲𝒾𝓉𝒽 𝟣 𝓉𝑜 ${displayedCategories.length} ✨`, threadID, messageID);
    }

    const selectedCategory = displayedCategories[replyIndex];

    // Lock condition check
    if (selectedCategory.isLocked && !isAdmin) {
      return api.sendMessage(`🔒 𝒞𝒶𝓉𝑒𝑔𝑜𝓇𝓎 "${selectedCategory.categoryName}" 𝒾𝓈 𝓁𝑜𝒸𝓀𝑒𝒹 𝒷𝓎 𝒶𝒹𝓂𝒾𝓃, 𝓅𝑜𝑜𝓀𝒾𝑒!`, threadID, messageID);
    }

    if (api.setMessageReaction) {
      api.setMessageReaction("🎀", messageID, () => {}, true);
    }

    const tempFilePath = path.join(__dirname, `album_temp_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp4`);

    try {
      const driveUrl = `https://drive.google.com/embeddedfolderview?id=${selectedCategory.folderId}`;
      const response = await axios.get(driveUrl).catch(async () => {
        return await axios.get(`https://docs.google.com/uc?export=list&id=${selectedCategory.folderId}`);
      });

      const htmlData = response.data;
      const matches = [...htmlData.matchAll(/"([^"]+)"\s*,\s*\[\s*"([^"]+)"\s*,\s*([0-9]+)\s*,\s*"([^"]+)"/g)];

      let fileId = "";
      if (!matches || matches.length === 0) {
        const fallbackMatches = [...htmlData.matchAll(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/g)];
        if (fallbackMatches.length === 0) {
          return api.sendMessage(`🥺 𝒩𝑜 𝓋𝒾𝒹𝑒𝑜𝓈 𝒻𝑜𝓊𝓃𝒹 𝒾𝓃 "${selectedCategory.categoryName}"!`, threadID, messageID);
        }
        fileId = fallbackMatches[Math.floor(Math.random() * fallbackMatches.length)][1];
      } else {
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        fileId = randomMatch[1];
      }

      const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

      const streamRes = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const writer = fs.createWriteStream(tempFilePath);
      streamRes.data.pipe(writer);

      writer.on("finish", () => {
        const catName = selectedCategory.categoryName;
        const cleanCatName = catName.toLowerCase().includes("video") ? catName : `${catName} Video`;

        const caption = `—͟͞Aliya_𝒜𝓁𝒷𝓊𝓂_ᥫ᭡—͟͞🌷\n` +
                        `𝐻𝑒𝓇𝑒'𝓈 𝓎𝑜𝓊𝓇 ${cleanCatName} 🌸✨`;

        api.sendMessage({
          body: caption,
          attachment: fs.createReadStream(tempFilePath)
        }, threadID, () => {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }, messageID);
      });

      writer.on("error", () => {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        api.sendMessage("❌ 𝐹𝒶𝒾𝓁𝑒𝒹 𝓉𝑜 𝒹𝑜𝓌𝓃𝓁𝑜𝒶𝒹 𝓋𝒾𝒹𝑒𝑜, 𝓅𝑜𝑜𝓀𝒾𝑒!", threadID, messageID);
      });

    } catch (err) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return api.sendMessage(`❌ 𝒟𝓇𝒾𝓋𝑒 𝐸𝓇𝓇𝑜𝓇: ${err.message}`, threadID, messageID);
    }
  }
};

