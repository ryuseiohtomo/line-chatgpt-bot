const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const axios = require('axios');
const { getNextStep, saveAnswer, getUserAnswers, resetUser } = require('./utils');
const questions = require('./quickReplies');

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
    range: 'agents!A2:H100',
  });

  return res.data.values.map(row => ({
    name: row[0],            // A列：社名
    age: row[1],             // B列：対応年齢
    gender: row[2],          // C列：対応性別
    area: row[3],            // D列：対応エリア
    education: row[4],       // E列：学歴条件
    experience: row[5],      // F列：経験社数条件
    job: row[6],             // G列：対応職種
    features: row[7]         // H列：特徴
  }));
}

// ✅ ChatGPTにTOP3エージェントを生成させる
async function getGptRecommendation(userAnswers, agents) {
  const prompt = `
あなたは転職支援に特化したマッチングAIです。
以下のユーザー情報とエージェント一覧をもとに、条件に合致するエージェントを3社選び、簡単な特徴比較とおすすめ理由を含めて出力してください。

【ユーザー情報】
${userAnswers.join('
')}

【エージェント一覧】
${agents.map(a => \`社名: \${a.name}｜対応年齢: \${a.age}｜対応性別: \${a.gender}｜対応エリア: \${a.area}｜学歴条件: \${a.education}｜経験社数条件: \${a.experience}｜対応職種: \${a.job}｜特徴: \${a.features}\`).join('\n')}

出力フォーマット（例）：
1. ◯◯エージェント：◯◯に強く、◯◯な方におすすめ。
2. △△エージェント：◯◯対応で、◯◯な特徴あり。
3. ××エージェント：◯◯希望の方に最適。

最後に「気になるエージェントがあれば面談予約してみましょう！」という一文を添えてください。
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

  return response.data.choices[0].message.content.trim();
}

app.post('/webhook', async (req, res) => {
  const events = req.body.events;
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId;
      const userMessage = event.message.text;

      const step = getNextStep(userId);
      saveAnswer(userId, step, userMessage);

      if (step === 8) {
        const answers = getUserAnswers(userId);
        const agents = await getAgentData();
        const reply = await getGptRecommendation(answers, agents);
        await client.replyMessage(event.replyToken, { type: 'text', text: reply });
        resetUser(userId);
      } else {
        const nextQuestion = questions[step];
        await client.replyMessage(event.replyToken, nextQuestion);
      }
    }
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on \${PORT}\`));
