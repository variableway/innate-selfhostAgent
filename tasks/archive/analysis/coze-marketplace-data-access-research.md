# Coze (扣子) Marketplace Data Access Research

> Research date: 2026-04-16
> Purpose: Comprehensive guide to accessing, scraping, and analyzing Coze's skill/bot/workflow marketplace data.

---

## Executive Summary

Coze (扣子) does NOT provide a public API for browsing or searching the marketplace/store. However, the platform uses internal (undocumented) API endpoints that power its web frontend, and these can be reverse-engineered to scrape marketplace data. One open-source scraping project (lik778/cozn-bot) already demonstrates this approach, and a detailed tutorial on Volcengine shows the complete scraping methodology using Python + DeepSeek.

---

## 1. Does Coze Have a Public API for Accessing Skill/Bot Data?

**Short answer: No public API for the marketplace/store.**

Coze provides two categories of API:

### Official Open API (documented, public)
These APIs are for **managing your own bots/agents** (not for browsing the marketplace):

| API | Endpoint | Purpose | Status |
|-----|----------|---------|--------|
| Publish agent | `/v1/bots/publish` | Publish your own bot | Active |
| Get agent list (deprecated) | `/v1/bots/published_bots` | List YOUR published bots | **DEPRECATED** |
| Chat with bot | `/v3/chat` | Interact with a bot | Active |
| Create conversation | `/v1/conversations/create` | Start a conversation | Active |
| Get plugin detail | Open API | Query plugin metadata | Active |

- **Documentation hub**: https://www.coze.com/open/docs/guides
- **API Playground**: https://www.coze.com/open/docs/developer_guides/api_playground
- **Authentication**: OAuth 2.0 or Personal Access Token (PAT)

### Internal Marketplace API (undocumented, used by frontend)
These are the endpoints the coze.cn website uses internally:

| API | Endpoint | Purpose |
|-----|----------|---------|
| List products (bots) | `/api/marketplace/product/list` | Paginated bot listing |
| Category list | `/api/marketplace/product/category/list` | List all categories |
| Product detail | `/api/marketplace/product/detail` | Get single bot detail |
| Bot version/prompt info | `/api/playground_api/bot_version/get_bot_version_info` | Get prompt, plugins, workflows |

These are **not documented** and require authentication cookies from a logged-in session.

---

## 2. How to Browse and Scrape Coze's Marketplace Listings

### Key Internal API: `/api/marketplace/product/list`

**Full URL**: `https://www.coze.cn/api/marketplace/product/list`

**Method**: GET

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `entity_type` | int | 1 = bots/agents | `1` |
| `keyword` | string | Search keyword (empty = all) | `""` |
| `page_num` | int | Page number (1-based) | `1` |
| `page_size` | int | Items per page (max ~50) | `24` or `50` |
| `sort_type` | int | 1 = recommended, 2 = newest | `1` |
| `source` | int | 1 = recommended feed | `1` |
| `category_id` | string | Category filter (omit for all) | `"7338033313162051635"` |
| `msToken` | string | Anti-bot token from session | (dynamic) |
| `a_bogus` | string | Anti-bot signature | (dynamic) |

**Special category handling**:
- `category_id = "1"` (recommended): remove `category_id` param, set `source=1`
- `category_id = "2"` (newest): remove `category_id` param, set `sort_type=2`

**Response structure** (JSON):
```json
{
  "code": 0,
  "data": {
    "has_more": true,
    "products": [
      {
        "bot_extra": {
          "chat_conversation_count": "145",
          "config": {
            "models": [{"name": "...", "icon_url": "..."}],
            "total_knowledges_count": 1,
            "total_plugins_count": 0,
            "total_workflows_count": 0
          },
          "publish_mode": 2,
          "publish_platforms": [{"name": "豆包", "url": "..."}],
          "user_count": 46
        },
        "meta_info": {
          "category": {"name": "角色", "id": "..."},
          "description": "...",
          "entity_id": "...",
          "entity_type": 1,
          "entity_version": "...",
          "favorite_count": 7,
          "heat": 0,
          "icon_url": "...",
          "id": "...",
          "is_favorited": false,
          "is_free": true,
          "labels": [],
          "listed_at": "...",
          "name": "...",
          "seller": {"name": "...", "avatar_url": "...", "id": "..."},
          "status": 1,
          "user_info": {"name": "...", "user_name": "..."}
        }
      }
    ]
  }
}
```

