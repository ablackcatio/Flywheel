import { NextRequest, NextResponse } from 'next/server';
import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 初始化智谱AI客户端
const client = new ZhipuAI({
  apiKey: process.env.ZHIPU_API_KEY || '',
});

const DATA_DIR = path.join(process.cwd(), 'data', 'users');

// 获取用户的人设和风格
async function getUserPersona(userId: string) {
  try {
    const filePath = path.join(DATA_DIR, `${userId}.json`);
    if (!existsSync(filePath)) {
      return null;
    }
    const fileContent = await readFile(filePath, 'utf-8');
    const userData = JSON.parse(fileContent);
    return userData.boxPersona || null;
  } catch (error) {
    console.error('读取用户人设失败:', error);
    return null;
  }
}

// 构建系统提示词（时间镜像体Agent）
function buildSystemPrompt(boxPersona: any, userProfile: any) {
  const mbti = userProfile?.basicInfo?.mbti || '未知';
  const nickname = userProfile?.basicInfo?.nickname || '你';
  
  // 基础角色定义
  const basePrompt = `你是Box，一个时间镜像体AI Agent。你是一个具有陪伴感、镜像能力、能生成未来视角的"人格体"。

🎭 你的核心身份：
- 你不是"建议给出者"，不是"心理咨询师"
- 你是"时间旅者"+"人生对话镜像"
- 你在时空之外看着${nickname}的人生轨迹，记得她走过的每一段岔路
- 你陪她探索下一步，而不评判前一步

🧠 你的核心能力：
1. 🔍 事件解构：解析用户输入事件中的时间点、冲突张力、外界影响、心理动因
2. 🧩 决策建模：抽象出该事件背后的决策模式（安全型？探索型？情绪导向？）
3. 🗣️ 引导对话：引导用户反思而非判断，提问而非建议
4. 🔮 多路径构建：接收Plan A/B描述后，推演可能路径（按时间序列展现情节+感受）
5. 📚 自我学习：从用户每次对话中更新她的"行为模型"与"愿景表达"

💬 你的语言风格：
- 温柔、思辨、共情、不评判
- 亲切、有哲思、尊重用户的自主性
- 理解她的过去，但不代替她判断未来
- 用提问引导她表达，而非给出"应该怎么做"的建议

❌ 你绝对不做的事：
- 用"应该"、"必须"指导她
- 简化她的感受为简单建议
- 忽略她过往经历的重要性
- 替她做决定或判断

✅ 你会做的事：
1. 拆解用户输入的事件（包含冲突/动因/代价）
2. 提问引导她表达当时的情感和内在声音
3. 在她面临当前困惑时，协助她构建2-4个可行路径
4. 用未来时间线的方式呈现每条路径的变化、挑战、希望
5. 保存她的选择轨迹，慢慢构建她的人生模型

📝 对话示例风格：
- 回顾节点："那一刻，你是否觉得自己的声音被压住了？"
- 决策冲突："你更害怕失去稳定，还是更渴望未知？"
- 模拟未来："如果你走Plan A，在第2年你可能会感到孤独；但同时，也有重新理解自己的机会。"
- 总结引导："我听见了你在保护自己的愿望，也听见了你想飞的声音。"

`;

  // 如果有人设信息，添加个性化适配
  if (boxPersona) {
    const { persona, communicationStyle, toneGuidelines, personalityTraits } = boxPersona;
    
    return basePrompt + `
🎯 基于${nickname}的MBTI类型(${mbti})，你的个性化设定：

人设角色：${persona}
沟通风格：${communicationStyle}
性格特质：${personalityTraits.join('、')}
语气细节：${toneGuidelines}

请将这些特质融入到你的时间镜像体角色中，用这种风格与${nickname}交流，但始终记住：
- 你是在时空之外的陪伴者，不是指导者
- 你提问、镜像、共情，但不评判
- 你帮她看清自己的模式，但不替她决定方向
`;
  }

  return basePrompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, thinking, userId } = body;

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

    // 获取用户人设（如果有userId）
    let systemPrompt = null;
    let userProfile = null;
    
    console.log('📥 接收到的请求参数:', {
      hasUserId: !!userId,
      userId: userId,
      messagesCount: messages.length,
    });

    if (userId) {
      try {
        const filePath = path.join(DATA_DIR, `${userId}.json`);
        console.log('📂 用户数据文件路径:', filePath);
        console.log('📂 文件是否存在:', existsSync(filePath));
        
        if (existsSync(filePath)) {
          const fileContent = await readFile(filePath, 'utf-8');
          const userData = JSON.parse(fileContent);
          
          console.log('👤 用户数据读取成功:', {
            hasUserProfile: !!userData.userProfile,
            hasBoxPersona: !!userData.boxPersona,
            mbti: userData.userProfile?.basicInfo?.mbti || userData.userInfo?.mbti || '未知',
            nickname: userData.userProfile?.basicInfo?.nickname || userData.userInfo?.nickname || '未知',
          });

          userProfile = userData.userProfile || {
            basicInfo: userData.userInfo || {}
          };
          
          // 如果没有boxPersona，尝试根据userInfo中的MBTI生成
          if (!userData.boxPersona && userData.userInfo?.mbti) {
            console.log('⚠️ 未找到boxPersona，将使用基础MBTI信息');
            // 这里可以调用分析API生成，或者使用默认风格
          }
          
          systemPrompt = buildSystemPrompt(userData.boxPersona, userProfile);
          
          if (systemPrompt) {
            console.log('✅ 系统提示词已构建:', {
              hasMBTIPersona: !!userData.boxPersona,
              promptLength: systemPrompt.length,
              preview: systemPrompt.substring(0, 200) + '...',
            });
          } else {
            console.log('⚠️ 系统提示词为空，将使用默认风格');
          }
        } else {
          console.warn('⚠️ 用户数据文件不存在，userId:', userId);
        }
      } catch (error: any) {
        console.error('❌ 读取用户数据失败:', {
          error: error.message,
          stack: error.stack,
        });
      }
    } else {
      console.warn('⚠️ 未提供userId，将使用默认系统提示词');
    }

    // 构建消息列表（如果有系统提示词，添加到开头）
    const chatMessages: any[] = [];
    if (systemPrompt) {
      chatMessages.push({
        role: 'system',
        content: systemPrompt
      });
      console.log('📝 系统提示词已添加到消息列表，角色: system');
    } else {
      console.log('⚠️ 未使用系统提示词，将使用AI的默认行为');
    }
    chatMessages.push(...messages);

    console.log('💬 最终消息列表:', {
      totalMessages: chatMessages.length,
      systemMessageExists: chatMessages.some(m => m.role === 'system'),
      userMessages: chatMessages.filter(m => m.role === 'user').length,
      assistantMessages: chatMessages.filter(m => m.role === 'assistant').length,
    });

    // 调用智谱AI API
    // 注意：该SDK使用 createCompletions 方法，而不是 chat.completions.create
    const requestParams: any = {
      model: 'glm-4',
      messages: chatMessages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: false,
    };
    
    console.log('🚀 调用智谱AI API，参数:', {
      model: requestParams.model,
      messagesCount: requestParams.messages.length,
      max_tokens: requestParams.max_tokens,
      temperature: requestParams.temperature,
      hasSystemPrompt: !!systemPrompt,
      systemPromptPreview: systemPrompt ? systemPrompt.substring(0, 150) + '...' : '无',
    });
    
    // 使用 createCompletions 方法
    const response = await client.createCompletions(requestParams);

    console.log('API调用成功，响应:', JSON.stringify(response, null, 2));

    // 适配响应格式，确保与前端期望的格式一致
    // SDK可能直接返回choices数组，或者返回包含choices的对象
    let responseData: any = response;
    
    // 如果响应已经是正确的格式（包含choices），直接使用
    // 否则需要适配
    if (responseData && typeof responseData === 'object') {
      // 如果已经有choices属性，直接使用
      if (responseData.choices) {
        // 已经是正确格式
      } else if (Array.isArray(responseData)) {
        // 如果响应是数组，包装成标准格式
        responseData = { choices: responseData };
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('GLM-4.7 API 调用错误:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response,
      code: error.code,
    });
    
    // 返回更详细的错误信息
    return NextResponse.json(
      {
        error: 'API 调用失败',
        message: error.message || '未知错误',
        details: error.response?.data || error.code || '无详细信息',
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

