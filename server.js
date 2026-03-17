const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'scores.json');

// 中间件
app.use(express.json());
app.use(express.static(__dirname));

// 初始化数据文件
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
}

// 获取排行榜
app.get('/api/leaderboard', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        // 排序：分数高在前，相同分数时间早在前
        const sorted = scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.date) - new Date(b.date);
        }).slice(0, 50); // 只返回前50
        
        res.json(sorted);
    } catch (error) {
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
        
        // 清理名字
        const cleanName = name.trim().slice(0, 12);
        if (cleanName.length < 1) {
            return res.status(400).json({ error: '名字不能为空' });
        }
        
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        const newEntry = {
            name: cleanName,
            score: score,
            date: new Date().toISOString()
        };
        
        scores.push(newEntry);
        await fs.writeFile(DATA_FILE, JSON.stringify(scores, null, 2));
        
        // 计算排名
        const sorted = scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.date) - new Date(b.date);
        });
        
        const rank = sorted.findIndex(e => 
            e.name === newEntry.name && 
            e.score === newEntry.score && 
            e.date === newEntry.date
        ) + 1;
        
        res.json({ success: true, rank });
    } catch (error) {
        res.status(500).json({ error: '保存失败' });
    }
});

// 获取玩家排名
app.get('/api/rank/:name/:score', async (req, res) => {
    try {
        const { name, score } = req.params;
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        const sorted = scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.date) - new Date(b.date);
        });
        
        // 找到该玩家该分数的最新记录
        const playerEntries = sorted.filter(e => 
            e.name === name && e.score === parseInt(score)
        );
        
        if (playerEntries.length === 0) {
            return res.json({ rank: null });
        }
        
        // 取最新的那条
        const latestEntry = playerEntries[playerEntries.length - 1];
        const rank = sorted.findIndex(e => 
            e.name === latestEntry.name && 
            e.score === latestEntry.score && 
            e.date === latestEntry.date
        ) + 1;
        
        res.json({ rank });
    } catch (error) {
        res.status(500).json({ error: '查询失败' });
    }
});

// 启动服务器
initDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`🐍 贪吃蛇服务器运行在 http://localhost:${PORT}`);
        console.log(`📊 排行榜地址: http://localhost:${PORT}`);
    });
});
