# Git 推送指南

由于路径编码问题，请手动在终端执行以下命令来推送代码到GitHub。

## 📋 推送步骤

### 1. 打开终端/命令提示符

进入项目目录（使用你系统的文件资源管理器，在项目目录右键选择"在终端中打开"或"Git Bash Here"）

### 2. 初始化Git仓库（如果还没有）

```bash
git init
```

### 3. 添加远程仓库

```bash
git remote add origin https://github.com/ablackcatio/Flywheel.git
```

如果远程仓库已存在，使用：
```bash
git remote set-url origin https://github.com/ablackcatio/Flywheel.git
```

### 4. 添加所有文件

```bash
git add .
```

### 5. 提交更改

```bash
git commit -m "Initial commit: Next.js version with Box Agent time mirror system

- Integrated Next.js framework
- Landing page (login interface)
- Home page (desktop interface)  
- Box page with 3D scene and chat
- ZhipuAI integration with MBTI personality system
- User data storage and analysis
- Time mirror AI Agent with personalized communication style
- Added comprehensive documentation"
```

### 6. 设置主分支

```bash
git branch -M main
```

### 7. 推送到远程仓库

```bash
git push -u origin main
```

## ⚠️ 注意事项

1. **如果仓库已有内容**：
   - 如果远程仓库已经有代码，需要先拉取：`git pull origin main --allow-unrelated-histories`
   - 然后解决可能的冲突后再推送

2. **认证问题**：
   - 如果遇到权限问题，可能需要配置GitHub认证
   - 使用Personal Access Token或SSH密钥
   - GitHub已不再支持密码认证

3. **确保.gitignore正确**：
   - 确保 `.env.local`、`node_modules`、`data/` 等敏感文件已被忽略
   - 查看 `.gitignore` 文件确认

4. **检查要提交的文件**：
   ```bash
   git status
   ```
   确认没有意外包含敏感文件

## 📝 后续更新

之后如果要推送新的更改：

```bash
git add .
git commit -m "你的提交信息"
git push
```

