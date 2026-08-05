# Git & GitHub Complete Learning Guide

A beginner-friendly, hands-on reference for everything Git and GitHub.
Every command explained in simple language with real examples.

---

## About This Repository

This repository is my personal Git and GitHub learning journal.
It documents every command I learned, what it does, why it exists,
and when to use it — written in the simplest way possible.

If you are a beginner, this guide is for you too.

---

## My Learning Goals

- Understand how Git works from the ground up
- Use GitHub to store and share my projects
- Manage code changes confidently
- Collaborate with other developers professionally

---

## Complete Command Reference


## 🖥️ 1. Windows Command Line Basics

---

### `cd <folder>`
**What it does:** Move into a folder.
**Analogy:** Like double-clicking a folder to open it.
```cmd
cd projects
```

---

### `cd ..`
**What it does:** Go back one folder level.
**Analogy:** Like clicking the back button in File Explorer.
```cmd
cd ..
```

---

### `dir`
**What it does:** List all files and folders in current location.
**Analogy:** Like looking inside an open folder.
```cmd
dir
```

---

### `cls/clear`
**What it does:** Clear the terminal screen.
**When to use:** When the screen gets too cluttered.
```cmd
cls
```

---

### `echo Hello > file.txt`
**What it does:** Creates a new file and writes "Hello" inside it.
**Analogy:** Like creating a new text file and typing in it.
```cmd
echo Hello > file.txt
```

---

### `type/code file.txt`
**What it does:** Shows the content of a file in the terminal.
**Analogy:** Like opening a file to read it, without editing.
```cmd
type file.txt
```

---

### `del/rm file.txt`
**What it does:** Permanently deletes a file.
**Warning:** There is no undo. The file is gone.
```cmd
del file.txt
```

---

### `rmdir foldername`
**What it does:** Deletes an empty folder.
**To delete a folder with files inside:**
```cmd
rmdir /s /q foldername
```

---

### `copy source.txt destination.txt`
**What it does:** Copies a file to a new location.
**Analogy:** Like Ctrl+C and Ctrl+V for files.
```cmd
copy notes.txt backup_notes.txt
```

---

### `move file.txt folder\`
**What it does:** Moves a file into a folder.
**Analogy:** Like dragging a file into a folder.
```cmd
move notes.txt projects\
```

---

---

## 🔧 2. Git Configuration

> Tell Git who you are. Git stamps your name and email
> on every commit you make — like signing your work.

---

### `git config --global user.name "Your Name"`
**What it does:** Sets your name for all Git commits globally.
**Why it matters:** Every commit shows who made it.
```bash
git config --global user.name "Meki"
```

---

### `git config --global user.email "your@email.com"`
**What it does:** Sets your email for all Git commits globally.
**Why it matters:** GitHub uses this to link commits to your account.
```bash
git config --global user.email "Meki@email.com"
```

---

### Check your configuration
```bash
git config --list
```
**What it does:** Shows all your current Git settings.

---

## 📁 3. Repository Commands

> A repository (repo) is a folder Git is tracking.
> Think of it as a project folder with a memory.

---

### `git init`
**What it does:** Turns your current folder into a Git repository.
**When to use:** At the very start of a new project.
**Analogy:** Like giving your folder a memory to track all changes.
```bash
git init
```
**Output:**

---

### `git status`
**What it does:** Shows the current state of your files.
**Tells you:**
- Which files are changed
- Which files are staged
- Which files are untracked
```bash
git status
```
**Output:**

---

### `git add <file>`
**What it does:** Stages a specific file — prepares it for commit.
**Analogy:** Like putting items in a box before sealing it.
```bash
git add index.html
```

---

### `git add .`
**What it does:** Stages ALL changed files at once.
```bash
git add .
```

---

### `git log`
**What it does:** Shows the full history of all commits.
**Analogy:** Like reading a diary of every change ever made.
```bash
git log
```
**Cleaner version:**
```bash
git log --oneline
```
**Output:**

---


## 🌿 4. Branching

> A branch is an independent copy of your project
> where you can work safely without affecting the main code.
> Analogy: Like working on a photocopy of a document
> instead of the original.

---

