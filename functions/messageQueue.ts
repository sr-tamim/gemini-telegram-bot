import { Telegram } from "telegraf";
import { Context } from "telegraf";
import { errorLog } from "./misc";
import { generateChatResponse, clearChatHistory } from "../gemini/generateChat";
import { analyzeImageResponse } from "../gemini/analyzeImage";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { Message, Update } from "telegraf/typings/core/types/typegram";

const tg = new Telegram(process.env.BOT_TOKEN || "");
// message queue to avoid gemini free api limit
interface QueueItem {
  ctx: Context<{
    message: Update.New &
      Update.NonChannel &
      Message.TextMessage &
      Message.PhotoMessage;
    update_id: number;
  }> &
    Omit<Context<Update>, keyof Context<Update>> &
    CommandContextExtn;
  loadingMsg?: any;
}

const messageQueue: QueueItem[] = [];
let lastReplySent = Date.now();
const delay = 5000;

const addMessageToQueue = (ctx: QueueItem["ctx"], loadingMsg?: any): void => {
  messageQueue.push({ ctx, loadingMsg });
  if (messageQueue.length === 1) sendResponse();
};

const sendResponse = async (): Promise<void> => {
  if (messageQueue.length === 0) return console.log("No message in queue");
  const { ctx } = messageQueue[0];
  const now = Date.now();
  const timeGap = now - lastReplySent;
  if (timeGap > delay) {
    try {
      ctx.telegram.sendChatAction(ctx.message!.chat.id, "typing");

      const senderName = ctx.message?.from?.first_name
        ? `${ctx.message?.from?.first_name} ${ctx.message?.from?.last_name}`
        : ctx.message?.from?.username || null;

      // generate response from openai
      let response: string | null = null;

      if (ctx.message?.photo) {
        const fileURL = await tg.getFileLink(
          (ctx.message as any).photo[(ctx.message as any).photo.length - 1]
            ?.file_id
        );
        response = await analyzeImageResponse(
          fileURL,
          ctx.message.caption || "Analyze this image"
        );
      } else {
        response = await generateChatResponse(
          ctx.message.text || "",
          ctx.message?.chat?.id.toString() || "",
          senderName
        );
      }
      if (!response) {
        response = "🤐";
      }
      await ctx.reply(response, {
        // send response
        parse_mode: "Markdown", // to parse markdown in response
        reply_parameters: {
          message_id: ctx.message.message_id,
          allow_sending_without_reply: true,
        },
        // reply_markup: { force_reply: true, selective: true } // to force user to reply to this message
      });
    } catch (e: any) {
      console.error("Error in sending response from queue:", e);
      if (
        e?.response?.error_code === 400 &&
        e?.response?.description?.toLowerCase().includes("can't parse entities")
      ) {
        try {
          // if error is due to parsing entities, try sending message without markdown
          const res = e?.on?.payload?.text || "Error occured!";
          await ctx.reply(res, {
            reply_parameters: {
              message_id: ctx.message.message_id,
              allow_sending_without_reply: true,
            },
            // reply_markup: { force_reply: true, selective: true }
          });
        } catch (e) {
          errorLog(e);
          ctx.reply("Error occured!");
        }
      } else {
        // if error occured, clear chat history
        clearChatHistory(ctx.message?.chat?.id.toString() || "");
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
  if (messageQueue.length > 0) {
    setTimeout(() => sendResponse(), delay - timeGap);
    return;
  }
};

export { addMessageToQueue };
