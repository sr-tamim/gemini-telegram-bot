require("dotenv").config();
const allowedGroups = process.env.GROUP_ID.toString().split(",");
const fs = require("fs");

/* ======= helper functions ======= */
const checkGroup = (ctx) => {
  const isAllowed = allowedGroups.includes(ctx.message?.chat?.id.toString());
  if (!isAllowed) {
    ctx.reply(
      "I am not allowed to reply outside specific groups. Join the public group and chat with me.\nhttps://t.me/ai_bot_bd_public"
    );
  }
  return isAllowed;
};

// write log to file
function errorLog(err) {
  const msg = err.message || JSON.stringify(err);
  const date = new Date().toLocaleString();
  // create logs folder if not exists
  if (!fs.existsSync("./logs")) {
    fs.mkdirSync("./logs");
  }
  // create error.txt file if not exists
  if (!fs.existsSync("./logs/error.txt")) {
    fs.writeFileSync("./logs/error.txt", "");
  }
  fs.appendFile(
    "./logs/error.txt",
    `[${date}] ${msg}\n\n   ======   \n`,
    (err) => {
      if (err) console.log(err);
    }
  );
}

module.exports = {
  checkGroup,
  errorLog,
};
