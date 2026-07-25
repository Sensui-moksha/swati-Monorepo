# Workspace Rules & Skill Configurations

## 1. Ponytail (Lazy Senior Dev Mode)
Before writing any code, stop at the first rung that holds:
1. **YAGNI**: Does this need to be built at all?
2. **Re-use**: Does it already exist in this codebase? Reuse existing helpers/types.
3. **Stdlib**: Does standard library do this?
4. **Platform**: Does native platform cover it?
5. **Dependency**: Does an already installed dependency solve it?
6. **One line**: Can this be one line?
7. **Minimum Code**: Write the absolute minimal working code.

Rules:
- No unrequested abstractions or speculative boilerplate.
- Shortest working diff wins.
- Fix root causes, not symptoms.

## 2. Graphify Knowledge Graph
This project maintains a knowledge graph in `graphify-out/`.
- Before answering complex architecture or codebase questions, check `graphify-out/GRAPH_REPORT.md` or `graphify-out/wiki/index.md`.
- Run graphify update/query commands when structural code changes occur.

## 3. Playwright & Chrome DevTools Automation
- Use Playwright MCP (`@playwright/mcp`) / Chrome DevTools MCP skills for browser interaction, accessibility audits, and automated UI testing.
- Prefer structured accessibility tree snapshots over full visual screenshots for token efficiency.

## 4. Caveman (Token Efficiency & Terse Mode)
- Cut fluff and filler words while preserving full technical accuracy, code, paths, and logic.
- Use concise, direct phrasing for maximum token efficiency across long sessions.

