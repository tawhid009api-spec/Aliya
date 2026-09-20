const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    version: "2.5.0",
    author: "Mr.King",
    role: 0,
    shortDescription: "Ask AI or analyze images with GPT-4o Vision",
    longDescription: "Ask anything to AI or reply to any image to get instant image analysis/explanation.",
    category: "ai",
    guide: { en: "{p}ai [question] OR reply to an image with {p}ai [question]" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ").trim();
    let imgUrl = "";

    // ১. ছবির ওপর Reply করা হয়েছে কি না তা চেক করা
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo") {
        imgUrl = attachment.url;
      }
    }

    // ২. Prompt এবং Image দুটিই অনুপস্থিত থাকলে সতর্ক করা
    if (!prompt && !imgUrl) {
      return message.reply("Aww pookie! 🥺 কোনো প্রশ্ন লেখো অথবা ছবির ওপর রিপ্লাই দিয়ে !ai ব্যবহার করো!");
    }

    // Reaction দেওয়া (প্রসেসিং শুরু)
    api.setMessageReaction("⌛️", event.messageID, () => {}, true);

    try {
      // আপনার নতুন Vercel API Call
      const backendUrl = `https://goatbot-ai-api.vercel.app/api/ai?prompt=${encodeURIComponent(prompt || "Describe this image")}${imgUrl ? `&img=${encodeURIComponent(imgUrl)}` : ""}`;
      
      const res = await axios.get(backendUrl);

      if (!res.data || !res.data.status) {
        api.setMessageReaction("❌️", event.messageID, () => {}, true);
        return message.reply(`Oops pookie! ${res.data?.message || "Failed to process request"} 😿`);
      }

      api.setMessageReaction("✅️", event.messageID, () => {}, true);

      // আপনার Pookie & Boss স্টাইলে আউটপুট
      const replyText = 
`✨ GOATBOT AI RESPONSE ✨
🎀 Powered by Mr.King 🎀

${res.data.response}

~ System Managed by Mr.King 👑✨`;

      await message.reply(replyText);

    } catch (error) {
      api.setMessageReaction("❌️", event.messageID, () => {}, true);
      const errorMsg = error.response?.data?.message || "AI Server-e somossa hoyeche 😿";
      message.reply(`Oops! Error: ${errorMsg}`);
    }
  }
};
