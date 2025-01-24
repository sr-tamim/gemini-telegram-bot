<h1 align="center">Gemini Telegram Bot</h1>
<h6 align="center">Feel the era of artificial intelligence</h6>

<h5 align="center">This repository contains the code of a Telegram chatbot built using Nodejs. This chatbot uses Gemini API to send reply to users on Telegram.</h5>

------

### Description

This code is a Telegram chatbot built using the Telegraf library in Node.js. This chatbot uses the Gemini API to generate responses to messages sent to it by users. It uses the Telegraf library for Telegram API for generating chat responses. The bot's functionality is based on the `generateChatResponse` function, which takes user input as an argument and generates a response using the Gemini API. The bot also has a `/start` or `/translate` command which greets the user and prompts them to start chatting.

#### What is a Telegram Bot?

Telegram is a popular instant messaging app that allows users to send messages, photos, videos, and files. Telegram also has a bot API that enables developers to create chatbots for various use cases, including customer service, news, weather, and more. Telegram bots can be integrated into groups and channels, allowing users to interact with them directly. Bots can respond to user messages, send notifications, and perform other automated tasks.

#### What is Gemini API?

Gemini API is a natural language processing API that generates human-like responses to user input. It uses machine learning models to understand and generate responses to user messages. The Gemini API can be used to create chatbots, virtual assistants, and other conversational interfaces.

---

#### Anyone who wants to chat with this bot on telegram, [Join in the public group](https://t.me/ai_bot_bd_public)

---

### For Developers

To run this code in your local machine, first you have to clone this repo. Then run below command

```shell
docker compose up -d
```

---

## Authors

[![sr-tamim's Profilator](https://profilator.deno.dev/sr-tamim?v=1.0.0.alpha.4)](https://github.com/sr-tamim)
[![SharafatKarim's Profilator](https://profilator.deno.dev/SharafatKarim?v=1.0.0.alpha.4)](https://github.com/SharafatKarim)

> This chatbot can only reply to messages in specific groups, as defined in the "allowedGroups" variable and it only responds to user messages that are replies to its own messages. I have restricted this bot in some groups and did not allow it to respond to public messages. This is to prevent spam and abuse of the bot. If you want to use this bot in your own group, you can modify the "allowedGroups" variable in the code to include your group ID.
