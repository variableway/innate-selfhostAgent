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
    echo "║           WSL2 终端工具安装脚本                                ║"
    echo "║                                                               ║"
    echo "║  安装内容: zsh + oh-my-zsh + 实用工具                          ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_wsl() {
    if ! grep -qi microsoft /proc/version; then
        print_error "此脚本只能在 WSL2 中运行"
        exit 1
    fi
    print_success "检测到 WSL 环境"
}

update_system() {
    print_info "更新系统包..."
    sudo apt update && sudo apt upgrade -y
    print_success "系统更新完成"
}

install_zsh() {
    print_info "安装 Zsh..."
    
    if command -v zsh &> /dev/null; then
        print_success "Zsh 已安装: $(zsh --version)"
    else
        sudo apt install -y zsh
        print_success "Zsh 安装完成"
    fi
}

install_oh_my_zsh() {
    print_info "安装 Oh My Zsh..."
    
    if [ -d "$HOME/.oh-my-zsh" ]; then
        print_success "Oh My Zsh 已安装"
    else
        sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
        print_success "Oh My Zsh 安装完成"
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
        print_warning "找不到 zshrc.template，使用默认配置"
        setup_default_zshrc
        return
    fi
    
    if [ -f "$zshrc" ]; then
        local backup_file="$zshrc.backup.$(date +%Y%m%d%H%M%S)"
        cp "$zshrc" "$backup_file"
        print_info "已备份原配置到: $backup_file"
    fi
    
    cp "$template_file" "$zshrc"
    print_success ".zshrc 配置完成"
}

setup_default_zshrc() {
    local zshrc="$HOME/.zshrc"
    
    cat > "$zshrc" << 'EOF'
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="agnoster"
plugins=(git docker npm fzf zsh-autosuggestions zsh-syntax-highlighting)
source $ZSH/oh-my-zsh.sh

export LANG=en_US.UTF-8
export EDITOR=vim

alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias cls='clear'
alias ..='cd ..'
alias ...='cd ../..'

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
EOF
    
    print_success ".zshrc 默认配置完成"
}

set_zsh_default() {
    print_info "设置 Zsh 为默认 Shell..."
    
    if [ "$SHELL" != "$(which zsh)" ]; then
        chsh -s "$(which zsh)"
        print_success "已设置 Zsh 为默认 Shell (重新登录后生效)"
    else
        print_success "Zsh 已是默认 Shell"
    fi
}

install_utilities() {
    print_info "安装实用工具..."
    
    local tools=("build-essential" "curl" "wget" "git" "tmux" "autojump" "tree" "htop" "fzf" "bat" "ripgrep" "jq" "unzip" "ca-certificates" "gnupg")
    
    for tool in "${tools[@]}"; do
        print_info "检查 $tool..."
        if dpkg -l | grep -q "^ii  $tool"; then
            print_success "$tool 已安装"
        else
            sudo apt install -y "$tool"
            print_success "$tool 安装完成"
        fi
    done
    
    print_info "配置 fzf..."
    if [ ! -f "$HOME/.fzf.zsh" ]; then
        yes | $(dpkg -L fzf | grep install)
        print_success "fzf 配置完成"
    fi
}

install_windows_interop_tools() {
    print_info "配置 Windows 互操作性..."
    
    local zshrc="$HOME/.zshrc"
    
    if ! grep -q 'WSL_INTEROP' "$zshrc" 2>/dev/null; then
        cat >> "$zshrc" << 'EOF'

# WSL Windows 互操作
alias open='explorer.exe'
alias code='code.exe'
EOF
        print_success "已添加 Windows 互操作配置"
    else
        print_success "Windows 互操作配置已存在"
    fi
}

verify_installation() {
    print_info "验证安装..."
    echo ""
    echo -e "${YELLOW}=== 验证结果 ===${NC}"
    echo "✓ Zsh: $(zsh --version)"
    echo "✓ Oh My Zsh: $([ -d ~/.oh-my-zsh ] && echo '已安装' || echo '未安装')"
    echo "✓ tmux: $(tmux -V)"
    echo "✓ tree: $(tree --version | head -1)"
    echo "✓ htop: $(htop --version | head -1)"
    echo "✓ fzf: $(fzf --version)"
    echo "✓ bat: $(bat --version)"
    echo "✓ ripgrep: $(rg --version | head -1)"
    echo ""
}

print_next_steps() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                  安装完成！                                  ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}下一步操作:${NC}"
    echo ""
    echo "  1. 重启 WSL: wsl --shutdown (在 Windows PowerShell 中)"
    echo "  2. 重新打开 WSL 终端"
    echo "  3. 运行: source ~/.zshrc"
    echo ""
    echo -e "${YELLOW}常用命令:${NC}"
    echo "  tmux              - 启动tmux会话"
    echo "  j <目录>          - 快速跳转目录"
    echo "  bat <文件>        - 查看文件内容"
    echo "  rg <关键词>       - 快速搜索"
    echo "  htop              - 系统监控"
    echo "  open .            - 用 Windows 资源管理器打开当前目录"
    echo ""
}

main() {
    print_banner
    check_wsl
    echo ""
    
    update_system
    echo ""
    
    install_zsh
    echo ""
    
    install_oh_my_zsh
    echo ""
    
    install_zsh_plugins
    echo ""
    
    install_utilities
    echo ""
    
    setup_zshrc
    echo ""
    
    set_zsh_default
    echo ""
    
    install_windows_interop_tools
    echo ""
    
    verify_installation
    
    print_next_steps
}

main "$@"
