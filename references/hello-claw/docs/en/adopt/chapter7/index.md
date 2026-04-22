---
prev:
  text: 'Chapter 6: Agent Management'
  link: '/en/adopt/chapter6'
next:
  text: 'Chapter 8: Gateway Operations'
  link: '/en/adopt/chapter8'
---

# Chapter 7: Tools and Scheduled Tasks

By the end of this chapter, your lobster will be able to find tools on its own, execute scheduled tasks — search the web, control the browser, and automatically send the weather every morning without missing a beat.

> **AutoClaw users**: [AutoClaw](/en/adopt/chapter1/) enables the `full` tool profile by default — no manual configuration needed. This chapter helps you understand the tool system so you can adjust it as needed.

## 0. Tools vs. Skills

The lobster's "brain" is the model (configured in Chapter 2), and **Tools are its "hands"** — without tools it can only chat; with tools it can actually get things done.

|  | Tools | Skills |
|---|---|---|
| **What they are** | Low-level capabilities built into OpenClaw | High-level instructions written by the community or users |
| **Examples** | Run commands, read/write files, search the web | "Send a morning briefing every day", "Summarize a webpage" |
| **Who provides them** | OpenClaw core code | ClawHub skill marketplace / written by users |
| **How to manage** | `openclaw config set tools.*` CLI commands | `clawhub` CLI install/uninstall |

In short: **Tools are the limbs, Skills are the techniques.**

## 1. Tool Profiles

Tool Profiles control what the lobster "can do." On a personal computer, using `full` directly is fine.

| Profile | Capability Scope | Use Case |
|--------|---------|---------|
| `full` | Unrestricted, all tools available | **Recommended** — all-purpose personal computer assistant |
| `coding` | File read/write, command execution, memory, image analysis | For developers only, excludes messaging and browser |
| `messaging` | Send/receive messages, browse sessions, check status | Pure chatbot |
| `minimal` | Status checks only | Minimal permissions |

```bash
# Check current configuration
openclaw config get tools.profile

# Set to full (recommended)
openclaw config set tools.profile full
openclaw gateway restart
```

> If the lobster only gives suggestions without performing actions, the profile is most likely stuck at the old default value `messaging` — just run the commands above to fix it.

::: danger full Mode Security Notice
In `full` mode, OpenClaw can execute any command and read/write any file on your computer. This is fine for personal computers (confirmation is requested before each operation), but **do not use `full` mode on production servers**.
:::

<details>
<summary>Setting a separate profile for a specific Agent</summary>

If you run multiple Agents (e.g., an all-purpose assistant + a customer service bot), you can set a different profile for each Agent:

```json
{
  "tools": { "profile": "full" },
  "agents": {
    "list": [
      {
        "id": "support",
        "tools": { "profile": "messaging", "allow": ["slack"] }
      }
    ]
  }
}
```

The configuration above gives the default Agent all tools, while the `support` Agent can only send/receive messages and use Slack.

</details>

## 2. Built-in Tools Overview

No need to memorize them all — the lobster automatically selects tools. You just need to make sure the profile is set to `full`.

| Category | Tools | Description |
|------|------|------|
| **File Operations** | `read` `write` `edit` `apply_patch` | Read/write files, apply patches in bulk |
| **Command Execution** | `exec` `process` | Run shell commands, manage background processes |
| **Web** | `web_search` `web_fetch` | Search engine queries, fetch webpage content |
| **Browser** | `browser` | Full browser automation (click, type, screenshot) |
| **Messaging** | `message` | Send/receive messages across channels (Feishu/QQ/Telegram, etc.) |
| **Scheduled Tasks** | `cron` | Create and manage scheduled/recurring tasks |
| **Canvas** | `canvas` | Drive the canvas feature of the companion app |
| **Devices** | `nodes` | Discover companion devices, take photos, record screen, get location |
| **Image/PDF** | `image` `pdf` | Analyze image content, parse PDF documents |
| **Gateway** | `gateway` | Restart gateway, view and modify configuration |
| **Sessions** | `sessions_*` `agents_list` | Manage conversation sessions, spawn sub-Agents |

<details>
<summary>Tool Groups (shorthand groupings) quick reference</summary>

OpenClaw provides predefined tool groups for convenient bulk reference in configuration:

| Tool Group | Included Tools |
|--------|-----------|
| `group:fs` | read, write, edit, apply_patch |
| `group:runtime` | exec, bash, process |
| `group:web` | web_search, web_fetch |
| `group:ui` | browser, canvas |
| `group:sessions` | sessions_list / history / send / spawn, session_status |
| `group:memory` | memory_search, memory_get |
| `group:automation` | cron, gateway |
| `group:messaging` | message |
| `group:nodes` | nodes |
| `group:openclaw` | All built-in tools (excluding plugins) |

These group names are used in the permission management sections that follow.

</details>

## 3. Web Search

