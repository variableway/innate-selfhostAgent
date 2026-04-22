# Having the Lobster Save Scripts and Set Up Scheduled Tasks: Ready-to-Copy Prompts

This file is not code — it is a collection of prompt templates for OpenClaw / the lobster.

It solves two problems:

1. Having the lobster save the script file you upload to the current working directory
2. Having the lobster create a daily 9 AM mail summary scheduled task on its own

---

## Usage 1: Have the Lobster Save the Script and Environment Variable Template

Upload `yesterday_mail_report.py` as an attachment to the lobster, then send this prompt:

```text
I just uploaded a script file. Please help me integrate it into the current working directory.

Please complete the following:

1. Create a `scripts/` directory in the current working directory (reuse if it already exists)
2. Save the `yesterday_mail_report.py` I uploaded to `scripts/yesterday_mail_report.py`
3. Create a `.env.example` in the current working directory with these placeholders:
   MAIL_HOST=imap.163.com
   MAIL_PORT=993
   MAIL_USER=your_name@163.com
   MAIL_PASSWORD=replace_with_authorization_code
   MAIL_FOLDER=INBOX
4. Do not write any real authorization codes into any file
5. When done, tell me:
   - Where the script was actually saved
   - Where `.env.example` was saved
   - What file I should copy next and what variables I need to fill in

If a file with the same name already exists in the current working directory, tell me the differences first, then decide whether to overwrite.
```

---

## Usage 2: Have the Lobster Create the Daily 9 AM Cron Job

Once the script is already in the current working directory, send this prompt:

```text
Please help me create a scheduled task in the current OpenClaw environment that runs every day at 9 AM.

Task goal:
- Run `scripts/yesterday_mail_report.py` in the current working directory
- Read the JSON output from the script
- Report only mail from yesterday 00:00-23:59

Output requirements:
1. Organize into four categories:
   - Needs my attention
   - Security alerts
   - System notifications
   - Ignorable mail
2. For each email, keep only:
   - Subject
   - Sender
   - Time
   - One-sentence summary
3. Add a "Today's Priority Items" section at the end
4. If `total_messages = 0`, simply tell me there is no new mail to report from yesterday

Execution requirements:
- Create using cron
- Set trigger time to 9 AM daily
- Use isolated session
- After creating, tell me the cron task name, cron expression, and the command to view the task
```

---

## Usage 3: One Shot — Have the Lobster Do Both at Once

If you want to hand everything to the lobster in one go, upload the script attachment and send this prompt:

```text
I uploaded a `yesterday_mail_report.py` script file. Please complete a full integration in the current working directory:

1. Create the `scripts/` directory and save the script to `scripts/yesterday_mail_report.py`
2. Create `.env.example` with mail connection variable placeholders, but do not write any real authorization codes
3. Tell me how to copy `.env.example` to `.env` and fill in my real mail variables
4. After confirming the script path is correct, create a cron task that runs every day at 9 AM
5. When the task runs:
   - Run `scripts/yesterday_mail_report.py`
   - Read the JSON output from the script
   - Report only yesterday's mail
   - Organize into "needs my attention / security alerts / system notifications / ignorable mail" four categories
   - End with "Today's Priority Items"
   - If there is no mail, report that there is no new mail requiring attention from yesterday

When done, give me a checklist with:
- Script save path
- `.env.example` path
- Cron task name
- Cron expression
- Commands for viewing, modifying, and deleting the task
```

---

## When to Prefer This Prompt-Based Approach

This approach is suited for:

- When you want the lobster to handle saving files itself
- When you do not want to manually type cron commands
- When you prefer advancing through "conversational tasks" rather than "manual deployment"

If you care more about control, you can still use the command-based approach.
The two approaches do not conflict — command-based is the lower-level fallback, and prompt-based is the more hands-free entry point.
