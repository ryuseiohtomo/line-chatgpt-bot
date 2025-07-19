const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const axios = require('axios');
const { getNextStep, saveAnswer, getUserAnswers, resetUser } = require('./utils');
const quickReplies = require('./quickReplies');
require('dotenv').config();

const app = express();
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new Client(config);
app.use(express.json());
app.use(middleware(config));

async function getAgentData() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'エージェント一覧!A2:H',
  });

  return res.data.values.map(row => ({
    name: row[0],
    age: row[1],
    gender: row[2],
    area: row[3],
    education: row[4],
    experience: row[5],
    jobType: row[6],
    features: row[7]
  }));
}

async function getGptRecommendation(userInput, agents) {
  const prompt = `
あなたは転職希望者に最適なエージェントを紹介するマッチングAIです。
以下のユーザー情報を参考に、条件に合うTOP3のエージェントを比較し、わかりやすく提案してください。
最後に「エージェントとの面談を予約しよう！」と一言添えてください。

【ユーザー情報】
${userInput}

【エージェント一覧】
${agents.map(a => `社名: ${a.name}｜対応年齢: ${a.age}｜対応性別: ${a.gender}｜対応エリア: ${a.area}｜学歴条件: ${a.education}｜経験社数条件: ${a.experience}｜対応職種: ${a.jobType}｜特徴: ${a.features}`).join('\n')}
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
    const userId = event.source.userId;

    if (event.type === 'message' && event.message.type === 'text') {
      const message = event.message.text;

      if (message === 'やり直す') {
        resetUser(userId);
        const step = getNextStep(userId);
        if (step === 1) {
          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: '最初の質問から再開します！',
          });
          await client.pushMessage(userId, quickReplies[0]);
        }
        return;
      }

      const step = getNextStep(userId);

      if (step === 1) {
        await client.replyMessage(event.replyToken, quickReplies[0]);
        return;
      }

      if (step <= quickReplies.length) {
        saveAnswer(userId, step - 1, message);
        await client.replyMessage(event.replyToken, quickReplies[step - 1]);
        return;
      }

      saveAnswer(userId, step - 1, message);
      const userAnswers = getUserAnswers(userId);

      const formatted = `
1. 年代: ${userAnswers[0]}
2. 性別: ${userAnswers[1]}
3. 希望勤務地: ${userAnswers[2]}
4. 最終学歴: ${userAnswers[3]}
5. 経験社数: ${userAnswers[4]}
6. 職種: ${userAnswers[5]}
7. 当てはまるもの: ${userAnswers[6]}
8. 転職理由: ${userAnswers[7]}
      `;

      const agents = await getAgentData();
      const replyText = await getGptRecommendation(formatted, agents);

      await client.replyMessage(event.replyToken, { type: 'text', text: replyText });
      resetUser(userId);
    }
  }

  res.send('ok');
});

app.listen(3000);
