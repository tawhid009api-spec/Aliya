const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const recentPairs = new Map();

module.exports = {
  config: {
    name: "pair8",
    author: "Mr.King",
    version: "1.0.1",
    role: 0,
    shortDescription: {
      en: "Pair male and female members"
    },
    longDescription: {
      en: "Pair with a specific mentioned user or automatically find an opposite gender match in the group."
    },
    category: "love",
    guide: {
      en: "{pref}pair8 or {pref}pair8 @mention"
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
    const pathImg = path.join(cacheDir, `pair8_${Date.now()}.png`);

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
        
        return await this.createAndSendPair(api, threadID, messageID, id1, id2, name1, name2, senderGender, pathAvt1, pathAvt2, pathImg);
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

      return await this.createAndSendPair(api, threadID, messageID, id1, id2, name1, name2, senderGender, pathAvt1, pathAvt2, pathImg);

    } catch (error) {
      console.error("Pair Error:", error);
      if (fs.existsSync(pathAvt1)) fs.removeSync(pathAvt1);
      if (fs.existsSync(pathAvt2)) fs.removeSync(pathAvt2);
      if (fs.existsSync(pathImg)) fs.removeSync(pathImg);
      
      return api.sendMessage(`❌ 𝓐𝓵𝓲𝔂𝓪 ♡ » Error: ${error.message}`, threadID, messageID);
    }
  },

  createAndSendPair: async function(api, threadID, messageID, id1, id2, name1, name2, senderGender, pathAvt1, pathAvt2, pathImg) {
    let avt1Data, avt2Data;

    try {
      const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      
      // Male / Female assign confirmation based on sender's gender
      const maleID = senderGender === "MALE" ? id1 : id2;
      const femaleID = senderGender === "MALE" ? id2 : id1;
      const maleName = senderGender === "MALE" ? name1 : name2;
      const femaleName = senderGender === "MALE" ? name2 : name1;

      const avtMaleUrl = `https://graph.facebook.com/${maleID}/picture?width=1024&height=1024&access_token=${token}`;
      const avtFemaleUrl = `https://graph.facebook.com/${femaleID}/picture?width=1024&height=1024&access_token=${token}`;
      
      avt1Data = await this.downloadWithRetry(avtMaleUrl, 3, 2000);
      avt2Data = await this.downloadWithRetry(avtFemaleUrl, 3, 2000);

      fs.writeFileSync(pathAvt1, Buffer.from(avt1Data.data));
      fs.writeFileSync(pathAvt2, Buffer.from(avt2Data.data));

      // Direct Google Drive Link for Background
      const baseUrl = "https://lh3.googleusercontent.com/d/1cpggD71djG5yn2O88MmZBvFH5ZyJaAdo";
      const baseRes = await this.downloadWithRetry(baseUrl);
      fs.writeFileSync(pathImg, Buffer.from(baseRes.data));

      const baseImage = await loadImage(pathImg);
      const avtMale = await loadImage(pathAvt1);
      const avtFemale = await loadImage(pathAvt2);

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

        // Subtle glow/border around avatar face
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.stroke();
        ctx.restore();
      }

      // Exact Face Position Coordinates
      const maleAvatarSize = Math.floor(canvas.width * 0.22);
      const maleX = Math.floor(canvas.width * 0.38); 
      const maleY = Math.floor(canvas.height * 0.16);

      const femaleAvatarSize = Math.floor(canvas.width * 0.22);
      const femaleX = Math.floor(canvas.width * 0.60);
      const femaleY = Math.floor(canvas.height * 0.20);

      // Render avatars directly over the characters' head positions
      drawCircularAvatar(ctx, avtMale, maleX, maleY, maleAvatarSize);
      drawCircularAvatar(ctx, avtFemale, femaleX, femaleY, femaleAvatarSize);

      // Name Labels at the bottom of the canvas
      const boxWidth = Math.floor(canvas.width * 0.38);
      const boxHeight = 42;
      const bottomY = Math.floor(canvas.height * 0.88);

      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath(); ctx.roundRect(canvas.width * 0.10, bottomY, boxWidth, boxHeight, 8); ctx.fill();
      ctx.beginPath(); ctx.roundRect(canvas.width * 0.52, bottomY, boxWidth, boxHeight, 8); ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center"; 
      ctx.textBaseline = "middle";

      const dispMaleName = maleName.length > 12 ? maleName.substring(0, 12) + "..." : maleName;
      const dispFemaleName = femaleName.length > 12 ? femaleName.substring(0, 12) + "..." : femaleName;

      ctx.fillText(`👦 ${dispMaleName}`, canvas.width * 0.10 + boxWidth / 2, bottomY + boxHeight / 2);
      ctx.fillText(`👧 ${dispFemaleName}`, canvas.width * 0.52 + boxWidth / 2, bottomY + boxHeight / 2);

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
