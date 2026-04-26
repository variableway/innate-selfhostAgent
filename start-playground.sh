#!/usr/bin/env bash
set -e

# Innate Playground - Tauri + Next.js (Mac/Linux)
# 一键启动脚本

echo "🚀 Starting Innate Playground..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLAYGROUND_DIR="$SCRIPT_DIR/playground"
DESKTOP_DIR="$PLAYGROUND_DIR/apps/desktop"

# 检查依赖
check_dep() {
  if command -v "$1" &> /dev/null; then
    return 0
  fi
  return 1
}

# 查找 cargo（支持多种安装路径）
find_cargo() {
  if command -v cargo &> /dev/null; then
    echo "found"
    return 0
  fi
  # 常见安装路径
  local paths=(
    "$HOME/.cargo/bin/cargo"
    "/usr/local/cargo/bin/cargo"
    "/opt/homebrew/bin/cargo"
    "/usr/bin/cargo"
  )
  for p in "${paths[@]}"; do
    if [ -x "$p" ]; then
      export PATH="$(dirname "$p"):$PATH"
      echo "found"
      return 0
    fi
  done
  echo "not_found"
  return 1
}

echo "📋 检查环境依赖..."

# 检查 Node.js
if ! check_dep "node"; then
  echo "❌ 错误: 未找到 Node.js"
  echo "   请先安装: https://nodejs.org"
  exit 1
fi
echo "   ✅ Node.js: $(node -v)"

# 检查 pnpm
if ! check_dep "pnpm"; then
  echo "❌ 错误: 未找到 pnpm"
  echo "   请先运行: npm install -g pnpm"
  exit 1
fi
echo "   ✅ pnpm: $(pnpm -v)"

# 检查/查找 Cargo
CARGO_STATUS=$(find_cargo)
if [ "$CARGO_STATUS" != "found" ]; then
  echo ""
  echo "⚠️  警告: 未找到 Rust/Cargo"
  echo ""
  echo "   Tauri 桌面应用需要 Rust 来编译后端。"
  echo ""
  echo "   请选择操作:"
  echo "     1) 自动安装 Rust（推荐）"
  echo "     2) 仅启动前端（浏览器预览，无桌面窗口）"
  echo "     3) 退出"
  echo ""
  read -rp "   输入选项 [1/2/3]: " choice

  case "$choice" in
    1)
      echo ""
      echo "🔧 正在安装 Rust..."
      if command -v curl &> /dev/null; then
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
        echo "✅ Rust 安装完成: $(cargo -V)"
      else
        echo "❌ 错误: 未找到 curl，无法自动安装 Rust"
        echo "   请手动安装: https://rustup.rs"
        exit 1
      fi
      ;;
    2)
      echo ""
      echo "🌐 将以纯前端模式启动（浏览器访问 http://localhost:3001）"
      echo ""
      RUN_MODE="web"
      ;;
    *)
      echo "已退出"
      exit 0
      ;;
  esac
else
  echo "   ✅ Cargo: $(cargo -V)"
  RUN_MODE="tauri"
fi

cd "$PLAYGROUND_DIR"

# 安装依赖（仅在 node_modules 不存在时）
if [ ! -d "$PLAYGROUND_DIR/node_modules" ]; then
  echo ""
  echo "📦 安装 playground 依赖..."
  pnpm install
else
  echo "   ✅ playground 依赖已安装"
fi

cd "$DESKTOP_DIR"

# 安装 desktop app 依赖
if [ ! -d "$DESKTOP_DIR/node_modules" ]; then
  echo "📦 安装 desktop app 依赖..."
  pnpm install
else
  echo "   ✅ desktop app 依赖已安装"
fi

echo ""

if [ "$RUN_MODE" = "web" ]; then
  echo "🔧 启动 Next.js 前端开发服务器..."
  echo ""
  echo "   🌐 浏览器访问: http://localhost:3001"
  echo "   ⚠️  部分 Tauri 功能（如文件系统、终端）在浏览器中不可用"
  echo ""
  pnpm dev
else
  echo "🔧 启动 Tauri 开发服务器..."
  echo ""
  echo "   🌐 前端: http://localhost:3001"
  echo "   🖥️  桌面窗口即将打开..."
  echo ""
  npx tauri dev
fi
