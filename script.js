// ============================================================
// PORTFOLIO.TS — Interactive IDE Experience
// ============================================================

// --- Theme Management ---
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

const getPreferredTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

const setTheme = (theme) => {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
};

setTheme(getPreferredTheme());

themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
});

window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme"))
            setTheme(e.matches ? "dark" : "light");
    });

// --- Tab Switching ---
const tabs = document.querySelectorAll(".tab");
const codeContents = document.querySelectorAll(".code-content");
const treeFiles = document.querySelectorAll(".tree-file");
const bcFile = document.getElementById("bcFile");
const langIndicator = document.getElementById("langIndicator");

const tabConfig = {
    portfolio: { file: "portfolio.ts", lang: "TypeScript" },
    readme: { file: "README.md", lang: "Markdown" },
    config: { file: "config.json", lang: "JSON" },
};

const switchTab = (tabName) => {
    tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    codeContents.forEach((content) => {
        content.classList.toggle("active", content.id === tabName + "Content");
    });

    treeFiles.forEach((file) => {
        file.classList.toggle("active", file.dataset.tab === tabName);
    });

    const config = tabConfig[tabName];
    if (config) {
        bcFile.textContent = config.file;
        langIndicator.textContent = config.lang;
    }

    document.getElementById("editor").scrollTop = 0;
};

tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

treeFiles.forEach((file) => {
    file.addEventListener("click", () => switchTab(file.dataset.tab));
});

// --- Explorer Toggle ---
const toggleExplorer = document.getElementById("toggleExplorer");
const collapseExplorer = document.getElementById("collapseExplorer");
const app = document.querySelector(".app");

toggleExplorer.addEventListener("click", () => {
    app.classList.toggle("explorer-open");
});

collapseExplorer.addEventListener("click", () => {
    app.classList.remove("explorer-open");
});

document.querySelectorAll(".tree-folder-header").forEach((header) => {
    header.addEventListener("click", () => {
        const folder = header.parentElement;
        const children = folder.querySelector(".tree-children");
        folder.classList.toggle("open");
        if (children) {
            children.classList.toggle("collapsed");
        }
    });
});

// --- Navigation ---
const sections = document.querySelectorAll(".code-section");
const activityIcons = document.querySelectorAll(".activity-icon[data-section]");
const mobileBtns = document.querySelectorAll(".mobile-btn");

const scrollToSection = (id) => {
    switchTab("portfolio");
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};

const setActiveSection = (id) => {
    activityIcons.forEach((icon) => {
        icon.classList.toggle("active", icon.dataset.section === id);
    });
    mobileBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.section === id);
    });
};

activityIcons.forEach((icon) => {
    icon.addEventListener("click", () => scrollToSection(icon.dataset.section));
});

mobileBtns.forEach((btn) => {
    btn.addEventListener("click", () => scrollToSection(btn.dataset.section));
});

const editor = document.getElementById("editor");
const observerOptions = {
    root: editor,
    threshold: 0.1,
    rootMargin: "-50px 0px -50% 0px",
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
        }
    });
}, observerOptions);

sections.forEach((section) => observer.observe(section));

// --- Cursor Position ---
const cursorPos = document.getElementById("cursorPos");

const updateCursorPos = () => {
    const scrollTop = editor.scrollTop;
    const lineHeight = 24;
    const line = Math.floor(scrollTop / lineHeight) + 1;
    cursorPos.textContent = `Ln ${Math.min(line, 999)}, Col 1`;
};

editor.addEventListener("scroll", updateCursorPos);

// --- Active Line ---
const updateActiveLine = () => {
    const lines = document.querySelectorAll(".code-content.active .line");
    const scrollTop = editor.scrollTop;
    const lineHeight = 24;
    const activeIndex = Math.floor(scrollTop / lineHeight);

    lines.forEach((line, index) => {
        line.classList.toggle("active-line", index === activeIndex);
    });
};

