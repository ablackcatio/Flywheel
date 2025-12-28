#!/bin/bash

# 修复 .zshrc 文件，只在 Homebrew 存在时才加载

ZSHRC_FILE="$HOME/.zshrc"

# 备份原始文件
if [ -f "$ZSHRC_FILE" ]; then
    cp "$ZSHRC_FILE" "${ZSHRC_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ 已备份原始 .zshrc 文件"
fi

# 创建新的 .zshrc 内容
cat > "$ZSHRC_FILE" << 'EOF'
# Homebrew 配置（仅在 Homebrew 存在时加载）
if [ -f /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# nvm 配置（如果已安装 nvm）
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # 自动使用 LTS 版本
    nvm use --lts > /dev/null 2>&1 || true
fi
EOF

echo "✅ .zshrc 文件已修复"
echo ""
echo "请运行以下命令重新加载配置："
echo "  source ~/.zshrc"
echo ""
echo "或者直接打开新的终端窗口"

