---
prev:
  text: 'Appendix F: Command Quick Reference'
  link: '/en/appendix/appendix-f'
next: false
---

# Appendix G: Configuration File Reference

All of OpenClaw's behavior — which model to use, which channels to connect, how often to send heartbeats — is controlled by a single JSON5 configuration file (`~/.openclaw/openclaw.json`). This appendix walks through every configuration block, explaining what each field does and when you'd need to change it.

::: warning Prefer CLI Commands
**The vast majority of configuration can be done via CLI commands** (e.g., `openclaw config set <key> <value>`) — there's no need to edit the JSON file by hand. Manual JSON edits are prone to missing commas, extra brackets, and other mistakes that cause configuration parsing failures and prevent the Gateway from starting.

This appendix is a **developer reference** — use it when you need to understand the complete configuration structure, make bulk changes, or troubleshoot configuration issues. For day-to-day use, manage your configuration through the CLI, the setup wizard (`openclaw onboard`), or the Web dashboard (`openclaw dashboard`).
:::

> **Don't want to write config by hand?** The [OpenClaw Config Generator](https://coclaw.com/openclaw-config-generator/) lets you generate configuration visually, which you can then fine-tune using this reference.

---

## Quick Navigation

| Section | Controls | Common Reasons to Edit |
|---------|----------|------------------------|
| [agents](#i-agent-configuration) | Model selection, workspace, heartbeat, sandbox | Switch models, add Agents, adjust heartbeat frequency |
| [channels](#ii-channel-configuration) | Chat platform connections, DM policy, group chat | Add new platforms, control who can DM |
| [gateway](#iii-gateway-configuration) | Port, bind address, authentication, hot reload | Remote access, add a password, change port |
| [session](#iv-session-configuration) | Session isolation, thread binding, auto-reset | Multi-user scenarios, adjust memory lifecycle |
| [tools](#v-tools-configuration) | Tool profile level, web search | Enable/restrict tools, configure search API |
| [skills](#vi-skills-configuration) | Skill enablement and credentials | Enter API keys after installing a new skill |
| [cron](#vii-cron-configuration) | Concurrency, logging, session retention | Adjust concurrency, log size |
| [hooks](#viii-webhook-configuration) | External event triggers for Agents | Integrate Gmail, GitHub, etc. |
| [bindings](#ix-bindings-configuration) | Agent ↔ channel mapping | Use different Agents for different channels |
| [env](#x-environment-variables) | API keys and other sensitive values | Add keys for new providers |
| [Advanced Features](#xi-advanced-features) | $include, variable substitution, SecretRef | Split large configs, store credentials securely |

---

## Configuration File Location

```
~/.openclaw/openclaw.json          # Main configuration file (JSON5 format)
~/.openclaw/.env                   # Environment variable file (for API keys, etc.)
```

OpenClaw will run even without a configuration file — it uses safe defaults. Run `openclaw config file` to confirm the actual path.

## Overall Configuration Structure

```json5
{
  agents: { ... },           // Agents: model, workspace, heartbeat
  channels: { ... },         // Channels: Telegram / QQ / Feishu, etc.
  gateway: { ... },          // Gateway: port, authentication, hot reload
  session: { ... },          // Session: isolation strategy, auto-reset
  messages: { ... },         // Messages: group chat mention rules
  tools: { ... },            // Tools: enabled level, search configuration
  skills: { ... },           // Skills: enablement and credentials
  cron: { ... },             // Cron: concurrency, logging
  hooks: { ... },            // Webhooks: external event triggers
  bindings: [...],           // Bindings: Agent-to-channel mappings
  env: { ... },              // Environment variables: API keys, etc.
}
```

---

## I. Agent Configuration

Agents are the core of OpenClaw — each Agent has its own model, workspace, and behavior settings.

### 1.1 Default Configuration (agents.defaults)

Default values shared by all Agents; individual Agents can override them.

```json5
{
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",

      // Model: primary model + fallback chain
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["openai/gpt-5.2"]
      },

      // Model directory (lets users switch with the /model command)
      models: {
        "anthropic/claude-sonnet-4-5": { alias: "Sonnet" },
        "openai/gpt-5.2": { alias: "GPT" }
      },

      imageMaxDimensionPx: 1200,     // Maximum image dimension for resizing (pixels)

      // Heartbeat: Agent proactively sends messages on a schedule
      heartbeat: {
        every: "30m",                // Interval: 30m / 2h / 1d
        target: "last",              // Who to message: last (most recent conversation) | specific channel | none
        directPolicy: "allow"        // Whether to allow direct messages: allow | block
      },

      // Sandbox: isolates tool execution environment
      sandbox: {
        mode: "non-main",            // off | non-main (isolate non-primary Agents) | all
        scope: "agent"               // session | agent | shared
      },

      // Tools
      tools: {
        enabled: true,
        profile: "full"
      }
    }
  }
}
```

**Configuration Quick Reference:**

| Field | Type | Default | When to Change |
|-------|------|---------|----------------|
| `workspace` | string | ~/.openclaw/workspace | To store working files in a different directory |
| `model.primary` | string | — | Switch the primary model (format: `provider/model`) |
| `model.fallbacks` | array | [] | Automatically fall back to backup models when primary is unavailable |
| `imageMaxDimensionPx` | number | 1200 | Reduce if images consume too many tokens |
| `heartbeat.every` | string | — | Adjust how often the Agent proactively sends greetings |
| `sandbox.mode` | string | off | Recommend `all` for security-sensitive scenarios |

### 1.2 Multiple Agents (agents.list)

A single OpenClaw instance can run multiple Agents — for example, a "home assistant" and a "work assistant" using different models:

```json5
{
  agents: {
    list: [
      {
        id: "home",
        default: true,                         // Default Agent
        workspace: "~/.openclaw/workspace-home",
        groupChat: {
          mentionPatterns: ["@openclaw", "openclaw"]
        }
      },
      {
        id: "work",
        workspace: "~/.openclaw/workspace-work",
        model: {
          primary: "anthropic/claude-opus-4-6"  // Use a more powerful model for work
        }
      }
    ]
  }
}
```

> Multiple Agents require [Bindings configuration](#ix-bindings-configuration) to specify which Agent responds to which channel.

---

## II. Channel Configuration

Channels determine which chat platforms OpenClaw connects to and who is allowed to interact with it.

### 2.1 Channels and DM Policy

Each channel can independently configure a "who can DM" policy:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",           // DM policy (see table below)
      allowFrom: ["tg:123"],         // Allowlist for allowlist/open modes
    },

    whatsapp: {
      enabled: true,
      allowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true } // Require @ mention in group chats
      }
    },

    discord: {
      enabled: true,
      botToken: "${DISCORD_BOT_TOKEN}",  // Reference an environment variable
      dmPolicy: "pairing",
      allowFrom: ["discord:123"]
    },

    slack: {
      enabled: true,
      botToken: "${SLACK_BOT_TOKEN}",
      dmPolicy: "pairing"
    }
  }
}
```

**DM Policy Options:**

| Policy | Behavior | Use Case |
|--------|----------|----------|
| `pairing` | Strangers receive a pairing code; admin approval required | Personal use (recommended) |
| `allowlist` | Only allowlisted users can DM | Small teams |
| `open` | Anyone can DM (requires `allowFrom: ["*"]`) | Public services |
| `disabled` | All DMs are ignored | Group-chat-only scenarios |

### 2.2 Group Chat Mention Gating

In group chats, the Agent does not respond to every message by default — it must be @-mentioned to reply:

```json5
{
  agents: {
    list: [{
      id: "main",
      groupChat: {
        mentionPatterns: ["@openclaw", "openclaw"]  // Trigger words
      }
    }]
  },
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true }   // Require @ in all groups
      }
    }
  }
}
```

> For full channel configuration details, see [Chapter 4: Chat Provider Configuration](/en/adopt/chapter4/).

---

## III. Gateway Configuration

The Gateway is OpenClaw's background service process; all message sending and receiving passes through it.

```json5
{
  gateway: {
    port: 18789,                      // Listening port
    bind: "loopback",                 // Bind address
    auth: {
      mode: "token",                  // Authentication mode
      token: "${OPENCLAW_GATEWAY_TOKEN}",
      password: "${OPENCLAW_GATEWAY_PASSWORD}",
      allowTailscale: true            // Skip authentication for Tailscale connections
    },
    tailscale: {
      mode: "off",                    // off | serve | funnel
      resetOnExit: false
    },
    reload: {
      mode: "hybrid",                // Reload strategy when configuration changes
      debounceMs: 300
    }
  }
}
```

**Bind Address — Controls Who Can Connect:**

| Value | Accessible From | Security |
|-------|----------------|----------|
| `loopback` | Local machine only (127.0.0.1) | Most secure (default) |
| `lan` | All devices on the local network | Use with authentication |
| `tailnet` | Tailscale virtual network | End-to-end encrypted |
| `auto` | Auto-detected | — |
| `custom` | Custom address | Depends on configuration |

**Hot Reload Mode — Whether to Restart After Config Changes:**

| Mode | Behavior | When to Choose |
|------|----------|----------------|
| `hybrid` | Safe changes applied immediately; critical changes trigger automatic restart | Recommended (default) |
| `hot` | Hot-apply only; logs when a restart would be needed | When you don't want interruptions |
| `restart` | Restart on any change | For consistency |
| `off` | Do not watch for configuration file changes | Manual management |

> For Gateway management, see [Chapter 8](/en/adopt/chapter8/). For remote access, see [Chapter 9](/en/adopt/chapter9/).

---

## IV. Session Configuration

Sessions determine which conversations share the same context.

```json5
{
  session: {
    dmScope: "per-channel-peer",      // Session isolation granularity

    threadBindings: {                 // Thread binding (for platforms with threads, e.g. Discord/Slack)
      enabled: true,
      idleHours: 24,                  // Hours before an idle thread is unbound
      maxAgeHours: 0                  // 0 = no maximum age limit
    },

    reset: {                          // Automatic session reset
      mode: "daily",                  // daily | idle | manual
      atHour: 4,                      // daily mode: hour of day to reset (24h format)
      idleMinutes: 120                // idle mode: minutes of inactivity before reset
    }
  }
}
```

**Session Isolation Granularity — Affects "Who Shares Memory With Whom":**

| Value | Isolation | Use Case |
|-------|-----------|----------|
| `main` | Everyone shares one session | Single user |
| `per-peer` | One session per user | Simple multi-user |
| `per-channel-peer` | One session per user per platform | Multi-platform, multi-user (recommended) |
| `per-account-channel-peer` | One session per account × platform × user | Multi-Agent, multi-platform |

---

## V. Tools Configuration

Controls which tools the Agent can use (search, coding, file operations, etc.).

```json5
{
  tools: {
    profile: "full",                  // Tool profile level
    enabled: true,
    web: {
      search: {
        apiKey: "${BRAVE_API_KEY}"    // API key required for web search
      }
    }
  }
}
```

**Tool Profile Levels — From Fewest to Most Tools:**

| Profile | Included Tools | Use Case |
|---------|---------------|----------|
| `messaging` | Chat only, no tools | Pure conversation |
| `default` | Basic toolset | Everyday use |
| `coding` | Programming toolset | Developers |
| `full` | Complete toolset | Full-featured (recommended) |
| `all` | All tools (including experimental) | Early adopters |

---

## VI. Skills Configuration

After installing a skill, some skills require an API key to be entered in the configuration before they can be enabled.

```json5
{
  skills: {
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: {
          source: "file",
          provider: "filemain",
          id: "/skills/entries/nano-banana-pro/apiKey"
        }
      }
    }
  }
}
```

> Use the `clawhub` CLI to manage skills. See [Appendix D: Skill Development and Publishing Guide](/en/appendix/appendix-d).

---

## VII. Cron Configuration

Controls global behavior for scheduled (cron) tasks.

```json5
{
  cron: {
    enabled: true,
    maxConcurrentRuns: 2,             // Maximum number of tasks to run concurrently
    sessionRetention: "24h",          // How long to retain task sessions
    runLog: {
      maxBytes: "2mb",                // Maximum log file size
      keepLines: 2000                 // Number of recent lines to retain
    }
  }
}
```

> For adding, removing, and managing cron tasks, see [Appendix F: Command Quick Reference](/en/appendix/appendix-f#cron-tasks).

---

## VIII. Webhook Configuration

Allows external services (Gmail, GitHub, IoT sensors, etc.) to trigger Agent tasks via HTTP.

```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",           // Authentication token (callers must include this)
    path: "/hooks",                   // Webhook path prefix
    defaultSessionKey: "hook:ingress",
    allowRequestSessionKey: false,
    allowedSessionKeyPrefixes: ["hook:"],
    mappings: [
      {
        match: { path: "gmail" },     // Matches /hooks/gmail
        action: "agent",
        agentId: "main",
        deliver: true                 // Deliver results to a channel
      }
    ]
  }
}
```

> For example, when a new Gmail message arrives, the Agent can automatically summarize it and push it to Telegram.

---

## IX. Bindings Configuration

In multi-Agent scenarios, bindings determine which Agent handles messages from which channel.

```json5
{
  bindings: [
    {
      agentId: "home",
      match: {
        channel: "whatsapp",
        accountId: "personal"         // Personal WhatsApp → home Agent
      }
    },
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        accountId: "biz"              // Work WhatsApp → work Agent
      }
    }
  ]
}
```

---

## X. Environment Variables

Do not write sensitive values like API keys directly in the configuration file — store them in a `.env` file or as environment variables, and reference them in the config using `${VAR}`.

```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",  // Set value directly (not recommended; use .env instead)
    vars: {
      GROQ_API_KEY: "gsk-..."         // Additional variables
    },
    shellEnv: {
      enabled: true,                  // Inherit variables from the shell environment
      timeoutMs: 15000
    }
  }
}
```

**Environment Variable Load Priority** (first match wins):

1. Parent process environment variables (e.g., those passed in by systemd)
2. `.env` file in the current working directory
3. `~/.openclaw/.env` file (global fallback)

> Existing environment variables are never overwritten.

---

## XI. Advanced Features

The following features are only needed for more complex configurations — beginners can skip this section.

### 11.1 Configuration Splitting ($include)

Is your config file getting too long? Use `$include` to split it into multiple files:

```json5
// ~/.openclaw/openclaw.json
{
  gateway: { port: 18789 },
  agents: {
    $include: "./agents.json5"        // Single file: replaces the entire object
  },
  broadcast: {
    $include: [
      "./clients/a.json5",           // Multiple files: deep-merged in order
      "./clients/b.json5"
    ]
  }
}
```

**Merge Rules:**
- Single file include: replaces the current object
- Multiple file include: deep-merged in order; later files take precedence
- Same-level keys: values in the parent config override included values
- Nested includes: up to 10 levels deep
- Paths: resolved relative to the current file

### 11.2 Environment Variable Substitution

String values in the configuration can reference environment variables:

```json5
{
  gateway: {
    auth: {
      token: "${OPENCLAW_GATEWAY_TOKEN}"     // Entire value from variable
    }
  },
  models: {
    providers: {
      custom: {
        baseUrl: "${API_BASE}/v1"            // Inline concatenation
      }
    }
  }
}
```

**Notes:**
- Variable names must match uppercase letters and underscores only: `[A-Z_][A-Z0-9_]*`
- If a variable is missing or empty, loading will fail (to prevent misconfiguration)
- Escaping: `$${VAR}` outputs the literal string `${VAR}`
- Variable substitution also works inside `$include` files

### 11.3 SecretRef Credentials

For scenarios with stricter security requirements, you can use SecretRef to retrieve credentials from external systems:

```json5
{
  models: {
    providers: {
      openai: {
        apiKey: {
          source: "env",              // Read from environment variable
          provider: "default",
          id: "OPENAI_API_KEY"
        }
      }
    }
  },
  skills: {
    entries: {
      "nano-banana-pro": {
        apiKey: {
          source: "file",             // Read from file
          provider: "filemain",
          id: "/skills/entries/nano-banana-pro/apiKey"
        }
      }
    }
  },
  channels: {
    googlechat: {
      serviceAccountRef: {
        source: "exec",              // Read from command output (e.g., Vault)
        provider: "vault",
        id: "channels/googlechat/serviceAccount"
      }
    }
  }
}
```

**Source Types:**

| Type | Source | Use Case |
|------|--------|----------|
| `env` | Environment variable | Simple scenarios (recommended default) |
| `file` | File contents | Kubernetes Secret mounts |
| `exec` | Command execution output | HashiCorp Vault and other secret managers |

> For security-related details, see [Chapter 10: Security and Threat Model](/en/adopt/chapter10/).

---

## XII. Complete Configuration Examples

Not sure where to start? Find the template closest to your situation, copy it, and modify as needed.

### Minimal Configuration — Just Installed, Get It Working

```json5
// ~/.openclaw/openclaw.json
{
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace"
    }
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"]
    }
  }
}
```

### Local Development — Use a Local Model, No Cost

```json5
{
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      model: {
        primary: "ollama/llama3.2"
      }
    }
  },
  gateway: {
    port: 18789,
    bind: "loopback",
    auth: {
      mode: "token",
      token: "dev-token"
    }
  }
}
```

### Server Deployment — Remote Access + Model Fallback

```json5
{
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["openai/gpt-5.2"]         // Automatically fall back if primary is unavailable
      }
    }
  },
  channels: {
    telegram: {
      enabled: true,
      botToken: "${TELEGRAM_BOT_TOKEN}",
      dmPolicy: "pairing"
    }
  },
  gateway: {
    port: 18789,
    bind: "lan",                               // Accessible on the local network
    auth: {
      mode: "password",
      password: "${GATEWAY_PASSWORD}"
    }
  },
  session: {
    dmScope: "per-channel-peer"                // Independent session per user
  }
}
```

### Multiple Agents — Home and Work Separated

```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-5" }
    },
    list: [
      {
        id: "home",
        default: true,
        workspace: "~/.openclaw/workspace-home"
      },
      {
        id: "work",
        workspace: "~/.openclaw/workspace-work",
        model: { primary: "anthropic/claude-opus-4-6" }
      }
    ]
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } }
  ]
}
```

---

## XIII. Ways to Edit Configuration

Four ways to modify configuration — use whichever you prefer:

| Method | Command / Action | Best For |
|--------|-----------------|----------|
| Interactive wizard | `openclaw onboard` or `openclaw configure` | Initial setup |
| CLI command | `openclaw config set/get/unset` | Changing a single value |
| Web dashboard | Open `http://127.0.0.1:18789` → Config tab | Visual editing |
| Direct file edit | Edit `~/.openclaw/openclaw.json` | Bulk changes |