editor.addEventListener("scroll", updateActiveLine);

// --- Terminal (Fully Interactive) ---
const terminal = document.getElementById("terminal");
const toggleTerminal = document.getElementById("toggleTerminal");
const closeTerminal = document.getElementById("closeTerminal");
const maximizeTerminal = document.getElementById("maximizeTerminal");
const terminalBody = document.getElementById("terminalBody");
const terminalInput = document.getElementById("terminalInput");

toggleTerminal.addEventListener("click", () => {
    terminal.classList.toggle("active");
    if (terminal.classList.contains("active")) {
        setTimeout(() => terminalInput.focus(), 100);
    }
});

closeTerminal.addEventListener("click", () => {
    terminal.classList.remove("active");
    terminal.classList.remove("maximized");
});

maximizeTerminal.addEventListener("click", () => {
    terminal.classList.toggle("maximized");
});

// Terminal state
let commandHistory = [];
let historyIndex = -1;
let currentDir = "~";

const terminalCommands = {
    help: () => ({
        output: `Available commands:
  about       Display about information
  projects    List all projects  
  skills      Show tech stack
  contact     Display contact info
  theme       Toggle dark/light theme
  clear       Clear terminal
  ls          List files
  pwd         Print working directory
  whoami      Display current user
  date        Show current date
  echo <msg>  Print a message
  cat <file>  View file contents
  cd <dir>    Change directory
  open <sec>  Open section (about|projects|skills|contact)
  github      Open GitHub profile
  linkedin    Open LinkedIn profile
  email       Compose email`,
        type: "info",
    }),

    about: () => ({
        output: `Name: Ahed Shammas
Role: Junior Software Developer
Location: Tartus, Syria
Status: Fullstack Web Developer Trainee at Bytes4Future
Currently: Building web applications with Laravel & PHP`,
        type: "success",
    }),

    projects: () => ({
        output: `📁 Projects/

  1. Lara Notes (2025)
     └─ Laravel notes app with authentication and CRUD operations.
     
  2. My School Hub (2023-2024)
     └─ Responsive school website with login functionality.`,
        type: "success",
    }),

    skills: () => ({
        output: `Languages:   HTML, CSS, JavaScript, PHP, SQL
Frameworks:  Laravel, Bootstrap
Tools:       Git, GitHub, VS Code, MySQL`,
        type: "success",
    }),

    contact: () => ({
        output: `Email:    ahedshammas@gmail.com
GitHub:   github.com/ahed1854
LinkedIn: linkedin.com/in/ahed1854
Twitter:  x.com/Ahed1854

Tip: Use 'github', 'linkedin', or 'email' command to open directly.`,
        type: "success",
    }),

    theme: () => {
        themeToggle.click();
        return {
            output: `Theme switched to ${html.getAttribute("data-theme")} mode.`,
            type: "success",
        };
    },

    clear: () => "CLEAR",

    ls: () => ({
        output: `portfolio.ts  README.md  config.json  src/  assets/`,
        type: "success",
    }),

    pwd: () => ({
        output: `/home/ahed/portfolio${currentDir === "~" ? "" : "/" + currentDir}`,
        type: "info",
    }),

    whoami: () => ({
        output: `ahed (Junior Software Developer)`,
        type: "info",
    }),

    date: () => ({
        output: new Date().toString(),
        type: "info",
    }),

    echo: (args) => ({
        output: args.join(" ") || "",
        type: "success",
    }),

    cat: (args) => {
        const file = args[0];
        const files = {
            "portfolio.ts": "// See editor tab above",
            "README.md": "# Ahed Shammas\n\nJunior Software Developer",
            "config.json": '{"name": "Ahed Shammas", "version": "2.1.0"}',
            "welcome.txt": "Welcome to my portfolio!",
        };
        return {
            output: files[file] || `cat: ${file}: No such file or directory`,
            type: files[file] ? "success" : "error",
        };
    },

    cd: (args) => {
        const dir = args[0] || "~";
        if (dir === ".." || dir === "~") {
            currentDir = "~";
            return { output: "", type: "success" };
        }
        const dirs = ["src", "assets", "projects"];
        if (dirs.includes(dir)) {
            currentDir = dir;
            return { output: "", type: "success" };
        }
        return { output: `cd: ${dir}: No such directory`, type: "error" };
    },

    open: (args) => {
        const sec = args[0];
        const valid = ["about", "projects", "skills", "contact"];
        if (valid.includes(sec)) {
            scrollToSection(sec);
            return {
                output: `Opened ${sec} section in editor.`,
                type: "success",
            };
        }
        return { output: `Usage: open <${valid.join("|")}>`, type: "error" };
    },

    github: () => {
        window.open("https://github.com/ahed1854", "_blank");
        return { output: "Opening GitHub profile...", type: "success" };
    },

    linkedin: () => {
        window.open("https://linkedin.com/in/ahed1854", "_blank");
        return { output: "Opening LinkedIn profile...", type: "success" };
    },

    email: () => {
        window.location.href = "mailto:ahedshammas@gmail.com";
        return { output: "Opening email client...", type: "success" };
    },
};

