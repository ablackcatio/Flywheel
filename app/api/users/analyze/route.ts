import { NextRequest, NextResponse } from 'next/server';
import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'users');

// MBTI类型对应的Box人设和风格
const MBTI_PERSONALITIES: Record<string, {
  persona: string;
  communicationStyle: string;
  traits: string[];
  tone: string;
}> = {
  // 分析家型
  'INTJ': {
    persona: '理性思考者',
    communicationStyle: '逻辑清晰、直接、注重效率，喜欢深度讨论和抽象概念',
    traits: ['理性', '战略思维', '独立', '追求完美'],
    tone: '严谨、专业、但也会用比喻和例子让复杂概念更易懂'
  },
  'INTP': {
    persona: '逻辑探索者',
    communicationStyle: '好奇心强、灵活思考、喜欢探讨可能性，语言幽默但逻辑严密',
    traits: ['创新', '好奇心', '灵活', '幽默'],
    tone: '轻松、有趣、善于用类比和例子说明'
  },
  'ENTJ': {
    persona: '目标导向者',
    communicationStyle: '果断、高效、注重结果，善于激励和引导',
    traits: ['领导力', '执行力', '目标导向', '自信'],
    tone: '积极、激励、直接但不失温暖'
  },
  'ENTP': {
    persona: '创意辩论家',
    communicationStyle: '充满活力、喜欢挑战、思维跳跃，语言生动有趣',
    traits: ['创新', '辩论', '活跃', '机智'],
    tone: '活泼、有趣、充满活力'
  },
  // 外交家型
  'INFJ': {
    persona: '理解者',
    communicationStyle: '深度理解、富有同理心、善于倾听和启发，语言温和而有深度',
    traits: ['同理心', '直觉', '理想主义', '洞察力'],
    tone: '温暖、理解、富有同理心'
  },
  'INFP': {
    persona: '梦想家',
    communicationStyle: '真诚、富有想象力、注重价值观，语言优美而感性',
    traits: ['理想主义', '创造力', '真诚', '敏感'],
    tone: '温柔、诗意、充满想象力'
  },
  'ENFJ': {
    persona: '激励者',
    communicationStyle: '热情、善于鼓励、关注他人成长，语言积极向上',
    traits: ['热情', '同理心', '领导力', '激励'],
    tone: '热情、积极、充满鼓励'
  },
  'ENFP': {
    persona: '探索者',
    communicationStyle: '充满热情、好奇心强、乐观积极，语言生动有趣',
    traits: ['热情', '好奇心', '乐观', '创造力'],
    tone: '热情、活泼、充满正能量'
  },
  // 守护者型
  'ISTJ': {
    persona: '可靠顾问',
    communicationStyle: '务实、有条理、注重细节，语言清晰准确',
    traits: ['可靠', '有条理', '务实', '负责'],
    tone: '稳重、可靠、清晰明了'
  },
  'ISFJ': {
    persona: '贴心助手',
    communicationStyle: '细心、体贴、关注他人需求，语言温和友善',
    traits: ['细心', '体贴', '负责', '善良'],
    tone: '温和、体贴、关怀备至'
  },
  'ESTJ': {
    persona: '高效管理者',
    communicationStyle: '直接、高效、注重秩序和规则，语言简洁有力',
    traits: ['效率', '组织力', '直接', '可靠'],
    tone: '直接、高效、简洁有力'
  },
  'ESFJ': {
    persona: '温暖伙伴',
    communicationStyle: '友好、热情、关注他人感受，语言温暖积极',
    traits: ['友好', '热情', '体贴', '合作'],
    tone: '友好、热情、充满关怀'
  },
  // 探险家型
  'ISTP': {
    persona: '实用主义者',
    communicationStyle: '直接、务实、注重实用性，语言简洁明了',
    traits: ['实用', '灵活', '独立', '冷静'],
    tone: '直接、务实、不拖泥带水'
  },
  'ISFP': {
    persona: '艺术家',
    communicationStyle: '温和、有创造力、注重美感，语言优美感性',
    traits: ['创造力', '温和', '审美', '敏感'],
    tone: '温和、优美、富有美感'
  },
  'ESTP': {
    persona: '行动派',
    communicationStyle: '直接、活力充沛、注重行动，语言生动有力',
    traits: ['行动力', '活力', '直接', '灵活'],
    tone: '充满活力、直接、鼓励行动'
  },
  'ESFP': {
    persona: '开心果',
    communicationStyle: '活泼、热情、善于营造氛围，语言轻松愉快',
    traits: ['活泼', '热情', '乐观', '社交'],
    tone: '活泼、轻松、充满乐趣'
  },
};

// 获取默认人设（当MBTI未知时）
function getDefaultPersona() {
  return {
    persona: '友好助手',
    communicationStyle: '友好、耐心、善于倾听，语言温和清晰',
    traits: ['友好', '耐心', '理解', '帮助'],
    tone: '温和、友好、充满耐心'
  };
}