### Product Detail API: `/api/marketplace/product/detail`

**Full URL**: `https://www.coze.cn/api/marketplace/product/detail`

**Parameters**: `product_id`, `entity_type`

### Bot Prompt/Version API: `/api/playground_api/bot_version/get_bot_version_info`

**Full URL**: `https://www.coze.cn/api/playground_api/bot_version/get_bot_version_info`

**Method**: POST

**Parameters**: `bot_id`, `version`, `scene`

Returns: prompt text, plugin details, workflow configurations, knowledge base info, suggested questions, prologue/opening message.

**Note**: Only available when `publish_mode === 1` (bot has opted to share prompt).

### Category List API: `/api/marketplace/product/category/list`

Returns all categories with IDs:

| Category | ID |
|----------|-----|
| 推荐 (Recommended) | `1` |
| 最新 (Newest) | `2` |
| 角色 (Role-play) | `7338033313162051635` |
| 游戏 (Games) | `7331636528340385830` |
| 学习助手 (Study Assistant) | `7331636528340402214` |
| 休闲娱乐 (Entertainment) | `7331636528340418598` |
| 咨询 (Consulting) | `7331636528340434982` |
| 商业助手 (Business Assistant) | `7331636528340451366` |
| 文本创作 (Text Creation) | `7331636528340467750` |
| 翻译 (Translation) | `7331636528340484134` |
| 图像 (Image) | `7331636528340500518` |
| 视频 (Video) | `7331636528340516902` |
| 音频 (Audio) | `7331636528340533286` |
| 效率工具 (Productivity) | `7331636528340549670` |

### Required Headers for Scraping

The requests require browser-like headers including session cookies:

```
Accept: application/json, text/plain, */*
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Agw-Js-Conv: str
Cookie: (session cookies from logged-in browser)
Referer: https://www.coze.cn/store/bot
User-Agent: Mozilla/5.0 ...
X-Requested-With: XMLHttpRequest
```

**Critical note**: `msToken` and `a_bogus` are anti-bot parameters that change per session. You need to extract these from your browser session (via DevTools Network tab) or generate them programmatically.

### Practical Scraping Approach

**Method 1: Browser session + script** (lik778/cozn-bot approach)
1. Log into coze.cn in Chrome
2. Open DevTools > Network tab
3. Visit `https://www.coze.cn/store/bot`
4. Copy the request headers (including Cookie, msToken, a_bogus)
5. Use those headers in your script
6. Paginate through all pages with delays (3-5 seconds between requests)

**Method 2: Python + requests** (Volcengine tutorial approach)
```python
import requests
import pandas as pd
import time

url_template = "https://www.coze.cn/api/marketplace/product/list?entity_type=1&keyword=&page_num={}&page_size=24&sort_type=1&source=1&msToken=YOUR_TOKEN&a_bogus=YOUR_BOGUS"

headers = {
    "Accept": "application/json, text/plain, */*",
    "Agw-Js-Conv": "str",
    "Referer": "https://www.coze.cn/store/bot",
    "User-Agent": "Mozilla/5.0 ...",
    "X-Requested-With": "XMLHttpRequest",
    "Cookie": "YOUR_COOKIES"
}

all_products = []
for page in range(1, 100):  # adjust upper bound
    url = url_template.format(page)
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        products = data.get('data', {}).get('products', [])
        if not products:
            break
        all_products.extend(products)
        print(f"Page {page}: {len(products)} products")
    time.sleep(5)

df = pd.DataFrame(all_products)
df.to_excel("coze_bots.xlsx", index=False)
```

---

## 3. Available Data Fields Per Bot/Skill

### From the list API (`/api/marketplace/product/list`):