Want the lobster to tell you today's news or the latest stock prices? Just configure web search.

Launch the wizard with one command:

```bash
openclaw configure --section web
```

The wizard will let you choose a search engine and enter an API Key. Once done, the lobster can query the web in real time.

After configuration, just ask directly in conversation:

```
What's in the tech news today?
Search for the update notes for the latest version of OpenClaw
```

The lobster automatically decides whether to go online — you don't need to specify.

> The `web_fetch` tool can also directly fetch the content of a specified URL and convert it to text. For dynamically rendered pages that require JavaScript, use the browser tool in the next section.

<details>
<summary>Which search engines are supported?</summary>

| Search Engine | Description |
|---------|------|
| **Brave** | Privacy-friendly, generous free tier, recommended for getting started |
| **Perplexity** | AI-enhanced search, high-quality results |
| **Kimi** | Available in China, optimized for Chinese search |
| **Gemini** | Google search capability |
| **Grok** | Search provided by xAI |

</details>

## 4. Browser Automation

Want the lobster to fill out forms, take screenshots, or click buttons? The browser tool is enabled by default — just say what you need:

```
Open Baidu and search for "today's weather", then take a screenshot for me
Open https://example.com, find the login button and click it
```

The lobster will automatically launch Chrome, open the page, identify elements, perform the action, and then take a screenshot for you to confirm.

> Prerequisite: Chrome or Chromium must be installed on the system. Most computers come with it pre-installed.

If the browser is not enabled, run:

```bash
openclaw config set browser.enabled true
openclaw gateway restart
```

<details>
<summary>What operations does the browser support?</summary>

| Operation | Description |
|------|------|
| `status` | Check whether the browser is running |
| `start` / `stop` | Start / stop the browser |
| `open` | Open a specified URL |
| `tabs` / `focus` / `close` | Tab management |
| `snapshot` | Get a page snapshot (identifies interactive elements) |
| `screenshot` | Capture the current page as an image |
| `act` | Interactive operations: click / type / press / hover / drag / fill / resize / wait |
| `navigate` | Forward / back / refresh |
| `console` | View browser console logs |
| `pdf` | Export the current page as PDF |
| `upload` | Upload a file |

`snapshot` has two modes: `ai` (default, Playwright analyzes page structure) and `aria` (returns the accessibility tree). `act` operations need to reference the element numbers returned by `snapshot`.

</details>

<details>
<summary>What if I need to be logged into multiple accounts at the same time?</summary>

Create multiple browser profiles, each with independent cookies and login state:

```json
{
  "browser": {
    "enabled": true,
    "defaultProfile": "chrome",
    "profiles": {
      "chrome": { "port": 18800 },
      "work": { "port": 18801 }
    }
  }
}
```

Specify which one to use in conversation:

```
Open the Feishu document using the work browser
```

Profile naming: lowercase letters + numbers + hyphens, maximum 64 characters. Port range: 18800–18899.

</details>

## 5. Scheduled Tasks (Cron)

Want the lobster to push news to you every morning? You need scheduled tasks.

The simplest example — send a weather forecast every morning at 8:

```bash
openclaw cron add --name "Weather Forecast" --cron "0 8 * * *" \
  --message "Check today's weather and send it to me" \
  --channel "feishu:chat:YourChatID"
```

Three scheduling methods to choose from:

```bash
# Fixed interval: run every 30 minutes
openclaw cron add --name "Periodic Check" --every 30m \
  --message "Check if there's anything I need to handle"

# One-time delay: remind in 20 minutes
openclaw cron add --name "Reminder" --at 20m \
  --message "Reminder: time to take a break!"
```

Manage tasks:

```bash
openclaw cron list                     # List all tasks
openclaw cron run "Weather Forecast"   # Trigger manually once
openclaw cron runs --id <taskID>       # View execution history
openclaw cron disable "Weather Forecast"  # Pause
openclaw cron enable "Weather Forecast"   # Resume
openclaw cron edit <jobId>             # Edit
openclaw cron rm <jobId>               # Delete
```

> Cron tasks depend on the Gateway running continuously. Tasks scheduled during machine downtime will not be retroactively executed; they resume after the Gateway restarts.

> The `--channel` format varies by platform: `feishu:chat:<ChatID>`, `telegram:chat:<ChatID>`, `qqbot:group:<groupid>`. See [Appendix F Command Quick Reference](/en/appendix/appendix-f) for the full format.

<details>
<summary>Cron expression quick reference (`minute hour day month weekday`)</summary>

| Expression | Meaning |
|--------|------|
| `0 8 * * *` | Every day at 8:00 AM |
| `0 9 * * 1-5` | Weekdays (Monday to Friday) at 9:00 AM |
| `*/30 * * * *` | Every 30 minutes |
| `0 20 * * 5` | Every Friday at 8:00 PM |
| `0 0 1 * *` | 1st of every month at midnight |

