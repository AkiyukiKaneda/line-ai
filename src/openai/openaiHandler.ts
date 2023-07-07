import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
  throw new Error('OpenAI APIキーが設定されていません。');
}

const chatCompletionSettings = {
  model: 'gpt-3.5-turbo-0613',
  max_tokens: 150,
  temperature: 0.7,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ['\n'],
  n: 1,
};

let openai: OpenAIApi | null = null;
// eslint-disable-next-line
let conversationHistory: ChatCompletionRequestMessage[] = [];

async function initializeOpenAIInstance(): Promise<OpenAIApi> {
  if (!openai) {
    const configuration = new Configuration({
      apiKey: OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
  }
  return openai;
}

async function readCharacterSettingsFromFile(
  filePath: string,
): Promise<string> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    throw new Error(`Failed to read file from ${filePath}: ${error}`);
  }
}

function createChatMessage(
  role: 'system' | 'user' | 'assistant',
  content: string,
): ChatCompletionRequestMessage {
  return { role, content };
}

async function initializeChatHistory(systemSettings: string): Promise<void> {
  if (conversationHistory.length === 0 && systemSettings !== '') {
    conversationHistory.push(createChatMessage('system', systemSettings));
  }
}

async function sendChatMessage(
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  conversationHistory.push(createChatMessage(role, content));
}

async function sendChatRequest(
  userMessage: string,
  systemSettings: string,
): Promise<string> {
  try {
    const openaiInstance = await initializeOpenAIInstance();

    await initializeChatHistory(systemSettings);
    await sendChatMessage('user', userMessage);

    const response = await openaiInstance.createChatCompletion({
      ...chatCompletionSettings,
      messages: conversationHistory,
    });

    const assistantMessage = response.data.choices[0].message.content;
    await sendChatMessage('assistant', assistantMessage);

    return assistantMessage;
  } catch (error) {
    throw new Error(`Failed to send OpenAI API request: ${error}`);
  }
}

export async function handleLineMessage(userMessage: string): Promise<string> {
  const startTime = Date.now();

  const filePath = path.join(
    process.cwd(),
    'public/characterSettings/tsun-mina.txt',
  );
  const characterSettings = await readCharacterSettingsFromFile(filePath);

  const systemSettings = `システム: ${characterSettings}\nではシミュレーションを開始します。`;

  const assistantReply = await sendChatRequest(userMessage, systemSettings);

  const responseTime = Date.now() - startTime;
  console.log(`userMessage: ${userMessage}`);
  console.log(`assistantReply: ${assistantReply}`);
  console.log(`レスポンス時間: ${responseTime} ミリ秒`);

  return assistantReply;
}
