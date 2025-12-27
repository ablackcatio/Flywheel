# 用户数据流验证指南

本文档说明如何验证用户数据是否正确传输给大模型，以及MBTI语气调整是否生效。

## 📋 验证清单

### 1. 用户ID生成和传递

#### ✅ 前端 → API 传递
- **位置**: `app/box/page.tsx` - `sendMessage` 函数
- **检查点**: 
  - localStorage中是否有 `flywheel_user`
  - `userInfo.userId` 是否存在
  - 请求体是否包含 `userId` 字段

#### ✅ 登录时生成userId
- **位置**: `app/page.tsx` - `handleSubmit` 函数
- **检查点**: 
  - 用户提交表单时自动生成 `userId`
  - 格式: `user_{timestamp}_{randomString}`
  - userId被保存到localStorage

### 2. 用户数据读取

#### ✅ API读取用户数据文件
- **位置**: `app/api/chat/route.ts` - POST处理函数
- **检查点**:
  - 文件路径: `data/users/{userId}.json`
  - 文件是否存在 (`existsSync`)
  - JSON解析是否成功
  - `userData.boxPersona` 是否存在
  - `userData.userProfile` 是否存在

### 3. MBTI人设系统提示词构建

#### ✅ 系统提示词构建
- **位置**: `app/api/chat/route.ts` - `buildSystemPrompt` 函数
- **检查点**:
  - 是否有 `boxPersona` 数据
  - MBTI类型是否正确提取
  - 人设信息是否包含在系统提示词中:
    - `persona` (人设角色)
    - `communicationStyle` (沟通风格)
    - `personalityTraits` (性格特质)
    - `toneGuidelines` (语气细节)

### 4. 系统提示词传递给AI

#### ✅ 消息列表构建
- **位置**: `app/api/chat/route.ts` - POST处理函数
- **检查点**:
  - 系统提示词是否作为第一条消息添加（`role: 'system'`）
  - 消息列表结构是否正确
  - 系统提示词内容是否完整

## 🔍 如何检查日志

### 前端日志（浏览器Console）

1. **用户登录时**:
   ```
   ✅ 用户信息已保存到localStorage: {userId: "...", nickname: "...", mbti: "..."}
   ```

2. **发送消息时**:
   ```
   📤 前端发送请求，userId: user_xxx, userInfo: {nickname: "...", mbti: "..."}
   📤 发送到/api/chat的请求体: {messagesCount: X, hasUserId: true, userId: "user_xxx"}
   ```

### 后端日志（服务器Console/Terminal）

1. **接收请求**:
   ```
   📥 接收到的请求参数: {hasUserId: true, userId: "user_xxx", messagesCount: X}
   ```

2. **读取用户数据**:
   ```
   📂 用户数据文件路径: /path/to/data/users/user_xxx.json
   📂 文件是否存在: true
   👤 用户数据读取成功: {hasUserProfile: true, hasBoxPersona: true, mbti: "INTJ", nickname: "..."}
   ```

3. **构建系统提示词**:
   ```
   ✅ 系统提示词已构建: {hasMBTIPersona: true, promptLength: 1500, preview: "..."}
   ```

4. **消息列表**:
   ```
   💬 最终消息列表: {totalMessages: X, systemMessageExists: true, ...}
   📝 系统提示词已添加到消息列表，角色: system
   ```

5. **API调用**:
   ```
   🚀 调用智谱AI API，参数: {model: "glm-4", messagesCount: X, hasSystemPrompt: true, ...}
   ```

## ⚠️ 常见问题排查

### 问题1: userId为null

**可能原因**:
- 用户尚未登录（localStorage中没有 `flywheel_user`）
- 登录时未生成userId（旧版本代码）

**解决方法**:
- 确保 `app/page.tsx` 中的 `handleSubmit` 生成userId
- 检查localStorage中的数据结构

### 问题2: 用户数据文件不存在

**可能原因**:
- 用户首次聊天，数据尚未保存
- 用户数据保存失败

**解决方法**:
- 首次聊天后会自动保存数据
- 检查 `app/box/page.tsx` 中的 `saveUserData` 函数是否正常执行

### 问题3: boxPersona不存在

**可能原因**:
- 用户数据尚未分析（需要至少3条用户消息）
- 分析API调用失败

**解决方法**:
- 确保用户发送了至少3条消息
- 检查 `/api/users/analyze` 是否正常执行
- 查看分析API的日志

### 问题4: 系统提示词未传递给AI

**可能原因**:
- boxPersona或userProfile为null
- 系统提示词构建失败

**解决方法**:
- 检查日志中的 "⚠️ 系统提示词为空" 警告
- 查看 `buildSystemPrompt` 函数的逻辑
- 确认用户数据文件格式正确

## ✅ 验证步骤

1. **登录并生成userId**:
   - 访问登录页面
   - 填写表单（包含MBTI）
   - 提交并检查localStorage中的userId

2. **发送第一条消息**:
   - 进入box页面
   - 发送任意消息
   - 检查前端日志：userId是否正确传递

3. **检查后端日志**:
   - 查看服务器日志
   - 确认用户数据文件被读取
   - 确认系统提示词被构建

4. **发送3+条消息触发分析**:
   - 继续发送消息（至少3条用户消息）
   - 检查是否触发 `/api/users/analyze`
   - 确认 `boxPersona` 被生成和保存

5. **验证MBTI语气调整**:
   - 发送新消息
   - 检查系统提示词是否包含MBTI人设信息
   - 观察AI回复的语气是否符合MBTI设定

## 📊 数据流图

```
用户登录
  ↓
生成userId → localStorage.setItem('flywheel_user', {userId, mbti, ...})
  ↓
发送聊天消息 → fetch('/api/chat', {userId, messages})
  ↓
API读取用户数据 → readFile(`data/users/${userId}.json`)
  ↓
构建系统提示词 → buildSystemPrompt(boxPersona, userProfile)
  ↓
添加系统消息 → messages = [{role: 'system', content: systemPrompt}, ...userMessages]
  ↓
调用AI API → createCompletions({messages, ...})
  ↓
AI根据系统提示词生成回复（包含MBTI语气调整）
  ↓
返回回复给前端
```

## 🎯 成功标志

所有数据流正常时，你应该看到：

1. ✅ localStorage中有 `flywheel_user`，包含 `userId`
2. ✅ 前端日志显示userId被正确传递
3. ✅ 后端日志显示用户数据文件被成功读取
4. ✅ 后端日志显示系统提示词包含MBTI人设信息
5. ✅ 后端日志显示系统消息被添加到消息列表
6. ✅ AI回复的语气符合用户的MBTI类型设定

