# DORK — A Scott Adventure

A mobile-first, Zork-inspired dark-comedy parser adventure built as a static web game.

## Play locally
Open `index.html` in a modern browser.

Run the browser regression check from the MechaJeeves root with
`.venv\Scripts\python.exe projects\dork_release\browser_test.py`.
It uses the installed Playwright and Edge browser; the game itself needs neither.

## True ending path
Take the badge; visit the break room for Jorge's creamer; give it to him in
Records. Take Form 66-B in the stacks. Open the Legal stamp box with your badge.
Insert the form and stamp in Procurement. Choose The Tower in HR. Read the
Compliance manual, then light the black candle in the Archives before taking
the east stair. In the chamber, use the silver key and name the cats in seal
order: Boo, Salem, Ash, Luna, Merlin. Go east through the released door.

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
