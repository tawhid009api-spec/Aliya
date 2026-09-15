const axios = require("axios");

// TikTok URL validation regex
const tiktokRegex = /(https?:\/\/(?:www\.|vt\.|vm\.)?tiktok\.com\/[^\s]+)/i;

async function processTikTokUrl({ url, api, event, message }) {
  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  try {
    const vercelApiUrl = `https://my-tiktok-api-mu.vercel.app/api/tiktok?url=${encodeURIComponent(url)}`;

    const response = await axios.get(vercelApiUrl, {
      headers: {
        "Authorization": "Bearer tI8QC8ZOh3O6qVmLD5Kr0SjhLz7eZJBxzzXpsx3RUOGjolmRHU+YLBCBAQ=="
      }
    });

    const resData = response.data;

    if ((resData.code !== 200 && resData.code !== 0) || !resData.data) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("𓍢ִ໋🌸✧ Fᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ TɪᴋTᴏᴋ ᴅᴀᴛᴀ! Iɴᴠᴀʟɪᴅ U R L ᴏʀ A P I ᴇʀʀᴏʀ. ✧🌸𓍢ִ໋");
    }

    const { aweme_id, desc, statistics, author, video, music, create_time } = resData.data;

    const videoId = aweme_id || "N/A";
    const formattedDate = create_time 
      ? new Date(create_time * 1000).toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) 
      : "N/A";

    const authorName = author?.nickname || "Unknown";
    const authorUsername = author?.unique_id ? `@${author.unique_id}` : "N/A";

    // Follower Count Multiple Path Checking (Fixing the 0 follower issue)
    const rawFollowers = author?.follower_count ?? author?.followers ?? author?.stats?.followerCount ?? 0;
    const followers = Number(rawFollowers).toLocaleString();

    const caption = desc || "No caption provided.";
    const duration = video?.duration ? `${Math.floor(video.duration / 1000)}s` : "N/A";

    const musicTitle = music?.title || "Original Sound";
    const musicArtist = music?.author || "Unknown";

    const plays = statistics?.play_count ? statistics.play_count.toLocaleString() : "0";
    const likes = statistics?.digg_count ? statistics.digg_count.toLocaleString() : "0";
    const comments = statistics?.comment_count ? statistics.comment_count.toLocaleString() : "0";
    const shares = statistics?.share_count ? statistics.share_count.toLocaleString() : "0";
    const collects = statistics?.collect_count ? statistics.collect_count.toLocaleString() : "0";

    const playUrl = video?.play_addr?.url_list?.[0] || url;
    const coverImg = video?.cover?.url_list?.[0] || video?.origin_cover?.url_list?.[0] || author?.avatar_thumb?.url_list?.[0];

    const replyMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞TɪᴋTᴏᴋ Iɴғᴏ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ Vɪᴅᴇᴏ I D : ${videoId}
ᥫ᭡ Uᴘʟᴏᴀᴅ Dᴀᴛᴇ : ${formattedDate}
ᥫ᭡ Dᴜʀᴀᴛɪᴏɴ : ${duration}

🌸 ─── Aᴜᴛʜᴏʀ Iɴғᴏ ─── 🌸
ᥫ᭡ Nᴀᴍᴇ : ${authorName}
ᥫ᭡ U sᴇʀɴᴀᴍᴇ : ${authorUsername}
ᥫ᭡ Fᴏʟʟᴏᴡᴇʀs : ${followers}

🌸 ─── Mᴜsɪᴄ Iɴғᴏ ─── 🌸
ᥫ᭡ Tɪᴛʟᴇ : ${musicTitle}
ᥫ᭡ Aʀᴛɪsᴛ : ${musicArtist}

🌸 ─── Sᴛᴀᴛɪsᴛɪᴄs ─── 🌸
ᥫ᭡ Pʟᴀʏs : ${plays}
ᥫ᭡ Lɪᴋᴇs : ${likes}
ᥫ᭡ Cᴏᴍᴍᴇɴᴛs : ${comments}
ᥫ᭡ Sʜᴀʀᴇs : ${shares}
ᥫ᭡ Sᴀᴠᴇs : ${collects}

🌸 ─── Cᴀᴘᴛɪᴏɴ ─── 🌸
${caption}

ᥫ᭡ Dɪʀᴇᴄᴛ U R L : ${playUrl}

𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

    const msgData = { body: replyMsg };

    if (coverImg) {
      const imgStream = (await axios.get(coverImg, { responseType: "stream" })).data;
      msgData.attachment = imgStream;
    }

    api.setMessageReaction("🎵", event.messageID, () => {}, true);
    return message.reply(msgData);

  } catch (error) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply(`𓍢ִ໋🌸✧ Eʀʀᴏʀ : ${error.response?.data?.message || error.message} ✧🌸𓍢ִ໋`);
  }
}

module.exports = {
  config: {
    name: "tikinfo",
    aliases: ["tiktokinfo", "tinfo"],
    version: "1.1.1",
    author: "Mr.King",
    role: 0,
    category: "info",
    shortDescription: "Fetch TikTok video analytical information",
    guide: "{pn} <tiktok_url> OR Send TikTok link directly"
  },

  onChat: async function ({ api, event, message }) {
    if (event.body && !event.body.startsWith("(") && tiktokRegex.test(event.body)) {
      const match = event.body.match(tiktokRegex);
      if (match && match[0]) {
        await processTikTokUrl({ url: match[0], api, event, message });
      }
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const inputUrl = args[0];

    if (!inputUrl) {
      return message.reply("𓍢ִ໋🌸✧ Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ TɪᴋTᴏᴋ U R L! ✧🌸𓍢ִ໋");
    }

    await processTikTokUrl({ url: inputUrl, api, event, message });
  }
};
