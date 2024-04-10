require("dotenv").config()
const { Telegraf } = require("telegraf")
const bot = new Telegraf(process.env.BOT_TOKEN)
const allowedGroups = process.env.GROUP_ID.toString().split(',')

const ai = require("./gemini/geminiAI")


/* ======= helper functions ======= */
const checkGroup = (ctx) => {
    const isAllowed = allowedGroups.includes(ctx.message?.chat?.id.toString())
    if (!isAllowed) {
        ctx.reply("I am not allowed to reply outside specific groups. Join the public group and chat with me.\nhttps://t.me/ai_bot_bd_public");
    };
    return isAllowed;
}

async function getResponse(prompt) {
    const chat = ai.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 100
        }
    })
    const res = await chat.sendMessage(prompt)
    return res.response.text()
}


/* ======= bot actions ======= */
bot.start(async ctx => {
    console.log("Received /start command")
    try {
        //if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

        return ctx.reply("Hi, this is *AI Bot BD*, ready to chat with you. \nReply to my message to start chatting...", {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            reply_markup: { force_reply: true, selective: true }
        })
    } catch (e) {
        console.error("error in start action:", e)
        return ctx.reply("Error occured")
    }
})


bot.on("message", async (ctx) => {
    if (ctx.message.via_bot) {
        return ctx.reply("Sorry! I don't reply bots.");
    }
    try {
        //if (!checkGroup(ctx)) return; // check if bot is allowed to reply in this group

        // message must be a reply of this bot's message
        if (ctx.message?.reply_to_message?.from?.id?.toString() !== process.env.BOT_ID.toString()) return

        const res = await getResponse(ctx.message.text)
        return ctx.reply(res, { // send response
            parse_mode: "Markdown", // to parse markdown in response
            reply_to_message_id: ctx.message?.message_id, // to reply to user's the message
            allow_sending_without_reply: true, // send message even if user's message is not found
            reply_markup: { force_reply: true, selective: true } // to force user to reply to this message
        })
    } catch (error) {
        console.log(error)
        return ctx.reply("Error occured");
    }
})


bot.launch()