| Field | Path | Description |
|-------|------|-------------|
| Bot name | `meta_info.name` | Display name |
| Description | `meta_info.description` | Text description |
| Category | `meta_info.category.name` | e.g., "角色", "游戏" |
| Creator name | `meta_info.seller.name` | Seller/author name |
| Creator avatar | `meta_info.seller.avatar_url` | Profile image URL |
| User count | `bot_extra.user_count` | Number of users |
| Conversation count | `bot_extra.chat_conversation_count` | Total chat conversations |
| Favorite count | `meta_info.favorite_count` | Number of favorites/likes |
| Heat score | `meta_info.heat` | Popularity score |
| Icon URL | `meta_info.icon_url` | Bot avatar/icon |
| Bot store URL | `https://www.coze.cn/store/bot/{meta_info.id}` | Link to bot page |
| Is free | `meta_info.is_free` | Free or paid |
| Labels | `meta_info.labels` | Tag array |
| Listed date | `meta_info.listed_at` | Unix timestamp |
| Status | `meta_info.status` | Publication status |
| Publish platforms | `bot_extra.publish_platforms` | Array of platforms (Doubao, WeChat, etc.) |
| Models used | `bot_extra.config.models` | Array of LLM models |
| Knowledge count | `bot_extra.config.total_knowledges_count` | Number of knowledge bases |
| Plugin count | `bot_extra.config.total_plugins_count` | Number of plugins |
| Workflow count | `bot_extra.config.total_workflows_count` | Number of workflows |

### From the detail/prompt API (additional fields):

| Field | Description |
|-------|-------------|
| Prompt | The bot's system prompt |
| Opening message | Prologue text |
| Suggested questions | Pre-set user questions |
| Plugin details | Full plugin configuration JSON |
| Workflow details | Full workflow configuration JSON |
| Knowledge base info | Knowledge base configuration |

---

## 4. Existing Tools and Projects for Coze Marketplace Analysis

### Primary: lik778/cozn-bot (GitHub)
- **URL**: https://github.com/lik778/cozn-bot
- **Stars**: 24 | **Forks**: 7
- **Language**: JavaScript (Node.js)
- **Description**: Scrapes all bots from Coze bot store and plugin store, including official bot prompts
- **Files**:
  - `code_store.js` - Scrapes all bots from bot store, paginates by category, saves to CSV/Excel
  - `code_prompt.js` - Scrapes prompt, plugins, workflows for each official bot
  - `code.js` - Processes plugin store JSON data
  - Pre-scraped data files included (as of March 2024)
- **Output**: CSV files, Excel files, Markdown files (for prompts)
- **Method**: Uses internal API endpoints with browser session cookies
- **Status**: Last updated 2024; the API patterns are still valid but tokens expire

### Tutorial: AI Web Crawler with DeepSeek (Volcengine/Tencent Cloud)
- **URL**: https://developer.volcengine.com/articles/7382357371446067209
- **Description**: Step-by-step tutorial showing how to use DeepSeek AI to generate a Python scraping script for Coze marketplace data
- **Method**: Uses `/api/marketplace/product/list` with Python + requests + pandas
- **Output**: Excel file with all bot data
- **Date**: June 2024

### Official SDKs (for bot management, not marketplace browsing):

| SDK | GitHub | Language |
|-----|--------|----------|
| coze-py | https://github.com/coze-dev/coze-py | Python |
| coze-java | https://github.com/coze-dev/coze-java | Java |
| coze-go | https://github.com/coze-dev/coze-go | Go |
| coze-studio | https://github.com/coze-dev/coze-studio | Self-hosted platform |

**Note**: These SDKs cover the official Open API (chat, publish, manage bots) but do NOT include marketplace browsing/search endpoints.

### Coze Studio (Open Source)
- **URL**: https://github.com/coze-dev/coze-studio
- **Wiki**: https://github.com/coze-dev/coze-studio/wiki/6.-API-Reference
- **Relevance**: The open-source version contains a reimplementation of the marketplace plugin listing API in Go (`backend/api/handler/coze/plugin_develop_service.go`). This is the best reference for understanding the internal API structure.

---

## 5. URL Structure of Coze's Stores

### Chinese Version (coze.cn) - Primary marketplace:

