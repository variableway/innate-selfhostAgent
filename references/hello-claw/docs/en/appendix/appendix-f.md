---
prev:
  text: 'Appendix E: Model Provider Selection Guide'
  link: '/en/appendix/appendix-e'
next:
  text: 'Appendix G: Configuration File Reference'
  link: '/en/appendix/appendix-g'
---

# Appendix F: Command Quick Reference

Just installed OpenClaw and feeling overwhelmed by dozens of commands? This quick reference organizes all CLI commands by use case — from installation to daily operations, from channel management to troubleshooting. **Look up what you need, when you need it** — no need to read through everything.

> **Reading tip**: Commands marked with ⭐ are the most frequently used and you'll need them right after installation. Commands marked with 🔧 are advanced operational commands that you may not encounter in everyday use. The inline comment for each command explains its purpose.

---

## Quick Navigation

| Scenario | Jump To | One-Line Summary |
|----------|---------|------------------|
| Just installed, want to try it | [Installation & Updates](#installation--updates) | Install, upgrade, uninstall |
| First-time setup | [Initialization & Configuration](#initialization--configuration) | Wizard, diagnostics, Dashboard |
| Chat directly in the terminal | [Terminal Chat](#terminal-chat) | TUI interactive chat, single Agent call |
| Get OpenClaw running | [Gateway Management](#gateway-management) | Start, stop, health check |
| Connect to chat platforms | [Channel Management](#channel-management) | Add Telegram / QQ / Feishu and other channels |
| Manage multiple Agents | [Agent Management](#agent-management) | Create, bind, run Agents |
| Install skills | [Skills & Plugins](#skills--plugins) | Browse, install, enable skills and plugins |
| Select and switch models | [Model Management](#model-management) | Set model, fallback, aliases |
| Schedule automatic execution | [Scheduled Tasks](#scheduled-tasks) | Add, edit, delete, view Cron jobs |
| Send messages, polls | [Message Sending](#message-sending) | Proactively send messages and interactions |
| Tune parameters | [Configuration Operations](#configuration-operations) | Read and write configuration values |
| Sandbox and security | [Sandbox & Security](#sandbox--security) | Sandbox isolation, approvals, security audits |
| Something went wrong | [Diagnostics & Debugging](#diagnostics--debugging) | Logs, Doctor, backup and restore |
| Other advanced features | [More Commands](#more-commands) | Memory, devices, browser, DNS, Webhooks, etc. |

---

## Global Options

All `openclaw` commands support the following options:

```bash
openclaw [--dev] [--profile <name>] [--log-level <level>] <command>

--dev              # Isolated development environment (state stored in ~/.openclaw-dev, ports auto-offset)
--profile <name>   # Custom isolated environment (state stored in ~/.openclaw-<name>)
--log-level <level>  # Override global log level (silent|fatal|error|warn|info|debug|trace)
--no-color         # Disable terminal color output
-V, --version      # Show version number
```

> Multiple environments stay isolated from each other: `--dev` is for debugging, `--profile` is for running multiple instances simultaneously (e.g., one production, one test).

---

## Installation & Updates

### ⭐ Install OpenClaw

**Windows users** (open PowerShell as Administrator):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iwr -useb https://openclaw.ai/install.ps1 | iex
```

> The one-click script automatically installs Node.js and OpenClaw, then launches the configuration wizard immediately after.

**macOS / Linux / WSL2 users**:

```bash
npm install -g openclaw@latest      # Install via npm (recommended)
# or
pnpm add -g openclaw@latest         # Install via pnpm
```

> Prerequisite: Node.js >= 22. See [Chapter 2: Manual Installation](/en/adopt/chapter2/).

### Update & Uninstall

```bash
openclaw update                      # ⭐ Update to the latest version
openclaw update --channel stable|beta|dev  # Switch to a specific update channel
openclaw --version                   # Show the current version

openclaw uninstall                   # Uninstall gateway service and local data (keeps CLI)
openclaw uninstall --all             # Completely uninstall
openclaw reset                       # Reset configuration and state (keeps CLI)
openclaw reset --scope config+creds+sessions --yes  # Precisely reset specified scope
```

---

## Initialization & Configuration

The first step after installation: run the configuration wizard.

### ⭐ Configuration Wizard

```bash
openclaw onboard                     # Interactive setup wizard (recommended for first use)
openclaw onboard --install-daemon    # Set up and install daemon (start on boot)
openclaw onboard --non-interactive --mode local  # Non-interactive mode (for scripted deployment)
openclaw onboard --reset             # Re-run the wizard (overwrites existing configuration)
```

### ⭐ Configuration Validation

Not sure if your configuration is correct? Use Doctor for a one-click diagnosis:

```bash
openclaw doctor                      # Automatically diagnose common issues
openclaw doctor --fix                # Diagnose and auto-fix
openclaw doctor --deep               # Deep scan (checks more items)
```

### Reconfigure

```bash
openclaw configure                   # Reopen the interactive configuration wizard
```

### ⭐ Open Dashboard

```bash
openclaw dashboard                   # Launch the Web Dashboard (browser opens automatically)
```

> See [Chapter 3: Initial Configuration Wizard](/en/adopt/chapter3/).

---

## Terminal Chat

No browser needed, no chat platform required — talk to OpenClaw directly in the terminal. SSH remote, servers, Docker containers — if there's a terminal, you can chat.

### ⭐ TUI Interactive Mode

```bash
openclaw tui                         # Open the terminal chat interface (connects to Gateway)
```

### Single Agent Call

No interactive interface needed — just send one message and go:

```bash
openclaw agent --message "Summarize today's schedule for me"              # Execute locally
openclaw agent --message "Hello" --to +15555550123 --deliver  # Execute and deliver to chat channel
openclaw agent --message "Analyze report" --thinking high                 # Use deep thinking
```

### Search Documentation

```bash
openclaw docs                        # Search OpenClaw official documentation
```

> See [Chapter 11: Web Interface & Clients](/en/adopt/chapter11/).

---

## Gateway Management

The Gateway is OpenClaw's core backend service — all message sending and receiving, skill calls go through it. Default address: `ws://127.0.0.1:18789`.

### ⭐ Daily Management

```bash
openclaw gateway status              # Check if the gateway is running
openclaw gateway start               # Start the gateway service
openclaw gateway stop                # Stop the gateway service
openclaw gateway restart             # Restart (required after changing configuration)
```

### Startup Options

Use these when you need to customize the startup method:

```bash
openclaw gateway --port 18789 --verbose     # Run in foreground (debug mode, logs output directly)
openclaw gateway --bind loopback            # Local access only (default, most secure)
openclaw gateway --bind lan                 # Local network access
openclaw gateway --bind tailnet             # Tailscale network access
openclaw gateway --auth token --token <t>   # Token authentication
openclaw gateway --auth password --password <p>  # Password authentication
openclaw gateway --tailscale serve|funnel   # Expose service via Tailscale
openclaw gateway --dev                      # Development mode
```

### Service Installation

```bash
openclaw gateway install             # Install as a system service (start on boot)
openclaw gateway uninstall           # Uninstall the system service
```

### Health Check

```bash
openclaw health                      # 🔧 Gateway health status
openclaw health --json               # JSON format output (suitable for script parsing)
openclaw health --verbose            # Detailed information
openclaw gateway call <method> --params '<json>'  # 🔧 Directly call a gateway RPC method
```

> See [Chapter 8: Gateway Operations & Management](/en/adopt/chapter8/).

---

## Channel Management

Channels are the chat platforms OpenClaw connects to — Telegram, QQ, Feishu, Discord, WhatsApp, and more.

### ⭐ Add a Channel

```bash
openclaw channels add                # Interactive add (recommended, with guided prompts)

# Non-interactive add examples:
openclaw channels add \
  --channel telegram \
  --account alerts \
  --name "Alerts Bot" \
  --token $TELEGRAM_BOT_TOKEN

openclaw channels add \
  --channel discord \
  --account work \
  --name "Work Bot" \
  --token $DISCORD_BOT_TOKEN
```

### View Status

```bash
openclaw channels list               # ⭐ List all added channels
openclaw channels list --json        # JSON format
openclaw channels status             # View connection status of each channel
openclaw channels status --probe     # Actively probe connections (more accurate)
openclaw channels logs               # View channel logs
openclaw channels logs --channel <name> --limit 200  # Specify channel, limit log count
```

### Remove a Channel

```bash
openclaw channels remove --channel <channel> --account <id>
openclaw channels remove --channel <channel> --account <id> --delete  # Also delete data
```

### Login / Logout (platforms requiring QR code scan, e.g. WhatsApp)

```bash
openclaw channels login              # Open QR code login
openclaw channels login --channel whatsapp --account <id> --verbose
openclaw channels logout             # Log out
openclaw channels logout --channel <channel> --account <id>
```

### ⭐ Pairing Management

Pairing is OpenClaw's security mechanism — new users require approval on their first conversation.

```bash
openclaw pairing list                # View pending pairing requests
openclaw pairing approve <channel> <code>           # Approve a pairing request
openclaw pairing approve --channel <channel> <code> --notify  # Approve and notify the other party
```

> See [Chapter 4: Chat Provider Configuration](/en/adopt/chapter4/).

---

## Agent Management

Agents are OpenClaw's intelligent entities — each Agent has its own model, workspace, and bound channels.

### View Agents

```bash
openclaw agents list                 # ⭐ List all Agents
openclaw agents list --json          # JSON format
openclaw agents list --bindings      # Show which channels each Agent is bound to
```

### Add an Agent

```bash
openclaw agents add                  # ⭐ Interactive add (recommended)
openclaw agents add [name]           # Specify a name

# Non-interactive (for automated deployment):
openclaw agents add my-agent \
  --workspace ~/.openclaw/workspace-my-agent \
  --model anthropic/claude-sonnet-4-5 \
  --bind whatsapp:personal \
  --non-interactive
```

### Bind Channels

One Agent can be bound to multiple channels, and one channel can be shared by multiple Agents.

```bash
openclaw agents bindings                              # View all binding relationships
openclaw agents bindings --agent <id>                  # View bindings for a specific Agent
openclaw agents bind --agent <id> --bind <channel[:accountId]>    # Add a binding
openclaw agents unbind --agent <id> --bind <channel[:accountId]>  # Remove a binding
openclaw agents unbind --agent <id> --all              # Remove all bindings
```

### Run an Agent (manual trigger)

```bash
openclaw agent --message "Hello" --to <dest>           # Send a message
openclaw agent --message "Hello" --session-id <id>     # Send in a specific session
openclaw agent --message "Hello" --thinking high       # Use deep thinking
openclaw agent --message "Hello" --local               # Local mode (bypasses gateway)
openclaw agent --message "Hello" --channel whatsapp --deliver  # Send and deliver to channel
```

### Delete an Agent

```bash
openclaw agents delete <id>          # Delete an Agent
openclaw agents delete <id> --force  # Force delete (skip confirmation)
```

---

## Skills & Plugins

Skills extend OpenClaw's capabilities — search, scheduling, smart home, and more are all powered by skills. Plugins are a lower-level extension mechanism.

### Skill Management

```bash
openclaw skills list                 # ⭐ List installed skills
openclaw skills list --eligible      # Show only available skills (dependencies satisfied)
openclaw skills list -v              # Show details (including missing dependencies)
openclaw skills list --json          # JSON format
openclaw skills info <name>          # View skill details
openclaw skills check                # Check skill health status
```

> To install new skills, use the `clawhub` CLI, not `openclaw skills`. See [Appendix D: Skill Development & Publishing Guide](/en/appendix/appendix-d).

```bash
# Common clawhub commands
npm i -g clawhub                     # Install clawhub CLI
clawhub search <keyword>             # Search for skills
clawhub install <skillname>          # Install a skill
clawhub list                         # List installed skills
clawhub update --all                 # Update all skills
clawhub uninstall <skillname>        # Uninstall a skill
```

### Plugin Management

```bash
openclaw plugins list                # List installed plugins
openclaw plugins list --json         # JSON format
openclaw plugins info <id>           # View plugin details
openclaw plugins install <path|.tgz|npm-spec>  # Install a plugin
openclaw plugins enable <id>         # Enable a plugin
openclaw plugins disable <id>        # Disable a plugin
openclaw plugins doctor              # Plugin diagnostics
```

---

## Model Management

OpenClaw supports multiple model providers, using the `provider/model-name` format to identify models.

### ⭐ Common Operations

```bash
openclaw models list                 # List available models
openclaw models status               # View the currently used model and its status
openclaw models set <model>          # Switch the default text model
openclaw models set-image <model>    # Switch the default image model
```

### Model Aliases

Find model names too long? Set up aliases:

```bash
openclaw models aliases list                    # View alias list
openclaw models aliases add <alias> <model>     # Add an alias (e.g., gpt → openai/gpt-4o)
openclaw models aliases remove <alias>          # Remove an alias
```

### Model Fallback

Automatically switch to a backup model when the primary model is unavailable:

```bash
openclaw models fallbacks list       # View the fallback chain
openclaw models fallbacks add <model>           # Add a fallback model
openclaw models fallbacks remove <model>        # Remove a fallback model
openclaw models fallbacks clear      # Clear the fallback chain
```

### Model Authentication

```bash
openclaw models auth add             # 🔧 Add model provider authentication
openclaw models auth setup-token     # 🔧 Set up a Token
openclaw models auth paste-token     # 🔧 Paste a Token
openclaw models auth order get|set|clear  # 🔧 Manage provider priority
```

> For model configuration details, see [Chapter 5: Model Management](/en/adopt/chapter5/). For provider comparisons, see [Appendix E: Model Provider Selection Guide](/en/appendix/appendix-e).

---

## Scheduled Tasks

Have OpenClaw automatically execute tasks on a time schedule — morning briefings, timed reminders, data checks, and more.

### ⭐ Common Operations

```bash
openclaw cron list                   # View all scheduled tasks
openclaw cron status                 # Overview of task execution status

# Add a task (three trigger methods):
openclaw cron add --name "Morning Briefing" --cron "0 8 * * *" --message "Today's weather and schedule" --channel "telegram:chat:123"
openclaw cron add --name "Timed Reminder" --every 10m --message "Time to drink water"
openclaw cron add --name "Delayed Task" --at 20m --message "Remind me in 20 minutes"
```

### Manage Tasks

```bash
openclaw cron edit <id>              # Edit a task
openclaw cron rm <id>                # Delete a task (note: rm, not delete)
openclaw cron enable <id>            # Enable a task
openclaw cron disable <id>           # Disable a task
openclaw cron run <id>               # Manually trigger a task immediately
openclaw cron runs                   # View execution history
```

### Channel Format Reference

The `--channel` parameter format varies by platform:

```
telegram:chat:<ChatID>
qqbot:c2c:<openid>
qqbot:group:<groupid>
feishu:chat:<ChatID>
discord:channel:<ChannelID>
```

---

## Message Sending

Send messages directly from the terminal, without going through a chat platform:

### Send a Message

```bash
openclaw message send --target +15555550123 --message "Hello"
```

### Send a Poll

```bash
openclaw message poll \
  --channel discord \
  --target channel:123 \
  --poll-question "What should we have for lunch?" \
  --poll-option "Hot pot" \
  --poll-option "Sushi"
```

### Other Message Operations

```bash
openclaw message react               # Add an emoji reaction
openclaw message reactions            # View reactions
openclaw message read                 # Mark as read
openclaw message edit                 # Edit a message
openclaw message delete               # Delete a message
openclaw message pin                  # Pin a message
openclaw message unpin                # Unpin a message
```

---

## Configuration Operations

OpenClaw's configuration can be read and written directly via CLI (for configuration file structure, see [Appendix G](/en/appendix/appendix-g)).

```bash
openclaw config get <path>           # Read a configuration value
openclaw config get agents.defaults.workspace  # Example: read the default workspace path

openclaw config set <path> <value>   # Set a configuration value
openclaw config set agents.defaults.heartbeat.every "2h"  # Example: set heartbeat interval
openclaw config set tools.profile full                     # Example: set tool configuration
openclaw config set logging.level debug                    # Example: enable debug logging

openclaw config unset <path>         # Delete a configuration value
openclaw config file                 # View the configuration file path
openclaw config validate             # Validate the configuration
openclaw config validate --json      # Output validation results in JSON format
```

> For the complete configuration file reference, see [Appendix G](/en/appendix/appendix-g).

---

## Diagnostics & Debugging

When something goes wrong, troubleshoot in this order: Doctor → Logs → Status → Security Audit.

### ⭐ Step 1: Doctor Diagnosis

```bash
openclaw doctor                      # Automatically detect common issues
openclaw doctor --fix                # Detect and auto-fix
openclaw doctor --deep               # Deep scan
```

### View Logs

```bash
openclaw logs --follow               # ⭐ Stream logs in real time (like tail -f)
openclaw logs --limit 100            # Last 100 log entries
openclaw logs --limit 100 --json     # JSON format (easier to search)
openclaw logs --limit 50 --plain     # Plain text format
```

### View System Status

```bash
openclaw status                      # ⭐ Overview of running status
openclaw status --deep               # Deep health check
openclaw status --json               # JSON format
openclaw status --usage              # Include usage information
```

### 🔧 Security Audit

```bash
openclaw security audit              # Security audit
openclaw security audit --deep       # Deep security scan
openclaw security audit --fix        # Detect and auto-fix security issues
```

### 🔧 Secret Management

```bash
openclaw secrets reload              # Reload secrets
openclaw secrets audit               # Secret security audit
openclaw secrets configure           # Configure secrets
openclaw secrets apply --from <plan.json>  # Batch apply from a plan file
```

> For security-related details, see [Chapter 10: Security Protection & Threat Model](/en/adopt/chapter10/).

---

## Sandbox & Security

### Sandbox Management

Sandboxes provide an isolated runtime environment for Agents, preventing operations from affecting the host system:

```bash
openclaw sandbox list                # List sandbox containers
openclaw sandbox start               # Start a sandbox
openclaw sandbox stop                # Stop a sandbox
```

> For sandbox details, see [Chapter 8: Gateway Operations](/en/adopt/chapter8/) and [Chapter 10: Security Protection](/en/adopt/chapter10/).

### Execution Approvals

Agent execution of sensitive operations requires human approval:

```bash
openclaw approvals list              # View pending approval operations
openclaw approvals approve <id>      # Approve
openclaw approvals deny <id>         # Deny
```

### 🔧 Agent Hooks

```bash
openclaw hooks list                  # List registered Agent Hooks
openclaw hooks add                   # Add a Hook
openclaw hooks remove <id>           # Remove a Hook
```

---

## More Commands

The following commands are used less frequently — consult as needed.

### Memory Management

OpenClaw automatically remembers conversation context. These commands are for manual memory management:

```bash
openclaw memory status               # Memory system status
openclaw memory index                # Manually trigger memory indexing
openclaw memory search "<query>"     # Search memory contents
```

### Device Management

Remote devices (phones, tablets, etc.) require approval when connecting to OpenClaw:

```bash
openclaw devices list                # List all devices
openclaw devices list --json         # JSON format
openclaw devices approve [requestId] # Approve a device
openclaw devices approve --latest    # Approve the latest request
openclaw devices reject <requestId>  # Reject a device
openclaw devices remove <deviceId>   # Remove an authorized device
openclaw devices clear --yes         # Clear all devices
openclaw devices clear --yes --pending  # Clear only pending devices
```

### Browser Management

OpenClaw has a built-in headless browser for web operation skills:

```bash
openclaw browser status              # Browser status
openclaw browser start               # Start the browser
openclaw browser stop                # Stop the browser
openclaw browser reset-profile       # Reset browser profile
openclaw browser tabs                # View open tabs
openclaw browser open <url>          # Open a web page
openclaw browser screenshot          # Take a screenshot
openclaw browser navigate <url>      # Navigate to a specified URL
```

### Session Management

```bash
openclaw sessions list               # List all sessions
openclaw sessions --json             # JSON format
openclaw sessions --verbose          # Detailed information
```

### System Management

```bash
openclaw system event                # View system events
openclaw system heartbeat last       # Time of the last heartbeat
openclaw system heartbeat enable     # Enable heartbeat
openclaw system heartbeat disable    # Disable heartbeat
openclaw system presence             # Online presence status
```

### Backup & Restore

```bash
openclaw backup create               # Create a local backup archive
openclaw backup verify               # Verify backup integrity
openclaw backup list                 # List existing backups
```

### Node Management (Headless Nodes)

Run headless nodes on remote servers, managed and scheduled by the gateway:

```bash
openclaw node start                  # 🔧 Start the Node Host service
openclaw node stop                   # 🔧 Stop the Node Host
openclaw nodes list                  # 🔧 List all nodes managed by the gateway
openclaw nodes pair                  # 🔧 Pair a new node
```

### DNS & Network Discovery

```bash
openclaw dns status                  # 🔧 DNS discovery status (Tailscale + CoreDNS)
```

### Webhooks

```bash
openclaw webhooks list               # 🔧 List configured Webhooks
openclaw webhooks add                # 🔧 Add a Webhook
openclaw webhooks remove <id>        # 🔧 Remove a Webhook
```

### Contacts & Group Lookup

```bash
openclaw directory self              # Look up your own ID
openclaw directory peers             # Look up contact IDs
openclaw directory groups            # Look up group IDs
```

### ACP (Agent Control Protocol)

```bash
openclaw acp status                  # 🔧 ACP protocol status
```

### Shell Auto-completion

```bash
openclaw completion                  # Generate shell completion script (supports bash/zsh/fish)
```

### iOS Pairing

```bash
openclaw qr                         # Generate iOS pairing QR code
```

### Usage Statistics & Cleanup

```bash
openclaw usage today                 # Today's token usage
openclaw usage month                 # Monthly usage
openclaw usage --by-skill            # Usage breakdown by skill

openclaw cleanup --conversations --older-than 7d   # Clean up old conversations
openclaw cleanup --skill-cache       # Clear skill cache
openclaw cleanup --older-than 30d    # Clean up data older than 30 days
```

---

## Shortcut Aliases

Set up short aliases for frequently used commands to avoid typing long commands repeatedly:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias oc='openclaw'
alias oct='openclaw tui'
alias ocg='openclaw gateway'
alias ocs='openclaw skills'
alias oca='openclaw agents'
alias ocd='openclaw dashboard'
alias ocdr='openclaw doctor'
alias occh='openclaw channels'

# One-command start/stop
alias ocstart='openclaw gateway start && openclaw dashboard'
alias ocstop='openclaw gateway stop'
alias ocrestart='openclaw gateway restart'
```

---

## Troubleshooting Quick Reference

| Symptom | Try This First | If That Doesn't Work |
|---------|---------------|----------------------|
| Gateway fails to start | `openclaw doctor --fix` | Check port conflicts: `lsof -i :18789` |
| Dashboard won't open | `openclaw gateway status` | Confirm gateway is running, check firewall |
| Channel won't connect | `openclaw channels status --probe` | Check if Token has expired, view channel logs |
| Model call fails | `openclaw models status` | Verify API Key, check balance |
| Device pairing fails | `openclaw devices list` | Approve pending requests |
| Configuration not taking effect | `openclaw config validate` | Restart gateway: `openclaw gateway restart` |
| TUI can't connect | `openclaw gateway status` | Confirm gateway is running, check port |
| Nothing works | `openclaw doctor --deep` | View logs: `openclaw logs --limit 50` |

---

## Getting Help

Can't remember a command? Add `--help` anywhere:

```bash
openclaw --help                      # All top-level commands
openclaw <command> --help             # Subcommands for a specific command
openclaw channels add --help          # Parameter details for a specific command
```

---

**Note**: This quick reference is compiled from the OpenClaw official CLI Reference. Commands may change with version updates — visit the [OpenClaw official documentation](https://docs.openclaw.ai/cli) for the latest information.
