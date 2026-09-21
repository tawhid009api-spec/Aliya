module.exports = {
	config: {
		name: "badwords",
		aliases: ["badword"],
		version: "2.5",
		author: "Mr.king",
		countDown: 5,
		role: 1,
		description: {
			vi: "Bật/tắt/thêm/xóa cảnh báo vi phạm từ thô tục",
			en: "Turn on/off/add/remove bad words warning, second time will ban user"
		},
		category: "box chat",
		guide: {
			en: "   {pn} add <words>\n   {pn} delete <words>\n   {pn} list\n   {pn} unwarn <userID|@tag>\n   {pn} on / off"
		}
	},

	langs: {
		en: {
			onText: "on",
			offText: "off",
			onlyAdmin: "⚠️ | Only admins can add banned words",
			missingWords: "⚠️ | You haven't entered the banned words",
			addedSuccess: "✅ | Added %1 banned words to the list",
			alreadyExist: "❌ | %1 banned words already exist: %2",
			tooShort: "⚠️ | %1 words are too short (< 2 chars): %2",
			onlyAdmin2: "⚠️ | Only admins can delete banned words",
			missingWords2: "⚠️ | You haven't entered words to delete",
			deletedSuccess: "✅ | Deleted %1 banned words",
			notExist: "❌ | %1 words do not exist: %2",
			emptyList: "⚠️ | The badwords list is currently empty",
			badWordsList: "📑 | Banned words in group: %1",
			onlyAdmin3: "⚠️ | Only admins can %1 this feature",
			turnedOnOrOff: "✅ | Banned words warning has been %1",
			onlyAdmin4: "⚠️ | Only admins can delete warnings",
			missingTarget: "⚠️ | You haven't entered user ID or tagged user",
			notWarned: "⚠️ | User %1 has not been warned",
			removedWarn: "✅ | Removed warnings & unbanned user %1 | %2",
			warned: "⚠️ | Badword \"%1\" detected! Warning 1/2. Next time you will be banned and kicked.",
			warned2: "⚠️ | Badword \"%1\" detected! You violated 2 times and have been banned from the bot.",
			needAdmin: "Bot needs admin privileges to kick members",
			unwarned: "✅ | Removed badword warnings & unbanned user %1 | %2"
		}
	},

	onLoad: async function () {
		if (!global.defaultBadWords) {
			global.defaultBadWords = ["sex", "magi", "chudi", "choda", "gandu", "maderchod", "bainchod", "khanki", "bokachoda", "slut", "bitch", "fuck"];
		}
	},

	onStart: async function ({ message, event, args, threadsData, usersData, role, getLang }) {
		const defaultWords = global.defaultBadWords || ["sex", "magi", "chudi", "choda", "gandu", "maderchod", "bainchod", "khanki", "bokachoda", "slut", "bitch", "fuck"];
		
		let threadBadWordsData = await threadsData.get(event.threadID, "data.badWords");
		if (!threadBadWordsData) {
			threadBadWordsData = { words: [...defaultWords], violationUsers: {} };
			await threadsData.set(event.threadID, threadBadWordsData, "data.badWords");
		}

		const badWords = await threadsData.get(event.threadID, "data.badWords.words", defaultWords);

		switch (args[0]?.toLowerCase()) {
			case "add": {
				if (role < 1) return message.reply(getLang("onlyAdmin"));
				const words = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim().toLowerCase()).filter(w => w);
				if (words.length === 0) return message.reply(getLang("missingWords"));
				const badWordsExist = [], success = [], failed = [];
				for (const word of words) {
					if (word.length < 2) { failed.push(word); continue; }
					if (!badWords.includes(word)) { badWords.push(word); success.push(word); }
					else { badWordsExist.push(word); }
				}
				await threadsData.set(event.threadID, badWords, "data.badWords.words");
				return message.reply((success.length ? getLang("addedSuccess", success.length) + "\n" : "") + (badWordsExist.length ? getLang("alreadyExist", badWordsExist.length, badWordsExist.join(", ")) : ""));
			}
			case "delete":
			case "del": {
				if (role < 1) return message.reply(getLang("onlyAdmin2"));
				const words = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim().toLowerCase()).filter(w => w);
				if (words.length === 0) return message.reply(getLang("missingWords2"));
				const success = [], failed = [];
				for (const word of words) {
					const idx = badWords.indexOf(word);
					if (idx > -1) { badWords.splice(idx, 1); success.push(word); }
					else { failed.push(word); }
				}
				await threadsData.set(event.threadID, badWords, "data.badWords.words");
				return message.reply(success.length ? getLang("deletedSuccess", success.length) : getLang("notExist", failed.length, failed.join(", ")));
			}
			case "list": {
				if (!badWords.length) return message.reply(getLang("emptyList"));
				return message.reply(getLang("badWordsList", badWords.join(", ")));
			}
			case "on": {
				if (role < 1) return message.reply(getLang("onlyAdmin3", getLang("onText")));
				await threadsData.set(event.threadID, true, "settings.badWords");
				return message.reply(getLang("turnedOnOrOff", getLang("onText")));
			}
			case "off": {
				if (role < 1) return message.reply(getLang("onlyAdmin3", getLang("offText")));
				await threadsData.set(event.threadID, false, "settings.badWords");
				return message.reply(getLang("turnedOnOrOff", getLang("offText")));
			}
			case "unwarn": {
				if (role < 1) return message.reply(getLang("onlyAdmin4"));
				let userID = Object.keys(event.mentions)[0] || args[1] || event.messageReply?.senderID;
				if (!userID || isNaN(userID)) return message.reply(getLang("missingTarget"));

				const violationUsers = await threadsData.get(event.threadID, "data.badWords.violationUsers", {});
				violationUsers[userID] = 0;
				await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");

				// Unban user in User Data
				try {
					await usersData.set(userID, {
						banned: {
							status: false,
							reason: null,
							date: null
						}
					});
				} catch (e) {
					console.error("Error unbanning user:", e);
				}

				const userName = await usersData.getName(userID);
				return message.reply(getLang("unwarned", userID, userName));
			}
			default: {
				return message.reply(`Badwords Commands:\n• badwords add <words>\n• badwords delete <words>\n• badwords list\n• badwords on/off\n• badwords unwarn <user>`);
			}
		}
	},

	onChat: async function ({ message, event, api, threadsData, usersData, prefix, getLang }) {
		if (!event.body || event.senderID === global.GoatBot?.botID) return;

		const isEnabled = await threadsData.get(event.threadID, "settings.badWords", true);
		if (!isEnabled) return;

		if (event.body.toLowerCase().startsWith(prefix + "badwords")) return;

		const defaultWords = global.defaultBadWords || ["sex", "magi", "chudi", "choda", "gandu", "maderchod", "bainchod", "khanki", "bokachoda", "slut", "bitch", "fuck"];
		const badWordList = await threadsData.get(event.threadID, "data.badWords.words", defaultWords);
		if (!badWordList || badWordList.length === 0) return;

		const violationUsers = await threadsData.get(event.threadID, "data.badWords.violationUsers", {});
		const messageText = event.body.toLowerCase();

		for (const word of badWordList) {
			const regex = new RegExp(`\\b${word}\\b`, "gi");
			if (regex.test(messageText)) {
				const currentViolations = violationUsers[event.senderID] || 0;

				if (currentViolations < 1) {
					violationUsers[event.senderID] = 1;
					await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");
					return message.reply(getLang("warned", word));
				} else {
					violationUsers[event.senderID] = 0;
					await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");
					await message.reply(getLang("warned2", word));

					// Ban user in Bot Database
					try {
						await usersData.set(event.senderID, {
							banned: {
								status: true,
								reason: "Violated badwords limit in group chat",
								date: new Date().toISOString()
							}
						});
					} catch (e) {
						console.error("Error banning user in bot system:", e);
					}

					// Kick from group
					return api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
						if (err) message.reply(getLang("needAdmin"));
					});
				}
			}
		}
	}
};
