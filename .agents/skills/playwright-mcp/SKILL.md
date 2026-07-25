---
name: playwright-mcp
description: Provides browser automation and testing capabilities using Playwright MCP server (@playwright/mcp) or Playwright CLI. Use for end-to-end web testing, browser automation, inspecting accessibility trees, interacting with web pages, and taking page snapshots.
---

# Playwright MCP Skill

This skill enables browser automation, web application testing, and interactive page inspection using Microsoft Playwright MCP (`@playwright/mcp`) and Playwright CLI (`playwright-cli`).

## Capabilities

- **Browser Automation**: Launch and control browser instances (Chromium, Firefox, WebKit).
- **Accessibility Tree Snapshots**: View page structure via Playwright's structured accessibility tree without needing pixel vision.
- **Form Interaction & Navigation**: Click elements, enter text, navigate URLs, wait for network idle, and handle popups.
- **Testing & Quality Assurance**: Run end-to-end user journeys and verify front-end components.

## Quick Start & Usage

### 1. Launching Playwright MCP Server
To start the Playwright MCP server via `npx`:
```bash
npx -y @playwright/mcp@latest
```

### 2. Using Playwright CLI for Token-Efficient Workflows
For high-throughput coding agent workflows:
```bash
npx -y @playwright/cli launch
```

### 3. Core Interaction Patterns
- **Navigate to URL**: `browser_navigate` / `goto`
- **Inspect page accessibility tree**: `take_snapshot` / `snapshot`
- **Click element**: `click` by selector or snapshot ref
- **Fill text fields**: `fill` / `type`
- **Take screenshot/snapshot**: `screenshot`

## Best Practices
- Prefer accessibility tree snapshots over full visual screenshots for token efficiency.
- Ensure dev server is running before attempting local URL testing (e.g., http://localhost:3000).
- Clean up browser instances after test execution completes.
