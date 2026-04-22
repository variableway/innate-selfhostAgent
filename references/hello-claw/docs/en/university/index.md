# Skills in Practice: Scenario Index and Selection Principles

This section collects skill combinations and deployment workflows organized by scenario. The goal is to run reusable automation loops with as few skills as possible.

Skills come from two sources: **ClawHub (original)** and **Chinese ClawHub (Tencent SkillHub)**.

[Open ClawHub (original)](https://clawhub.ai/) | [Open Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories)

Keep your skill count low. Installing too many skills crowds the context window, leading to slower responses, weaker judgment, and higher debugging costs.
One goal only: select by scenario, prioritize stability and maintainability first.

## 1. Top Recommendation: Learn to Use ClawHub First

If you only remember one thing, remember this:

1. Go to [ClawHub (original)](https://clawhub.ai/) or [Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories) and search for skills by category
2. Install with `clawhub install <skill-slug>`
3. Immediately test with a real task after installing

```bash
clawhub install <skill-slug>
```

ClawHub is the "skill dock" for OpenClaw skills: uploading, versioning, searching, and installing all happen through it. You can use either the original or Chinese entry point as needed.
For a more systematic category index with examples, check the community-curated repository directly:

- [awesome-openclaw-skills (5,000+ categorized skills)](https://github.com/VoltAgent/awesome-openclaw-skills)
- [ClawHub (original)](https://clawhub.ai/)
- [Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories)

If you prefer not to install the CLI globally, you can also use a one-off command:

```bash
npx clawhub@latest install <skill-slug>
```

You can also search these keywords online to get started quickly:

- `clawhub install`
- `clawhub skills`
- `clawhub openclaw`

## 2. Selection Principles: The Shortest Path to a Stronger Claw

- Beginners should keep **5–10** high-frequency skills active at all times
- Install "chassis skills" first: search, browser, code repository, knowledge base, calendar/email
- For every new skill added, run it through a real task first
- Clear out rarely used skills weekly to avoid context pollution

## 3. The Skills Menu (Order by Category)

Below is a menu-style summary organized by the category structure from `list.md`.
Each category lists a few representative skills that are quick to pick up and highly reusable. For the full list, see the Awesome index or ClawHub.

| Category (list.md) | Recommended skills (examples) | Best for |
|---|---|---|
| Coding Agents & IDEs (1222) | `github`, `code-reviewer`, `git-ops` | Daily development, PR reviews, repo collaboration |
| Browser & Automation (335) | `agent-browser`, `playwright`, `summarize` | Web scraping, form automation, information extraction |
| Productivity & Tasks (206) | `todoist`, `notion`, `obsidian` | Task management, knowledge capture, personal workflows |
| Communication (149) | `slack`, `agentmail`, `gog` | Messaging, email handling, team coordination |
| Search & Research (350) | `tavily-search`, `hackernews`, `summarize` | Web search, news tracking, quick research |
| DevOps & Cloud (409) | `devops`, `aws-infra`, `azure-devops` | Deployment, cloud resource management, pipelines |
| Web & Frontend Development (938) | `agent-browser`, `playwright`, `github` | Frontend integration, UI testing, automated regression |
| Calendar & Scheduling (65) | `caldav-calendar`, `gog`, `todoist` | Scheduling, conflict detection, reminders |
| Notes & PKM (71) | `obsidian`, `notion`, `summarize` | Note archiving, knowledge linking, long-term memory |
| Security & Passwords (53) | `skill-vetter`, `1password`, `amai-id` | Skill security checks, risk alerts |
| PDF & Documents (111) | `summarize`, `add-watermark-to-pdf`, `agentmail` | Document summaries, report processing, attachment workflows |
| Smart Home & IoT (43) | `home-assistant`, `weather`, `gog` | Home automation, life assistant integrations |

## 4. Suggested Curriculum (Copy Directly)

### 4.1 Starter Kit of 5

```bash
clawhub install skill-vetter
clawhub install tavily-search
clawhub install agent-browser
clawhub install github
clawhub install gog
```

### 4.2 Advanced Add-ons (Pick One or Two as Needed)

- Content creation: `x-api`, `linkedin`, `blogburst`
- DevOps engineering: `devops`, `aws-infra`, `azure-devops`
- Personal assistant: `weather`, `caldav-calendar`, `agentmail`

## 5. Further Learning

- Full category index and large skill library:
  [awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- Skill publishing, versioning, and installation:
  [ClawHub (original)](https://clawhub.ai/) | [Chinese ClawHub (Tencent SkillHub)](https://skillhub.tencent.com/#categories)
- Tools chapter in this tutorial (toolsets, scheduled tasks, web search):
  [Chapter 7: Tools and Scheduled Tasks](/en/adopt/chapter7/)
- Skill development and publishing workflow:
  [Appendix D: Skill Development and Publishing Guide](/en/appendix/appendix-d)
- Skill development in practice (local health management):
  [Skill Development in Practice: Local Health Management Assistant](/en/university/local-health-assistant/)

**One-sentence graduation requirement**: The key to making the claw "useful" is not installing the most skills, but installing the right ones.
Pick 5 from this menu first, get your own first automation loop running, then keep adding.

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
