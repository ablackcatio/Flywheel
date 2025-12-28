import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'users');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
        { status: 400 }
      );
    }

    const filePath = path.join(DATA_DIR, `${userId}.json`);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: '用户数据不存在' },
        { status: 404 }
      );
    }

    const fileContent = await readFile(filePath, 'utf-8');
    const userData = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error: any) {
    console.error('读取用户数据错误:', error);
    return NextResponse.json(
      {
        error: '读取用户数据失败',
        message: error.message || '未知错误',
      },
      { status: 500 }
    );
  }
}
