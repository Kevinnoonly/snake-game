# 🐍 贪吃蛇 - 联网版

多人联网贪吃蛇游戏，支持全球排行榜！

## 启动方式

### 方式1：快速启动（推荐）

```bash
cd snake-game
npm install
npm start
```

然后浏览器打开 `http://localhost:3000`

### 方式2：局域网/公网访问

**本机局域网访问：**
```bash
npm start
# 同局域网设备访问 http://你的IP:3000
```

**公网部署（推荐 Vercel）：**
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel
```

**或使用 ngrok 临时公网：**
```bash
# 安装 ngrok 后
ngrok http 3000
# 会生成 https://xxx.ngrok.io 链接，分享给朋友即可
```

## 功能特点

- 🌐 **联网排行榜** - 所有玩家分数实时同步
- 🏆 **全球排名** - 查看自己在所有玩家中的排名
- 🎮 **动态难度** - 每100分速度提升
- 📱 **多端支持** - 手机、电脑、平板都能玩
- 🔄 **实时刷新** - 排行榜每30秒自动更新

## 文件说明

- `index.html` - 游戏前端
- `server.js` - Node.js 服务器
- `package.json` - 依赖配置
- `scores.json` - 分数数据（自动生成）

## API 接口

- `GET /api/leaderboard` - 获取排行榜
- `POST /api/score` - 提交分数

## 默认端口

- 3000（可通过环境变量 `PORT` 修改）
