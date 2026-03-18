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
        const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 50);
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
        
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        scores.push({
            name: name.trim().slice(0, 12),
            score: score,
            date: new Date().toISOString()
        });
        
        await fs.writeFile(DATA_FILE, JSON.stringify(scores, null, 2));
        
        const sorted = scores.sort((a, b) => b.score - a.score);
        const rank = sorted.findIndex(e => e.name === name && e.score === score) + 1;
        
        res.json({ success: true, rank });
    } catch (error) {
        res.status(500).json({ error: '保存失败' });
    }
});

// 启动服务器
initDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`🐍 贪吃蛇服务器运行在 http://localhost:${PORT}`);
    });
});
