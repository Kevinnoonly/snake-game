# 🐍 贪吃蛇 - 分享给朋友玩

## 快速开始

```bash
cd snake-game
./start.sh
```

## 分享给朋友的3种方式

### 方式1：Ngrok（最简单，临时链接）⭐推荐

```bash
# 1. 安装 ngrok
brew install ngrok

# 2. 启动服务器
npm start

# 3. 新开一个终端，运行 ngrok
ngrok http 3000
```

你会看到类似：
```
Forwarding  https://abcd1234.ngrok-free.app -> http://localhost:3000
```

把 `https://abcd1234.ngrok-free.app` 发给朋友即可！

---

### 方式2：LocalTunnel（免费，无需注册）

```bash
# 1. 安装
npm install -g localtunnel

# 2. 启动服务器
npm start

# 3. 新开终端运行
lt --port 3000
```

会生成类似 `https://smooth-dodo-15.loca.lt` 的链接。

---

### 方式3：部署到云端（永久在线）

#### 方案 A：Render（免费）

1. 访问 https://render.com 注册账号
2. 创建 New Web Service
3. 连接 GitHub 仓库或上传代码
4. 设置：
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 部署后会得到永久链接如 `https://snake-game-xx.onrender.com`

#### 方案 B：Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 在 snake-game 目录运行
vercel

# 3. 按提示操作，完成后会生成链接
```

#### 方案 C：Railway

1. 访问 https://railway.app
2. 上传代码或连接 GitHub
3. 自动部署，获得永久链接

---

## 常见问题

### Q: 朋友打不开链接？
- 检查你的电脑是否关机/休眠
- 检查防火墙是否阻挡 3000 端口
- 尝试更换网络（公司网络可能封锁 ngrok）

### Q: 分数保存失败？
- 检查服务器是否还在运行
- 按 F12 打开浏览器控制台查看错误
- 刷新页面重试

### Q: 如何多人同时玩？
- 每个人用不同名字进入
- 排行榜是全局的，所有人都能看到排名

---

## 局域网玩法（无需互联网）

如果和朋友在同一 WiFi：

```bash
# 1. 获取你的局域网 IP
ifconfig | grep "inet " | head -1
# 输出类似：inet 192.168.1.105

# 2. 朋友访问
http://192.168.1.105:3000
```

---

## 推荐方案总结

| 方式 | 难度 | 稳定性 | 适用场景 |
|------|------|--------|----------|
| Ngrok | ⭐ 简单 | ⚠️ 临时 | 快速分享给朋友 |
| LocalTunnel | ⭐ 简单 | ⚠️ 临时 | 不想注册账号 |
| Render | ⭐⭐ 中等 | ✅ 永久 | 长期运行 |
| Vercel | ⭐⭐ 中等 | ✅ 永久 | 开发者推荐 |