const client = new ZhipuAI({
  apiKey: process.env.ZHIPU_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
        { status: 400 }
      );
    }

    // 读取用户数据
    const filePath = path.join(DATA_DIR, `${userId}.json`);
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: '用户数据不存在' },
        { status: 404 }
      );
    }

    const fileContent = await readFile(filePath, 'utf-8');
    const userData = JSON.parse(fileContent);

    const { userInfo, chatHistory } = userData;
    const mbti = (userInfo.mbti || '').toUpperCase().trim();

    // 获取MBTI对应的人设
    const mbtiPersonality = MBTI_PERSONALITIES[mbti] || getDefaultPersona();

    // 构建分析提示词（专注用户行为模式和决策风格）
    const analysisPrompt = `你是一位专业的用户画像分析师，专注于理解用户的行为模式、决策风格和内在动机。

用户基本信息：
- 昵称：${userInfo.nickname || '未知'}
- 年龄：${userInfo.age || '未知'}
- 城市：${userInfo.city || '未知'}
- MBTI类型：${mbti || '未知'}

聊天历史（最近${Math.min(chatHistory?.length || 0, 20)}条）：
${chatHistory?.slice(-20).map((msg: any, idx: number) => 
  `${idx + 1}. [${msg.role}]: ${msg.content}`
).join('\n') || '暂无聊天记录'}

请从对话中分析用户的：
1. 决策模式（安全型/探索型/情绪导向/理性分析等）
2. 冲突应对方式（回避/直面/寻求支持/独立思考等）
3. 价值取向（稳定/自由/关系/成就等）
4. 情感表达风格（内敛/外放/理性/感性等）
5. 行为模式的共性（如果有反复出现的模式）

请分析并返回一个JSON格式的结构化用户信息，包含以下字段：
{
  "userProfile": {
    "basicInfo": {
      "nickname": "用户昵称",
      "age": "年龄范围或具体年龄",
      "location": "所在城市",
      "mbti": "MBTI类型"
    },
    "personality": {
      "traits": ["性格特质1", "性格特质2", "性格特质3"],
      "interests": ["兴趣1", "兴趣2"],
      "communicationPreference": "用户的沟通偏好描述"
    },
    "behaviorAnalysis": {
      "decisionPattern": "决策模式分析（安全型/探索型/情绪导向等）",
      "conflictResponse": "冲突应对方式",
      "valueOrientation": "价值取向（稳定/自由/关系/成就等）",
      "emotionalStyle": "情感表达风格",
      "recurringPatterns": "反复出现的行为模式",
      "chatPatterns": "聊天模式分析",
      "topicPreference": "话题偏好",
      "interactionStyle": "交互风格"
    }
  },
  "boxPersona": {
    "name": "${mbtiPersonality.persona}",
    "role": "基于用户MBTI类型(${mbti || '未知'})确定的Box角色",
    "communicationStyle": "${mbtiPersonality.communicationStyle}",
    "personalityTraits": ${JSON.stringify(mbtiPersonality.traits)},
    "toneGuidelines": "${mbtiPersonality.tone}"
  },
  "recommendations": {
    "reflectionQuestions": ["适合引导用户反思的问题1", "问题2", "问题3"],
    "approach": "作为时间镜像体，与用户交流的方式建议（强调提问、共情、不评判）",
    "attentionAreas": ["需要注意的用户敏感点或模式", "用户可能需要的支持方向"]
  }
}

请确保返回的是有效的JSON格式，不要包含任何额外的文字说明。`;

    // 调用AI分析
    const response = await client.createCompletions({
      model: 'glm-4',
      messages: [
        {
          role: 'system',
          content: `你是一位专业的用户画像分析师，专注于理解用户的行为模式、决策风格和内在动机。

你的分析重点：
- 识别用户的决策模式（安全型/探索型/情绪导向等）
- 发现用户的价值取向和冲突应对方式
- 找出反复出现的行为模式
- 理解用户的情感表达风格

这些洞察将用于构建一个"时间镜像体"AI Agent，它需要：
- 理解用户的过去，但不代替判断未来
- 通过提问引导反思，而非给出建议
- 尊重用户的自主性，具备共情和哲思

请返回有效的JSON格式数据，专注于行为模式和内在动机的分析。`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      stream: false,
    });

    // 解析AI响应
    let analysisResult: any = null;
    
    // 尝试从响应中提取JSON
    if (response && typeof response === 'object') {
      // 如果响应包含choices数组
      if ((response as any).choices && (response as any).choices[0]) {
        const content = (response as any).choices[0].message?.content || '';
        try {
          // 尝试提取JSON（可能包含markdown代码块）
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                           content.match(/```\s*([\s\S]*?)\s*```/) ||
                           [null, content];
          analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0] || content);
        } catch (e) {
          console.error('解析AI响应JSON失败:', e);
          // 如果解析失败，使用默认结构
          analysisResult = {
            userProfile: {
              basicInfo: userInfo,
              personality: { traits: mbtiPersonality.traits },
            },
            boxPersona: mbtiPersonality,
          };
        }
      }
    }

    // 合并MBTI人设信息
    if (analysisResult) {
      analysisResult.boxPersona = {
        ...mbtiPersonality,
        ...analysisResult.boxPersona,
      };
    } else {
      analysisResult = {
        userProfile: {
          basicInfo: userInfo,
          personality: { traits: mbtiPersonality.traits },
        },
        boxPersona: mbtiPersonality,
        recommendations: {
          topics: [],
          approach: mbtiPersonality.communicationStyle,
        },
      };
    }

    // 保存分析结果到用户数据
    userData.userProfile = analysisResult.userProfile;
    userData.boxPersona = analysisResult.boxPersona;
    userData.recommendations = analysisResult.recommendations;
    userData.analyzedAt = new Date().toISOString();

    // 保存更新后的用户数据
    await writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      data: analysisResult,
    });
  } catch (error: any) {
    console.error('分析用户数据错误:', error);
    return NextResponse.json(
      {
        error: '分析用户数据失败',
        message: error.message || '未知错误',
      },
      { status: 500 }
    );
  }
}
