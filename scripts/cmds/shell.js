const { exec } = require('child_process');

module.exports = {
  config: {
    name: "shell",
    version: "2.0",
    author: "Mr.king",
    countDown: 5,
    role: 2,
    shortDescription: "Execute shell commands",
    longDescription: "Execute terminal shell commands safely with automatic text chunking and output handling.",
    category: "owner",
    guide: {
      vi: "{p}{n} <command>",
      en: "{p}{n} <command>"
    }
  },

  onStart: async function ({ args, message }) {
    const command = args.join(" ");

    if (!command) {
      return message.reply("Please provide a shell command to execute.");
    }

    // Safety check for dangerous commands
    if (command.match(/rm\s+-rf\s+\/|mkfs|shutdown|reboot/i)) {
      return message.reply("Execution blocked: Extremely dangerous command detected.");
    }

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
      let output = "";

      if (error) {
        output = `Error:\n${error.message}`;
      } else if (stderr) {
        output = `Stderr:\n${stderr}`;
      } else if (!stdout || stdout.trim() === "") {
        output = "Command executed successfully with no output.";
      } else {
        output = stdout;
      }

      // Split output into multiple messages if it exceeds Messenger character limit (2000 chars)
      const MAX_LENGTH = 1900;
      if (output.length <= MAX_LENGTH) {
        return message.reply(`\`\`\`\n${output}\n\`\`\``);
      } else {
        for (let i = 0; i < output.length; i += MAX_LENGTH) {
          const chunk = output.substring(i, i + MAX_LENGTH);
          await message.reply(`\`\`\`\n${chunk}\n\`\`\``);
        }
      }
    });
  }
};
