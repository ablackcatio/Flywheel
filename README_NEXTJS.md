# Next.js + GLM-4.7 多轮对话项目

这是一个基于 Next.js 框架和 GLM-4.7 模型的多轮对话应用。

## 功能特点

- 🚀 **Next.js 14** - 使用最新的 Next.js 框架
- 🤖 **GLM-4.7 集成** - 调用智谱 AI 的 GLM-4.7 模型
- 💬 **多轮对话** - 支持上下文记忆的多轮对话
- 🌊 **流式输出** - 支持实时流式响应，提升交互体验
- 🧠 **思考模式** - 支持显示 AI 的思考过程
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入你的 GLM-4.7 API Key：

```env
ZHIPU_API_KEY=your-api-key-here
```

### 3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
.
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── route.ts          # 非流式 API 路由
│   │       └── stream/
│   │           └── route.ts      # 流式 API 路由
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   └── globals.css               # 全局样式
├── components/
│   └── ChatInterface.tsx         # 聊天界面组件
├── .env.local.example            # 环境变量示例
├── next.config.js                # Next.js 配置
├── package.json                  # 项目依赖
├── tailwind.config.js            # Tailwind CSS 配置
└── tsconfig.json                 # TypeScript 配置
```

## API 使用说明

### 非流式调用

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '你好' },
    ],
    thinking: { type: 'enabled' },
  }),
});
```

### 流式调用

```typescript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '你好' },
    ],
    thinking: { type: 'enabled' },
  }),
});
```

## 功能说明

### 多轮对话

应用会自动保存对话历史，每次发送消息时会将所有历史消息一起发送给 API，实现上下文记忆。

### 思考模式

GLM-4.7 支持思考模式，可以在回复前显示 AI 的思考过程。在聊天界面中，思考过程会以黄色背景显示在回复内容上方。

### 流式输出

开启流式输出后，AI 的回复会实时显示，提供更好的交互体验。

## 技术栈

- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **zai-sdk** - GLM-4.7 SDK
- **React Hooks** - 状态管理

## 注意事项

1. **API Key 安全**：请勿将 `.env.local` 文件提交到 Git 仓库
2. **API 限制**：注意 GLM-4.7 API 的调用频率和费用限制
3. **错误处理**：应用已包含基本的错误处理，但建议根据实际需求完善

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 在环境变量中添加 `ZHIPU_API_KEY`
4. 部署完成

### 其他平台

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 许可证

MIT License

