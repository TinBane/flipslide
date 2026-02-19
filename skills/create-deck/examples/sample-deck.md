# Example: Product Launch Deck

Given the prompt "Create a deck for our new product launch — a task management app called Taskflow", here is the output:

## Folder Structure Created

```
taskflow-launch/
├── index.html
├── flipslide.js
├── flipslide.css
└── fonts/
    └── Outfit-Variable.woff2
```

## index.html Content

```html
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Taskflow Launch</title><link rel="stylesheet" href="flipslide.css"><style>body{opacity:0;transition:opacity .3s}body.fs-ready{opacity:1}</style></head><body><div id="fs-deck"></div><script id="fs-source" type="text/markdown">
# Taskflow
## Task Management, Reimagined

<!-- notes: Welcome everyone. Today we're unveiling Taskflow. -->

---

```callout
87% of teams say task management is their biggest bottleneck
```

*Source: Workplace Productivity Survey 2025*

---

## The Problem

- Teams juggle 4+ tools for task tracking
- Context switching costs 23 minutes per interruption
- No single view across projects and teams

---

## Introducing Taskflow

One unified workspace for every team:

***

- Kanban, list, and timeline views
- Real-time collaboration
- Smart prioritization with AI
- Integrations with Slack, GitHub, Figma

---

## How It Works

- [ ] Create a workspace in 30 seconds
- [ ] Invite your team via email or Slack
- [x] Import from Jira, Asana, or Trello
- [ ] Start managing tasks immediately

---

## Pricing

| Plan | Price | Users | Features |
|------|-------|-------|----------|
| Starter | Free | Up to 5 | Core features |
| Pro | $12/mo | Unlimited | AI + integrations |
| Enterprise | Custom | Unlimited | SSO + audit log |

---

## Early Results

- **3x** faster project setup
- **40%** reduction in missed deadlines
- **92%** team satisfaction score

---

# Thank You

Questions? hello@taskflow.app

---

<!-- flipslide:config
theme:
  background: "#0f172a"
  text: "#f1f5f9"
  accent: "#6366f1"
  heading_font: "fonts/Outfit-Variable.woff2"
  body_font: "fonts/Outfit-Variable.woff2"
  slide_number: true
  slide_number_format: "{current} / {total}"
  progress_bar: true
  transition: fade
  aspect_ratio: "16:9"
  autofit: true
  autofit_min: "1.2vw"

backgrounds:
  a:
    color: "#0f172a"
  b:
    color: "#1e1b4b"
  c:
    color: "#312e81"

background_map:
  title: a
  content: b

slide_overrides:
  title:
    heading-size: "10vw"
  content:
    heading-size: "4.5vw"
-->
</script><script src="flipslide.js"></script></body></html>
```
