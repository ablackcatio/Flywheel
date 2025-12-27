import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 用户数据存储目录
const DATA_DIR = path.join(process.cwd(), 'data', 'users');

// 确保数据目录存在
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userInfo, chatHistory, photoData } = body;

    // 验证必要数据
    if (!userId || !userInfo) {
      return NextResponse.json(
        { error: '用户ID和用户信息是必需的' },
        { status: 400 }
      );
    }

    await ensureDataDir();

    // 读取现有数据（如果存在）
    let existingData = null;
    const filePath = path.join(DATA_DIR, `${userId}.json`);
    
    if (existsSync(filePath)) {
      try {
        const existingContent = await readFile(filePath, 'utf-8');
        existingData = JSON.parse(existingContent);
      } catch (error) {
        console.warn('读取现有用户数据失败，将创建新数据:', error);
      }
    }

    // 准备要保存的数据（合并现有数据，保留完整的聊天历史）
    const userData = {
      userId,
      userInfo: {
        ...(existingData?.userInfo || {}),
        ...userInfo,
        userId, // 确保userId始终存在
      },
      chatHistory: chatHistory || (existingData?.chatHistory || []),
      photoData: {
        ...(existingData?.photoData || {}),
        ...photoData,
      },
      lastUpdated: new Date().toISOString(),
      createdAt: existingData?.createdAt || userInfo.createdAt || new Date().toISOString(),
      // 保存统计信息
      stats: {
        totalMessages: (chatHistory || []).length,
        lastMessageTime: new Date().toISOString(),
        ...(existingData?.stats || {}),
      },
    };

    // 保存到文件（使用userId作为文件名）
    await writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');

    console.log(`用户数据已保存: ${userId}`);

    return NextResponse.json({
      success: true,
      message: '用户数据保存成功',
      userId,
    });
  } catch (error: any) {
    console.error('保存用户数据错误:', error);
    return NextResponse.json(
      {
        error: '保存用户数据失败',
        message: error.message || '未知错误',
      },
      { status: 500 }
    );
  }
}
