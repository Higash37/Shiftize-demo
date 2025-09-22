/**
 * 簡単な日時選択テスト用Webhook
 */

import * as functions from 'firebase-functions';
import { Client } from '@line/bot-sdk';

export const lineWebhook = functions.https.onRequest(async (req: any, res: any) => {
  // LINE Bot設定（関数内で初期化）
  const config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  };

  const client = new Client(config);
  console.log('📅 SIMPLE WEBHOOK ACTIVATED:', new Date().toISOString());

  try {
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
          } else {
            // その他のメッセージには簡単な応答
            await client.replyMessage(event.replyToken, {
              type: 'text',
              text: '「日付指定シフト追加」と入力して日時選択機能をテストしてください。'
            });
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).send('Error handled');
  }
});