```bash
# CLI examples
openclaw config get agents.defaults.workspace      # Read a value
openclaw config set agents.defaults.heartbeat.every "2h"  # Set a value
openclaw config unset tools.web.search.apiKey       # Delete a value
openclaw config file                                # View the config file path
openclaw config validate                            # Validate the configuration
```

> After editing the file directly, the Gateway will automatically detect the change and apply it (depending on the [hot reload mode](#iii-gateway-configuration)).

---

## XIV. Important Notes

### Strict Validation

OpenClaw only accepts configurations that fully conform to the schema. Misspelled field names, incorrect value types, or unrecognized keys will cause the Gateway to **refuse to start**.

When a startup failure occurs:
1. Run `openclaw doctor` to see exactly what went wrong
2. Run `openclaw doctor --fix` to attempt automatic repair
3. At this point, only diagnostic commands are available: `openclaw doctor`, `openclaw logs`, `openclaw health`, `openclaw status`

### Hot Reload Scope

Changing configuration does not always require a restart. Most changes take effect immediately; only core Gateway parameters require a restart:

| No Restart Needed (Hot Reload) | Requires Restart |
|-------------------------------|-----------------|
| Channels `channels.*` | Gateway port, bind address, authentication `gateway.*` |
| Agents / Models `agents.*` `models.*` | Plugins `plugins` |
| Cron tasks `cron` / Webhooks `hooks` | Service discovery `discovery` |
| Session / Messages / Tools / Skills / Logging | — |

> Exception: Changes to `gateway.reload` and `gateway.remote` do not trigger a restart.

---

**Note**: This configuration reference is based on the official OpenClaw documentation. Configuration fields may change across versions. For the complete reference, visit [OpenClaw Configuration](https://docs.openclaw.ai/gateway/configuration).