### `git branch`
**What it does:** Lists all branches in your repository.
```bash
git branch
```
**Output:**


The `*` shows which branch you are currently on.

---

### `git branch <branch-name>`
**What it does:** Creates a new branch.
**When to use:** When starting a new feature or fix.
```bash
git branch feature/login
```

---

### `git switch <branch-name>`
**What it does:** Switches to an existing branch.
**Modern command** — use this instead of `git checkout`.
```bash
git switch feature/login
```

---

### `git switch -c <new-branch>`
**What it does:** Creates a new branch AND switches to it immediately.
**The `-c` stands for:** create
```bash
git switch -c feature/signup
```

---

### `git checkout <branch-name>` *(old way)*
**What it does:** Same as `git switch` but older syntax.
**Still works** but `git switch` is cleaner and recommended.
```bash
git checkout feature/login
```

---

## 🔀 5. Merging

> Merging combines changes from one branch into another.
> Analogy: Like copying your edits from the photocopy
> back into the original document.

---

### `git merge <branch-name>`
**What it does:** Merges the named branch into your current branch.
```bash
git switch main
git merge feature/login
```

---

### Fast-Forward Merge
Happens when main has no new commits since the branch was created.
Git simply moves the pointer forward — clean and simple.


---

### Three-Way Merge
Happens when both main and the branch have new commits.
Git creates a new merge commit combining both.


---

### Merge Conflict
Happens when both branches changed the same line.
Git cannot decide which version to keep — you must fix it manually.


**Fix:** Edit the file, remove the markers, then:
```bash
git add <file>
git commit -m "resolve merge conflict"
```

---

## 🔍 6. Tracking Files

> Git puts files into three categories:
> Tracked, Untracked, and Staged.

---

### `git ls-files`
**What it does:** Shows all files Git is currently tracking.
```bash
git ls-files
```
**Output:**

---

### `git rm <file-name>`
**What it does:** Removes a file from Git tracking AND deletes it.
**Warning:** This deletes the file from your computer too.
```bash
git rm old-file.txt
```

**To stop tracking without deleting the file:**
```bash
git rm --cached old-file.txt
```

---
## ↩️ 7. Undoing Unstaged Changes

> You edited a file but have NOT staged it yet
> and want to go back to the last saved version.

---

### `git restore <file-name>` ✅ Modern
**What it does:** Discards all changes in a file since last commit.
**Warning:** Changes are permanently lost.
```bash
git restore index.html
```

---

### `git restore -p <file-name>`
**What it does:** Lets you undo specific lines instead of the whole file.
**The `-p` stands for:** `--patch`
```bash
git restore -p index.html
```
**Interactive options:**
| Key | Action |
|-----|--------|
| `y` | Undo this chunk |
| `n` | Keep this chunk |
| `s` | Split into smaller pieces |
| `e` | Edit manually which lines to undo |
| `q` | Quit |

---

### `git checkout <file-name>` *(old way)*
**What it does:** Same as `git restore` but older syntax.
```bash
git checkout index.html
```

---

## 🧹 8. Deleting Untracked Files

> Untracked files are new files Git has never seen before.
> These commands permanently delete them.

---

### `git clean -dn`
**What it does:** PREVIEW — shows which files WOULD be deleted.
**Always run this first** before actually deleting.
```bash
git clean -dn
```
**Output:**


---

### `git clean -df`
**What it does:** Actually deletes all untracked files and folders.
**Warning:** Cannot be undone.
```bash
git clean -df
```

---

## 📤 9. Undoing Staged Changes

> You staged a file with `git add` but want to unstage it
> before committing.

---

### `git restore --staged <file-name>` ✅ Modern
**What it does:** Removes file from staging area.
**Your changes are kept** — just unstaged.
```bash
git restore --staged index.html
```

---

### `git reset <file-name>`
**What it does:** Same as above — unstages the file.
**Your changes are kept** in the working directory.
```bash
git reset index.html
```

---

## ⏪ 10. Removing Commits (Reset)

> HEAD~1 means "go back 1 commit".

---

### `git reset --soft HEAD~1`
**What it does:** Removes the last commit.
**Your changes:** Kept and still staged — ready to re-commit.
**Analogy:** Unsealing a box but keeping everything inside it.
```bash
git reset --soft HEAD~1
```

