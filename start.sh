#!/bin/bash

# 贪吃蛇联网版启动脚本
# Snake Game Online Launcher

cd "$(dirname "$0")"

echo "🐍 贪吃蛇联网版启动器"
echo "========================"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
fi

# 启动服务器
echo "🚀 启动服务器..."
node server.js &
SERVER_PID=$!

sleep 2

# 获取本机IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}')

echo ""
echo "✅ 服务器已启动！"
echo ""
echo "🎮 游戏地址："
echo "   本机访问：http://localhost:3000"
echo "   局域网访问：http://${LOCAL_IP}:3000"
echo ""

# 检查是否有 ngrok
if command -v ngrok &> /dev/null; then
    echo "🌐 检测到 ngrok，正在创建公网链接..."
    ngrok http 3000
else
    echo "💡 想让朋友从外网访问？安装 ngrok："
    echo "   brew install ngrok"
    echo "   然后运行：ngrok http 3000"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    wait $SERVER_PID
fi
