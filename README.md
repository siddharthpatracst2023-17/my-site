# my-site — Project Showcase

A fast, responsive project showcase site deployed via a **Git hook production pipeline** on macOS.

---

## Live deployment pipeline

```
git push origin main
      │
      ▼
  GitHub (remote origin)
      │
      ▼
  bare repo on production Mac  ←── post-receive hook fires
      │
      ▼
  ~/Sites/my-site  (live files updated)
```

One push. No manual steps.

---

## Project structure

```
my-site/
├── index.html       # Main showcase page
└── README.md        # This file
```

---

## How to run locally

```bash
git clone https://github.com/siddharthpatracst2023-17/my-site.git
cd my-site
open index.html
```

---

## How to deploy (production Mac setup)

### 1. Create the bare repo on the production Mac
```bash
mkdir -p ~/repos/my-site.git
cd ~/repos/my-site.git
git init --bare
```

### 2. Create the post-receive hook
```bash
nano ~/repos/my-site.git/hooks/post-receive
```

Paste this (replace `YOUR_USERNAME` with your macOS username):
```bash
#!/bin/bash
GIT_WORK_TREE=/Users/YOUR_USERNAME/Sites/my-site \
GIT_DIR=/Users/YOUR_USERNAME/repos/my-site.git \
git checkout -f main

echo "--- Deployed to ~/Sites/my-site ---"
```

```bash
chmod +x ~/repos/my-site.git/hooks/post-receive
```

### 3. Add production as a Git remote
```bash
cd ~/my-site
git remote add production YOUR_USERNAME@PROD_IP:repos/my-site.git
```

### 4. Push to deploy
```bash
git push production main
```

---

## Tech stack

| Layer | Tool |
|---|---|
| Version control | Git + GitHub |
| Deployment | Git bare repo + post-receive hook |
| Server | macOS Apache (built-in) |
| Frontend | HTML5 + CSS3 |
| Fonts | Space Grotesk + JetBrains Mono |

---

## Author

**Siddharth Patra** — [@siddharthpatracst2023-17](https://github.com/siddharthpatracst2023-17)
