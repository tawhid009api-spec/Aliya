const axios = require("axios");
const Jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "kiss",
    version: "1.0.0",
    author: "Custom Bot",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss your crush ",
    longDescription: "Mention someone to kiss them 🦆💨.",
    category: "fun",
    guide: {
      en: "{p}kiss @mention"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { senderID, mentions } = event;
    const mentionKeys = Object.keys(mentions);

    if (mentionKeys.length === 0) {
      return message.reply("Doya kore kauke mention korun (jake kiss korte chan)!");
    }

    const targetID = mentionKeys[0];

    // Profile picture public URL (Token lagbe na)
    const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc154235e9214154422f60d64c00d4620`;
    const targetAvatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%7Cc154235e9214154422f60d64c00d4620`;

    // Template Image URL
    const bgImageUrl = "https://i.imgur.com/9a4OdNE.jpeg";

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const outputPath = path.join(cacheDir, `kiss_${senderID}_${targetID}.png`);

    try {
      message.reply("Chobi toiri hocche, ektu opekkha korun...");

      // Download base image & avatars
      const [baseImg, senderImg, targetImg] = await Promise.all([
        Jimp.read(bgImageUrl),
        Jimp.read(senderAvatarUrl),
        Jimp.read(targetAvatarUrl)
      ]);

      // Make profile pictures circular
      senderImg.circle();
      targetImg.circle();

      // Resize profile pictures for girl/boy faces
      // Girl character position (Left side): sender/target adjustment
      targetImg.resize(110, 110); // Girl's face size
      senderImg.resize(110, 110); // Boy's face size

      // Composite girl's face (Target user)
      // Coordinates (x, y) dynamically adjusted for the photo
      baseImg.composite(targetImg, 420, 260);

      // Composite boy's face (Sender user)
      baseImg.composite(senderImg, 550, 240);

      // Save processed image
      await baseImg.writeAsync(outputPath);

      // Send image to chat
      await message.reply({
        body: `😘 <@${senderID}> kissed <@${targetID}>!`,
        attachment: fs.createReadStream(outputPath)
      });

      // Cleanup local cache file
      fs.unlinkSync(outputPath);

    } catch (error) {
      console.error(error);
      message.reply("Chobi toiri korar somoy ekta somossa hoyeche.");
    }
  }
};
