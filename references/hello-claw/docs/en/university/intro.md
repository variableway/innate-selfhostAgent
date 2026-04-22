---
title: "Claw University: Intro & Skills Elective Guide"
---

Claw University is a night school for people who already have their lobster up and running.

After installing a few Skills, most people run into the same problem:
You can install them, you can run commands, but it still does not quite feel like "it is actually helping me do more real work."
The Skills marketplace is like a giant supermarket. There are shelves everywhere, it is easy to browse until you are exhausted, and still hard to know which few things you should bring home first.

Claw University does one thing: pick a few representative scenarios and clearly explain how to start using a small set of Skills together.
Each article follows one concrete thread: from the use case, to which Skills to install, to how to connect them into a reusable workflow.

To find Skills, you can go directly to [ClawHub](https://clawhub.ai/) or [Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories).

The whole section can be summarized in one sentence:
Install fewer Skills, seriously run through a few real scenarios, and make your lobster reliable and useful.

## Skills in Practice: Scenario Index and Selection Principles

This section collects skill combinations and real deployment flows organized by scenario. The goal is to build reusable automation loops with as few Skills as possible.

Skills come from two entry points: the original **ClawHub** and **Chinese ClawHub (Tencent SkillHub)**.

[Open ClawHub](https://clawhub.ai/) | [Open Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories)

Do not install too many Skills at once. Too many will crowd the context window, slow responses down, weaken judgment, and make debugging more expensive.
The goal is simple: choose by scenario, and prioritize stability and maintainability first.

## 1. The First Recommendation: Learn ClawHub First

If you remember only one method, remember this:

1. Go to [ClawHub](https://clawhub.ai/) or [Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories) and search by category
2. Install with `clawhub install <skill-slug>`
3. Run one real task immediately after installing

```bash
clawhub install <skill-slug>
```

ClawHub is the "skill dock" of OpenClaw: upload, versioning, discovery, and installation all revolve around it. Use either the global entry or the Chinese entry as needed.
If you want a more systematic category map and examples, go straight to the community-maintained collection:

- [awesome-openclaw-skills (5,000+ categorized skills)](https://github.com/VoltAgent/awesome-openclaw-skills)
- [ClawHub](https://clawhub.ai/)
- [Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories)

If you do not want to install the CLI globally, you can also use a one-off command:

```bash
npx clawhub@latest install <skill-slug>
```

You can also search these keywords online to get started quickly:

- `clawhub install`
- `clawhub skills`
- `clawhub openclaw`

## 2. Course Selection Principles: The Shortest Path to a Stronger Lobster

- Beginners should keep **5 to 10** high-frequency Skills installed
- Install the "foundation Skills" first: search, browser, code repository, knowledge base, calendar and email
- Every time you add 1 new Skill, run it once on a real task
- Clean up rarely used Skills weekly to avoid context pollution

## 3. Skill Menu: Order by Category

Below is a menu-style shortlist organized by the category logic from `list.md`.
Each category starts with a few representative Skills that are quick to learn and highly reusable. For the complete list, use the Awesome collection or ClawHub.

| Category (`list.md`) | Recommended short list (examples) | Best for |
|---|---|---|
| Coding Agents & IDEs (1222) | `github`, `code-reviewer`, `git-ops` | Daily development, PR reviews, repository collaboration |
| Browser & Automation (335) | `agent-browser`, `playwright`, `summarize` | Web scraping, form automation, information extraction |
| Productivity & Tasks (206) | `todoist`, `notion`, `obsidian` | Task management, knowledge capture, personal workflows |
| Communication (149) | `slack`, `agentmail`, `gog` | Messaging, email workflows, team coordination |
| Search & Research (350) | `tavily-search`, `hackernews`, `summarize` | Web search, news tracking, rapid research |
| DevOps & Cloud (409) | `devops`, `aws-infra`, `azure-devops` | Deployment, cloud resource management, pipelines |
| Web & Frontend Development (938) | `agent-browser`, `playwright`, `github` | Frontend integration, UI testing, automated regression |
| Calendar & Scheduling (65) | `caldav-calendar`, `gog`, `todoist` | Scheduling, conflict detection, reminders |
| Notes & PKM (71) | `obsidian`, `notion`, `summarize` | Note archiving, knowledge linking, long-term memory |
| Security & Passwords (53) | `skill-vetter`, `1password`, `amai-id` | Skill security checks, risk alerts |
| PDF & Documents (111) | `summarize`, `add-watermark-to-pdf`, `agentmail` | Document summaries, report processing, attachment workflows |
| Smart Home & IoT (43) | `home-assistant`, `weather`, `gog` | Home automation, life assistant integrations |

## 4. Recommended Course Plan

### 4.1 Starter Kit of 5

```bash
clawhub install skill-vetter
clawhub install tavily-search
clawhub install agent-browser
clawhub install github
clawhub install gog
```

### 4.2 Advanced Add-ons: Pick One or Two by Need

- Content creation: `x-api`, `linkedin`, `blogburst`
- DevOps engineering: `devops`, `aws-infra`, `azure-devops`
- Personal assistant: `weather`, `caldav-calendar`, `agentmail`

## 5. Deeper Learning Paths

- Full category map and large-scale skill library:
  [awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- Skill publishing, versioning, and installation:
  [ClawHub](https://clawhub.ai/) | [Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories)
- The tools chapter in this tutorial, covering toolsets, scheduled tasks, and web search:
  [Chapter 7: Tools and Scheduled Tasks](/en/adopt/chapter7/)
- Skill development and publishing workflow:
  [Appendix D: Skill Development and Publishing Guide](/en/appendix/appendix-d)

**One-sentence graduation requirement**: The key to making your lobster useful is not installing the most Skills, but installing the most suitable ones.
Pick 5 from this menu, get your first automation loop running, and then keep adding.

## 6. `awesome-openclaw-skills` Example Bundles

The following set is a "copy directly" shortlist selected from [awesome-openclaw-skills (5,000+ categorized skills)](https://github.com/VoltAgent/awesome-openclaw-skills). It gives you a first batch of candidates organized by scenario.

### 6.1 Development Collaboration (Coding + PR)

- [`github`](https://clawhub.ai/steipete/github): query and operate repositories, issues, PRs, and releases
- [`code-reviewer`](https://clawhub.ai/skills?nonSuspicious=true&q=code-reviewer): review changes and surface risks
- [`git-ops`](https://clawhub.ai/skills?nonSuspicious=true&q=git-ops): automate common Git workflows
- [`summarize`](https://clawhub.ai/skills?nonSuspicious=true&q=summarize): quickly summarize PRs and docs

Example task:

```text
Help me review the high-priority issues created in this repository over the last 7 days, suggest a repair priority order, and generate a PR review checklist.
```

### 6.2 Research and Search (Search + Browser)

- [`tavily-search`](https://clawhub.ai/bert-builder/tavily): search the web for current information
- [`hackernews`](https://clawhub.ai/skills?nonSuspicious=true&q=hackernews): aggregate technical news
- [`agent-browser`](https://clawhub.ai/thesethrose/agent-browser): execute browser steps and extract structured content
- [`summarize`](https://clawhub.ai/skills?nonSuspicious=true&q=summarize): compress long content and extract the key points

Example task:

```text
Help me research articles from the last 3 months about "OpenClaw multi-agent orchestration," organize them into a comparison table, and give me implementation advice.
```

### 6.3 Personal Productivity (Calendar + Email + Tasks)

- [`caldav-calendar`](https://clawhub.ai/asleep123/caldav-calendar): query schedules and detect conflicts
- [`agentmail`](https://clawhub.ai/adboio/agentmail): email send/receive workflows
- [`todoist`](https://clawhub.ai/skills?nonSuspicious=true&q=todoist): task breakdown and tracking
- [`gog`](https://clawhub.ai/skills?nonSuspicious=true&q=gog): Google ecosystem coordination for Gmail, Calendar, and Drive

Example task:

```text
Send me a "daily briefing" every morning at 9:00 with schedule conflicts, my top 3 tasks, and the important unread emails from last night.
```

### 6.4 Operations Automation (DevOps + Cloud)

- [`devops`](https://clawhub.ai/tkuehnl/agentic-devops): script common operations actions
- [`aws-infra`](https://clawhub.ai/skills?nonSuspicious=true&q=aws-infra): inspect AWS resources
- [`azure-devops`](https://clawhub.ai/pals-software/azure-devops): integrate pipelines and project management
- [`playwright`](https://clawhub.ai/skills?nonSuspicious=true&q=playwright): regression checks for web consoles

Example task:

```text
Run a production environment inspection every Monday: certificate expiry, instance health, and failed pipelines, then generate repair suggestions.
```

### 6.5 Security and Risk Control

- [`skill-vetter`](https://clawhub.ai/spclaudehome/skill-vetter): security health check before installing Skills
- [`1password`](https://clawhub.ai/skills?nonSuspicious=true&q=1password): credential storage and retrieval
- [`amai-id`](https://clawhub.ai/skills?nonSuspicious=true&q=amai-id): identity and risk verification
- [`summarize`](https://clawhub.ai/skills?nonSuspicious=true&q=summarize): summarize security advisories and vulnerability notices

Example task:

```text
Before installing any new Skill, run a risk scan first and output one of three results: safe to install, needs manual review, or do not install.
```

### 6.6 Document Processing (PDF + Knowledge)

- [`add-watermark-to-pdf`](https://clawhub.ai/skills?nonSuspicious=true&q=add-watermark-to-pdf): batch process PDFs
- [`agentmail`](https://clawhub.ai/adboio/agentmail): attachment routing
- [`obsidian`](https://clawhub.ai/skills?nonSuspicious=true&q=obsidian): preserve notes and knowledge
- [`notion`](https://clawhub.ai/tyler6204/better-notion): sync to a team knowledge base

Example task:

```text
Apply a watermark to all PDF reports received this week, summarize them, and sync them to the "weekly-report-materials" folders in Notion and Obsidian.
```
