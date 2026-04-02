#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
    echo -e "${CYAN}"
    echo "╔═════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                     ║"
    echo "║              WSL2 AI 开发环境一键安装脚本                           ║"
    echo "║                                                                     ║"
    echo "║  包含内容:                                                          ║"
    echo "║    • Zsh + Oh My Zsh + 插件                                         ║"
    echo "║    • Node.js (fnm) + LTS                                            ║"
    echo "║    • Python (uv) + 多版本                                           ║"
    echo "║    • 实用工具 (tmux, fzf, ripgrep 等)                               ║"
    echo "║                                                                     ║"
    echo "╚═════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${CYAN}[STEP $1]${NC} $2"; }

check_wsl() {
    if ! grep -qi microsoft /proc/version; then
        print_error "此脚本只能在 WSL2 中运行"
        print_info "请在 Windows 中打开 WSL2 终端后执行"
        exit 1
    fi
    print_success "检测到 WSL 环境"
}

show_menu() {
    echo ""
    echo -e "${YELLOW}请选择安装模式:${NC}"
    echo ""
    echo "  1) 完整安装 (推荐) - 安装所有组件"
    echo "  2) 自定义安装 - 选择要安装的组件"
    echo "  3) 仅终端工具 - zsh, oh-my-zsh, 插件"
    echo "  4) 仅 Node.js - fnm + Node.js LTS"
    echo "  5) 仅 Python - uv + Python 3.12/3.13"
    echo "  6) 退出"
    echo ""
    read -p "请输入选项 [1-6]: " choice
    echo ""
    
    case $choice in
        1) install_all ;;
        2) custom_install ;;
        3) install_terminal_only ;;
        4) install_nodejs_only ;;
        5) install_python_only ;;
        6) echo "退出安装"; exit 0 ;;
        *) print_error "无效选项"; show_menu ;;
    esac
}

get_script_dir() {
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
}

install_terminal_only() {
    local script_dir=$(get_script_dir)
    print_step "1" "安装终端工具..."
    bash "$script_dir/install-terminal-tools-wsl.sh"
}

install_nodejs_only() {
    local script_dir=$(get_script_dir)
    print_step "1" "安装 Node.js..."
    bash "$script_dir/install-nodejs-wsl.sh"
}

install_python_only() {
    local script_dir=$(get_script_dir)
    print_step "1" "安装 Python..."
    bash "$script_dir/install-python-wsl.sh"
}

custom_install() {
    echo -e "${YELLOW}请选择要安装的组件:${NC}"
    echo ""
    
    local install_terminal="n"
    local install_node="n"
    local install_py="n"
    
    read -p "安装终端工具 (zsh, oh-my-zsh)? [y/N]: " install_terminal
    read -p "安装 Node.js (fnm)? [y/N]: " install_node
    read -p "安装 Python (uv)? [y/N]: " install_py
    
    local step=1
    local script_dir=$(get_script_dir)
    
    if [[ $install_terminal =~ ^[Yy]$ ]]; then
        print_step "$step" "安装终端工具..."
        bash "$script_dir/install-terminal-tools-wsl.sh"
        ((step++))
        echo ""
    fi
    
    if [[ $install_node =~ ^[Yy]$ ]]; then
        print_step "$step" "安装 Node.js..."
        bash "$script_dir/install-nodejs-wsl.sh"
        ((step++))
        echo ""
    fi
    
    if [[ $install_py =~ ^[Yy]$ ]]; then
        print_step "$step" "安装 Python..."
        bash "$script_dir/install-python-wsl.sh"
        ((step++))
        echo ""
    fi
    
    print_final_summary
}

install_all() {
    local script_dir=$(get_script_dir)
    
    print_step "1" "安装终端工具..."
    bash "$script_dir/install-terminal-tools-wsl.sh"
    echo ""
    
    print_step "2" "安装 Node.js..."
    bash "$script_dir/install-nodejs-wsl.sh"
    echo ""
    
    print_step "3" "安装 Python..."
    bash "$script_dir/install-python-wsl.sh"
    echo ""
    
    print_final_summary
}

print_final_summary() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}              全部安装完成！                                ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}重要：完成以下步骤使配置生效${NC}"
    echo ""
    echo "  1. 在 Windows PowerShell 中执行:"
    echo "     wsl --shutdown"
    echo ""
    echo "  2. 重新打开 WSL 终端"
    echo ""
    echo "  3. 验证安装:"
    echo "     zsh --version"
    echo "     node -v"
    echo "     uv --version"
    echo ""
    echo -e "${YELLOW}常用命令速查:${NC}"
    echo ""
    echo "  终端:"
    echo "    tmux              - 终端复用"
    echo "    j <目录>          - 快速跳转"
    echo "    Ctrl+R            - 历史搜索 (fzf)"
    echo ""
    echo "  Node.js:"
    echo "    fnm install 20    - 安装 Node 20"
    echo "    fnm use 20        - 切换版本"
    echo "    npm run dev       - 运行开发服务器"
    echo ""
    echo "  Python:"
    echo "    uv init           - 初始化项目"
    echo "    uv add requests   - 添加依赖"
    echo "    uv run app.py     - 运行脚本"
    echo ""
    echo "  WSL 特有:"
    echo "    open .            - Windows 资源管理器打开当前目录"
    echo "    code .            - VS Code 打开当前目录"
    echo ""
}

main() {
    print_banner
    check_wsl
    show_menu
}

main "$@"
