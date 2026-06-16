# Project Settings

## GitHub & Security
- Username: `ush-dmitri`
- Token: stored in environment variable (`GH_TOKEN` or via `gh auth login`)
- All code repos go under `https://github.com/ush-dmitri/<repo-name>`
- NEVER hardcode tokens, API keys, or secrets in source code or commit messages.
- NEVER commit `.env`, `credentials.json`, or any file containing secrets.

## Git & Version Control Rules
- **Single Branch Workflow:** The ONLY allowed default branch is `main`. NEVER create, checkout, commit to, or push to a branch named `master`.
- **Auto-Commits:** When instructed to commit, autonomously analyze the code changes (`git diff`) and generate a concise, descriptive commit message in English using standard conventional formatting (e.g., `feat: description`, `fix: description`).
- **`.gitignore`:** Always check and update `.gitignore` to exclude: OS files, IDE configs, build artifacts, environment files, and caches.

## Session Workflow (Start & Finish Triggers)
- **Trigger Words:** Strictly react to the exact words "старт" or "start" for session initialization, and "финиш" or "finish" for session wrap-up.
- **Pre-Check (Missing Repo):** BEFORE executing any Git pull or push commands, check if a Git repository exists in the current directory (e.g., check for `.git` or run `git status`).
  - **IF NO REPO EXISTS:** Stop. Ask the user in Russian: *"Git репозиторий отсутствует. Будем его создавать и привязывать к GitHub?"*
  - **If user answers "нет":** Acknowledge that this is a local/throwaway project, skip all Git operations, and proceed with normal coding assistance.
  - **If user answers "да":** Autonomously run `git init -b main`, set up the initial commit, ask the user for the GitHub repository name to set the remote origin, and push.
- **Start Trigger (Pull):** If the word is "старт"/"start" AND the repo exists, execute `git pull origin main`. Briefly report the sync status in Russian and wait for the user's instructions.
- **Finish Trigger (Push):** If the word is "финиш"/"finish" AND the repo exists, autonomously perform the full save sequence:
  1. `git add .`
  2. Generate conventional commit message in English based on diff.
  3. `git commit -m "..."`
  4. `git push origin main`
  Briefly report successful save in Russian.

## Communication & Language Policy
- **Chat Interface:** Always communicate with the user and ask clarifying questions STRICTLY in Russian.
- **Code & Repository:** All generated code, variable names, functions, inline code comments, and Git commit messages MUST be written STRICTLY in English.
- **Conciseness:** Keep responses short and direct. No unnecessary preamble or pleasantries.

## Coding Standards & Architecture (Vibe-Coding)
- **Completeness:** Always write COMPLETE, production-ready code. NEVER use placeholders, TODOs, or ellipses (such as `// rest of the code here`).
- **Modularity:** Embrace clean architecture. Create new files and split code into modules/classes when it improves readability (e.g., separating UI from Logic).
- **Context Independence:** Treat every task objectively based on its specific requirements, regardless of the application domain.

## Error Handling & Debugging
- **No Apologies:** If an error occurs (in terminal, compilation, or execution), DO NOT apologize. 
- **Proactive Fixing:** Analyze the error log, identify the root cause, and immediately provide the corrected code block or terminal command to fix it.
- **Safe Commands:** When running shell commands, briefly explain what the command does before executing it.