# Node.js 安装指南

## 问题说明
当前系统中没有安装 Node.js，导致无法运行项目。

## 解决方案

### 方案 1：使用官方安装包（推荐，最简单）

1. **下载 Node.js**
   - 访问：https://nodejs.org/zh-cn/
   - 下载 LTS（长期支持）版本（推荐 v18 或 v20）
   - 选择 macOS 安装包（.pkg 文件）

2. **安装**
   - 双击下载的 .pkg 文件
   - 按照安装向导完成安装

3. **验证安装**
   打开终端，运行：
   ```bash
   node --version
   npm --version
   ```

4. **运行项目**
   ```bash
   cd "/Users/jiyang/Desktop/ai/备份/接ai之后/人生飞轮"
   npm run dev
   ```

---

### 方案 2：使用 Homebrew（需要先安装 Homebrew）

如果还没有安装 Homebrew，先安装：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

然后安装 Node.js：

```bash
brew install node
```

---

### 方案 3：使用 nvm（Node Version Manager）

适合需要管理多个 Node.js 版本的开发者。

1. **安装 nvm**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **重新加载终端配置**
   ```bash
   source ~/.zshrc
   ```

3. **安装 Node.js**
   ```bash
   nvm install --lts
   nvm use --lts
   ```

4. **配置自动使用 LTS 版本**
   在 `~/.zshrc` 文件末尾添加：
   ```bash
   nvm use --lts > /dev/null
   ```

---

## 安装后运行项目

安装完 Node.js 后，运行：

```bash
cd "/Users/jiyang/Desktop/ai/备份/接ai之后/人生飞轮"
npm install  # 如果 node_modules 有问题，先重新安装依赖
npm run dev
```

然后在浏览器中访问：http://localhost:3000

