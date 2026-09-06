module.exports = {
  config: {
    name: "setnick",
    aliases: ["nickname", "shownick", "nick"],
    version: "2.1.0",
    author: "Mr.king 🎭",
    countDown: 5,
    role: 0,
    category: "box chat",
    shortDescription: "Set super pookie stylish nickname or check current nickname",
    longDescription: "Set a cute aesthetic nickname using 15 custom pookie styles by replying with a number.",
    guide: {
      en: "{pn} <desired_name> - Get 15 aesthetic pookie font choices\n{pn} - View current nickname"
    }
  },

  // Custom Font Decorator Engine
  applyPookieStyle: function (text, styleNumber) {
    const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const styles = {
      italic: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍0123456789",
      script: "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789",
      boldItalic: "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑵𝑺𝑳𝑴𝑵𝑶𝑸𝑸𝑅𝑺𝑻𝑈𝑽𝑾𝑿𝒀𝒁0123456789",
      sansBoldItalic: "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙯𝙔𝙕0123456789",
      serifBold: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙0123456789",
      squared: "🄰🄱🄲🄳🄴🄵🄒🄷🄸🄹🄺🄻🄼🄝🄞🄟🄠🄡🄢🄣🄤🄥🄦🄧🄨🄩🄰🄱🄲🄳🄴🄵🄒🄷🄸🄹🄺🄻🄼🄝🄞🄟🄠🄡🄢🄣🄤🄥🄦🄧🄨🄩0123456789"
    };

    function convertText(str, map) {
      if (!map) return str;
      let res = "";
      for (let char of str) {
        const idx = normal.indexOf(char);
        res += (idx !== -1 && map[idx]) ? map[idx] : char;
      }
      return res;
    }

    const tItalic = convertText(text, styles.italic);
    const tScript = convertText(text, styles.script);
    const tBoldItalic = convertText(text, styles.boldItalic);
    const tSansBoldItalic = convertText(text, styles.sansBoldItalic);
    const tSerifBold = convertText(text, styles.serifBold);
    const tSquared = convertText(text, styles.squared);

    const templates = {
      1: `⊹ฺ${tScript} .\`~°ヽ.｡+ﾟ🌷🕊️`,
      2: `°🫧•𖨆 ${tScript}`,
      3: `ʕ•́ᴥ•̀ʔっ ${tBoldItalic}`,
      4: `${tSansBoldItalic} め`,
      5: `•⎯͢  🎀🐱${tSquared}•⎯⃝🎀🐱`,
      6: `𐙚${tSerifBold}-🌷`,
      7: `🧸 ${tScript} ྀི`,
      8: `✿ ${tItalic} ♡`,
      9: `🍓 ${tSansBoldItalic} ꕀ 🍦`,
      10: `𓍢ִ໋🌷͙֒ ${tScript}`,
      11: `ꕤ ${tBoldItalic} ౨ৎ`,
      12: `🤍 ${tItalic} ྀི°`,
      13: `☁️˚.𖦹 ${tScript} 𖦹.˚☁️`,
      14: `🌸 ${tSerifBold} 🫧`,
      15: `🎀𓈒${tSansBoldItalic}𓈒💗`
    };

    return templates[styleNumber] || text;
  },

  onStart: async function ({ api, event, args, usersData, prefix }) {
    const { threadID, messageID, senderID } = event;
    const nameInput = args.join(" ");

    if (!nameInput) {
      try {
        const info = await api.getThreadInfo(threadID);
        const currentNick = info.nickname[senderID] || (await usersData.getName(senderID));
        
        return api.sendMessage(
          `🌸 ─── 𝑷𝑶𝑶𝑲𝑰𝑬 𝑵𝑰𝑪𝑲𝑵𝑨𝑴𝑬 ─── 🌸\n` +
          `╭──────────────────⬣\n` +
          `│ 👤 𝐘𝐨𝐮𝐫 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 : ${currentNick}\n` +
          `╰──────────────────⬣\n` +
          `💡 Type "${prefix}setnick <name>" to get 15 cute pookie font choices!`,
          threadID,
          messageID
        );
      } catch (err) {
        return api.sendMessage("❌ Error fetching nickname details.", threadID, messageID);
      }
    }

    let fontList = 
      `🌸 ─── 𝑷𝑶𝑶𝑲𝑰𝑬 𝑭𝑶𝑵𝑻𝑺 ─── 🌸\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📌 𝐓𝐞𝐱𝐭 : ${nameInput}\n\n`;

    for (let i = 1; i <= 15; i++) {
      fontList += `${i}. ${this.applyPookieStyle(nameInput, i)}\n`;
    }

    fontList += 
      `━━━━━━━━━━━━━━━━━━\n` +
      `💬 Reply to this message with a number (1-15) to select your favorite pookie nickname!`;

    return api.sendMessage(fontList, threadID, (err, info) => {
      if (err) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        rawText: nameInput
      });
    }, messageID);
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body } = event;
    const { author, rawText } = Reply;

    if (senderID !== author) {
      return api.sendMessage("⚠️ Only the person who requested the nickname can choose!", threadID, messageID);
    }

    const choice = parseInt(body.trim());

    if (isNaN(choice) || choice < 1 || choice > 15) {
      return api.sendMessage("❌ Invalid choice! Please reply with a number between 1 and 15.", threadID, messageID);
    }

    const selectedNickname = this.applyPookieStyle(rawText, choice);

    try {
      await api.changeNickname(selectedNickname, threadID, senderID);
      
      global.GoatBot.onReply.delete(Reply.messageID);

      return api.sendMessage(
        `✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐂𝐇𝐀𝐍𝐆𝐄𝐃!\n` +
        `───────────────────\n` +
        `💖 𝐍𝐞𝐰 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 : ${selectedNickname}`,
        threadID,
        messageID
      );
    } catch (err) {
      return api.sendMessage("❌ Failed to set nickname. Please check bot permissions in this group.", threadID, messageID);
    }
  }
};
