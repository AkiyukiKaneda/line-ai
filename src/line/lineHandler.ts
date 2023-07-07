import { lineClient } from './lineClient';
import { TextMessage } from '@line/bot-sdk';
import { handleLineMessage } from '../openai/openaiHandler';

export async function handleLineEvent(event: any) {
  try {
    if (event.type === 'message' && event.message.type === 'text') {
      const message = event.message.text;

      const gpt3Reply = await handleLineMessage(message);

      const replyMessage: TextMessage = {
        type: 'text',
        text: gpt3Reply,
      };

      await lineClient.replyMessage(event.replyToken, replyMessage);
    }
  } catch (err) {
    console.error('Error while handling Line event and replying:', err);
    throw err;
  }
}
