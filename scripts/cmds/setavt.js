const axios = require("axios");

module.exports = {
	config: {
		name: "setavt",
		aliases: ["changeavt", "setavatar"],
		version: "2.0",
		author: "Mr.king",
		countDown: 5,
		role: 2,
		description: {
			vi: "Đổi avatar bot",
			en: "Change bot avatar"
		},
		category: "owner",
		guide: {
			vi: "   {pn} [<image url> | <phản hồi tin nhắn có ảnh>] [<caption> | để trống] [<expirationAfter (seconds)> | để trống]",
			en: "   {pn} [<image url> | reply to an image] [<caption> | optional] [<expirationAfter (seconds)> | optional]"
		}
	},

	langs: {
		vi: {
			cannotGetImage: "❌ | Đã xảy ra lỗi khi truy vấn đến url hình ảnh",
			invalidImageFormat: "❌ | Định dạng hình ảnh không hợp lệ",
			changedAvatar: "✅ | Đã thay đổi avatar của bot thành công",
			errorOccurred: "❌ | Đã xảy ra lỗi: %1"
		},
		en: {
			cannotGetImage: "❌ | An error occurred while querying the image url",
			invalidImageFormat: "❌ | Invalid image format",
			changedAvatar: "✅ | Changed bot avatar successfully",
			errorOccurred: "❌ | An error occurred: %1"
		}
	},

	onStart: async function ({ message, event, api, args, getLang }) {
		let imageURL = (args[0] || "").startsWith("http") ? args.shift() : null;

		if (!imageURL) {
			if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === "photo") {
				imageURL = event.attachments[0].url;
			} else if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
				imageURL = event.messageReply.attachments[0].url;
			}
		}

		if (!imageURL) {
			return message.SyntaxError();
		}

		const expirationAfter = (args.length > 0 && !isNaN(args[args.length - 1])) ? Number(args.pop()) : null;
		const caption = args.join(" ");

		let response;
		try {
			response = await axios.get(imageURL, {
				responseType: "stream"
			});
		} catch (err) {
			return message.reply(getLang("cannotGetImage"));
		}

		const contentType = response.headers["content-type"] || "";
		if (!contentType.includes("image")) {
			return message.reply(getLang("invalidImageFormat"));
		}

		response.data.path = "avatar.jpg";

		const timestamp = expirationAfter ? expirationAfter * 1000 : null;

		api.changeAvatar(response.data, caption, timestamp, (err) => {
			if (err) {
				return message.reply(getLang("errorOccurred", err.message || JSON.stringify(err)));
			}
			return message.reply(getLang("changedAvatar"));
		});
	}
};
