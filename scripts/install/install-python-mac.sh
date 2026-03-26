#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║              Python 开发环境安装脚本 (Mac)                     ║"
    echo "║                                                               ║"
    echo "║  安装内容: uv + Python 3.12 + 常用工具                         ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_info "安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        if [[ $(uname -m) == 'arm64' ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        print_success "Homebrew 安装完成"
    else
        print_success "Homebrew 已安装"
    fi
}

install_uv() {
    print_info "安装 uv (极速 Python 工具)..."
    
    if command -v uv &> /dev/null; then
        print_success "uv 已安装: $(uv --version)"
        return
    fi
    
    brew install uv
    print_success "uv 安装完成"
}

configure_shell() {
    print_info "配置 Shell 环境..."
    
    local shell_rc=""
    if [[ "$SHELL" == */zsh ]]; then
        shell_rc="$HOME/.zshrc"
    elif [[ "$SHELL" == */bash ]]; then
        shell_rc="$HOME/.bashrc"
    else
        shell_rc="$HOME/.profile"
    fi
    
    if ! grep -q 'UV_PYTHON' "$shell_rc" 2>/dev/null; then
        echo '' >> "$shell_rc"
        echo '# uv Python configuration' >> "$shell_rc"
        echo 'export UV_PYTHON_PREFERENCE=only-managed' >> "$shell_rc"
        print_success "已添加 uv 配置到 $shell_rc"
    else
        print_success "uv 配置已存在"
    fi
}

install_python() {
    print_info "安装 Python..."
    
    uv python install 3.12
    uv python install 3.11
    
    print_success "Python 安装完成"
}

set_default_python() {
    print_info "设置默认 Python 版本..."
    
    uv python pin 3.12 --global
    
    local python_version=$(uv python find 3.12)
    print_success "默认 Python: $python_version"
}

configure_pip_mirror() {
    print_info "配置 pip 镜像（国内用户推荐）..."
    
    read -p "是否配置清华镜像? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p ~/.pip
        cat > ~/.pip/pip.conf << EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
EOF
        print_success "已配置清华镜像"
    else
        print_info "跳过镜像配置"
    fi
}

install_common_tools() {
    print_info "安装常用 Python 工具..."
    
    local tools=("black" "ruff" "pytest" "httpie")
    
    for tool in "${tools[@]}"; do
        read -p "是否安装 $tool? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            uv tool install "$tool"
            print_success "$tool 安装完成"
        fi
    done
}

verify_installation() {
    print_info "验证安装..."
    echo ""
    
    echo -e "${YELLOW}uv 版本:${NC}"
    uv --version 2>/dev/null || echo "未安装"
    
    echo -e "${YELLOW}Python 版本:${NC}"
    uv python list 2>/dev/null || echo "无"
    
    echo -e "${YELLOW}已安装的工具:${NC}"
    uv tool list 2>/dev/null || echo "无"
}

print_next_steps() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                  安装完成！                                  ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}下一步操作:${NC}"
    echo ""
    echo "  1. 重启终端或运行: source ~/.zshrc"
    echo "  2. 验证安装: python --version"
    echo "  3. 创建项目: uv init my-project && cd my-project"
    echo "  4. 安装 Kimi CLI: uv tool install kimi-cli"
    echo ""
    echo -e "${YELLOW}uv 常用命令:${NC}"
    echo "  uv python install 3.11   # 安装 Python 版本"
    echo "  uv python list           # 查看已安装版本"
    echo "  uv venv                  # 创建虚拟环境"
    echo "  uv add requests          # 添加依赖"
    echo "  uv run python app.py     # 运行脚本"
    echo "  uv tool install black    # 安装全局工具"
    echo ""
}

main() {
    print_banner
    check_homebrew
    echo ""
    install_uv
    echo ""
    configure_shell
    echo ""
    install_python
    echo ""
    set_default_python
    echo ""
    configure_pip_mirror
    echo ""
    install_common_tools
    echo ""
    verify_installation
    print_next_steps
}

main "$@"
