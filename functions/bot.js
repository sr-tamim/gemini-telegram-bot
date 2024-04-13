require("dotenv").config()
const { Telegraf } = require("telegraf")
const { checkGroup, clearChatHistory } = require("./misc")
const { addMessageToQueue } = require("./messageQueue")
const bot = new Telegraf(process.env.BOT_TOKEN)

/* ======= bot actions ======= */
bot.start(async ctx => {
    console.log("Received /start command")
    try {
        if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

        // clear chat history
        clearChatHistory(ctx.message?.chat?.id.toString())

        return ctx.reply("Hi, this is *Gemini Bot BD*, ready to chat with you. \nReply to my message to start chatting...", {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            reply_markup: { force_reply: true, selective: true }
        })
    } catch (e) {
        console.error("Error in start action:", e)
        return ctx.reply("Error occured")
    }
})

bot.command("about", async ctx => {
    console.log("Received /about command")
    try {
        return ctx.reply("I am *Gemini Bot BD*\\. I am a Telegram bot developed by *SR Tamim* \\(@sr\\_tamim\\) and maintained by *Sharafat Karim* \\(@SharafatKarim\\)\\. I am here to chat with you\\.", {
            parse_mode: "MarkdownV2",
            allow_sending_without_reply: true
        })
    } catch (e) {
        console.error("error in about action:", e)
        return ctx.reply("Error occured")
    }
})


bot.on("message", async (ctx) => {
    if (ctx.message.via_bot) {
        return ctx.reply("Sorry! I don't reply bots.");
    }
    try {
        if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

        // message must be a reply of this bot's message
        if (ctx.message?.reply_to_message?.from?.id?.toString() !== process.env.BOT_ID.toString()) return

        ctx.telegram.sendChatAction(ctx.message.chat.id, "typing")
        addMessageToQueue(ctx)
    } catch (error) {
        console.log(error)
        clearChatHistory(ctx.message?.chat?.id.toString())
        return ctx.reply("Error occured");
    }
})

module.exports = {
    bot
}