const addTerminalLine = (html, type = "output") => {
    const line = document.createElement("div");
    line.className = "terminal-line";

    if (type === "prompt") {
        // Updated prompt to "ahed@portfolio"
        line.innerHTML = `<span class="terminal-prompt">ahed@portfolio:${currentDir}$</span> <span class="terminal-cmd">${html}</span>`;
    } else if (type === "CLEAR") {
        terminalBody.innerHTML = "";
        return;
    } else {
        line.innerHTML = `<span class="terminal-output ${type}">${html}</span>`;
    }

    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
};

const executeCommand = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;

    addTerminalLine(trimmed, "prompt");

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = terminalCommands[cmd];
    if (command) {
        const result = command(args);
        if (result === "CLEAR") {
            terminalBody.innerHTML = "";
            addTerminalLine(
                "Terminal cleared. Type 'help' for commands.",
                "info",
            );
        } else if (typeof result === "object") {
            addTerminalLine(result.output, result.type);
        }
    } else {
        addTerminalLine(
            `Command not found: ${cmd}. Type 'help' for available commands.`,
            "error",
        );
    }
};

terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const value = terminalInput.value;
        executeCommand(value);
        terminalInput.value = "";
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            terminalInput.value = "";
        }
    } else if (e.key === "Tab") {
        e.preventDefault();
        const val = terminalInput.value.toLowerCase();
        const cmds = Object.keys(terminalCommands);
        const match = cmds.find((c) => c.startsWith(val));
        if (match) {
            terminalInput.value = match;
        }
    } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        terminalBody.innerHTML = "";
        addTerminalLine("Terminal cleared. Type 'help' for commands.", "info");
    }
});

terminalBody.addEventListener("click", () => {
    terminalInput.focus();
});

// --- Command Palette (Shortcut: Ctrl+Shift+Q) ---
const commandPalette = document.getElementById("commandPalette");
const cpInput = document.getElementById("cpInput");
const cpResults = document.getElementById("cpResults");

