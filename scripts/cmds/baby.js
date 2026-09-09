const axios = require("axios");

const roniBotTriggers = [
  "baby", "bby", "babu", "bbu", "jan", "bot", "জান", "জানু", "বেবি", "wifey", "aliya", "king", "mrking"
];

const peacockTriggers = ["baby", "bby", "jan", "জান", "জানু", "বেবি"];
const spamCooldown = new Map();

const fallbackMessages = [
  "কথা কম কও, মুখে মাস্ক পইরা ঘোড়ো 😷🔥",
  "মাথাডা একদম আউলায়া দিলা তো ভাই 😵‍💫💭",
  "এমবি নাই ভাই, এমবি কিনে দে তারপর কথা কমু 📱💸",
  "পড়ালেখা বাদ দিয়া বটের লগে আলু ছুলতে আইছো? 🥔📚",
  "এক চ্যাপা মাইরা একবারে উগান্ডা পাঠায়া দিমু ✈️🐒",
  "চা খাইবা? না খাইলে ভাগো তো এখান থেকে ☕🧹",
  "তর কথা শুইন্যা আমার ফ্রিজের পানিও গরম হয়া গেছে 🧊🔥",
  "আমারে কি গুগল পাইছ নাকি? সব প্রশ্নের উত্তর পাইবা 🤖❌",
  "হুদাই চিল্লাইও না, একটু পপকন খাইয়া ঘুম দাও 🍿😴",
  "আরে ভাই থামো, এক্টু দম নিতে দাও আমারে 😮‍💨✋",
  "কি বললা বুঝি নাই, আরেকবার কও তো বুড়া দাদু 👵🏻👓",
  "বিকাশে ৫০০ টাকা পাঠাও, তারপর সুন্দর উত্তর দিমু 🤑💳",
  "তোমার কথা শুইন্যা আমার ব্যাটারি ১০% কম্যা গেল 🔋🪫",
  "আহা কী প্রেম! যেন শাহজাহান আর মমতাজের নাতনি 🕌❤️",
  "থামো তো ভাই! মাথায় হাত দিয়া একটু ভাবতে দাও 🤯🤔",
  "লুঙ্গি সামলায়া কথা কও, বাতাস ছাড়লে উইড়া যাইবা 🌬️🩲",
  "অতিরিক্ত ঢং স্বাস্থ্যের জন্য ক্ষতিকর baby 🍼😏",
  "ইসস! এতো ঢং করো কেন? একদম চড় খাইতে ইচ্ছে করতাছে 🤏🏻🐸"
];

const baseApiUrl = "https://baby-one-zeta.vercel.app/";

const adminCredentials = {
  username: "Mr.king",
  password: "tanindev@#90"
};

const makeBold = (text) => {
  if (!text) return "";
  const fonts = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
    n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
    N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
    "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
};
 return text.split("").map(char => fonts[char] || char).join("");
};

const extractEmojis = (text) => {
  if (!text) return [];
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = Array.from(segmenter.segment(text));
    const emojiRegex = /\p{Extended_Pictographic}/u;
    return segments.map(s => s.segment).filter(str => emojiRegex.test(str));
  }
  const fallbackRegex = /(\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}]?)/gu;
  return text.match(fallbackRegex) || [];
};

const checkSingleQuery = async (query) => {
  if (!query) return null;
  try {
    const res = await axios.post(`${baseApiUrl}/api/hinata`, { text: query, style: 3 });
    const replyMsg = res.data ? res.data.message : null;
    
    if (replyMsg && 
        !replyMsg.includes("sikai deu") && 
        !replyMsg.includes("error") && 
        !replyMsg.includes("fetching") && 
        !replyMsg.includes("I don't know")) {
      
      if (replyMsg.includes(" | ")) {
        const list = replyMsg.split(" | ");
        return list[Math.floor(Math.random() * list.length)];
      }
      return replyMsg;
    }
  } catch {
    return null;
  }
  return null;
};

const getRandomTeachResponse = async () => {
  try {
    const res = await axios.get(`${baseApiUrl}/api/jan/random-trigger`);
    if (res.data && res.data.trigger) {
      const resp = await checkSingleQuery(res.data.trigger);
      if (resp) return resp;
    }
  } catch {}
  return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
};

const handleMediaCheck = (attachments) => {
  if (attachments && attachments.length > 0) {
    const type = attachments[0].type;
    const replies = {
      video: ["Mb nai bby pore dio", "ajaira sop video😒", "1 ta kidni de then dekhmu"],
      audio: ["Sent 100000000tk to bkash then I will listen", "aj boyra bole kisu sunte parlam na😤", "tor Kun Kun jaygay betha go bandubi lolita"],
      photo: ["iss amk picture diye potanor chesta 🌚😘", "pic dekhe ki hobe jokon mb e nai"]
    };
    if (replies[type]) {
      const list = replies[type];
      return list[Math.floor(Math.random() * list.length)];
    }
  }
  return null;
};

