import { NextRequest, NextResponse } from 'next/server';
import { ZhipuAiClient } from 'zai-sdk';

// 初始化 GLM-4.7 客户端
const client = new ZhipuAiClient({
  apiKey: process.env.ZHIPU_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, thinking } = body;

    // 验证 API Key
    if (!process.env.ZHIPU_API_KEY) {
      return NextResponse.json(
        { error: 'ZHIPU_API_KEY 未配置，请在 .env.local 文件中设置' },
        { status: 500 }
      );
    }

    // 验证消息格式
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '消息格式错误，messages 必须是非空数组' },
        { status: 400 }
      );
    }

    // 调用 GLM-4.7 API
    const response = await client.chat.completions.create({
      model: 'glm-4.7',
      messages: messages,
      thinking: thinking || { type: 'enabled' },
      max_tokens: 65536,
      temperature: 1.0,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('GLM-4.7 API 调用错误:', error);
    return NextResponse.json(
      {
        error: 'API 调用失败',
        message: error.message || '未知错误',
      },
      { status: 500 }
    );
  }
}

// 流式响应
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '请使用 POST 方法调用此 API',
    endpoint: '/api/chat',
    method: 'POST',
  });
}

