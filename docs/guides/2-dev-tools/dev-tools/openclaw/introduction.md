# OpenClaw

OpenClaw is your own personal AI assistant that runs on your own devices. It connects to the channels you already use (WhatsApp, Telegram, Discord, etc.) and has access to your files and tools.

## English Introduction

### Installation

#### macOS / Linux
You can install OpenClaw using the official one-line installer, which sets up Node.js and everything else for you:
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Alternatively, if you prefer using `npm`:
```bash
npm install -g openclaw
openclaw onboard
```

Or install from source:
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build
pnpm run openclaw onboard
```

#### Windows
**Note:** Native Windows support is currently experimental. It is **strongly recommended** to use **WSL2 (Windows Subsystem for Linux)** with Ubuntu.

1.  **Install WSL2**:
    Open PowerShell as Administrator and run:
    ```powershell
    wsl --install
    ```
    Restart your computer if prompted.

2.  **Install OpenClaw inside WSL2**:
    Open your Ubuntu terminal (search for "Ubuntu" in the Start menu) and run the Linux installation command:
    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```

### Starting & Verification

After installation, start the Gateway service:
```bash
openclaw gateway start
```
You should see a success message indicating the service has started (e.g., `Restarted systemd service: openclaw-gateway.service`).

**Verify Dashboard:**
Open your browser and visit:
*   **Local**: `http://localhost:18789`
*   **WSL2**: If localhost fails, use your WSL2 IP: `http://<WSL-IP>:18789` (Run `hostname -I` to find it).

### Key Features
*   **Personal AI**: Runs on your hardware, not a walled garden.
*   **Multi-Channel**: Works with WhatsApp, Telegram, Discord, Slack, and more.
*   **Extensible**: Can be extended with new skills and tools.

### Core Architecture & Concepts

OpenClaw is designed as a complete intelligent platform, acting as a "smart platform" with five key functional areas.

#### System Architecture

```mermaid
graph TD
    User[User/Channels] -->|Message| Gateway[Gateway (Control Plane)]
    Gateway -->|Route| Agent[Agent (Brain)]
    Agent -->|Use| Skills[Skills (Toolbox)]
    Agent -->|Read/Write| Memory[Memory (Persistence)]
    Gateway -->|Connect| Nodes[Nodes (Sensors/Devices)]
    
    subgraph Core Components
    Gateway
    Agent
    Skills
    Memory
    end
```

#### Key Components

1.  **Gateway (The Door)**:
    *   **Role**: Central control plane.
    *   **Function**: Manages sessions, routes requests, handles authentication, and dispatches messages between channels and agents.
    *   **Tech**: Node.js daemon, WebSocket server.

2.  **Agent (The Brain)**:
    *   **Role**: Reasoning engine.
    *   **Function**: Understands context, plans tasks, and decides which tools to use.
    *   **Models**: Supports Claude, GPT-4, and local Ollama models.

3.  **Skills (The Toolbox)**:
    *   **Role**: Execution capabilities.
    *   **Function**: Plugins defined via `SKILL.md` that allow the Agent to perform actions (file ops, API calls, browser control).

4.  **Channels (The Connection)**:
    *   **Role**: Communication interfaces.
    *   **Function**: Connects AI to user apps like WhatsApp, Telegram, Discord, Slack, SMS, etc.

5.  **Nodes (The Sensors/Limbs)**:
    *   **Role**: Device extensions.
    *   **Function**: Small agents running on edge devices (phones, laptops, Pis) to provide local capabilities like camera access, geolocation, or system notifications.

### Troubleshooting

#### Common Issue: Works in WSL2 but not Windows (Localhost Issue)
**Symptoms**:
*   `curl http://127.0.0.1:18789` works inside WSL2 terminal.
*   `http://127.0.0.1:18789` fails in Windows browser.

**Reason**:
WSL2 runs in a separate network namespace. While Windows attempts to forward `localhost` ports, this often fails if the service inside WSL2 is listening only on `127.0.0.1` (loopback) and not `0.0.0.0` (all interfaces).