const autoTeachAndGetResponse = async (triggerText) => {
  const randomResponse = await getRandomTeachResponse();
  if (triggerText && triggerText.length >= 2) {
    try {
      await axios.post(`${baseApiUrl}/api/jan/teach`, {
        trigger: triggerText,
        responses: randomResponse
      }, {
        headers: {
          username: adminCredentials.username,
          password: adminCredentials.password
        }
      });
    } catch (e) {}
  }
  return randomResponse;
};

const fetchApiResponse = async (text, attachments = []) => {
  try {
    const fullTextResp = await checkSingleQuery(text);
    if (fullTextResp) return fullTextResp;

    const emojis = extractEmojis(text);
    if (emojis.length > 0) {
      for (const singleEmoji of emojis) {
        const emojiResp = await checkSingleQuery(singleEmoji);
        if (emojiResp) return emojiResp;
      }
    }

    const words = text.trim().split(/\s+/);
    if (words.length > 1) {
      for (const word of words) {
        const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, "");
        if (cleanWord.length < 2) continue;
        
        const wordResp = await checkSingleQuery(cleanWord);
        if (wordResp) return wordResp;
      }
    }

    return await autoTeachAndGetResponse(text);
  } catch {
    return await autoTeachAndGetResponse(text);
  }
};

const getDatabaseStats = async () => {
  try {
    const res = await axios.get(`${baseApiUrl}/api/jan/stats`, {
      headers: {
        username: adminCredentials.username,
        password: adminCredentials.password
      },
      timeout: 5000
    });
    if (res.data && res.data.success) {
      const teachCount = res.data.totalTeach || 0;
      const responseCount = res.data.totalResponses || 0;
      const dataSize = res.data.dataSize || null;

      let msg = `🐤 | Total Teach = ${teachCount}\n♻️ | Total Response = ${responseCount}`;
      if (dataSize) {
        msg += `\n💾 | Database Size = ${dataSize}`;
      }
      return msg;
    } else {
      throw new Error("API response error");
    }
  } catch {
    return `🐤 | Total Teach = api off\n♻️ | Total Response = api off\nServer is having error...server ki maka vosra 👅💦`;
  }
};

module.exports.config = {
   name: "baby", 
   aliases: ["hinata", "bby", "bbu", "jan", "janu", "wifey", "bot"],
   version: "20.0",
   author: "Mr.King",
   role: 0,
   category: "chat",
   guide: {
     en: "{pn} [message]"
   }
};

module.exports.onStart = async ({ api, event, args }) => {
  if (event.senderID == api.getCurrentUserID()) return;
  
  const uid = event.senderID;
  const currentTime = Date.now();
  if (spamCooldown.has(uid) && currentTime - spamCooldown.get(uid) < 3000) {
      return api.sendMessage(makeBold("Hop bumb koros kn 😒"), event.threadID, event.messageID);
  }
  spamCooldown.set(uid, currentTime);

  try {
    if (args && args.length > 0) {
      const fullCmd = args.join(" ").toLowerCase();
      if (fullCmd === "list" || fullCmd === "datacheck") {
        const stats = await getDatabaseStats();
        return api.sendMessage(makeBold(stats), event.threadID, event.messageID);
      }
    }

    const mediaReply = handleMediaCheck(event.attachments);
    if (mediaReply) {
      return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
    }

    if (!args || args.length === 0) {
      const ran = ["Bolo baby", "I love you", "Welcome to Mr.King Chatbot! 😎"];
      return api.sendMessage(makeBold(ran[Math.floor(Math.random() * ran.length)]), event.threadID, event.messageID);
    }

    const userMsg = args.join(" ");
    const botResponse = await fetchApiResponse(userMsg, event.attachments || []);
    
    api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
      if (!err && info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          triggerText: userMsg
        });
      }
    }, event.messageID);

  } catch (err) {
    console.error(err);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  if (event.senderID == api.getCurrentUserID()) return;

  const uid = event.senderID;
  const currentTime = Date.now();
  if (spamCooldown.has(uid) && currentTime - spamCooldown.get(uid) < 3000) {
      return api.sendMessage(makeBold("Hop spam koros kn 😒"), event.threadID, event.messageID);
  }
  spamCooldown.set(uid, currentTime);

  try {
    const userMsg = event.body || "";

    if (Reply && Reply.type === "reply" && userMsg.trim()) {
      const previousBotMsg = Reply.triggerText || "";
      if (previousBotMsg && previousBotMsg.length >= 2) {
        try {
          await axios.post(`${baseApiUrl}/api/jan/teach`, {
            trigger: previousBotMsg,
            responses: userMsg
          }, {
            headers: {
              username: adminCredentials.username,
              password: adminCredentials.password
            }
          });
        } catch (e) {}
      }
    }

    const mediaReply = handleMediaCheck(event.attachments);
    let botResponse = mediaReply;
    if (!botResponse) {
      botResponse = await fetchApiResponse(userMsg, event.attachments || []);
    }

    api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
      if (!err && info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          triggerText: userMsg
        });
      }
    }, event.messageID);
  } catch (err) {
    console.error(err);
  }
};