Not familiar with cron syntax? Using `--every` (recurring interval) or `--at` (one-time delay) is more intuitive.

</details>

## 6. Command Execution (Exec)

`exec` is the core of how the lobster "gets things done" — installing software, processing files, and running scripts all rely on it. Just say what you need:

```
Create a file called hello.txt with today's date and "Hello from OpenClaw!"
Write a number guessing game in Python, save it as game.py and run it
```

The lobster will ask for your confirmation before each execution.

<details>
<summary>exec parameters and background process management</summary>

| Parameter | Description | Default |
|------|------|--------|
| `command` | The command to execute (required) | — |
| `timeout` | Timeout in seconds; terminates after this duration | 1800 (30 minutes) |
| `background` | Run immediately in the background | false |
| `yieldMs` | Automatically move to background after this many milliseconds | 10000 (10 seconds) |
| `pty` | Whether a real terminal is needed | false |

Background commands are managed through the `process` tool:

| Operation | Description |
|------|------|
| `list` | List all background processes |
| `poll` | Get new output and exit status |
| `log` | View output logs |
| `write` | Write input to the process |
| `kill` | Terminate the process |
| `clear` / `remove` | Clean up completed processes |

</details>

<details>
<summary>exec security policy</summary>

The exec tool has three security levels:

| Level | Description |
|------|------|
| `deny` | Completely prohibit command execution |
| `allowlist` | Only allow commands on the whitelist |
| `full` | Allow any command execution (requires user confirmation) |

If you need to restrict the commands the lobster can execute, configure the security level with `openclaw config set tools.exec.security allowlist`. See [Appendix G](/en/appendix/appendix-g) for details.

</details>

## 7. Tool Permission Management

Need to restrict the lobster's capabilities? Use `tools.allow` and `tools.deny` for precise control:

```bash
# Disable the browser
openclaw config set tools.deny '["browser"]'

# Allow only file operations and search
openclaw config set tools.allow '["group:fs", "group:web"]'
```

`deny` takes priority over `allow`. Matching is case-insensitive and supports `*` wildcards.

<details>
<summary>Restrict tools by model provider</summary>

Use `tools.byProvider` to set different permissions for different providers:

```json
{
  "tools": {
    "profile": "coding",
    "byProvider": {
      "google-antigravity": { "profile": "minimal" }
    }
  }
}
```

`byProvider` can only **narrow** permissions — it cannot exceed the scope of the global profile. Supports two levels of granularity: `provider` (e.g., `siliconflow`) or `provider/model` (e.g., `openai/gpt-5.2`).

</details>

<details>
<summary>What if the lobster gets stuck doing the same thing repeatedly?</summary>

Enable tool loop detection:

```json
{
  "tools": {
    "loopDetection": {
      "enabled": true,
      "warningThreshold": 10,
      "criticalThreshold": 20,
      "globalCircuitBreakerThreshold": 30
    }
  }
}
```

The detector recognizes three loop patterns: the same tool called repeatedly, polling with no progress, and two tools alternating back and forth. Disabled by default.

</details>

## 8. Plugin Tools

Not enough built-in tools? OpenClaw supports plugin extensions:

| Plugin | Description |
|------|------|
| **Lobster** | Workflow runtime, supports multi-step tasks and resumable approval flows |
| **LLM Task** | LLM calls in JSON format, for structured output (optional schema validation) |
| **Diffs** | File diff viewer, supports PNG / PDF rendering |
| **Voice Call** | Voice call plugin |
| **Zalo Personal** | Zalo personal account plugin |

For installation and configuration details, see [Appendix G: Configuration File Reference](/en/appendix/appendix-g).

<details>
<summary>How does the AI model "see" the tools?</summary>

OpenClaw makes tools visible to the model through two channels:

1. **System prompt**: Human-readable tool list + usage guide
2. **Tool Schema**: Structured function definitions sent to the model API

Tools blocked by `tools.deny` will not appear in either channel, so the model naturally has no way to call them.

</details>

## 9. Frequently Asked Questions

**The lobster only chats and doesn't perform any actions?**

The tool profile may be stuck at `messaging` or `minimal`:

```bash
openclaw config set tools.profile full
openclaw gateway restart
```

**Web search is unavailable?**

You need to configure a search engine API Key first: `openclaw configure --section web`.

**Browser tool throwing errors?**

First confirm it is enabled (`openclaw config get browser.enabled`), then ensure Chrome or Chromium is installed on the system. Linux servers without a graphical interface require Chromium in headless mode; WSL2 users may need additional configuration — see [Appendix G](/en/appendix/appendix-g) for details.

**Scheduled tasks are not running?**

Check whether the Gateway is running (`openclaw status`). Tasks scheduled during machine downtime will not be retroactively executed.

**How do I see which tools the lobster called?**

In the conversation details of the web control panel (`openclaw dashboard`) you can see every tool call. You can also check the logs:

```bash
openclaw logs --limit 50
```
