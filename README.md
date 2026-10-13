# DORK — A Scott Adventure

## Expanded Edition · 2.0.0

A mobile-first, Zork-inspired dark-comedy parser adventure. Escape an occult state agency using observation, paperwork, and a household the Agency has badly misunderstood.

**Play:** open `index.html` in a modern browser, or play the GitHub Pages deployment. Keep the JavaScript and CSS files beside the page. The game needs no server, installation, account, API key, package manager, or network connection after the files have loaded. A downloaded copy and the hosted site have separate browser saves.

The original escape route remains intact. The expanded edition adds eight interconnected optional rooms, department puzzles, a repaired service-lift loop, a deeper investigation, and a playable Below. There is still one true ending. Knowledge survives death; items and solved puzzles do not.

### Controls

Type a command and press Enter or the submit button. LOOK, EXAMINE, TAKE, DROP, USE, GIVE, TALK, and N/S/E/W are useful starting points. HELP gives neutral examples. HINT offers three deliberate stages of assistance for the current puzzle. HELP teaches syntax with imaginary examples, not actual puzzles or their special commands.

INVENTORY (INV / I) lists only carried items in the transcript. There is no PACK panel or clickable surroundings catalog; discover interactions by reading and experimenting. LORE (also JOURNAL / ARCHIVE) prints selected discoveries in the transcript and retains them between runs. There is no Casebook panel, automatic objectives list, or hazard-summary interface. MAP reveals visited rooms and marks unexplored or blocked connections without exposing their destinations.

TOOLS contains readable display, larger text, reduced animation, brief revisits, history, save import/export, and transcript export. Up/Down recalls commands and preserves an unfinished draft. Tab can complete a single unambiguous carried object name, never a nearby or undiscovered object. Escape closes a panel. LOOK always gives the full room description, even when brief revisits are enabled.

### Saves and permadeath

Autosave retains the existing `dork_run_v1` and `dork_meta_v1` browser keys so older saves migrate in place. The payload now has an explicit schema version. Invalid collections are sanitized; future-version saves are preserved, not overwritten. TOOLS can export the preserved original before replacing it deliberately.

If browser storage is denied or full, the current tab continues in memory and displays a warning. Export a backup before closing it. A save import is validated and previewed; it only replaces the current run after CONFIRM REPLACE. Importing a backup can restore an earlier run, so treat backups as portability/recovery tools rather than part of the intended permadeath challenge.

Death clears the run and records a cause-specific separation report. RESTART begins with empty inventory and puzzle flags. Read evidence, learned warnings, and narrator callbacks remain. Returning property at Asset Control is reversible through its recovery hatch, but reclaimed state property must be returned again before departure.

### Walkthrough and engineering notes

See `SOLUTION.md` for the spoiler walkthrough. `EXPANDED_EDITION.md` describes the architecture, acceptance criteria, deliberate behavior changes, and testing limits. Earlier audit Markdown/JSON/CSV files are retained as historical snapshots, not current exhaustive coverage reports.

### Run the tests

The game has no runtime dependencies. Development tests require Node and Python with Playwright:

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install --with-deps msedge chromium webkit
node tests/core_test.js
python browser_test.py
python input_audit_matrix.py
python input_audit_playthrough.py
python tests/expanded_test.py
```

`browser_test.py` retains the original Edge regression. The expanded suite runs Chromium and WebKit, checks both complete routes, and exercises failure paths, save migrations, real file exports/imports, narrow portrait/landscape layouts, and focus behavior. Test evidence is written to `test-results/` and uploaded by CI. WebKit/device-size emulation is not a substitute for a physical iPhone keyboard check.

`DORK_BROWSER_EXECUTABLE` selects an installed Chromium executable for local tests. `DORK_TEST_URL` can target a deployed page instead of a local file. To regenerate a sampled response inventory, run `python response_inventory.py --output test-results/current-response-inventory.json`.

### Source layout

| File | Responsibility |
| --- | --- |
| `engine-core.js` | Pure object resolution, validated/versioned state, resilient storage, backup decoding |
| `parser.js` | Shared verb vocabulary and command grammar |
| `game-data.js` | Original rooms and objects |
| `expansion-data.js` | Optional departments, objects, clues, and room connections |
| `world-content.js` | Registered scenery and state-aware descriptions |
| `expansion.js` | Department puzzle rules, conversations, scenes, and ending callbacks |
| `game-support.js` | Discovered map, graduated hints, death lessons, and observation metadata |
| `interface.js` | Accessible panels, history, settings, downloads, confirmed imports |
| `game.js` | Core puzzle actions, command dispatch, narration, run lifecycle |
| `index.html`, `style.css` | Responsive CRT presentation and readable display |

### Deployment

GitHub Pages serves `main` at the repository root. No build step is needed. Test a feature branch before merging; the expanded validation workflow publishes a downloadable source archive and test evidence. A release should pass the original regression, parser invariants, equivalence matrix, varied-command route, and Chromium/WebKit acceptance suite.

### Reset all local data

Export a backup first. Clear the site's browser data, or use DevTools:

```js
['dork_meta_v1', 'dork_run_v1', 'dork_preferences_v2'].forEach(key => localStorage.removeItem(key));
location.reload();
```
