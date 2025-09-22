const functions = require('firebase-functions');
const { Client, middleware } = require('@line/bot-sdk');

// LINE Bot設定
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

exports.lineWebhookTest = functions.https.onRequest(async (req, res) => {
  console.log('🚀 TEST WEBHOOK ACTIVATED:', new Date().toISOString());

  if (req.method === 'POST') {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text;

        if (text === '日付指定シフト追加') {
          console.log('📅 Datetime picker test triggered');

          await client.replyMessage(event.replyToken, {
            type: 'template',
            altText: '日付を選択してください',
            template: {
              type: 'buttons',
              title: '📅 日付選択テスト',
              text: 'LINEの日時選択機能をテストします',
              actions: [
                {
                  type: 'datetimepicker',
                  label: '📅 日付を選択',
                  mode: 'date',
                  data: 'date_test'
                }
              ]
            }
          });
        }
      }
    }
  }

  res.status(200).send('OK');
});