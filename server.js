const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL 连接配置
// Render 会自动设置 DATABASE_URL 环境变量
let pool;
let useMemoryMode = false;

// 内存存储（备用）
let memoryScores = [];

function initPool() {
    if (!process.env.DATABASE_URL) {
        console.log('⚠️ 没有 DATABASE_URL，使用内存模式');
        useMemoryMode = true;
        return null;
    }
    
    try {
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        useMemoryMode = true;
        return null;
    }
}

pool = initPool();

// 中间件
app.use(express.json());
app.use(express.static(__dirname));

// 初始化数据库表
async function initDatabase() {
    if (useMemoryMode || !pool) {
        console.log('💾 使用内存模式（数据不会持久化）');
        return;
    }
    
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
        console.error('❌ 数据库初始化失败:', error.message);
        useMemoryMode = true;
        console.log('⚠️ 切换到内存模式（数据不会持久化）');
    }
}

// 获取排行榜
app.get('/api/leaderboard', async (req, res) => {
    try {
        if (useMemoryMode) {
            // 内存模式
            const sorted = memoryScores.sort((a, b) => b.score - a.score).slice(0, 50);
            res.json(sorted);
        } else {
            // 数据库模式
            const result = await pool.query(
                'SELECT name, score, date FROM scores ORDER BY score DESC, date ASC LIMIT 50'
            );
            res.json(result.rows);
        }
    } catch (error) {
        console.error('读取排行榜失败:', error.message);
        res.status(500).json({ error: '读取失败' });
    }
});

// 提交分数
app.post('/api/score', async (req, res) => {
    try {
        const { name, score } = req.body;
        
        if (!name || typeof score !== 'number') {
            return res.status(400).json({ error: '参数错误' });
        }
        
        const cleanName = name.trim().slice(0, 12);
        
        if (useMemoryMode) {
            // 内存模式
            memoryScores.push({
                name: cleanName,
                score: score,
                date: new Date().toISOString()
            });
            
            const sorted = memoryScores.sort((a, b) => b.score - a.score);
            const rank = sorted.findIndex(e => e.name === cleanName && e.score === score) + 1;
            
            res.json({ success: true, rank });
        } else {
            // 数据库模式
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                await client.query(
                    'INSERT INTO scores (name, score, date) VALUES ($1, $2, NOW())',
                    [cleanName, score]
                );
                
                const rankResult = await client.query(
                    'SELECT COUNT(*) + 1 as rank FROM scores WHERE score > $1',
                    [score]
                );
                
                await client.query('COMMIT');
                
                const rank = parseInt(rankResult.rows[0].rank);
                res.json({ success: true, rank });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }
    } catch (error) {
        console.error('提交分数失败:', error.message);
        res.status(500).json({ error: '保存失败' });
    }
});

// 获取玩家最佳排名
app.get('/api/rank/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        if (useMemoryMode) {
            // 内存模式
            const sorted = memoryScores.sort((a, b) => b.score - a.score);
            const rank = sorted.findIndex(e => e.name === name) + 1;
            res.json({ rank: rank > 0 ? rank : null });
        } else {
            // 数据库模式
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
        }
    } catch (error) {
        console.error('查询排名失败:', error.message);
        res.status(500).json({ error: '查询失败' });
    }
});

// 健康检查
app.get('/api/health', async (req, res) => {
    if (useMemoryMode) {
        res.json({ status: 'ok', database: 'memory_mode', mode: 'memory' });
    } else {
        try {
            await pool.query('SELECT 1');
            res.json({ status: 'ok', database: 'connected', mode: 'postgresql' });
        } catch (error) {
            res.status(500).json({ status: 'error', database: 'disconnected', mode: 'memory' });
        }
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
    if (pool && !useMemoryMode) {
        await pool.end();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 关闭服务器...');
    if (pool && !useMemoryMode) {
        await pool.end();
    }
    process.exit(0);
});
