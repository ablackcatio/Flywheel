# Next.js 项目集成说明

本项目已成功集成了三个页面：
1. `/` - 登录界面（landing.html）
2. `/home` - 桌面界面（home.html，已添加登录按钮）
3. `/box` - 3D应用主体（box.html，包含聊天功能）

## 已完成的工作

✅ 创建了Next.js路由结构
✅ 将landing.html转换为React组件（`app/page.tsx`）
✅ 将home.html转换为React组件（`app/home/page.tsx`）
✅ 添加了登录按钮到home页面
✅ 创建了box页面框架（`app/box/page.tsx`）
✅ 集成了聊天功能（智谱AI API）

## 待完成的工作

### 1. 集成app.js的3D场景

`app/box/Box3DScene.tsx` 需要集成原有的 `app.js` 的3D场景逻辑。

**方案A：将app.js复制到public目录（推荐用于快速集成）**

```bash
# 将app.js复制到public目录
cp app.js public/app.js
```

然后在 `app/box/Box3DScene.tsx` 中通过script标签加载：

```tsx
useEffect(() => {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/app.js';
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
}, []);
```

**方案B：重构app.js为React组件（推荐用于长期维护）**

将 `app.js` 的逻辑重构为React hooks，这样可以更好地与React生命周期集成。

### 2. 路由守卫

在 `app/box/page.tsx` 中已添加了基本的登录检查，但可以进一步完善：

```tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('flywheel_user');
    if (!userInfo) {
      router.push('/');
    }
  }
}, [router]);
```

### 3. 用户状态管理

可以创建Context来管理用户状态：

```tsx
// app/context/UserContext.tsx
export const UserContext = createContext();
```

## 启动项目

```bash
cd 人生飞轮
npm install
npm run dev
```

访问：
- http://localhost:3000 - 登录页面
- http://localhost:3000/home - 桌面页面
- http://localhost:3000/box - 3D应用页面

## 环境变量配置

确保创建 `.env.local` 文件并配置智谱AI API Key：

```env
ZHIPU_API_KEY=your-api-key-here
```

## 文件结构

```
人生飞轮/
├── app/
│   ├── page.tsx          # 登录页面 (landing.html)
│   ├── home/
│   │   ├── page.tsx      # 桌面页面 (home.html)
│   │   └── Home.module.css
│   ├── box/
│   │   ├── page.tsx      # 3D应用页面 (box.html)
│   │   └── Box3DScene.tsx # 3D场景组件（待完善）
│   └── api/
│       └── chat/         # 智谱AI API路由
├── public/
│   └── app.js            # 3D场景逻辑（需要从根目录复制）
└── ...
```

## 注意事项

1. **app.js集成**：由于app.js使用了ES模块导入，需要确保Three.js正确安装和配置
2. **聊天功能**：box页面的聊天功能已集成智谱AI，确保API Key配置正确
3. **静态资源**：box.html中的图片路径需要根据实际部署情况调整
4. **用户数据**：目前使用localStorage存储用户信息，生产环境建议使用更安全的方式

