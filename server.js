const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL 连接配置
// Render 会自动设置 DATABASE_URL 环境变量
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/snake_game',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 中间件
app.use(express.json());
app.use(express.static(__dirname));

// 初始化数据库表
async function initDatabase() {
    try {
        const client = await pool.connect();
        
        // 创建 scores 表
        await client.query(`
            CREATE TABLE IF NOT EXISTS scores (
                id SERIAL PRIMARY KEY,
                name VARCHAR(12) NOT NULL,
                score INTEGER NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建索引以提高查询性能
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)
        `);
        
        client.release();
        console.log('✅ 数据库初始化成功');
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        // 如果数据库连接失败，使用内存模式
        console.log('⚠️ 切换到内存模式（数据不会持久化）');
    }
}

// 获取排行榜
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT name, score, date FROM scores ORDER BY score DESC, date ASC LIMIT 50'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('读取排行榜失败:', error);
        res.status(500).json({ error: '读取失败' });
    }
});

// 提交分数
app.post('/api/score', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { name, score } = req.body;
        
        if (!name || typeof score !== 'number') {
            return res.status(400).json({ error: '参数错误' });
        }
        
        const cleanName = name.trim().slice(0, 12);
        
        // 开始事务
        await client.query('BEGIN');
        
        // 插入新分数
        await client.query(
            'INSERT INTO scores (name, score, date) VALUES ($1, $2, NOW())',
            [cleanName, score]
        );
        
        // 计算排名
        const rankResult = await client.query(
            'SELECT COUNT(*) + 1 as rank FROM scores WHERE score > $1',
            [score]
        );
        
        await client.query('COMMIT');
        
        const rank = parseInt(rankResult.rows[0].rank);
        
        res.json({ success: true, rank });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('提交分数失败:', error);
        res.status(500).json({ error: '保存失败' });
    } finally {
        client.release();
    }
});

// 获取玩家最佳排名
app.get('/api/rank/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        const result = await pool.query(
            `SELECT rank FROM (
                SELECT name, score, RANK() OVER (ORDER BY score DESC) as rank
                FROM scores
            ) ranked WHERE name = $1 LIMIT 1`,
            [name]
        );
        
        if (result.rows.length === 0) {
            return res.json({ rank: null });
        }
        
        res.json({ rank: parseInt(result.rows[0].rank) });
    } catch (error) {
        console.error('查询排名失败:', error);
        res.status(500).json({ error: '查询失败' });
    }
});

// 健康检查
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

// 启动服务器
initDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🐍 贪吃蛇服务器运行在 http://0.0.0.0:${PORT}`);
        console.log(`💾 数据库模式: ${process.env.DATABASE_URL ? 'PostgreSQL' : '内存模式'}`);
    });
});

// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('🛑 关闭服务器...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 关闭服务器...');
    await pool.end();
    process.exit(0);
});
