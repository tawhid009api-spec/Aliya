const axios = require("axios");

module.exports = {
  config: {
    name: "ddg",
    aliases: ["duckduckgo", "define", "ask"],
    version: "1.0.0",
    author: "Mr.King",
    role: 0,
    category: "utility",
    shortDescription: "Search definitions and summaries via DuckDuckGo Instant Answer API",
    guide: "{pn} <search_term>"
  },

  onStart: async function ({ api, event, args, message }) {
    const query = args.join(" ").trim();

    if (!query) {
      return message.reply("𓍢ִ໋🌸✧ Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ a sᴇᴀʀᴄʜ ǫᴜᴇʀʏ! (ᴇ.ɢ. ddg python) ✧🌸𓍢ִ໋");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://api.duckduckgo.com/", {
        params: {
          q: query,
          format: "json",
          no_html: 1,
          skip_disambig: 1
        }
      });

      const data = response.data;

      // Extract details prioritize Abstract, Answer, or Definition
      const summary = data.AbstractText || data.Answer || data.Definition;
      const source = data.AbstractSource || "DuckDuckGo";
      const sourceUrl = data.AbstractURL || "";
      const heading = data.Heading || query;
      const image = data.Image ? (data.Image.startsWith("http") ? data.Image : `https://duckduckgo.com${data.Image}`) : null;

      if (!summary) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`𓍢ִ໋🌸✧ Nᴏ ɪɴsᴛᴀɴᴛ ᴀɴsᴡᴇʀ ᴏʀ sᴜᴍᴍᴀʀʏ ғᴏᴜɴᴅ ғᴏʀ "${query}"! ✧🌸𓍢ִ໋`);
      }

      let replyMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞DᴜᴄᴋDᴜᴄᴋGᴏ Iɴsᴛᴀɴᴛ Aɴsᴡᴇʀ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ Tᴏᴘɪᴄ : ${heading}
ᥫ᭡ Sᴏᴜʀᴄᴇ : ${source}

🌸 ─── Sᴜᴍᴍᴀʀʏ ─── 🌸
${summary}`;

      if (sourceUrl) {
        replyMsg += `\n\nᥫ᭡ Lᴇᴀʀɴ Mᴏʀᴇ : ${sourceUrl}`;
      }

      replyMsg += `\n\n𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

      const msgData = { body: replyMsg };

      if (image) {
        const imgStream = (await axios.get(image, { responseType: "stream" })).data;
        msgData.attachment = imgStream;
      }

      api.setMessageReaction("🔍", event.messageID, () => {}, true);
      return message.reply(msgData);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("𓍢ִ໋🌸✧ Fᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ data ғʀᴏᴍ DᴜᴄᴋDᴜᴄᴋGᴏ! ✧🌸𓍢ִ໋");
    }
  }
};
