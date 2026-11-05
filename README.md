# Cyber Security Awareness Simulator

A modern, interactive cybersecurity training platform built with React. Learn to identify phishing emails, detect fake websites, strengthen passwords, and respond to real-world attack scenarios — all in a safe simulated environment.

Cyber Security Awareness Simulator

## Features

- **Phishing Email Simulator** — Gmail-style interface to analyze and mark suspicious emails
- **Fake Website Detector** — Inspect URLs, HTTPS indicators, and compare real vs fake sites
- **Password Strength Analyzer** — Live strength meter with crack-time estimates
- **Cyber Safety Quiz** — Timed multiple-choice quiz with score tracking
- **Attack Simulation Scenarios** — OTP scams, QR fraud, tech support, WiFi, social engineering
- **Analytics Dashboard** — Recharts visualizations of threat trends and your progress
- **Dark/Light Theme Toggle** — Persistent via localStorage
- **Achievement Badges** — Unlock badges as you complete modules
- **Live Threat Alert Ticker** — Simulated cyber threat feed
- **Responsive Design** — Mobile, tablet, and desktop optimized
- **Smooth Animations** — Framer Motion page transitions and scroll effects
- **Cybersecurity News** — Stay updated about cybersecurity developments through news articles 

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 6 | Build tool |
| Tailwind CSS 4 | Styling |
| React Router DOM 7 | Routing |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| Lucide React | Icons |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
# Clone or navigate to the project directory
cd "Cyber Security Project"

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── layouts/        # Layout wrappers
├── routes/         # Route definitions
├── data/           # Static content & mock data
├── hooks/          # Custom React hooks
├── utils/          # Helper functions
├── context/        # Theme & app state
├── animations/     # Framer Motion variants
└── styles/         # Global CSS & Tailwind
```

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, features, stats, testimonials |
| `/phishing-simulator` | Phishing email training |
| `/fake-website-detector` | Website fraud detection |
| `/password-analyzer` | Password strength tool |
| `/cyber-quiz` | Timed security quiz |
| `/attack-simulation` | Interactive attack scenarios |
| `/cyber-news` | Curated cybersecurity news |
| `/dashboard` | Analytics & progress charts |
| `/about` | About page & achievements |

## Screenshots

> Add your screenshots to `docs/screenshots/` and they will appear here.

| Page | Preview |
|---|---|
| Home | `./docs/screenshots/hero.png` |
| Phishing Simulator | `./docs/screenshots/phishing.png` |
| Dashboard | `./docs/screenshots/dashboard.png` |
| Quiz | `./docs/screenshots/quiz.png` |

## LocalStorage Keys

| Key | Description |
|---|---|
| `cyber-theme` | Dark/light theme preference |
| `cyber-achievements` | Unlocked achievement IDs |
| `cyber-quiz-scores` | Quiz score history |
| `cyber-sim-stats` | Simulation completion counts |

---

## 🚀 FOSSSoC Season 1 Contribution Guidelines

This repository is an official project for **FOSSSoC Season 1 (November Phase)** hosted by **[TKM FOSS](https://github.com/tkmfoss)**.

- 🌐 **Live Demo:** [https://tkmfoss.github.io/Cyber-Security-Simulator/](https://tkmfoss.github.io/Cyber-Security-Simulator/)
- 📋 **Active Issues:** Browse open challenges on the [Issues Tab](https://github.com/tkmfoss/Cyber-Security-Simulator/issues) (tagged `soc-s1`).

---

### 1. How to Claim an Issue
1. Browse open issues tagged with `soc-s1`.
2. Comment `/claim` on an unassigned issue.
3. Our automated bot will immediately assign you if you meet the eligibility criteria.
4. ⚠️ **1-Issue Rule:** You can only have **ONE active claimed issue at any time** across all FOSSSoC repositories. You must have your pull request merged or closed before claiming another.
5. ⏳ **Tiered Inactivity Window:** You have **3 days (72 hours)** for Easy issues, and **5 days (120 hours)** for Medium and Hard issues to open a pull request. If no PR is opened within this window, the bot automatically unassigns the issue to keep opportunities open for others.

---

### 2. How to Raise a New Issue & Work on It
Found an unlisted bug, edge case, or have an idea for an awesome new cybersecurity learning module or feature (e.g., sound effects, custom phishing email templates, attack vectors, or security badges)? You are strongly encouraged to propose it!

#### Step A: Check Existing Issues & PRs
Before creating a new issue, search the [Issues Tab](https://github.com/tkmfoss/Cyber-Security-Simulator/issues) and [Pull Requests Tab](https://github.com/tkmfoss/Cyber-Security-Simulator/pulls) to make sure someone else hasn't already reported, claimed, or fixed it. Duplicate issues will be closed.

#### Step B: Open an Issue with a Template
1. Go to [New Issue](https://github.com/tkmfoss/Cyber-Security-Simulator/issues/new/choose).
2. Choose either **Bug Report** or **Feature Proposal**.
3. Use a clear, conventional title:
   - For bugs: `fix(scope): concise description of the defect`
   - For features: `feat(scope): concise description of the proposal`
4. Fill out all template sections: steps to reproduce, expected vs observed behavior, relevant files, and your proposed approach.

#### Step C: Mentor Review & Difficulty Assignment
- A project mentor (`@nillubtw` / `@antonl-dev` / `@ras-al`) will review your proposal to verify that it is constructive, non-trivial, and fits the platform.
- If approved, the mentor will tag your issue with:
  - `soc-s1` label (mandatory for automated leaderboard tracking).
  - The appropriate difficulty tier: `level:easy` (10 pts), `level:medium` (25 pts), or `level:hard` (50 pts).
- ⚠️ **IMPORTANT:** **Do not start coding or submit a PR until a mentor has reviewed and labeled the issue!** PRs linked to unapproved or unlabeled issues cannot be scored by the automated leaderboard.

#### Step D: Claim and Begin Working
- As soon as the mentor adds the labels, comment `/claim` on the issue to assign yourself.
- The standard **1-Issue Rule** applies (you cannot claim if you already have an active assigned issue).
- Your **tiered inactivity clock (3 days for Easy, 5 days for Medium/Hard)** begins once assigned.

---

### 3. How to Submit Your Solution
1. Fork this repository to your personal GitHub account.
2. Clone your fork locally and create a descriptive branch:
   ```bash
   git checkout -b fix/quiz-timer-expiration
   ```
3. Install dependencies and run locally:
   ```bash
   npm install
   npm run dev
   ```
4. Verify your changes and test the production build:
   ```bash
   npm run build
   ```
5. Commit your changes with clear commit messages and push to your fork.
6. Open a Pull Request targeting `main` of `tkmfoss/Cyber-Security-Simulator`.
7. 🔗 **CRITICAL:** Include `Fixes #<issue_number>` in your pull request description (e.g., `Fixes #1`). This automatically links the issue, closes it upon merge, and ensures the automated leaderboard tracks your score!

