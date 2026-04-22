# 🦞 Lobster Review: Which Use Case Actually Holds Up?

This page addresses one question: **among all the "lobster applications," which scenarios are the most reliable, most cost-effective, and worth committing to long-term?**

To avoid gut-feel recommendations, every scenario on this page is rated using the same consistent rubric, and results are updated continuously based on real testing.

> It's recommended to read [Chapter 7: Introduction to the Skill System](/en/adopt/chapter7/) and [Chapter 9: Multi-Model and Cost Optimization](/en/adopt/chapter9/) before this page — doing so will sharpen your judgment.

---

## 1. Rating Criteria (Unified Rubric)

Each application scenario is scored across 5 dimensions (maximum 5 points each):

| Dimension | What It Measures | Weight |
|---|---|---|
| Success Rate | How many of 10 tasks complete reliably | 30% |
| Response Speed | Time from initiation to usable result | 20% |
| Cost | Token / API spend per task | 20% |
| Maintainability | Configuration complexity and troubleshooting difficulty | 15% |
| Automation Potential | Whether it can run unattended long-term | 15% |

> Final score = weighted sum of each dimension's score.
> For enterprise deployments, consider raising the "Maintainability" weight to 25%.

---

## 2. Quick Conclusions (Current Version)

The following recommendations reflect the current version and can serve as a roadmap for "what to tackle first":

| Application Type | Recommendation | One-Line Verdict |
|---|---|---|
| Morning Briefing / Information Aggregation | ⭐⭐⭐⭐⭐ | Low cost, high value — the best place for beginners to start |
| Development Assistance (Code Review / Docs) | ⭐⭐⭐⭐☆ | Clear productivity gains, but requires careful prompting and scope control |
| Content Creation (Topic Selection / Drafting) | ⭐⭐⭐⭐☆ | Fast output, but human oversight of style and facts is necessary |
| Customer Service / Automated Replies | ⭐⭐⭐☆☆ | High value but high risk — review and fallback mechanisms are mandatory |

---

## 3. Per-Scenario Reviews

### 3.1 Morning Briefing / Information Aggregation

- Best for: Personal productivity users, managers, content operators
- Strengths: Stable structured output, strong cross-source synthesis
- Risks: Output quality is directly determined by the quality of input sources
- Recommendation: Start with "read-only automation" — avoid triggering external write operations directly

### 3.2 Development Assistance (Code Review / Documentation Updates)

- Best for: Developers, small-team tech leads
- Strengths: Significant time savings on repetitive tasks, especially initial PR triage
- Risks: False positives and false negatives both exist — cannot replace final human review
- Recommendation: Default to suggestions only; do not auto-merge or auto-modify the main branch

### 3.3 Content Creation (Topic Selection / Drafting / Rewriting)

- Best for: Independent creators, marketing teams, brand teams
- Strengths: Fast topic ideation and first drafts, well-suited for bulk material production
- Risks: Homogenization, factual errors, brand voice drift
- Recommendation: Establish two fixed gates: fact-checking and human final review

### 3.4 Customer Service / Automated Replies

- Best for: Business teams with fixed Q&A templates
- Strengths: Can cover high-frequency questions, reduces manual workload
- Risks: High cost of incorrect answers — even higher risk when commitments or policies are involved
- Recommendation: Start with semi-automated FAQ handling, then gradually expand automation permissions

---

## 4. An Evaluation Template You Can Reuse Directly

For each new "lobster application" you add, fill in the following template:

| Field | Content |
|---|---|
| Scenario Name | e.g., Automated Daily Report Generation |
| Test Tasks | A fixed set of 10 representative tasks |
| Model and Configuration | e.g., `gpt-4.1-mini` + 3 skills |
| Success Rate | Tasks completed / 10 |
| Average Duration | Seconds |
| Cost per Task | Tokens / Dollar amount |
| Failure Types | Timeout / Tool error / Factual error |
| Final Recommendation | Recommended / Monitor / Hold |

---

## 5. Update Cadence (Recommended)

- Update frequency: Once per month
- Data sources: Unified task set + fixed model configuration
- Change log: Add one "version change summary" line with each update

You can also append an "Empirical Test Log" at the bottom of this page, upgrading the review from "subjective impressions" to "reproducible conclusions."