| Page | URL |
|------|-----|
| Bot Store (browse) | `https://www.coze.cn/store/bot` |
| Individual bot page | `https://www.coze.cn/store/bot/{bot_id}` |
| Skills Store | `https://www.coze.cn/skills` |
| Plugin Store | `https://www.coze.cn/store/plugin` |
| Workflow Store | `https://www.coze.cn/store/workflow` |
| Explore/Home | `https://www.coze.cn/home` |
| Bot builder | `https://www.coze.cn/space/{space_id}/bot/{bot_id}` |

### International Version (coze.com):

| Page | URL |
|------|-----|
| Explore Store | `https://www.coze.com/store` |
| Individual bot page | `https://www.coze.com/store/bot/{bot_id}` |
| Home/Dashboard | `https://www.coze.com/home` |
| Documentation | `https://www.coze.com/open/docs/guides/coze_store` |

### Documentation URLs:

| Topic | URL |
|-------|-----|
| Store overview (EN) | `https://www.coze.com/open/docs/guides/store` |
| Explore Store guide (EN) | `https://www.coze.com/open/docs/guides/coze_store` |
| Publish to Store (EN) | `https://www.coze.com/open/docs/guides/store_bot` |
| Data analysis (EN) | `https://www.coze.com/open/docs/guides/data` |
| Skills Store docs (CN) | `https://www.coze.cn/open/docs/cozespace/skills_store` |
| Skills overview (CN) | `https://docs.coze.cn/guides/skill_overview` |
| Skill development (CN) | `https://www.coze.cn/open/docs/guides/vibe_coding_skill` |
| Publish skill (CN) | `https://www.coze.cn/open/docs/guides/deploy_skill` |

---

## 6. GitHub Repositories and Open-Source Tools for Coze Analytics

