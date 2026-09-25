const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	} catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "3.0.0",
		author: "NTKhang | Upgraded",
		countDown: 2,
		role: 4,
		description: {
			en: "Auto Package Installer & Command Manager with Live Reaction"
		},
		category: "owner",
		guide: {
			en: "   {pn} install <url> <file.js>\n   {pn} install <file.js> <code>\n   {pn} load <file.js>\n   {pn} loadAll"
		}
	},

	langs: {
		en: {
			missingFileName: "❌ | Command file name lacks .js extension or missing.",
			loaded: "✅ | Command \"%1\" loaded successfully!",
			loadedError: "❌ | Failed to load command \"%1\"\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Syntax: {pn} install <url/code> <filename.js>",
			invalidUrl: "⚠️ | Invalid URL provided.",
			invalidUrlOrCode: "⚠️ | Failed to extract valid code from source.",
			alreadExist: "⚠️ | File already exists. React to overwrite.",
			installed: "🚀 | Successfully installed \"%1\"\n📁 Saved: %2",
			installedError: "❌ | Failed to install \"%1\"\n%2: %3"
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		const { unloadScripts } = global.utils;
		const action = (args[0] || "").toLowerCase();

		if (action === "load" && args.length === 2) {
			if (!args[1]) return message.reply(getLang("missingFileName"));
			const infoLoad = await loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, null, api, event.messageID);
			if (infoLoad.status === "success") return message.reply(getLang("loaded", infoLoad.name));
			return message.reply(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
		}

		else if (action === "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName) return message.reply(getLang("missingUrlCodeOrFileName"));

			if (url.endsWith(".js") && !isURL(url)) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			// Add Loading Reaction 🛜
			api.setMessageReaction("🛜", event.messageID, (err) => {}, true);

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				if (!fileName || !fileName.endsWith(".js")) {
					api.setMessageReaction("❌", event.messageID, () => {}, true);
					return message.reply(getLang("missingFileName"));
				}

				const domain = getDomain(url);
				if (!domain) {
					api.setMessageReaction("❌", event.messageID, () => {}, true);
					return message.reply(getLang("invalidUrl"));
				}

				if (domain === "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex)) url = url.replace(regex, "https://pastebin.com/raw/$1");
				} else if (domain === "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex)) url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				try {
					const res = await axios.get(url);
					rawCode = res.data;
				} catch (e) {
					api.setMessageReaction("❌", event.messageID, () => {}, true);
					return message.reply(getLang("invalidUrlOrCode"));
				}

				if (domain === "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			} else {
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				} else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				} else {
					api.setMessageReaction("❌", event.messageID, () => {}, true);
					return message.reply(getLang("missingFileName"));
				}
			}

			if (!rawCode) {
				api.setMessageReaction("❌", event.messageID, () => {}, true);
				return message.reply(getLang("invalidUrlOrCode"));
			}

			const targetPath = path.join(process.cwd(), "scripts", "cmds", fileName);

			if (fs.existsSync(targetPath)) {
				api.setMessageReaction("", event.messageID, () => {}, true);
				return message.reply(getLang("alreadExist"), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						author: event.senderID,
						data: { fileName, rawCode }
					});
				});
			} else {
				const infoLoad = await loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode, api, event.messageID);
				if (infoLoad.status === "success") {
					// Set Success Reaction ☃️
					api.setMessageReaction("☃️", event.messageID, () => {}, true);
					return message.reply(getLang("installed", infoLoad.name, `/scripts/cmds/${fileName}`));
				} else {
					api.setMessageReaction("❌", event.messageID, () => {}, true);
					return message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
				}
			}
		} else {
			message.SyntaxError();
		}
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
		const { author, data: { fileName, rawCode } } = Reaction;
		if (event.userID != author) return;

		api.setMessageReaction("🛜", event.messageID, () => {}, true);

		const infoLoad = await loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode, api, event.messageID);
		if (infoLoad.status === "success") {
			api.setMessageReaction("☃️", event.messageID, () => {}, true);
			return message.reply(getLang("installed", infoLoad.name, `/scripts/cmds/${fileName}`));
		} else {
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			return message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
		}
	}
};

async function loadScripts(folder, fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode, fcaApi, targetMessageID) {
	try {
		if (rawCode) {
			if (fileName.endsWith(".js")) fileName = fileName.slice(0, -3);
			fs.writeFileSync(path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`), rawCode);
		}

		let pathCommand = path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`);
		const contentFile = fs.readFileSync(pathCommand, "utf8");

		// Auto Package Detection & Installation
		const regExpCheckPackage = /require\s*\(\s*[`'"]([^`'"]+)[`'"]\s*\)/g;
		let packages = [];
		let match;

		while ((match = regExpCheckPackage.exec(contentFile)) !== null) {
			let pkg = match[1];
			if (!pkg.startsWith(".") && !pkg.startsWith("/") && pkg !== "path") {
				pkg = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
				packages.push(pkg);
			}
		}

		for (const packageName of packages) {
			const packagePath = path.join(process.cwd(), "node_modules", packageName);
			if (!fs.existsSync(packagePath)) {
				try {
					execSync(`npm install ${packageName} --save`, { stdio: "pipe" });
				} catch (err) {
					// Fallback for Sharp WASM if Sharp package fails on Android/Termux
					if (packageName === "sharp") {
						execSync(`npm install sharp @img/sharp-wasm32 --save`, { stdio: "pipe" });
					}
				}
			}
		}

		if (require.cache[require.resolve(pathCommand)]) {
			delete require.cache[require.resolve(pathCommand)];
		}

		const command = require(pathCommand);
		command.location = pathCommand;
		const configCommand = command.config;
		if (!configCommand || typeof configCommand !== "object") throw new Error("config of command must be an object");

		const scriptName = configCommand.name;
		const { GoatBot } = global;

		GoatBot.commands.set(scriptName, command);
		fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

		return { status: "success", name: fileName, command };

	} catch (err) {
		return {
			status: "failed",
			name: fileName,
			error: err
		};
	}
}

