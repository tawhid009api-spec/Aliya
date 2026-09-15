const axios = require("axios");

module.exports = {
  config: {
    name: "iginfo",
    version: "3.0",
    author: "Mr.King",
    role: 0,
    shortDescription: "Fetch full Instagram profile info from username, profile link, or video URL",
    longDescription: "Send any Instagram username, profile link, or reel/video link to get full profile info.",
    category: "info",
    guide: { en: "Usage: !iginfo [username / profile URL / video URL]" }
  },

  onStart: async function({ api, event, args, message }) {
    const input = args.join(" ").trim();

    if (!input) {
      return message.reply("Aww pookie! Username, profile link, or video link missing 🥺\nUsage: !iginfo [link/username]");
    }

    api.setMessageReaction("⌛️", event.messageID, () => {}, true);

    try {
      let targetUsername = input;

      // ১. যদি ইউজার ভিডিও/পোস্ট/রিলের লিঙ্ক দেয় (/reel/, /p/)
      if (input.includes("instagram.com/reel/") || input.includes("instagram.com/p/") || input.includes("instagr.am")) {
        const autoApi = `https://xsaim8x-xxx-api.onrender.com/api/auto?url=${encodeURIComponent(input)}`;
        const autoRes = await axios.get(autoApi);

        const extractedUser = autoRes.data?.author || autoRes.data?.username || autoRes.data?.owner;

        if (!extractedUser) {
          api.setMessageReaction("❌️", event.messageID, () => {}, true);
          return message.reply("Oops pookie! Video link theke username extract kora jay nai 😿");
        }

        targetUsername = extractedUser;
      }

      // ২. Vercel API কল করে ফুল প্রোফাইল ইনফরমেশন ফেচ করা
      const apiUrl = `https://instagram-info-api-chi.vercel.app/api/instagram?username=${encodeURIComponent(targetUsername)}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.data;

      if (!res.data.status || !data) {
        api.setMessageReaction("❌️", event.messageID, () => {}, true);
        return message.reply(`Oops pookie! ${res.data?.message || "User not found"} 😿`);
      }

      api.setMessageReaction("✅️", event.messageID, () => {}, true);

      // ৩. আপনার Pookie স্টাইলে সম্পূর্ণ ইনফরমেশন টেক্সট
      const replyText = 
`✨ INSTAGRAM PROFILE INFO ✨
🎀 Pookie's Details 🎀

• Name: ${data.full_name}
• Username: @${data.username}
• ID: ${data.id}
• Private: ${data.is_private ? "Yes 🔒" : "No 🔓"}
• Verified: ${data.is_verified ? "Yes ✔️" : "No ❌"}

• Followers: ${data.followers.toLocaleString()} 💖
• Following: ${data.following.toLocaleString()} 💫
• Posts: ${data.total_posts} 📸

• Bio:
${data.biography}

• Link: ${data.external_url}

~ API by Mr.King 👑✨`;

      if (data.profile_pic_url) {
        const imgStream = await axios.get(data.profile_pic_url, { responseType: "stream" });
        await message.reply({
          body: replyText,
          attachment: imgStream.data
        });
      } else {
        await message.reply(replyText);
      }

    } catch (error) {
      api.setMessageReaction("❌️", event.messageID, () => {}, true);
      const errorMsg = error.response?.data?.message || "Profile info paoya jay nai pookie 😿";
      message.reply(`Oops! Error: ${errorMsg}`);
    }
  }
};