---

### `git reset HEAD~1` *(Mixed — default)*
**What it does:** Removes the last commit.
**Your changes:** Kept but unstaged — back in working directory.
**Analogy:** Unsealing the box AND unpacking the items.
```bash
git reset HEAD~1
```

---

### `git reset --hard HEAD~1`
**What it does:** Removes the last commit.
**Your changes:** Completely deleted — cannot be recovered.
**Analogy:** Throwing the sealed box in the trash.
```bash
git reset --hard HEAD~1
```

## 🔗 11. Detached HEAD

> Detached HEAD means you are looking at an old commit
> directly — not on any branch.
> Analogy: Like reading an old page of your diary
> without being on the current page.

---

### Enter Detached HEAD
```bash
git checkout <commit-id>
# or modern way
git switch --detach <commit-id>
```

---

### Full Safe Workflow
```bash
# 1. Enter detached HEAD
git switch --detach a1b2c3d

# 2. Make changes and commit
git add .
git commit -m "experiment from old commit"

# 3. Save your work — create a branch
git switch -c experiment/old-feature

# 4. Return to main
git switch main

# 5. Merge your new branch
git merge experiment/old-feature
```

---

## 🗑️ 12. Deleting Branches

> When a branch is no longer needed — after merging —
> it is good practice to delete it and keep your repository clean.
> Analogy: Like throwing away your photocopy after copying
> the edits back into the original document.

---

### `git branch -d <branch-name>` ✅ Safe Delete

**What it does:** Deletes a branch only if it has been fully merged.
**Why it is used:** Keeps your repository clean and organised.
**When to use:** After merging a feature branch into main.

```bash
git branch -d feature/login
```

**Output if merged:**
```
Deleted branch feature/login (was a1b2c3d).
```

**Output if NOT merged:**
```
error: The branch 'feature/login' is not fully merged.
If you are sure you want to delete it, run:
  git branch -D feature/login
```

---

### `git branch -D <branch-name>` ⚠️ Force Delete

**What it does:** Force deletes a branch even if it has NOT been merged.
**Why it is used:** When you want to discard a branch completely.
**When to use:** Only when you are 100% sure you do not need it.

```bash
git branch -D feature/login
```

**Output:**
```
Deleted branch feature/login (was a1b2c3d).
```

---

### Deleting Multiple Branches at Once

**What it does:** Deletes several branches in one command.
**Why it is used:** Saves time when cleaning up many old branches.

```bash
# Safe delete multiple branches
git branch -d feature/login feature/signup feature/dashboard

# Force delete multiple branches
git branch -D feature/login feature/signup feature/dashboard
```

**Output:**
```
Deleted branch feature/login (was a1b2c3d).
Deleted branch feature/signup (was e4f5g6h).
Deleted branch feature/dashboard (was i7j8k9l).
```

---

### Quick Comparison

| Command | Stands for | Deletes if not merged | Safe? |
|---|---|---|---|
| `git branch -d` | delete | ❌ Refuses | ✅ Always safe |
| `git branch -D` | force Delete | ✅ Yes | ⚠️ Dangerous |

---

### Golden Rules

| Situation | Use this |
|---|---|
| Branch is fully merged | `git branch -d` |
| Branch is NOT merged but no longer needed | `git branch -D` |
| Not sure if branch is merged | Always try `-d` first |
| Cleaning up many old branches | List with `-d` then force with `-D` |

---
## 🔗 13. Saving Detached HEAD Changes

> If you made commits while in Detached HEAD state,
> those commits are NOT attached to any branch.
> You must create a new branch from them before switching away
> or they will be lost forever.
> Analogy: Like writing notes on a loose piece of paper —
> you must staple it to a notebook before you lose it.

---

### `git branch <new-branch-name> <commit-id>` ✅

**What it does:** Creates a new branch from a specific commit ID.
**Why it is used:** Saves commits made in Detached HEAD state.
**When to use:** Immediately after making commits in Detached HEAD.

```bash
git branch experiment/old-feature a1b2c3d
```

**Output:**
```
(no output means success)
```