**Solution**:
1.  **Method 1 (Recommended): Use WSL2 IP**
    *   Run `hostname -I` (capital I) in WSL2.
    *   Use that IP in Windows: `http://<WSL-IP>:18789`.

2.  **Method 2: Listen on All Interfaces**
    *   Configure OpenClaw to listen on `0.0.0.0` instead of `127.0.0.1`.
    *   Edit `~/.openclaw/openclaw.json` or run `openclaw configure` and set host to `0.0.0.0`.

#### Common Issue: WSL2 Connection Refused
If you see an error like:
```
curl: (7) Failed to connect to localhost port 18789 after 0 ms: Couldn't connect to server
```
This is usually caused by:

1.  **Server Stopped**: If you pressed `Ctrl+C` in the terminal running OpenClaw, you killed the server process.
    *   **Fix**: Do not close the terminal or press `Ctrl+C`. Open a **new terminal window** or tab to run commands.


#### Common Issue: Windows npm Installation Errors
If you try to install on Windows using `npm install -g openclaw@latest` and see errors like:
*   `npm error code 3221225477`
*   `EPERM: operation not permitted`
*   Errors related to `node-llama-cpp`

**Solutions:**

1.  **Run as Administrator**:
    Open "Command Prompt" or "PowerShell" by right-clicking and selecting **"Run as Administrator"**.

2.  **Force Install**:
    If you have old versions or conflicting dependencies, try:
    ```bash
    npm install -g openclaw@latest --force
    ```

3.  **Disable GPU (if node-llama-cpp fails)**:
    If the error persists specifically with `node-llama-cpp`, you can try disabling GPU acceleration during install:
    ```powershell
    $env:NODE_LLAMA_CPP_NO_GPU=1
    npm install -g openclaw@latest
    ```

#### Common Issue: WSL Missing Linux Modules / ServBay Paths
If you see errors like:
```
Error: Cannot find module '@mariozechner/clipboard-linux-x64-gnu'
Error: Cannot find module '/mnt/c/ServBay/packages/node/current/node_modules/openclaw/openclaw.mjs'
```
**Reason**: This happens when you are running Node.js or npm from Windows (e.g., via ServBay or a Windows installation mapped to `/mnt/c/`) inside WSL. This causes path confusion and binary incompatibility.

**Solution**: You must use a **native Linux Node.js** installation inside WSL.

1.  **Install `nvm` (Node Version Manager) in WSL**:
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    # Restart your terminal after this
    ```

2.  **Install Node.js via nvm**:
    ```bash
    nvm install node
    nvm use node
    ```

3.  **Reinstall OpenClaw**:
    ```bash
    npm install -g openclaw
    ```

#### Common Issue: Service Running but Port Not Listening (Missing Config)
If `openclaw gateway status` shows:
*   `Config (cli): ... (missing)`
*   `Gateway port 18789 is not listening`
*   `RPC probe failed`

**Reason**: The configuration file `openclaw.json` has not been generated yet.

**Solution**:

1.  **Generate Configuration**:
    Run the configuration wizard:
    ```bash
    openclaw configure
    ```
    Follow the prompts (you can accept defaults for most). Ensure you save the configuration at the end.

2.  **Restart Service**:
    ```bash
    openclaw gateway start
    ```
    (Or `systemctl --user restart openclaw-gateway.service`)

3.  **Verify**:
    Check status again:
    ```bash
    openclaw gateway status
    ```
    The port should now be listening.


---

## 中文介绍

### 安装

#### macOS / Linux
您可以使用官方的一键安装脚本来安装 OpenClaw，它会自动为您配置 Node.js 和其它依赖：
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

或者，如果您更喜欢使用 `npm`：
```bash
npm install -g openclaw
openclaw onboard
```

或者从源码安装：
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build
pnpm run openclaw onboard
```

