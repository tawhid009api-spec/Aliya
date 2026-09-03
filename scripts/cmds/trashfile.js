const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "trashfile",
    aliases: ["clean", "autoclean", "clearcache"],
    version: "1.0",
    author: "Mr.king",
    countDown: 5,
    role: 2,
    shortDescription: "Clean system cache and temporary files",
    longDescription: "Deletes temporary cache files, logs, and downloads to optimize bot performance.",
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const rootDir = process.cwd();
    
    // Directory paths to target for temporary/junk files
    const targets = [
      path.join(rootDir, "modules", "commands", "cache"),
      path.join(rootDir, "modules", "events", "cache"),
      path.join(rootDir, "cache"),
      path.join(rootDir, "tmp"),
      path.join(rootDir, "temp")
    ];

    let deletedCount = 0;
    let freedBytes = 0;

    for (const dir of targets) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            // Ignore system/config hidden keep files
            if (file === ".gitkeep" || file === "readme.txt") continue;

            const filePath = path.join(dir, file);
            try {
              const stats = fs.statSync(filePath);
              if (stats.isFile()) {
                freedBytes += stats.size;
                fs.unlinkSync(filePath);
                deletedCount++;
              }
            } catch (fileErr) {
              // Skip locked or inaccessible files silently
            }
          }
        } catch (dirErr) {
          // Skip inaccessible folders
        }
      }
    }

    const freedMB = (freedBytes / (1024 * 1024)).toFixed(2);

    if (deletedCount === 0) {
      return message.reply("🧹 System is already clean! No cache or junk files found.");
    }

    return message.reply(`✅ System cache cleared successfully!\n\n🗑️ Deleted Files: ${deletedCount}\n💾 Memory Freed: ${freedMB} MB\n🚀 Bot status: Running smoothly.`);
  }
};