const paletteCommands = [
    {
        label: "Go to About",
        action: () => scrollToSection("about"),
        shortcut: "Ctrl+1",
        icon: "👤",
    },
    {
        label: "Go to Projects",
        action: () => scrollToSection("projects"),
        shortcut: "Ctrl+2",
        icon: "📁",
    },
    {
        label: "Go to Skills",
        action: () => scrollToSection("skills"),
        shortcut: "Ctrl+3",
        icon: "⚡",
    },
    {
        label: "Go to Contact",
        action: () => scrollToSection("contact"),
        shortcut: "Ctrl+4",
        icon: "✉️",
    },
    {
        label: "Toggle Theme",
        action: () => themeToggle.click(),
        shortcut: "",
        icon: "🌓",
    },
    {
        label: "Toggle Explorer",
        action: () => toggleExplorer.click(),
        shortcut: "Ctrl+Shift+Z",
        icon: "📂",
    },
    {
        label: "Toggle Terminal",
        action: () => toggleTerminal.click(),
        shortcut: "Ctrl+`",
        icon: "💻",
    },
    {
        label: "Open README",
        action: () => switchTab("readme"),
        shortcut: "",
        icon: "📄",
    },
    {
        label: "Open Config",
        action: () => switchTab("config"),
        shortcut: "",
        icon: "⚙️",
    },
    {
        label: "Find in File",
        action: () => toggleFindWidget(),
        shortcut: "Ctrl+F",
        icon: "🔍",
    },
    {
        label: "Command Palette",
        action: () => {},
        shortcut: "Ctrl+Shift+Q",
        icon: "⌘",
    },
];

const openCommandPalette = () => {
    commandPalette.classList.add("active");
    cpInput.value = "";
    cpInput.focus();
    renderPaletteResults(paletteCommands);
};

const closeCommandPalette = () => {
    commandPalette.classList.remove("active");
};

const renderPaletteResults = (commands) => {
    cpResults.innerHTML = commands
        .map(
            (cmd, index) => `
        <div class="cp-result ${index === 0 ? "active" : ""}" data-index="${index}">
            <span class="cp-result-icon">${cmd.icon}</span>
            <span>${cmd.label}</span>
            ${cmd.shortcut ? `<span class="cp-result-key">${cmd.shortcut}</span>` : ""}
        </div>
    `,
        )
        .join("");

    document.querySelectorAll(".cp-result").forEach((el, i) => {
        el.addEventListener("click", () => {
            commands[i].action();
            closeCommandPalette();
        });
    });
};

cpInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = paletteCommands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query),
    );
    renderPaletteResults(filtered);
});

commandPalette
    .querySelector(".cp-backdrop")
    .addEventListener("click", closeCommandPalette);

// --- Find Widget ---
const findWidget = document.getElementById("findWidget");
const findInput = document.getElementById("findInput");
const findCount = document.getElementById("findCount");
const findPrev = document.getElementById("findPrev");
const findNext = document.getElementById("findNext");
const findClose = document.getElementById("findClose");

let findMatches = [];
let findCurrentIndex = -1;

const toggleFindWidget = () => {
    findWidget.classList.toggle("active");
    if (findWidget.classList.contains("active")) {
        findInput.focus();
        findInput.select();
    }
};

const performFind = () => {
    const query = findInput.value.toLowerCase();
    if (!query) {
        findCount.textContent = "0/0";
        return;
    }

    const activeContent = document.querySelector(".code-content.active");
    const text = activeContent.textContent.toLowerCase();
    findMatches = [];
    let index = text.indexOf(query);

    while (index !== -1) {
        findMatches.push(index);
        index = text.indexOf(query, index + 1);
    }

    findCurrentIndex = findMatches.length > 0 ? 0 : -1;
    updateFindCount();
};

const updateFindCount = () => {
    if (findMatches.length === 0) {
        findCount.textContent = "0/0";
        return;
    }
    findCount.textContent = `${findCurrentIndex + 1}/${findMatches.length}`;
};

findInput.addEventListener("input", performFind);
findClose.addEventListener("click", () =>
    findWidget.classList.remove("active"),
);

// --- Context Menu ---
const contextMenu = document.getElementById("contextMenu");

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.add("active");
});

document.addEventListener("click", () => {
    contextMenu.classList.remove("active");
});

document.querySelectorAll(".cm-item").forEach((item) => {
    item.addEventListener("click", () => {
        const action = item.dataset.action;
        switch (action) {
            case "theme":
                themeToggle.click();
                break;
            case "palette":
                openCommandPalette();
                break;
            case "goto":
                break;
        }
    });
});

