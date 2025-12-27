import { NextRequest } from 'next/server';
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
      return new Response(
        JSON.stringify({ error: 'ZHIPU_API_KEY 未配置' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 验证消息格式
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: '消息格式错误' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 调用 GLM-4.7 流式 API
          const response = await client.chat.completions.create({
            model: 'glm-4.7',
            messages: messages,
            thinking: thinking || { type: 'enabled' },
            stream: true,
            max_tokens: 65536,
            temperature: 1.0,
          } as any);

          // 处理流式数据
          for await (const chunk of response) {
            const data = JSON.stringify(chunk);
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }

          controller.close();
        } catch (error: any) {
          console.error('流式 API 调用错误:', error);
          const errorData = JSON.stringify({
            error: '流式 API 调用失败',
            message: error.message,
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('流式响应错误:', error);
    return new Response(
      JSON.stringify({
        error: '创建流式响应失败',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

