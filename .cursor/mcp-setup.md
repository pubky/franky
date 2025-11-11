# MCP (Model Context Protocol) Server Setup

MCP servers enhance AI capabilities by connecting to external tools and data sources.

## Available MCP Servers

We use 2 MCP servers configured in `.cursor/mcp.json`:

1. **Figma Desktop** - Extract design specs from Figma files
2. **Playwright** - Browser automation for testing

---

## 1. Figma MCP (Required)

**Purpose**: Extract design specs from Figma files

**Setup**:

1. Install and open Figma Desktop app
2. Already configured in `.cursor/mcp.json` (runs locally on port 3845)
3. No authentication required

**Usage**:

- "Check Figma design for Button component"
- "Extract spacing from PostCard design"
- "Verify visual parity with Figma"

**Figma Project**: [shadcn_ui-PUBKY](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)

**Note**: Figma Desktop must be running for MCP to work

---

## 2. Playwright MCP (Required)

**Purpose**: Browser automation for testing

**Setup**:

1. Already configured in `.cursor/mcp.json`
2. Run `npm install` (includes Playwright)
3. No auth required - runs locally

**Usage**:

- "Open app and test Button component"
- "Take screenshots at mobile/tablet/desktop sizes"
- "Test login flow and capture errors"

**Troubleshooting**:

- Browser not installed? Run `npx playwright install chromium`

---

## Configuration

### File Location

`.cursor/mcp.json` (already configured for Figma and Playwright)

### Current Configuration

```json
{
  "mcpServers": {
    "Figma Desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    },
    "Playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

**Requirements**:

- Figma Desktop app installed and running
- Playwright installed via `npm install`
- No authentication needed for either server

---

## Quick Onboarding

1. [ ] Run `npm install`
2. [ ] Install and open Figma Desktop app
3. [ ] MCP servers already configured in `.cursor/mcp.json`
4. [ ] Test: Ask AI to "Check Figma for Button specs"

---

## Troubleshooting

**Figma MCP not responding?**

- Check if Figma Desktop app is running
- Verify port 3845 is available
- Restart Figma Desktop app
- Restart Cursor

**Playwright issues?**

- Run `npx playwright install chromium`
- Check if dev server is running

---

## Resources

- [Cursor MCP Docs](https://cursor.sh/docs/mcp)
- [Figma API](https://www.figma.com/developers/api)
- [AGENTS.md](../AGENTS.md) - Main AI context
