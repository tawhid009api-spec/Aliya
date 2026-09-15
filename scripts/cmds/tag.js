module.exports = {
  config: {
    name: "tag",
    version: "1.0.0",
    author: "Mr.King",
    role: 0,
    shortDescription: "Mention user by reply, name, or nickname with message",
    longDescription: "Tag any user using reply, exact name, or nickname along with a custom message box.",
    category: "utility",
    guide: { en: "{p}tag [reply / name / nickname] [your message]" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageReply, mentions } = event;

    try {
      // থ্রেডের সব মেম্বার এবং ইনফরমেশন ফেচ করা
      const threadInfo = await api.getThreadInfo(threadID);
      const { participantIDs, userInfo, nicknames } = threadInfo;

      let targetData = null;
      let userMsg = "";

      // ১. যদি কাউকে Reply দেওয়া হয়
      if (messageReply) {
        const targetID = messageReply.senderID;
        const name = userInfo.find(u => u.id === targetID)?.name || "Pookie";
        targetData = { id: targetID, name: name };
        userMsg = args.join(" ");
      } 
      // ২. যদি নাম বা নিকনেম দিয়ে ট্যাগ করা হয়
      else if (args.length > 0) {
        const input = args.join(" ").toLowerCase();

        // নামের সাথে মেলানো
        for (const u of userInfo) {
          if (input.includes(u.name.toLowerCase())) {
            targetData = { id: u.id, name: u.name };
            userMsg = args.join(" ").replace(new RegExp(u.name, "gi"), "").trim();
            break;
          }
        }

        // যদি নাম না পাওয়া যায়, তবে Nickname দিয়ে খোঁজা
        if (!targetData && nicknames) {
          for (const [id, nick] of Object.entries(nicknames)) {
            if (nick && input.includes(nick.toLowerCase())) {
              const fullName = userInfo.find(u => u.id === id)?.name || nick;
              targetData = { id: id, name: fullName };
              userMsg = args.join(" ").replace(new RegExp(nick, "gi"), "").trim();
              break;
            }
          }
        }
      }

      // যদি টার্গেট ইউজার না পাওয়া যায়
      if (!targetData) {
        return message.reply("Aww pookie! 🥺 কাউকে ট্যাগ করতে হলে তাকে রিপ্লাই দাও অথবা তার নাম/নিকনেম সঠিক করে লেখো!");
      }

      const finalMsg = userMsg || "Hlw pookie! You got a tag ✨";

      // আপনার Pookie & Boss স্টাইলে মেসেজ বক্স আউটপুট
      const tagText = `@${targetData.name}`;
      const replyBody = 
`✨ POOKIE MENTION SYSTEM ✨
🎀 Boss's Notification 🎀

Mentioned: ${tagText}

╭─── [ MESSAGE BOX ] ───⬣
│ 💬 ${finalMsg}
╰────────────────────────⬣

~ System Managed by Mr.King 👑✨`;

      // মেনশন পাঠাতে অপশন রেডি করা
      const mentionObj = [{
        tag: tagText,
        id: targetData.id
      }];

      return api.sendMessage({
        body: replyBody,
        mentions: mentionObj
      }, threadID, event.messageID);

    } catch (error) {
      return message.reply("Oops pookie! Tag পাঠাতে সমস্যা হয়েছে 😿");
    }
  }
};
