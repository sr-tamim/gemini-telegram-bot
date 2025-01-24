const { Telegram } = require("telegraf");
const { errorLog } = require("./misc");
const {
  generateChatResponse,
  clearChatHistory,
} = require("../gemini/generateChat");
const { analyzeImageResponse } = require("../gemini/analyzeImage");

const tg = new Telegram(process.env.BOT_TOKEN);
// message queue to avoid gemini free api limit
const messageQueue = [];
let lastReplySent = Date.now();
const delay = 5000;

const addMessageToQueue = (ctx, loadingMsg) => {
  messageQueue.push({ ctx, loadingMsg });
  if (messageQueue.length === 1) sendResponse();
};

const sendResponse = async () => {
  if (messageQueue.length === 0) return console.log("No message in queue");
  const { ctx } = messageQueue[0];
  const now = Date.now();
  const timeGap = now - lastReplySent;
  if (timeGap > delay) {
    try {
      ctx.telegram.sendChatAction(ctx.message.chat.id, "typing");

      const senderName = ctx.message?.from?.first_name
        ? `${ctx.message?.from?.first_name} ${ctx.message?.from?.last_name}`
        : ctx.message?.from?.username || null;

      // generate response from openai
      let response;

      if (ctx.message?.photo) {
        const fileURL = await tg.getFileLink(
          ctx.message.photo[ctx.message.photo.length - 1]?.file_id
        );
        response = await analyzeImageResponse(
          fileURL,
          ctx.message.caption || "Analyze this image"
        );
      } else {
        response = await generateChatResponse(
          ctx.message.text,
          ctx.message?.chat?.id.toString(),
          senderName
        );
      }
      if (!response) {
        response = "🤐";
      }
      await ctx.reply(response, {
        // send response
        parse_mode: "Markdown", // to parse markdown in response
        reply_to_message_id: ctx.message?.message_id, // to reply to user's the message
        allow_sending_without_reply: true, // send message even if user's message is not found
        // reply_markup: { force_reply: true, selective: true } // to force user to reply to this message
      });
    } catch (e) {
      if (
        e?.response?.error_code === 400 &&
        e?.response?.description?.toLowerCase().includes("can't parse entities")
      ) {
        try {
          // if error is due to parsing entities, try sending message without markdown
          const res = e?.on?.payload?.text || "Error occured!";
          await ctx.reply(res, {
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            // reply_markup: { force_reply: true, selective: true }
          });
        } catch (e) {
          errorLog(e);
          ctx.reply("Error occured!");
        }
      } else {
        // if error occured, clear chat history
        clearChatHistory(ctx.message?.chat?.id.toString());
        // write error log
        errorLog(e);
        ctx.reply("Error occured!");
      }
    } finally {
      messageQueue.shift(); // remove first element from queue}
      lastReplySent = Date.now(); // update last reply sent time
    }
  }
  // if there are more messages in queue, call this function again after delay
  if (messageQueue.length > 0)
    return setTimeout(() => sendResponse(), delay - timeGap);
};

module.exports = { addMessageToQueue };
