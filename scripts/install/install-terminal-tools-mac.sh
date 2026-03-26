#!/bin/bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_banner() {
    echo "========================================"
    echo "  Mac Terminal Tools Installer"
    echo "  适用于初学者的AI开发环境配置"
    echo "========================================"
    echo ""
}

install_homebrew() {
    print_info "检查 Homebrew..."
    if command_exists brew; then
        print_success "Homebrew 已安装: $(brew --version | head -1)"
    else
        print_info "正在安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        if [[ $(uname -m) == 'arm64' ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        print_success "Homebrew 安装完成"
    fi
}

install_terminal_apps() {
    print_info "安装Terminal应用程序..."
    
    print_info "[1/3] Warp (推荐)..."
    if brew list --cask | grep -q "warp"; then
        print_success "Warp 已安装"
    else
        brew install --cask warp
        print_success "Warp 安装完成"
    fi
    
    print_info "[2/3] iTerm2..."
    if brew list --cask | grep -q "iterm2"; then
        print_success "iTerm2 已安装"
    else
        brew install --cask iterm2
        print_success "iTerm2 安装完成"
    fi
    
    print_info "[3/3] Alacritty..."
    if brew list --cask | grep -q "alacritty"; then
        print_success "Alacritty 已安装"
    else
        read -p "是否安装 Alacritty? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            brew install --cask alacritty
            print_success "Alacritty 安装完成"
        fi
    fi
}

install_zsh() {
    print_info "配置 Zsh + Oh My Zsh..."
    
    if ! command_exists zsh; then
        brew install zsh
        print_success "Zsh 安装完成"
    else
        print_success "Zsh 已安装: $(zsh --version)"
    fi
    
    if [ ! -d "$HOME/.oh-my-zsh" ]; then
        print_info "安装 Oh My Zsh..."
        sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
        print_success "Oh My Zsh 安装完成"
    else
        print_success "Oh My Zsh 已安装"
    fi
}

install_zsh_plugins() {
    print_info "安装 Zsh 推荐插件..."
    
    local zsh_custom="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"
    
    if [ ! -d "$zsh_custom/plugins/zsh-autosuggestions" ]; then
        git clone https://github.com/zsh-users/zsh-autosuggestions "$zsh_custom/plugins/zsh-autosuggestions" 2>/dev/null || true
        print_success "zsh-autosuggestions 安装完成"
    else
        print_success "zsh-autosuggestions 已安装"
    fi
    
    if [ ! -d "$zsh_custom/plugins/zsh-syntax-highlighting" ]; then
        git clone https://github.com/zsh-users/zsh-syntax-highlighting.git "$zsh_custom/plugins/zsh-syntax-highlighting" 2>/dev/null || true
        print_success "zsh-syntax-highlighting 安装完成"
    else
        print_success "zsh-syntax-highlighting 已安装"
    fi
}

setup_zshrc() {
    print_info "配置 .zshrc..."
    
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local template_file="$script_dir/../../config/zshrc.template"
    local zshrc="$HOME/.zshrc"
    
    if [ ! -f "$template_file" ]; then
        print_error "找不到 zshrc.template 文件: $template_file"
        return 1
    fi
    
    if [ -f "$zshrc" ]; then
        local backup_file="$zshrc.backup.$(date +%Y%m%d%H%M%S)"
        cp "$zshrc" "$backup_file"
        print_info "已备份原配置到: $backup_file"
    fi
    
    cp "$template_file" "$zshrc"
    print_success ".zshrc 配置完成 (主题: agnoster, 插件: git docker npm fzf zsh-autosuggestions zsh-syntax-highlighting)"
}

install_utilities() {
    print_info "安装实用工具..."
    
    local tools=("tmux" "autojump" "tree" "htop" "fzf" "bat" "ripgrep")
    
    for tool in "${tools[@]}"; do
        print_info "安装 $tool..."
        if brew list | grep -q "^$tool$"; then
            print_success "$tool 已安装"
        else
            brew install "$tool"
            print_success "$tool 安装完成"
        fi
    done
    
    print_info "配置 fzf..."
    if [ ! -f "$HOME/.fzf.zsh" ]; then
        $(brew --prefix)/opt/fzf/install --key-bindings --completion --no-update-rc --no-bash --no-fish
        print_success "fzf 配置完成"
    fi
}

verify_installation() {
    print_info "验证安装..."
    echo ""
    echo "=== 验证结果 ==="
    echo "✓ Homebrew: $(brew --version | head -1)"
    echo "✓ Zsh: $(zsh --version)"
    echo "✓ Oh My Zsh: $([ -d ~/.oh-my-zsh ] && echo '已安装' || echo '未安装')"
    echo "✓ tmux: $(tmux -V)"
    echo "✓ autojump: $(which autojump)"
    echo "✓ tree: $(tree --version | head -1)"
    echo "✓ htop: $(htop --version | head -1)"
    echo "✓ fzf: $(fzf --version)"
    echo "✓ bat: $(bat --version)"
    echo "✓ ripgrep: $(rg --version | head -1)"
    echo ""
}

print_next_steps() {
    echo ""
    echo "========================================"
    echo "  安装完成！"
    echo "========================================"
    echo ""
    echo "下一步操作:"
    echo "1. 重启终端或运行: source ~/.zshrc"
    echo "2. 打开 iTerm2 或 Warp 体验增强的终端"
    echo "3. 尝试命令: j <目录名> 快速跳转"
    echo "4. 按 Ctrl+R 搜索命令历史 (fzf)"
    echo ""
    echo "常用命令:"
    echo "  tmux              - 启动tmux会话"
    echo "  j <目录>          - 快速跳转目录"
    echo "  bat <文件>        - 查看文件内容"
    echo "  rg <关键词>       - 快速搜索"
    echo "  htop              - 系统监控"
    echo ""
    echo "文档参考: docs/guides/terminal-setup-mac.md"
    echo ""
}

main() {
    print_banner
    
    install_homebrew
    echo ""
    
    install_terminal_apps
    echo ""
    
    install_zsh
    echo ""
    
    install_zsh_plugins
    echo ""
    
    install_utilities
    echo ""
    
    setup_zshrc
    echo ""
    
    verify_installation
    
    print_next_steps
}

main "$@"
