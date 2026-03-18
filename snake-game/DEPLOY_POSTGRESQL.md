# 🚀 贪吃蛇游戏 + PostgreSQL 部署指南

## 概述

这个版本使用 **PostgreSQL 数据库** 持久化存储排行榜数据，即使服务器重启也不会丢失！

---

## 📁 更新内容

### 1. 服务器代码 (server.js)
- ✅ 使用 PostgreSQL 替代 JSON 文件
- ✅ 支持事务处理（防止并发冲突）
- ✅ 自动创建数据表和索引
- ✅ 优雅关闭时正确释放连接

### 2. 数据库配置 (render.yaml)
- ✅ 声明式 PostgreSQL 服务
- ✅ 自动注入 DATABASE_URL 环境变量
- ✅ 免费版 256MB 存储

### 3. 依赖更新 (package.json)
- ✅ 添加 `pg` (PostgreSQL 客户端)

---

## 🚀 部署步骤

### 方式1：使用 render.yaml（推荐）

Render 会自动读取 `render.yaml` 文件并创建所需资源。

1. **提交代码到 GitHub**
```bash
git add -A
git commit -m "添加 PostgreSQL 数据库支持"
git push origin main
```

2. **在 Render Dashboard 部署**
   - 访问 https://dashboard.render.com
   - 点击 **"New Web Service"**
   - 选择你的 snake-game 仓库
   - Render 会自动读取 `render.yaml` 并创建：
     - Web Service（Node.js）
     - PostgreSQL 数据库

3. **等待部署完成**
   - 约 3-5 分钟
   - 数据库会自动初始化
   - 获得公网链接

---

### 方式2：手动创建

如果你不想使用 `render.yaml`，可以手动创建：

#### 步骤1：创建 PostgreSQL 数据库
1. 在 Render Dashboard 点击 **"New PostgreSQL"**
2. 配置：
   - **Name**: `snake-game-db`
   - **Database**: `snake_game`
   - **User**: `snake_user`
   - **Plan**: `Free`
3. 点击 **"Create Database"**
4. 等待创建完成（约 2 分钟）

#### 步骤2：创建 Web Service
1. 点击 **"New Web Service"**
2. 选择 snake-game 仓库
3. 配置：
   - **Name**: `snake-game-server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. 添加环境变量：
   - **Key**: `DATABASE_URL`
   - **Value**: 从 PostgreSQL 数据库页面复制 `Internal Connection String`
5. 点击 **"Create Web Service"**

---

## 💾 数据库特性

### 数据持久化
- ✅ 服务器重启数据不丢失
- ✅ 自动备份（每天一次）
- ✅ 支持最多 10 个并发连接

### 免费版限制
| 项目 | 限制 |
|------|------|
| 存储空间 | 256 MB |
| 并发连接 | 10 个 |
| 备份保留 | 7 天 |
| 自动休眠 | 30 天无活动后删除 |

### 数据表结构
```sql
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(12) NOT NULL,
    score INTEGER NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_score ON scores(score DESC);
```

---

## 🔍 验证部署

### 1. 检查数据库连接
访问 `https://你的链接/api/health`
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. 测试排行榜
1. 打开游戏页面
2. 玩一局游戏并提交分数
3. 刷新页面，确认分数还在
4. 等待 5 分钟（服务器休眠后）
5. 再次访问，确认数据未丢失

---

## 🛠️ 本地开发

如果你想在本地测试：

### 1. 安装 PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# 创建数据库
createdb snake_game
```

### 2. 设置环境变量
```bash
export DATABASE_URL="postgresql://localhost:5432/snake_game"
```

### 3. 运行服务器
```bash
npm install
npm start
```

---

## 📊 数据库管理

### 查看数据
在 Render Dashboard：
1. 进入你的 PostgreSQL 数据库
2. 点击 **"Shell"** 标签
3. 运行 SQL 查询：
```sql
-- 查看排行榜
SELECT * FROM scores ORDER BY score DESC LIMIT 10;

-- 查看玩家数量
SELECT COUNT(DISTINCT name) FROM scores;

-- 查看最高分
SELECT MAX(score) FROM scores;
```

### 备份数据
```bash
# 导出数据
pg_dump $DATABASE_URL > backup.sql

# 导入数据
psql $DATABASE_URL < backup.sql
```

---

## 💰 费用说明

| 服务 | 免费版 | 付费版 |
|------|--------|--------|
| Web Service | $0/月 | $7/月起 |
| PostgreSQL | $0/月 | $15/月起 |

**免费版足够使用！**
- 256MB 可存储约 10 万条记录
- 对于贪吃蛇游戏绰绰有余

---

## 🆘 常见问题

### Q: 数据库连接失败？
- 检查 `DATABASE_URL` 环境变量是否正确设置
- 确认 PostgreSQL 服务状态为 "Available"

### Q: 如何清空排行榜？
```sql
-- 在 Render Shell 中运行
TRUNCATE TABLE scores;
```

### Q: 数据满了怎么办？
```sql
-- 只保留前 1000 名
DELETE FROM scores WHERE id NOT IN (
    SELECT id FROM scores ORDER BY score DESC LIMIT 1000
);
```

---

## 🎮 游戏链接示例

部署成功后：
```
🐍 贪吃蛇 - 数据持久化版！
https://snake-game-xxxxx.onrender.com

✅ 排行榜数据永久保存
✅ 服务器重启不丢失
✅ 支持全球玩家对战
```

---

开始部署吧！🚀
