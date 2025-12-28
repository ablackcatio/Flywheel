#!/bin/bash

# 加载 Node.js 环境
# 方法1: 尝试加载 nvm
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use default 2>/dev/null || nvm use node 2>/dev/null || nvm use --lts 2>/dev/null
fi

# 方法2: 尝试 Homebrew 路径
if [ -d "/opt/homebrew/bin" ]; then
    export PATH="/opt/homebrew/bin:$PATH"
fi

# 检查 npm 是否可用
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 找不到 npm 命令"
    echo "请确保已安装 Node.js，并配置好环境变量"
    exit 1
fi

echo "✅ Node.js 环境已加载"
echo "Node 版本: $(node --version)"
echo "NPM 版本: $(npm --version)"
echo ""
echo "正在启动开发服务器..."
echo ""

# 切换到项目目录
cd "$(dirname "$0")"

# 启动开发服务器
npm run dev

