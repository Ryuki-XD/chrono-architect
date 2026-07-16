# ⏳ Chrono Architect

A polished browser puzzle game where you **record your actions** and **replay them as time clones** — cooperating with your past selves to solve increasingly complex puzzles.

Built entirely with **HTML5 + CSS3 + JavaScript (ES6 Modules) + Phaser 3**. No backend required. All assets are procedurally generated.

![Chrono Architect Screenshot](screenshots/gameplay.png)
*Screenshot placeholder — replace with actual gameplay capture*

---

## 🎮 Gameplay

You wake in a strange facility with the power to manipulate time. Each level presents a puzzle that **cannot be solved alone** — you must record your movements, commit them as a **time clone**, and then cooperate with that clone (and others) to open doors, disable lasers, and reach the exit.

### Core Mechanic
1. **Move** through the level normally
2. Press **SPACE** to commit your actions as a clone
3. The level resets — your clone replays your exact movements
4. Move alongside your clone to solve the puzzle together
5. Reach the **exit portal** to complete the level

### Puzzle Elements
| Element | Description |
|---------|-------------|
| 🟦 Pressure Plates | Activated by standing on them (player, clone, or crate) |
| 🚪 Doors | Open/close based on connected plate or switch signals |
| 📦 Crates | Push onto plates or into laser beams to block them |
| 🔴 Laser Beams | Deadly! Avoid or block with crates. Toggle with switches |
| 🔘 Switches | Toggle connected doors/lasers with the Interact key |
| 💎 Energy Cores | Collect to activate the exit portal |
| 🌀 Exit Portal | Level exit — active when all conditions are met |
| ⬛ Moving Platforms | Ride them across gaps |

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `W` `A` `S` `D` / Arrow Keys | Move |
| `SPACE` | Commit clone (save recording) |
| `E` | Interact (toggle switches) |
| `R` | Restart level |
| `U` | Undo last clone |
| `H` | Show hint |
| `ESC` | Pause menu |

---

## 📦 Installation

### Quick Start (Local)

```bash
# Clone the repository
git clone https://github.com/yourusername/chrono-architect.git
cd chrono-architect

# Serve with any static file server
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` in your browser.

> **Note:** ES6 modules require a local server — opening `index.html` directly via `file://` will not work due to CORS.

### GitHub Pages Deployment

1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch**, root directory `/`
4. Save — your game will be live at `https://yourusername.github.io/chrono-architect/`

No build step required. The game loads Phaser 3 from CDN and runs directly.

---

## 🏗️ Project Structure

```
chrono-architect/
├── index.html              # Entry point
├── main.js                 # Phaser config & bootstrap
├── css/
│   └── style.css           # Global styles + loading screen
├── js/
│   ├── config/
│   │   └── GameConfig.js   # All constants and enums
│   ├── scenes/
│   │   ├── BootScene.js    # Manager init
│   │   ├── PreloadScene.js # Asset generation
│   │   ├── MainMenuScene.js
│   │   ├── LevelSelectScene.js
│   │   ├── GameScene.js    # Core gameplay loop
│   │   └── UIScene.js      # HUD overlay
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Clone.js
│   │   ├── PressurePlate.js
│   │   ├── Door.js
│   │   ├── MovingPlatform.js
│   │   ├── Crate.js
│   │   ├── LaserBeam.js
│   │   ├── Switch.js
│   │   ├── EnergyCore.js
│   │   └── ExitPortal.js
│   ├── managers/
│   │   ├── CloneManager.js
│   │   ├── LevelManager.js
│   │   ├── AudioManager.js
│   │   ├── SaveManager.js
│   │   ├── AchievementManager.js
│   │   └── InputManager.js
│   ├── ui/
│   │   ├── HUD.js
│   │   ├── PauseMenu.js
│   │   ├── VictoryScreen.js
│   │   ├── SettingsPanel.js
│   │   ├── HintPanel.js
│   │   └── AchievementToast.js
│   ├── data/
│   │   ├── LevelData.js    # 20 handcrafted levels
│   │   └── AchievementData.js
│   └── utils/
│       ├── AssetGenerator.js
│       ├── ParticleEffects.js
│       └── MathUtils.js
├── assets/                 # For future custom art/audio
├── LICENSE                 # MIT
└── README.md
```

---

## 🎨 Technical Highlights

- **Deterministic Replay**: Grid-based movement with a fixed-tick system ensures clones replay identically every time
- **Procedural Assets**: All graphics generated via Phaser Graphics API — zero external image files
- **Procedural Audio**: Web Audio API synthesis for all sound effects and ambient music
- **Signal System**: Modular signal wiring connects plates/switches to doors/lasers/platforms
- **Performance**: Single RenderTexture for static tiles, minimal draw calls, consistent 60 FPS
- **Persistence**: LocalStorage save with schema versioning and migration
- **Achievement System**: 15 achievements with toast notifications
- **Responsive**: Phaser Scale.FIT with CENTER_BOTH adapts to any viewport

---

## 📊 Levels

20 handcrafted levels with progressive difficulty:

| # | Name | New Mechanic |
|---|------|-------------|
| 1 | First Echo | Movement basics |
| 2 | Mirror Image | Clone recording |
| 3 | Dual Presence | Multiple plates |
| 4 | Three's Company | Two clones |
| 5 | Push & Pull | Crates |
| 6 | Laser Maze | Lasers (avoid) |
| 7 | Block the Beam | Crate + laser interaction |
| 8 | Switched On | Switches |
| 9 | Moving Ground | Moving platforms |
| 10 | Energy Harvest | Energy cores |
| 11–15 | Combination puzzles | Multi-mechanic |
| 16–18 | Advanced puzzles | Complex coordination |
| 19 | Paradox Engine | 4-clone puzzle |
| 20 | The Architect | Ultimate challenge |

---

## 🛠️ Tech Stack

- **Engine**: [Phaser 3.80.1](https://phaser.io/) (CDN)
- **Language**: JavaScript ES6 Modules
- **Styling**: Vanilla CSS3
- **Fonts**: Google Fonts (Orbitron, Inter)
- **Audio**: Web Audio API (procedural synthesis)
- **Storage**: LocalStorage
- **Deployment**: GitHub Pages compatible (zero build)

---

## 📄 License

[MIT License](LICENSE) — feel free to fork, modify, and share.
