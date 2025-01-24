require("dotenv").config();
const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const { checkGroup, errorLog } = require("./misc");
const { addMessageToQueue } = require("./messageQueue");
const { getContentResponse } = require("../gemini/generateContent");
const { clearChatHistory } = require("../gemini/generateChat");

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ======= bot actions ======= */
bot.start(async (ctx) => {
  console.log("Received /start command");
  try {
    if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

    // clear chat history
    clearChatHistory(ctx.message?.chat?.id.toString());

    return ctx.reply(
      "Hi, this is *Gemini Bot BD*, ready to chat with you. \nReply to my message to start chatting...",
      {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true,
        // reply_markup: { force_reply: true, selective: true }
      }
    );
  } catch (e) {
    errorLog(e);
    console.error("Error in start action:", e);
    return ctx.reply("Error occured");
  }
});

bot.command("about", async (ctx) => {
  console.log("Received /about command");
  try {
    return ctx.reply(
      "I am *Gemini Bot BD*\\. I am a Telegram bot developed by *SR Tamim* \\(@sr\\_tamim\\) and maintained by *Sharafat Karim* \\(@SharafatKarim\\)\\. I am here to chat with you\\.",
      {
        parse_mode: "MarkdownV2",
        allow_sending_without_reply: true,
      }
    );
  } catch (e) {
    errorLog(e);
    console.error("error in about action:", e);
    return ctx.reply("Error occured");
  }
});

bot.command("translate", async (ctx) => {
  console.log("Received /translate command");
  try {
    if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

    // translation input text from reply to message
    let text = ctx.message?.reply_to_message?.text;
    if (!text) {
      return ctx.reply("Reply to a message to translate it");
    }
    text = `translate to bn: "${text.trim()}"`;

    ctx.telegram.sendChatAction(ctx.message.chat.id, "typing");
    const res = await getContentResponse(text);
    if (!res) {
      return ctx.reply("🤐");
    }
    return ctx.reply(res, {
      parse_mode: "Markdown",
      reply_to_message_id: ctx.message.message_id,
      allow_sending_without_reply: true,
    });
  } catch (e) {
    if (
      e?.response?.error_code === 400 &&
      e?.response?.description?.toLowerCase().includes("can't parse entities")
    ) {
      try {
        // if error is due to parsing entities, try sending message without markdown
        const res = e?.on?.payload?.text || "Error occured!";
        return ctx.reply(res, {
          reply_to_message_id: ctx.message?.message_id,
          allow_sending_without_reply: true,
          // reply_markup: { force_reply: true, selective: true }
        });
      } catch (e) {
        errorLog(e);
        return ctx.reply("Error occured");
      }
    }
    errorLog(e);
    console.error("Error in translate action:", e);
    return ctx.reply("Error occured");
  }
});

bot.on(message("reply_to_message"), async (ctx) => {
  if (ctx.message.via_bot) {
    return ctx.reply("Sorry! I don't reply bots.");
  }
  try {
    if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

    // message must be a reply of this bot's message
    if (
      ctx.message?.reply_to_message?.from?.id?.toString() !==
      process.env.BOT_ID.toString()
    )
      return;

    ctx.telegram.sendChatAction(ctx.message.chat.id, "typing");
    addMessageToQueue(ctx);
  } catch (error) {
    console.log(error);
    clearChatHistory(ctx.message?.chat?.id.toString());
    errorLog(error);
    return ctx.reply("Error occured");
  }
});

bot.on(message("photo"), async (ctx) => {
  console.log("Received photo message");
  if (ctx.message.via_bot) {
    return ctx.reply("Sorry! I don't reply bots.");
  }
  try {
    if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

    // message must be a reply of this bot's message
    if (
      ctx.message?.reply_to_message?.from?.id?.toString() !==
      process.env.BOT_ID.toString()
    )
      return;

    ctx.telegram.sendChatAction(ctx.message.chat.id, "typing");
    addMessageToQueue(ctx);
  } catch (error) {
    console.log(error);
    errorLog(error);
    return ctx.reply("Error occured");
  }
});

module.exports = {
  bot,
};
