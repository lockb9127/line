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
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        });

        const replyMessage = gptResponse.choices[0].message.content;

        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: replyMessage,
        });
      } catch (error) {
        console.error('OpenAI API Error:', error);
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: '抱歉，系統發生錯誤，請稍後再試。',
        });
      }
    }
  }

  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`伺服器正在 ${port} 埠上執行`);
});