#### Windows
**注意**：目前对原生 Windows 的支持尚处于实验阶段。**强烈建议**使用 **WSL2 (Windows Subsystem for Linux)** 搭配 Ubuntu 使用。

1.  **安装 WSL2**：
    以管理员身份打开 PowerShell 并运行：
    ```powershell
    wsl --install
    ```
    根据提示重启计算机。

2.  **在 WSL2 中安装 OpenClaw**：
    打开您的 Ubuntu 终端（在开始菜单中搜索 "Ubuntu"），然后运行 Linux 安装命令：
    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```

### 启动与验证

安装完成后，启动 Gateway 服务：
```bash
openclaw gateway start
```
您应该会看到服务已成功启动的提示（例如：`Restarted systemd service: openclaw-gateway.service`）。

**验证仪表板：**
在浏览器中访问：
*   **本地**：`http://localhost:18789`
*   **WSL2**：如果 localhost 无法访问，请使用 WSL2 IP：`http://<WSL-IP>:18789`（运行 `hostname -I` 获取 IP）。

### 主要特性
*   **个人 AI**：在您自己的硬件上运行，而非封闭的平台。
*   **多渠道支持**：支持 WhatsApp, Telegram, Discord, Slack 等。
*   **可扩展**：可以通过新的技能和工具进行扩展。

### 核心架构与概念

OpenClaw 被设计为一个完整的智能平台，可以想象成一个拥有五个重要功能区的“智能中枢”。

#### 系统架构图

```mermaid
graph TD
    User[用户/渠道] -->|消息| Gateway[Gateway (大门/控制平面)]
    Gateway -->|路由| Agent[Agent (大脑)]
    Agent -->|调用| Skills[Skills (工具箱)]
    Agent -->|读写| Memory[Memory (持久化记忆)]
    Gateway -->|连接| Nodes[Nodes (传感器/终端)]
    
    subgraph 核心组件
    Gateway
    Agent
    Skills
    Memory
    end
```

#### 关键组件

1.  **Gateway (大门)**：
    *   **定位**：中央控制平面。
    *   **功能**：管理会话、路由请求、进行鉴权，并在渠道和 Agent 之间分发消息。
    *   **技术**：Node.js 守护进程，WebSocket 服务。
    *   **技术**：Node.js 守护进程，WebSocket 服务。

2.  **Agent (大脑)**：
    *   **定位**：推理引擎。
    *   **功能**：负责理解上下文意图、制定分步计划、决定要调用哪些工具或技能。
    *   **模型**：支持 Claude、GPT-4 及 Ollama 本地模型。

3.  **Skills (工具箱)**：
    *   **定位**：执行能力集。
    *   **功能**：模块化的插件系统（通过 `SKILL.md` 定义），让 Agent 可以“开门、倒咖啡、发邮件、跑脚本”。

4.  **Channels (通道)**：
    *   **定位**：通信接口。
    *   **功能**：连接用户现有的即时通讯软件（如 WhatsApp, Telegram, Discord, Slack 等），实现无缝对接。

5.  **Nodes (传感器/终端)**：
    *   **定位**：设备端扩展。
    *   **功能**：运行在用户端设备（手机、笔记本、树莓派）上的小智能体，提供摄像头、地理位置或系统通知等本地能力。

### 故障排除

#### 常见问题：WSL2 内部可访问，但在 Windows 无法访问 (localhost 问题)
**现象**：
*   在 WSL2 终端运行 `curl http://127.0.0.1:18789` 成功。
*   在 Windows 浏览器访问 `http://127.0.0.1:18789` 失败。

**原因**：
WSL2 和 Windows 是两个独立的网络环境。默认情况下，WSL2 中的 `127.0.0.1` 仅指代 WSL2 虚拟机本身，Windows 的 `127.0.0.1` 指代 Windows 主机。虽然微软做了端口转发优化，但并不总是生效，尤其是当服务仅监听 `127.0.0.1` 时。

