# Repository Skills Catalog & Reference Guide

> **Workspace**: `Prototype v0` (`Cryoflake/Swathi-Publications-Backend`)  
> **Location**: [`.agents/skills/`](file:///Users/moksha/Documents/Prototype%20v0/.agents/skills)  
> **Last Updated**: September 20, 2026  

This document catalogs all specialized skills available within this repository and execution environment, organized by functional domain with trigger keywords, file paths, and invocation instructions.

---

## 1. Quick Reference & Command Cheat Sheet

| Skill | Trigger / Slash Command | Primary Purpose | Path |
| :--- | :--- | :--- | :--- |
| **ponytail** | `/ponytail`, `lazy mode`, `shortest diff` | Enforce minimal working code, YAGNI, and stdlib first | [ponytail](.agents/skills/ponytail/SKILL.md) |
| **ponytail-review** | `/ponytail-review`, `review for over-engineering` | Hunt bloat, unneeded abstractions, and reinvented wheels | [ponytail-review](.agents/skills/ponytail-review/SKILL.md) |
| **ponytail-audit** | `/ponytail-audit`, `audit for over-engineering` | Full-repo scan for dead code, unneeded dependencies | [ponytail-audit](.agents/skills/ponytail-audit/SKILL.md) |
| **ponytail-debt** | `/ponytail-debt`, `ponytail ledger` | Harvest `ponytail:` comments into a debt ledger | [ponytail-debt](.agents/skills/ponytail-debt/SKILL.md) |
| **ponytail-gain** | `/ponytail-gain`, `show ponytail impact` | Show benchmark scoreboard (tokens saved, diff reduction) | [ponytail-gain](.agents/skills/ponytail-gain/SKILL.md) |
| **ponytail-help** | `/ponytail-help`, `ponytail help` | Quick-reference card for ponytail rules and levels | [ponytail-help](.agents/skills/ponytail-help/SKILL.md) |
| **graphify** | `/graphify`, `graphify update`, `query graph` | Knowledge graph, AST relations, call flows, impact queries | [graphify](.agents/skills/graphify/SKILL.md) |
| **caveman** | `/caveman`, `terse mode`, `less tokens` | High-density communication cutting output token fluff | [caveman](.agents/skills/caveman/SKILL.md) |
| **cavecrew** | `cavecrew`, `cavecrew-builder` | Delegate subtasks to compressed investigator/builder agents | [cavecrew](.agents/skills/cavecrew/SKILL.md) |
| **caveman-review** | `/caveman-review`, `review the diff` | Ultra-concise code review (1 line per finding) | [caveman-review](.agents/skills/caveman-review/SKILL.md) |
| **caveman-commit** | `/commit`, `/caveman-commit` | Minimal conventional commit messages focused on intent | [caveman-commit](.agents/skills/caveman-commit/SKILL.md) |
| **caveman-compress** | `/caveman-compress` | Compress markdown / memory files to reduce prompt tokens | [caveman-compress](.agents/skills/caveman-compress/SKILL.md) |
| **caveman-stats** | `/caveman-stats` | Token usage, cache efficiency, and mode attribution report | [caveman-stats](.agents/skills/caveman-stats/SKILL.md) |
| **caveman-help** | `/caveman-help` | Quick-reference card for caveman levels and commands | [caveman-help](.agents/skills/caveman-help/SKILL.md) |
| **playwright-mcp** | `playwright`, `e2e test`, `ui test` | Headless browser automation, structured a11y trees, testing | [playwright-mcp](.agents/skills/playwright-mcp/SKILL.md) |
| **chrome-devtools** | `chrome-devtools`, `inspect network` | Debug web pages, automate browser, analyze performance | [chrome-devtools](.agents/skills/chrome-devtools/SKILL.md) |
| **chrome-devtools-cli** | `devtools cli`, `chrome script` | CLI shell scripts for automated browser actions | [chrome-devtools-cli](.agents/skills/chrome-devtools-cli/SKILL.md) |
| **debug-optimize-lcp** | `debug lcp`, `largest contentful paint` | CWV debugging, hero render optimization, network waterfall | [debug-optimize-lcp](.agents/skills/debug-optimize-lcp/SKILL.md) |
| **a11y-debugging** | `a11y`, `accessibility audit` | ARIA labels, focus states, tap targets, contrast audits | [a11y-debugging](.agents/skills/a11y-debugging/SKILL.md) |
| **cookie-debugging** | `cookies`, `auth redirect`, `samesite` | Session state, 401/403, Cookie headers, consent conformance | [cookie-debugging](.agents/skills/cookie-debugging/SKILL.md) |
| **memory-leak-debugging** | `memory leak`, `heap snapshot`, `OOM` | Heap snapshots, V8 memory profiling, Node leak detection | [memory-leak-debugging](.agents/skills/memory-leak-debugging/SKILL.md) |
| **troubleshooting** | `troubleshoot connection` | Resolve Chrome DevTools MCP connection and target failures | [troubleshooting](.agents/skills/troubleshooting/SKILL.md) |

---

## 2. Global & Plugin Skills (Environment-Wide)

| Skill | Trigger Keywords | Primary Purpose | Source Plugin / Location |
| :--- | :--- | :--- | :--- |
| **modern-web-guidance** | `modern web`, `dialog`, `popover`, `:has()` | HTML/CSS best practices, container queries, modern web APIs | `modern-web-guidance-plugin` |
| **ui-ux-pro-max** | `ui design`, `color palette`, `typography` | UI/UX design intelligence (84 styles, 192 palettes, 74 font pairs) | Global Skills |
| **chrome-extensions** | `chrome extension`, `manifest v3` | Build, debug, and publish Manifest V3 Chrome Extensions | `modern-web-guidance-plugin` |
| **antigravity-guide** | `antigravity`, `agy cli`, `slash commands` | Comprehensive guide and reference for Google Antigravity | Antigravity Builtin |
| **agy-customizations** | `customizations`, `create skill`, `rules` | Guide to creating custom skills, rules, plugins, and hooks | Antigravity Builtin |

---

## 3. Detailed Breakdown by Domain

### 3.1 Software Architecture & Simplicity (Ponytail Suite)
Channels a senior principal engineer who eliminates speculative boilerplate, over-engineering, and unneeded dependencies.

1. **[ponytail](.agents/skills/ponytail/SKILL.md)**:
   - **Guiding Ladder**:
     1. *YAGNI*: Does this need to be built at all?
     2. *Re-use*: Does it already exist in this repo?
     3. *Stdlib*: Does native standard library do this?
     4. *Platform*: Does native runtime/browser platform cover it?
     5. *Dependency*: Does an already installed package solve it?
     6. *One line*: Can this be one line?
     7. *Minimum Code*: Write the absolute shortest working diff.
   - **Intensity Levels**: `lite`, `full` (default), `ultra`.

2. **[ponytail-review](.agents/skills/ponytail-review/SKILL.md)**:
   - Code review hunting complexity: finds what to delete, reinvented stdlib, and speculative abstractions. Output: 1 line per finding (`location | what to cut | replacement`).

3. **[ponytail-audit](.agents/skills/ponytail-audit/SKILL.md)**:
   - Full-repository audit ranking areas with highest bloat and dead flexibility.

4. **[ponytail-debt](.agents/skills/ponytail-debt/SKILL.md)**:
   - Aggregates all inline `// ponytail:` comment shortcuts into a prioritized debt ledger so deferred work isn't forgotten.

5. **[ponytail-gain](.agents/skills/ponytail-gain/SKILL.md)** & **[ponytail-help](.agents/skills/ponytail-help/SKILL.md)**:
   - Impact scoreboard and quick-reference syntax card.

---

### 3.2 Codebase Intelligence & Graph Analysis (Graphify)

1. **[graphify](.agents/skills/graphify/SKILL.md)**:
   - Extracts AST nodes, symbol definitions, calls, imports, and relationships across TypeScript, Python, and JSON files into a persistent knowledge graph in `graphify-out/`.
   - **Active Graph State in this repo**: **7,696 nodes, 14,613 edges, 527 communities**.
   - **Outputs Generated**:
     - Interactive Graph: [`graphify-out/graph.html`](graphify-out/graph.html)
     - D3 Hierarchy Tree: [`graphify-out/GRAPH_TREE.html`](graphify-out/GRAPH_TREE.html)
     - Mermaid Call Flows: [`graphify-out/Prototype-v0-callflow.html`](graphify-out/Prototype-v0-callflow.html)
     - Architecture Report: [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md)
   - **CLI Commands**:
     - `graphify update`: Incremental AST re-extraction.
     - `graphify tree`: Regenerate D3 collapsible tree.
     - `graphify export callflow-html`: Regenerate Mermaid flow diagram.

---

### 3.3 Token Efficiency & Compressed Communication (Caveman Suite)

1. **[caveman](.agents/skills/caveman/SKILL.md)**:
   - Cuts conversational filler and pleasantries while preserving 100% technical correctness, paths, diffs, and logic. Levels: `lite`, `full`, `ultra`.
2. **[cavecrew](.agents/skills/cavecrew/SKILL.md)**:
   - Subagent delegation model to keep main conversation context small:
     - `cavecrew-investigator`: Fast code locator.
     - `cavecrew-builder`: 1-2 file isolated editor.
     - `cavecrew-reviewer`: Compressed diff inspector.
3. **[caveman-review](.agents/skills/caveman-review/SKILL.md)**:
   - Ultra-dense code review format for PRs and diffs.
4. **[caveman-commit](.agents/skills/caveman-commit/SKILL.md)**:
   - Intent-only Conventional Commit generator (e.g. `fix(db): add in-memory fallback for offline dev`).
5. **[caveman-compress](.agents/skills/caveman-compress/SKILL.md)**:
   - Token-compactor for project memory docs, reducing input context costs.

---

### 3.4 Browser Automation, UI & Accessibility Testing

1. **[playwright-mcp](.agents/skills/playwright-mcp/SKILL.md)**:
   - Controls headless Chromium/Firefox via `@playwright/mcp`.
   - Captures structured accessibility tree snapshots instead of heavy visual screenshots for token-efficient automated UI testing.
2. **[chrome-devtools](.agents/skills/chrome-devtools/SKILL.md)** & **[chrome-devtools-cli](.agents/skills/chrome-devtools-cli/SKILL.md)**:
   - Direct browser automation, live DOM inspection, and network payload interception.
3. **[a11y-debugging](.agents/skills/a11y-debugging/SKILL.md)**:
   - Validates WCAG 2.1 compliance: ARIA roles, color contrast ratios, keyboard Tab navigation, and touch targets.

---

### 3.5 Performance, Memory & Diagnostics

1. **[debug-optimize-lcp](.agents/skills/debug-optimize-lcp/SKILL.md)**:
   - Diagnoses slow Largest Contentful Paint, render-blocking resources, font display delays, and image delivery.
2. **[memory-leak-debugging](.agents/skills/memory-leak-debugging/SKILL.md)**:
   - Heap allocation analysis, closure retention traps, uncleaned event listeners, and Node.js OOM debugging.
3. **[cookie-debugging](.agents/skills/cookie-debugging/SKILL.md)**:
   - Session tokens, SameSite policies, Partitioned cookies (CHIPS), and CORS credentials.
4. **[troubleshooting](.agents/skills/troubleshooting/SKILL.md)**:
   - Diagnostic runbook for MCP connection drops and port collisions.

---

## 4. How to Invoke Skills

To invoke any of these skills in your prompt, simply include the slash command or mention the skill name:

- **Example 1 (Minimal Diff)**:  
  `"Fix the checkout tax calculation /ponytail"`
- **Example 2 (Codebase Architecture)**:  
  `"How are books streamed to the reader canvas? Use graphify"`
- **Example 3 (Over-Engineering Review)**:  
  `"/ponytail-review on the latest changes in backend/src/services"`
- **Example 4 (Token-Efficient Response)**:  
  `"/caveman summarize recent test results"`
- **Example 5 (Accessibility Audit)**:  
  `"Run an a11y audit on the reader page using playwright-mcp"`
