const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

const recentPairs = new Map();

// Mathematical Bold Sans Converter Function
function toMathBold(str) {
  const charMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
    'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
    'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝘫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
    'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
    'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟩', '8': '𝟴', '9': '𝟵'
  };

  return str.split('').map(char => charMap[char] || char).join('');
}

// Fixed Selected Caption #2
const fixedCaption = "Every love story is beautiful, but ours is my favorite.";

module.exports = {
  config: {
    name: "pair9",
    author: "Mr.King",
    version: "1.0.5",
    role: 0,
    shortDescription: {
      en: "Pair male and female members with scenic landscape"
    },
    longDescription: {
      en: "Pair with a specific mentioned user or automatically find an opposite gender match in the group."
    },
    category: "love",
    guide: {
      en: "{pref}pair9 or {pref}pair9 @mention"
    }
  },

  downloadWithRetry: async function(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 15000,
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
          }
        });
        return response;
      } catch (error) {
        if (error.response?.status === 429) {
          const waitTime = delay * Math.pow(2, i);
          console.log(`Rate limited, waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries reached");
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, mentions } = event;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const pathAvt1 = path.join(cacheDir, `avt1_${Date.now()}.png`);
    const pathAvt2 = path.join(cacheDir, `avt2_${Date.now()}.png`);
    const pathImg = path.join(cacheDir, `pair9_${Date.now()}.png`);

    try {
      let id1 = senderID, id2, name2;

      const ThreadInfo = await api.getThreadInfo(threadID);
      const all = ThreadInfo.userInfo;
      const senderInfo = all.find(u => u.id == id1);
      const senderGender = senderInfo ? senderInfo.gender : null;

      if (!senderGender || (senderGender !== "MALE" && senderGender !== "FEMALE")) {
        return api.sendMessage("❌ 𝓐𝓵𝓲𝔂𝓪 ♡ » Could not determine your gender! Please ensure your Facebook profile has gender set to Male or Female.", threadID, messageID);
      }

      if (Object.keys(mentions).length > 0) {
        id2 = Object.keys(mentions)[0];
        const mentionedUser = all.find(u => u.id == id2);
        const mentionedGender = mentionedUser ? mentionedUser.gender : null;
        
        if (senderGender === mentionedGender) {
          return api.sendMessage(
            senderGender === "MALE" 
              ? "❌ 𝓐𝓵𝓲𝔂𝓪 ♡ » You can't pair with another boy! 💔\nOnly Boys ↔️ Girls matching allowed!" 
              : "❌ 𝓐𝓵𝓲𝔂𝓪 ♡ » You can't pair with another girl! 💔\nOnly Girls ↔️ Boys matching allowed!", 
            threadID, messageID
          );
        }

        const mentionedName = mentions[id2].replace("@", "");
        
        let userInfoData;
        try {
          userInfoData = await api.getUserInfo([id1, id2]);
        } catch (e) {
          userInfoData = {};
        }
        
        const name1 = userInfoData[id1]?.name || "You";
        const name2 = mentionedName || userInfoData[id2]?.name || "Someone";
        
        return await this.createAndSendPair(api, threadID, messageID, id1, id2, name1, name2, pathAvt1, pathAvt2, pathImg);
      }

      let targetGender = senderGender === "MALE" ? "FEMALE" : "MALE";
      let candidates = all.filter(u => u.gender === targetGender && u.id !== id1);

      if (candidates.length === 0) {
        const genderText = senderGender === "MALE" ? "girls" : "boys";
        return api.sendMessage(`❌ 𝓐𝓵𝓲𝔂𝓪 ♡ » No ${genderText} found in this group to pair with!`, threadID, messageID);
      }

      const userKey = `${threadID}_${id1}`;
      let recentList = recentPairs.get(userKey) || [];
      
      let availableCandidates = candidates.filter(u => !recentList.includes(u.id));
      
      if (availableCandidates.length === 0) {
        recentList = [];
        availableCandidates = candidates;
      }

      const randomUser = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
      id2 = randomUser.id;
      name2 = randomUser.name;

      recentList.push(id2);
      if (recentList.length > 5) recentList.shift();
      recentPairs.set(userKey, recentList);

      let userInfoData;
      try {
        userInfoData = await api.getUserInfo([id1, id2]);
      } catch (e) {
        userInfoData = {};
      }
      
      const name1 = userInfoData[id1]?.name || "You";
      if (!name2) name2 = userInfoData[id2]?.name || "Someone";

      return await this.createAndSendPair(api, threadID, messageID, id1, id2, name1, name2, pathAvt1, pathAvt2, pathImg);

    } catch (error) {
      console.error("Pair Error:", error);
      if (fs.existsSync(pathAvt1)) fs.removeSync(pathAvt1);
      if (fs.existsSync(pathAvt2)) fs.removeSync(pathAvt2);
      if (fs.existsSync(pathImg)) fs.removeSync(pathImg);
      
      return api.sendMessage(`❌ 𝓐𝓵𝓲𝔂𝓪 ♡ » Error: ${error.message}`, threadID, messageID);
    }
  },

  createAndSendPair: async function(api, threadID, messageID, id1, id2, name1, name2, pathAvt1, pathAvt2, pathImg) {
    let avt1Data, avt2Data;

    try {
      const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      
      const avt1Url = `https://graph.facebook.com/${id1}/picture?width=1024&height=1024&access_token=${token}`;
      const avt2Url = `https://graph.facebook.com/${id2}/picture?width=1024&height=1024&access_token=${token}`;
      
      avt1Data = await this.downloadWithRetry(avt1Url, 3, 2000);
      avt2Data = await this.downloadWithRetry(avt2Url, 3, 2000);

      // Convert downloaded images/avatars to pure PNG using Sharp
      const pngAvt1Buffer = await sharp(Buffer.from(avt1Data.data)).toFormat("png").toBuffer();
      const pngAvt2Buffer = await sharp(Buffer.from(avt2Data.data)).toFormat("png").toBuffer();

      fs.writeFileSync(pathAvt1, pngAvt1Buffer);
      fs.writeFileSync(pathAvt2, pngAvt2Buffer);

      // Download base image (Drive webp image auto-converted to PNG)
      const baseUrl = "https://lh3.googleusercontent.com/d/15RWt_BLQhmkv6nQvnRhImfkiB3Q0H6QC";
      const baseRes = await this.downloadWithRetry(baseUrl);
      
      const pngBaseBuffer = await sharp(Buffer.from(baseRes.data)).toFormat("png").toBuffer();
      fs.writeFileSync(pathImg, pngBaseBuffer);

      const baseImage = await loadImage(pathImg);
      const avt1 = await loadImage(pathAvt1);
      const avt2 = await loadImage(pathAvt2);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      function drawCircularAvatar(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.stroke();
        ctx.restore();
      }

      // Profile positions on left side sky
      const avatarSize = Math.floor(canvas.height * 0.28);
      const avt1X = Math.floor(canvas.width * 0.08);
      const avt2X = Math.floor(canvas.width * 0.25);
      const avatarY = Math.floor(canvas.height * 0.18);

      drawCircularAvatar(ctx, avt1, avt1X, avatarY, avatarSize);
      drawCircularAvatar(ctx, avt2, avt2X, avatarY, avatarSize);

      // Selected Caption #2 Render
      const boldQuote = toMathBold(fixedCaption);
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.roundRect(canvas.width * 0.12, canvas.height * 0.04, canvas.width * 0.76, 48, 24);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`“${boldQuote}”`, canvas.width * 0.50, canvas.height * 0.04 + 24);

      // Names Box
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.font = "bold 16px Arial";
      
      const dispName1 = toMathBold(name1.length > 10 ? name1.substring(0, 10) + "..." : name1);
      const dispName2 = toMathBold(name2.length > 10 ? name2.substring(0, 10) + "..." : name2);

      ctx.beginPath(); ctx.roundRect(avt1X, avatarY + avatarSize + 10, avatarSize, 32, 6); ctx.fill();
      ctx.beginPath(); ctx.roundRect(avt2X, avatarY + avatarSize + 10, avatarSize, 32, 6); ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(dispName1, avt1X + avatarSize / 2, avatarY + avatarSize + 26);
      ctx.fillText(dispName2, avt2X + avatarSize / 2, avatarY + avatarSize + 26);

      const out = fs.createWriteStream(pathImg);
      const stream = canvas.createPNGStream({ compressionLevel: 3 });
      stream.pipe(out);
      
      await new Promise((resolve, reject) => {
        out.on("finish", resolve);
        out.on("error", reject);
      });

      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      return api.sendMessage({
        body: `✨ 𝓐𝓵𝓲𝔂𝓪 ♡ » Perfect Match Found! 💕\n\n💘 ${name1} 💖 ${name2}`,
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch(error) {
      console.error("Create Pair Error:", error);
      if (fs.existsSync(pathAvt1)) fs.removeSync(pathAvt1);
      if (fs.existsSync(pathAvt2)) fs.removeSync(pathAvt2);
      if (fs.existsSync(pathImg)) fs.removeSync(pathImg);
      throw error;
    }
  }
};