// --- Tooltip ---
const tooltip = document.getElementById("tooltip");

const showTooltip = (el, text) => {
    tooltip.textContent = text;
    tooltip.classList.add("active");
    const rect = el.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
};

const hideTooltip = () => {
    tooltip.classList.remove("active");
};

document.querySelectorAll(".token-function").forEach((el) => {
    el.addEventListener("mouseenter", () => showTooltip(el, "function"));
    el.addEventListener("mouseleave", hideTooltip);
});

document.querySelectorAll(".token-type").forEach((el) => {
    el.addEventListener("mouseenter", () => showTooltip(el, "type: string"));
    el.addEventListener("mouseleave", hideTooltip);
});

// --- Keyboard Shortcuts (Updated) ---
document.addEventListener("keydown", (e) => {
    // Command Palette: Ctrl+Shift+Q (or Cmd+Shift+Q)
    if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === "q" || e.key === "Q")
    ) {
        e.preventDefault();
        openCommandPalette();
        return;
    }

    // Find: Cmd/Ctrl+F
    if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        toggleFindWidget();
        return;
    }

    // Escape closes overlays
    if (e.key === "Escape") {
        closeCommandPalette();
        findWidget.classList.remove("active");
        return;
    }

    // Section navigation: Cmd/Ctrl+1-4
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        const key = parseInt(e.key);
        if (key >= 1 && key <= 4) {
            e.preventDefault();
            const targets = ["about", "projects", "skills", "contact"];
            scrollToSection(targets[key - 1]);
            return;
        }
    }

    // Explorer toggle: Ctrl+Shift+Z (or Cmd+Shift+Z)
    if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === "z" || e.key === "Z")
    ) {
        e.preventDefault();
        toggleExplorer.click();
        return;
    }

    // Terminal toggle: Ctrl+`
    if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        toggleTerminal.click();
        return;
    }

    // Palette navigation
    if (commandPalette.classList.contains("active")) {
        const results = document.querySelectorAll(".cp-result");
        const active = document.querySelector(".cp-result.active");
        let activeIndex = active ? parseInt(active.dataset.index) : -1;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % results.length;
            results.forEach((r, i) =>
                r.classList.toggle("active", i === activeIndex),
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex =
                activeIndex <= 0 ? results.length - 1 : activeIndex - 1;
            results.forEach((r, i) =>
                r.classList.toggle("active", i === activeIndex),
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (active) active.click();
        }
    }
});

// --- Clock ---
const clock = document.getElementById("clock");
const updateClock = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};
setInterval(updateClock, 1000);
updateClock();

// --- Git Changes ---
const gitChanges = document.getElementById("gitChanges");
const updateGitChanges = () => {
    const changes = Math.floor(Math.random() * 5);
    gitChanges.textContent = changes === 0 ? "0 changes" : `${changes} changes`;
    gitChanges.style.color = changes > 0 ? "#3fb950" : "var(--text-secondary)";
};

setInterval(updateGitChanges, 30000);
updateGitChanges();

// --- Initialize ---
document.addEventListener("DOMContentLoaded", () => {
    switchTab("portfolio");

    const content = document.querySelector(".code-content.active");
    if (content) {
        content.style.opacity = "0";
        content.style.transform = "translateY(10px)";
        content.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        requestAnimationFrame(() => {
            content.style.opacity = "1";
            content.style.transform = "translateY(0)";
        });
    }

    const allLines = document.querySelectorAll(".line");
    const modifiedIndices = [5, 12, 28, 45, 67];
    modifiedIndices.forEach((i) => {
        if (allLines[i]) allLines[i].classList.add("modified");
    });

    const addedIndices = [8, 15, 30];
    addedIndices.forEach((i) => {
        if (allLines[i]) allLines[i].classList.add("added");
    });
});