**Then switch to your new branch:**
```bash
git switch experiment/old-feature
```

**Output:**
```
Switched to branch 'experiment/old-feature'
```

---

### Full Safe Workflow

```bash
# Step 1 — Enter Detached HEAD
git switch --detach a1b2c3d

# Output:
# HEAD is now at a1b2c3d add login page

# Step 2 — Make changes and commit
git add .
git commit -m "experiment: test old feature"

# Output:
# [detached HEAD f1g2h3i] experiment: test old feature
# 1 file changed, 5 insertions(+)

# Step 3 — Save by creating branch from commit ID
git branch experiment/old-feature f1g2h3i

# Step 4 — Switch to your new branch
git switch experiment/old-feature

# Output:
# Switched to branch 'experiment/old-feature'

# Step 5 — Return to main and merge
git switch main
git merge experiment/old-feature

# Output:
# Updating a1b2c3d..f1g2h3i
# Fast-forward
#  index.html | 5 +++++
#  1 file changed, 5 insertions(+)
```

---

### ⚠️ What Happens if You Do NOT Save

```bash
# If you switch away without creating a branch
git switch main

# Git warns you:
# Warning: you are leaving 1 commit behind, not connected to any branch.
# If you want to keep it, create a branch:
#   git branch <new-branch-name> f1g2h3i
```

---

### Golden Rules for Detached HEAD

| Situation | What to do |
|---|---|
| Just exploring old commits | Safe — no need to save |
| Made commits in Detached HEAD | Immediately run `git branch <name> <id>` |
| Switched away without saving | Commits may be lost ❌ |
| Not sure of the commit ID | Run `git log --oneline` first |

---

---
swich
## 🚫 14. Understanding .gitignore

> A `.gitignore` file tells Git which files and folders
> to completely ignore — never track, never commit.
> Analogy: Like a DO NOT TOUCH list you give to Git.
> Whatever is on the list, Git pretends it does not exist.

---

### Why You Need .gitignore

Some files should NEVER be committed to GitHub:

| File type | Why ignore it |
|---|---|
| `node_modules/` | Too large — can be reinstalled anytime |
| `.env` | Contains secret passwords and API keys |
| `dist/` | Auto-generated build files |
| `.DS_Store` | Mac system files — not needed |
| `*.log` | Log files — not part of your code |

---

### How to Create a .gitignore File

```bash
# Create the file
echo > .gitignore

# Open in VS Code
code .gitignore
```

---

### What to Write Inside .gitignore

```gitignore
# Ignore node_modules folder
node_modules/

# Ignore environment variables file
.env

# Ignore build output folder
dist/

# Ignore all log files
*.log

# Ignore Mac system files
.DS_Store

# Ignore a specific file
secret.txt

# Ignore all .txt files
*.txt

# Ignore everything inside a folder
uploads/*
```

---

### How Each Rule Works

| Rule | What it ignores |
|---|---|
| `node_modules/` | The entire folder |
| `.env` | One specific file |
| `*.log` | All files ending in `.log` |
| `uploads/*` | Everything inside uploads folder |
| `!important.log` | Exception — do NOT ignore this file |

---

### Practical Example for Your Finance App

```gitignore
# Dependencies
node_modules/

# Environment variables — never commit these ❌
.env
.env.local
.env.production

# Build output
dist/
build/

# Log files
*.log
npm-debug.log

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
```

---

### Check if .gitignore is Working

```bash
git status
```

**Output — ignored files will NOT appear:**
```
On branch main
nothing to commit, working tree clean
```

---

### ⚠️ Important Warning

> If a file was already committed before you added it
> to `.gitignore`, Git will still track it.
> You must remove it from tracking first:

```bash
git rm --cached .env
git commit -m "chore: remove .env from tracking"
```

---

### Golden Rules for .gitignore

| Rule | Reason |
|---|---|
| Always add `.env` | Protects your secret keys |
| Always add `node_modules/` | Keeps repo size small |
| Create `.gitignore` before first commit | Prevents tracking unwanted files |
| Never ignore your main source files | You will lose your code ❌ |



*Built with curiosity, practice, and a lot of broken commits.* 