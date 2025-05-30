require('dotenv').config();

const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// 環境變數載入檢查
console.log('LINE_CHANNEL_ACCESS_TOKEN:', process.env.LINE_CHANNEL_ACCESS_TOKEN ? '有載入' : '未載入');
console.log('LINE_CHANNEL_SECRET:', process.env.LINE_CHANNEL_SECRET ? '有載入' : '未載入');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '有載入' : '未載入');

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const lineClient = new Client(lineConfig);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.post('/webhook', middleware(lineConfig), async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      try {
        const gptResponse = await openai.chat.completions.create({