module.exports.onChat = async ({ api, event }) => {
  if (event.senderID == api.getCurrentUserID()) return;

  try {
    const message = event.body || "";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage === "baby list" || lowerMessage === "baby datacheck") {
      const stats = await getDatabaseStats();
      return api.sendMessage(makeBold(stats), event.threadID, event.messageID);
    }

    if (roniBotTriggers.some(word => lowerMessage.startsWith(word))) {
        const uid = event.senderID;
        const currentTime = Date.now();
        if (spamCooldown.has(uid) && currentTime - spamCooldown.get(uid) < 3000) {
            return api.sendMessage(makeBold("Hop bumb koros kn 😒"), event.threadID, event.messageID);
        }
        spamCooldown.set(uid, currentTime);

        const reactionEmoji = peacockTriggers.some(word => lowerMessage.startsWith(word)) ? "🪽" : "🪽";
        api.setMessageReaction(reactionEmoji, event.messageID, () => {}, true);

        let userText = message; 
        for (const prefix of roniBotTriggers) {
            if (lowerMessage.startsWith(prefix)) { 
                userText = message.substring(prefix.length).trim();
                break;
            }
        }

        if (userText.toLowerCase() === "list" || userText.toLowerCase() === "datacheck") {
          const stats = await getDatabaseStats();
          return api.sendMessage(makeBold(stats), event.threadID, event.messageID);
        }

        if (!userText) {
          const ranPrompt = [
            "babu khuda lagse🥺",
          "Hop beda😾,Boss বল boss😼",  
          "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",  
          "  🐸🐸🐸  ",
          "  TERI MAKI MAJE MAJE  ",
          "  『 ᴀᴅᴅᴀ ᴠᴏʀᴘᴜʀ 』☁️🫧 ",
          "bye",
          "naw amr boss k message daw m.me/61586231481655 ",
          "mb nei bye",
          "meww",
          "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
          "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",  
          "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
          "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏",
          "গোসল করে আসো যাও😑😩",
          "আসসালামু আলাইকুম",
          "কেমন আছো_🥹",
          "বলেন sir__😌",
          "বলেন ম্যাডাম__😌",
          "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
          "🙂🙂🙂",
          "এটাই দেখার বাকি ছিলো_🙂🙂🙂",
          "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼 😒😒",
          "𝗧𝗮𝗿𝗽𝗼𝗿 𝗯𝗼𝗹𝗼_🙂",
          "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗶𝗯𝗲 𝘁𝗼__🥺",
          "𝗕𝗯𝘆 না জানু, বল 😌",
          "বেশি bby bby করলে leave নিবো কিন্তু 😒😒",
          "__বেশি বেবি বললে কামুর দিমু 🤭🤭",
          "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙞 𝙖𝙢𝙖𝙠𝗲 𝙙𝙖𝙠𝙨𝙤? 😂😂😂",
          "bolo baby😒",
          "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
          "আমি তো অন্ধ কিছু দেখি না🐸 😎",
          "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🫣",
          "𝗼𝗶𝗶 ঘুমানোর আগে.! তোমার মনটা কোথায় রেখে ঘুমাও.!🤔_নাহ মানে চুরি করতাম 😞😘",
          "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘",
          "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗯𝗯𝘆 𝗯𝗯𝘆 করিস  😉😋🤣",
          "এই এই তোর পরীক্ষা কবে? শুধু 𝗕𝗯𝘆 𝗯𝗯𝘆 করিস 😾",
          "তোরা যে হারে 𝗕𝗯𝘆 ডাকছিস আমি তো সত্যি বাচ্চা হয়ে যাবো_☹😑",
          "আজব তো__😒",
          "আমাকে ডেকো না,আমি ব্যাস্ত আছি🙆🏻‍♀",
          "𝗕𝗯𝘆 বললে চাকরি থাকবে না",
          "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, Tawhid ,Tawhid ও তো করতে পারো😑?",
          "আমার সোনার বাংলা, তারপরের লাইন কি? 🙈",
          "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
          "হটাৎ আমাকে মনে পড়লো 🙄",
          "𝗕𝗯𝘆 বলে অসম্মান করতেছিস,😰😿",
          "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
          "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
          "খাওয়া দাওয়া করছো?🙄",
          "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
          "আরে আমি মজা করার mood এ নাই😒",
          "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
          "আরে Bolo আমার জান, কেমন আছো? 😚",
          "একটা BF খুঁজে দাও 😿",
          "ফ্রেন্ড রিকোয়েস্ট দিলে ৫ টাকা দিবো 😗",
          "oi mama ar dakis na pilis 😿",
          "🐤🐤",
          "__ভালো হয়ে  যাও 😑😒",
          "এমবি কিনে দাও না_🥺🥺",
          "ওই মামা_আর ডাকিস না প্লিজ😫",
          "৩২ তারিখ আমার বিয়ে 🐤",
          "হা বলো😒,কি করতে পারি😐😑?",
          "বলো ফুলটুশি_😘",
          "amr JaNu lagbe,Tumi ki single aso?🥹",
          "আমাকে না ডেকে একটু পড়তেও বসতে তো পারো 😒😒",
          "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄",
          "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄",
          "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫",
          "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
          "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
          "ভুলে যাও আমাকে 😞😞",
          "দেখা হলে কাঠগোলাপ দিও..🤗",
          "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নি🥺 পচা তুমি🥺",
          "আগে একটা গান বলো, ☹ নাহলে কথা বলবো না 🥺",
          "বলো কি করতে পারি তোমার জন্য 😚",
          "কথা দেও আমাকে পটাবা...!! 😌",
          "বার বার Disturb করেতেছিস কোনো 😾, আমার জানু এর সাথে ব্যাস্ত আছি😋",
          "আমাকে না ডেকে একটু পড়তে বসতেও তো পারো 🥺🥺",
          "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑😒",
          "ওই তুমি single না?🫵🤨 😑😒",
          "বলো জানু 😒",
          "Meow🐤",
          "Tawhid tomay valobase",
          "Babu,Tumi pocha",
          "gu kha", 
          "✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐬𝐞𝐧𝐭 𝟏𝟬𝟬 GB🥰",
          "🌛 Namaj porso",
          "Amar boss Tawhid islam single ase oke msg dew",
          " chill up 『 ᴀᴅᴅᴀ ᴠᴏʀᴘᴜʀ 』☁️🫧 e join koro",
          "amk na Dake duck🦆 game khelo",
          "Ami more gesi",
          "tumi eto dustu kn🌚",
          "tomak khaye dei🌚",
          "astagfirullah Ami Valo mey",
          "nache dekhaw ektu🕺🏼💃🏼",
          "আর কত বার ডাকবা ,শুনছি তো 🤷🏻‍♀",
          "কি হলো, মিস টিস করতেছিস নাকি 🤣",
          "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈",
          "আজকে আমার mন ভালো নেই 🙉",
          "আমি হাজারো মশার Crush😓",
          "প্রেম করার বয়সে লেখাপড়া করতেছি, রেজাল্ট তো খা/রা'প হবেই.!🙂",
          "আমার ইয়ারফোন চু'রি হয়ে গিয়েছে!! কিন্তু চোর'কে গা-লি দিলে আমার বন্ধু রেগে যায়!'🙂",
          "ছেলেদের প্রতি আমার এক আকাশ পরিমান শরম🥹🫣",
          "__ফ্রী ফে'সবুক চালাই কা'রন ছেলেদের মুখ দেখা হারাম 😌",
          "মন সুন্দর বানাও মুখের জন্য তো 'Snapchat' আছেই! 🌚" ,
          "𝗘𝘃𝗲𝗿𝘆𝘁𝗵𝗶𝗻𝗴 𝗶𝘀 𝘁𝗲𝗺𝗽𝗼𝗿𝗮𝗿𝘆, 𝗯𝘂𝘁 𝗠𝗿.𝗞𝗶𝗻𝗴'𝘀 𝗯𝗼𝘁 𝗶𝘀 𝗽𝗲𝗿𝗺𝗮𝗻𝗲𝗻𝘁! ✨♾️"
          ];
          const chosenText = ranPrompt[Math.floor(Math.random() * ranPrompt.length)];
          return api.sendMessage(makeBold(chosenText), event.threadID, (err, info) => {
            if (!err && info) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                triggerText: chosenText
              });
            }
          }, event.messageID);
        }

        const mediaReply = handleMediaCheck(event.attachments);
        if (mediaReply) {
          return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
        }

        const botResponse = await fetchApiResponse(userText, event.attachments || []);
        api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              triggerText: userText
            });
          }
        }, event.messageID);
    }
  } catch (err) {
    console.error(err);
  }
};
      
      