| Repository | Stars | Description | Relevance |
|-----------|-------|-------------|-----------|
| [lik778/cozn-bot](https://github.com/lik778/cozn-bot) | 24 | Scrapes Coze bot store, plugin store, prompts | **Primary tool** - complete scraping code |
| [coze-dev/coze-studio](https://github.com/coze-dev/coze-studio) | High | Open-source Coze platform | Internal API reimplementation in Go |
| [coze-dev/coze-py](https://github.com/coze-dev/coze-py) | High | Official Python SDK | Official Open API (no marketplace browsing) |
| [coze-dev/coze-java](https://github.com/coze-dev/coze-java) | Medium | Official Java SDK | Official Open API |
| [coze-dev/coze-go](https://github.com/coze-dev/coze-go) | Medium | Official Go SDK | Official Open API |
| [lyhue1991/coze](https://github.com/lyhue1991/coze) | - | Coze API usage examples | API integration patterns |

**Important gap**: There is NO dedicated open-source analytics/visualization tool for Coze marketplace data. The lik778/cozn-bot project is the closest, but it only handles data collection (scraping), not analysis or visualization.

---

## 7. Coze Analytics Dashboard for Bot Creators

**Yes, Coze provides a built-in analytics dashboard.**

### Documentation
- **URL**: https://www.coze.com/open/docs/guides/data
- **Chinese**: https://www.coze.cn/open/docs/guides/data

### Available Metrics (from the dashboard)

| Metric | Description |
|--------|-------------|
| Active users | Number of active users per time period |
| User retention | Retention rate over time |
| Conversation count | Total conversations with the bot |
| Message count | Total messages exchanged |
| User satisfaction | Satisfaction scores from interactions |
| Query analytics | Analysis of user queries and dialogue patterns |

### Query Analytics Feature
Coze offers a dedicated **Query Analytics** feature that provides:
- User dialogue history and patterns
- Satisfaction score tracking
- Interaction quality metrics
- Ability to optimize based on user conversations

### Access
- Available to bot creators within the Coze platform
- Not exposed via public API (cannot be scraped externally)
- Only visible to the bot owner/creator
- Located in: Bot management > Data Analysis section

### Limitations
- No public API to access analytics data programmatically
- Data is only available through the Coze web UI
- Only covers your own bots (cannot see other creators' analytics)
- No export API documented

---

## Actionable Methods Summary

### Method 1: Internal API Scraping (Most Effective)
**Best for**: Comprehensive data collection of all marketplace bots

1. Log into coze.cn, extract session cookies and anti-bot tokens
2. Use `/api/marketplace/product/list` with pagination
3. Optionally fetch details via `/api/marketplace/product/detail`
4. Optionally fetch prompts via `/api/playground_api/bot_version/get_bot_version_info`
5. Export to CSV/Excel/JSON

**Limitations**: Session tokens expire; requires logged-in account; anti-bot protection (msToken, a_bogus)

### Method 2: Official SDK (Limited)
**Best for**: Managing your own bots, programmatic chat

1. Use coze-py / coze-java / coze-go SDK
2. Authenticate with PAT or OAuth
3. Use Chat API to interact with bots
4. Use Publish API to manage your bots

**Limitations**: Cannot browse marketplace; cannot list other creators' bots; deprecated agent list API

### Method 3: Coze Studio (Self-Hosted)
**Best for**: Understanding internal API architecture

1. Deploy Coze Studio from https://github.com/coze-dev/coze-studio
2. Examine Go source code for marketplace API implementation
3. Adapt the patterns for your own data collection

**Limitations**: Self-hosted version may differ from coze.cn production APIs

### Method 4: Browser Automation
**Best for**: When API tokens are hard to obtain

1. Use Playwright/Puppeteer to automate browser
2. Navigate to coze.cn/store/bot
3. Scroll through pages and extract data from rendered DOM
4. Handle dynamic loading and pagination

**Limitations**: Slower; more fragile; resource-intensive

---

## Key Risks and Considerations

1. **Terms of Service**: Scraping coze.cn may violate Coze's ToS. Use for personal research/analysis only.
2. **Anti-bot protection**: `msToken` and `a_bogus` parameters are dynamically generated anti-bot signatures that require either browser session extraction or reverse-engineering.
3. **Rate limiting**: Scripts should use delays (3-5 seconds minimum between requests) to avoid account bans.
4. **Cookie expiration**: Session cookies expire, requiring periodic re-authentication.
5. **API stability**: Internal APIs are undocumented and may change without notice.
6. **Data freshness**: Pre-scraped datasets (from lik778/cozn-bot) are from March 2024 and likely outdated.

---

## Sources

- [lik778/cozn-bot - GitHub](https://github.com/lik778/cozn-bot) - Primary scraping tool for Coze marketplace
- [AI Web Crawler: DeepSeek batch extraction of Coze data - Volcengine](https://developer.volcengine.com/articles/7382357371446067209) - Tutorial on scraping Coze with Python
- [Coze Store Overview - Official Docs](https://www.coze.com/open/docs/guides/store)
- [Explore Store - Official Docs](https://www.coze.com/open/docs/guides/coze_store)
- [Publish Bots to Store - Official Docs](https://www.coze.com/open/docs/guides/store_bot)
- [Data Analysis Dashboard - Official Docs](https://www.coze.com/open/docs/guides/data)
- [Get Agent List (deprecated) - Official Docs](https://www.coze.com/open/docs/developer_guides/published_bots_list)
- [API Playground - Official Docs](https://www.coze.com/open/docs/developer_guides/api_playground)
- [Coze Skills Store - Official Docs (CN)](https://www.coze.cn/open/docs/cozespace/skills_store)
- [Skills Overview - Official Docs (CN)](https://docs.coze.cn/guides/skill_overview)
- [coze-dev/coze-studio - GitHub](https://github.com/coze-dev/coze-studio) - Open-source Coze platform
- [coze-dev/coze-py - GitHub](https://github.com/coze-dev/coze-py) - Official Python SDK
- [coze-dev/coze-java - GitHub](https://github.com/coze-dev/coze-java) - Official Java SDK
- [Coze Query Analytics - Times of AI](https://www.timesofai.com/news/coze-unveils-game-changing-query-analytics-for-ai-chatbots/)
- [ByteDance Coze Skills Store Launch - Zhihu](https://zhuanlan.zhihu.com/p/1996589615226840613)
- [Coze Agent Engineering Analysis - Zhihu](https://zhuanlan.zhihu.com/p/707830725)
- [LLM App Store Analysis - ACM](https://dl.acm.org/doi/full/10.1145/3708530)
