# portfolio.ts

A unique, minimal portfolio designed to look like a source file in a modern code editor. Built for CS graduate students who want something different from generic templates.

## What's Different?

- **IDE Aesthetic** — Activity bar, tabs, breadcrumbs, line numbers, status bar. The entire portfolio is presented as a TypeScript file.
- **Syntax Highlighting as Design** — Your name, projects, and skills are styled as code tokens (strings, comments, keywords) using familiar editor color schemes.
- **Dark/Light Editor Themes** — Toggle between "Dark+" and "Light+" modes. Respects system preference.
- **Working Tabs** — Click `README.md` tab to switch to a markdown view. Click `portfolio.ts` to return.
- **Keyboard Navigation** — `Cmd/Ctrl + 1/2/3/4` jumps to sections.
- **Fully Responsive** — Mobile gets a clean bottom tab bar; desktop gets the full IDE chrome.

## Run Locally

### Option 1: Open Directly
Double-click `index.html`. Works fine, but fonts load best from a server.

### Option 2: Local Server (Recommended)

**Python:**
```bash
python -m http.server 8000
