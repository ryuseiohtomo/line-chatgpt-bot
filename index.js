const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
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

async function getAgentData() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'agents!A2:E100',
  });

  return res.data.values.map(row => ({
    name: row[0],
    area: row[1],
    industry: row[2],
    age: row[3],
    features: row[4]
  }));
} 

async function getGptRecommendation(userInput, agents) {
  const prompt = `
あなたは転職支援AIです。ユーザーの条件に合うエージェントを1社選んでください。
選定基準は以下です：
- 地域、年齢層、業界、特徴の一致度
- ユーザーの要望とのマッチ率
出力形式は「おすすめエージェント：○○（理由：〜〜）」としてください。

ユーザー情報: ${userInput}

agents:
${agents.map(a => `名前: ${a.name}、得意分野: ${a.industry}、対応エリア: ${a.area}、年齢層: ${a.age}、特徴: ${a.features}`).join('\n')}
`;

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  }, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data.choices[0].message.content;
}

app.post('/webhook', async (req, res) => {
  const events = req.body.events;
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userInput = event.message.text;
      const agents = await getAgentData();
      const replyText = await getGptRecommendation(userInput, agents);

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText,
      });
    }
  }
  res.send('ok');
});

app.listen(3000);
