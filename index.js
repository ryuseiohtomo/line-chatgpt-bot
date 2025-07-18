const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const axios = require('axios');
require('dotenv').config();

const app = express();
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new Client(config);
app.use(middleware(config));
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const events = req.body.events;
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const reply = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: event.message.text }],
      }, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const answer = reply.data.choices[0].message.content;

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: answer,
      });
    }
  }
  res.send('ok');
});

app.listen(3000);