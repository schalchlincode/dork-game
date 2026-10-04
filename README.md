# DORK — A Scott Adventure

A mobile-first, Zork-inspired dark-comedy parser adventure built as a static web game.

## Play locally
Open `index.html` in a modern browser.

Run the browser regression check from the MechaJeeves root with
`.venv\Scripts\python.exe projects\dork_release\browser_test.py`.
It uses the installed Playwright and Edge browser; the game itself needs neither.

For a reproducible sample of player-facing replies, run
`.venv\Scripts\python.exe projects\dork_release\response_inventory.py`.
The generated `RESPONSE_INVENTORY.json` records actual Edge input and replies
for ten verbs against each listed room item in a fresh isolated room state.
It is a sample, not a count of every possible command or authored response.

## True ending path
See `SOLUTION.md` for the spoiler walkthrough.

## Publish on GitHub Pages
1. Create a new GitHub repository, e.g. `dork-game`.
2. Upload every file in this folder to the repository root.
3. In GitHub: **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then Save.
6. GitHub will provide the public URL after deployment.

No server, database, API key, build process, npm package, or framework is required.

## Files
- `index.html` — page shell and CRT terminal markup
- `style.css` — responsive retro monitor / iPhone UI
- `game-data.js` — rooms, objects, descriptions, world content
- `game.js` — parser, game state, puzzles, permadeath, persistence
- `DESIGN.md` — design rules for future expansion
- `CODEX_PROMPT.txt` — prompt for MechaJeeves/Codex to audit and extend the project safely

## Current mechanics
- Permadeath with persistent death log
- Persistent discovered lore
- Narrator remembers prior runs
- Optional insulting hint system
- Broad parser synonyms plus dozens of novelty verbs
- Object-specific interactions and generic responses
- Inventory and puzzle state
- Local autosave between browser sessions
- Clear true ending
- Touch-friendly command buttons
- iPhone safe-area support and responsive portrait/landscape layouts

## Reset all persistent data
In Safari/Chrome, clear site data for the GitHub Pages site. For development, browser DevTools can run:

```js
localStorage.removeItem('dork_meta_v1');
localStorage.removeItem('dork_run_v1');
location.reload();
```