---

### 4. Scoring & Points

| Difficulty | Tag | Points | Description |
|---|---|---|---|
| 🟢 Easy | `level:easy` | **10 pts** | Localized component fixes, simple state resets, UI indicators |
| 🟡 Medium | `level:medium` | **25 pts** | Cross-component state, data modeling, persistence, search/filter |
| 🔴 Hard | `level:hard` | **50 pts** | Architectural engines, multi-step simulations, progression systems |

- ⚡ **Early Bird Bonus:** **+5 bonus points** for PRs opened during Week 1 (November 1 – November 7).
- 🌟 **Quality Bonus:** **+5 bonus points** for clean, well-documented code with thorough PR descriptions (awarded via `quality:excellent` label).
- 🛑 **Repository Cap:** Maximum of **5 scored PRs** per repository.

---

### 5. 🎯 Bug Hunting & Feature Proposals

Starter beginner-friendly issues (`level:easy`) are available on the [Issues Tab](https://github.com/tkmfoss/Cyber-Security-Simulator/issues) to help you get started with your first pull request!

Beyond the starter issues, contributors are strongly encouraged to explore the platform, test edge cases across quizzes, attack simulations, password analyzers, and dashboards, or propose new modules. Follow the steps above to open a **Bug Report** or **Feature Proposal**!