**解决方法**：
1.  **方法一（推荐）：使用 WSL2 的局域网 IP**
    *   在 WSL2 终端运行：`hostname -I` (注意是大写 **I**)
    *   找到类似 `172.x.x.x` 的 IP 地址。
    *   在 Windows 浏览器中使用该 IP：`http://172.x.x.x:18789`

2.  **方法二：配置 OpenClaw 监听所有网卡 (0.0.0.0)**
    *   如果使用 IP 仍然无法访问，可能是因为 OpenClaw 默认只允许本机连接。
    *   编辑配置 `~/.openclaw/openclaw.json` (如果存在)，尝试查找 host 配置并改为 `0.0.0.0`。
    *   或者重新运行 `openclaw configure` 并在提示 host/ip 时输入 `0.0.0.0`。

#### 常见问题：WSL2 连接被拒绝
如果您看到如下错误：
```
curl: (7) Failed to connect to localhost port 18789 after 0 ms: Couldn't connect to server
```
这通常由两个原因引起：

1.  **服务器已停止**：如果您在运行 OpenClaw 的终端中按下了 `Ctrl+C` (`^C`)，您实际上杀死了服务器进程。
    *   **解决方法**：不要关闭终端或按 `Ctrl+C`。打开一个**新的终端窗口**或标签页来运行 `curl` 命令或访问仪表板。


#### 常见问题：Windows npm 安装错误
如果您尝试在 Windows 上使用 `npm install -g openclaw@latest` 安装时遇到如下错误：
*   `npm error code 3221225477`
*   `EPERM: operation not permitted`
*   与 `node-llama-cpp` 相关的错误

**解决方法：**

1.  **以管理员身份运行**：
    右键点击“命令提示符”或“PowerShell”，选择**“以管理员身份运行”**。

2.  **强制安装**：
    如果有旧版本残留或依赖冲突，尝试：
    ```bash
    npm install -g openclaw@latest --force
    ```

3.  **禁用 GPU（如果 node-llama-cpp 报错）**：
    如果错误主要来自 `node-llama-cpp`，尝试在安装时禁用 GPU 加速：
    ```powershell
    $env:NODE_LLAMA_CPP_NO_GPU=1
    npm install -g openclaw@latest
    ```

#### 常见问题：WSL 中缺少 Linux 模块 / ServBay 路径问题
如果您在 WSL 中运行 OpenClaw 时遇到如下错误：
```
Error: Cannot find module '@mariozechner/clipboard-linux-x64-gnu'
Error: Cannot find module '/mnt/c/ServBay/packages/node/current/node_modules/openclaw/openclaw.mjs'
```
**原因**：这是因为您在 WSL 中使用了 Windows 环境的 Node.js 或 npm（例如通过 ServBay 或映射到 `/mnt/c/` 的 Windows 安装）。这会导致路径混乱和二进制不兼容。

**解决方法**：您必须在 WSL 内部使用**原生 Linux Node.js**。

1.  **在 WSL 中安装 `nvm` (Node Version Manager)**：
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    # 安装完成后重启终端
    ```

2.  **通过 nvm 安装 Node.js**：
    ```bash
    nvm install node
    nvm use node
    ```

3.  **重新安装 OpenClaw**：
    ```bash
    npm install -g openclaw
    ```

#### 常见问题：服务运行但端口未监听 (缺少配置)
如果 `openclaw gateway status` 显示：
*   `Config (cli): ... (missing)`
*   `Gateway port 18789 is not listening`
*   `RPC probe failed`

**原因**：配置文件 `openclaw.json` 尚未生成。

**解决方法**：
1.  **生成配置**：
    运行配置向导：
    ```bash
    openclaw configure
    ```
    按照提示操作（大多数情况下可以直接接受默认值）。确保最后保存配置。

2.  **重启服务**：
    ```bash
    openclaw gateway start
    ```
    （或者 `systemctl --user restart openclaw-gateway.service`）

3.  **验证**：
    再次检查状态：
    ```bash
    openclaw gateway status
    ```
    此时端口应该处于监听状态。
