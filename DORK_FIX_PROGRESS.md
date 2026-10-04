# Dork Fix Progress

Resume at the first batch not marked DONE. Each batch must be exercised by `browser_test.py` before it is marked DONE.

| Batch | Fixes | Status | Files changed | Test result | Decision / notes |
|---|---|---|---|---|---|
| 1 | 1, 23 | DONE | `game.js`, `game-data.js`, `browser_test.py` | `browser_test.py` passed: full route, alias boundaries, near-match priority, persistence, mobile, no page errors | Used whole-word/phrase matching and longest-alias selection with room items winning ties; added `drawing` to the wall-drawing aliases so it beats carried napkin text. Updated no prior assertions. |
| 2 | 2, 3, 12, 13 | DONE | `game.js`, `browser_test.py` | `browser_test.py` passed: contract refusal/signing, restart confirmation/cancellation, win lock, literal HTML input, full route and mobile | Restart requires the entire command and consecutive confirmation during active runs; only the fixed boot title uses trusted markup. Updated no prior assertions. |
| 3 | 4, 5, 6 | DONE | `game.js`, `game-data.js`, `browser_test.py` | `browser_test.py` passed: candle use, carried candle gate, leaving/back, exit aliases, full route and mobile | Stored previous room in the existing run state; room exit aliases resolve through each room's actual exits. Updated no prior assertions. |
| 4 | 7, 8, 9, 10, 11 | DONE | `game.js`, `game-data.js`, `browser_test.py` | `browser_test.py` passed: look/inventory phrases, tarot choices, original verb echo, all/help commands, procurement consumption, full route and mobile | Bare TAKE of the lethal cards warns; PICK, SELECT, CHOOSE and USE retain lethal choices. Updated no prior assertions. |
| 5 | 14, 15, 16, 21, 22 | DONE | `game.js`, `game-data.js`, `browser_test.py` | `browser_test.py` passed: entry lines, seal poses, key placement, geography, articles and full route | Kept the machine as the only key source; changed no prior assertions. |
| 6 | 17 | DONE | `game.js`, `game-data.js`, `browser_test.py` | `browser_test.py` passed: state-aware room and box descriptions plus full route | First active flag wins, so finalOpen precedes keyUsed; changed no prior assertions. |
| 7 | 18, 19, 20 | DONE | `game.js`, `game-data.js`, `browser_test.py` | `browser_test.py` passed: Ash, Jorge, five cat interactions, full route and death checks | Added HUG to TOUCH synonyms; changed no prior assertions. |
| 8 | 24 | DONE | `README.md`, `SOLUTION.md`, `browser_test.py` | `browser_test.py` passed: spoiler placement and full browser run | README now points to the separate spoiler file; changed no prior assertions. |

## Player-style review, 2026-10-04

Method: entered commands in Edge against the local page, read each reply, then replayed the full browser regression after changes. These are observed responses, not a source-only estimate of parser coverage.

| Room | Player input | Initial result | Change / remaining note |
|---|---|---|---|
| Meeting | `look at exit sign` | Nonspecific examination | Now points east and explains the missing west door. |
| Meeting | `drink water` | Generic warning unrelated to the visible skin | Now describes the water and leaves the player in control. |
| Meeting | `go through east door` | Parser rejection | Now moves east. |
| Break room | `look in fridge`, `open fridge` | Nonspecific or generic failure | Now describes the contents and Jorge's creamer. |
| Break room | `press vending machine button` | Generic push reply | Now points toward Procurement for the candle. |
| Records lobby | `go through gate` | Parser rejection | Now checks Jorge's gate and respects its blocker. |
| Legal Annex | `refuse contract` | Parser rejection | Now explains that the waiver stamp records refusal. |

The route to the true ending, deaths, autosave, restart, parser boundaries, and narrow layouts still pass in the browser regression. This pass samples seven confusing input patterns; it does not establish that every possible command or room response is coherent. Continue with a room-by-room command matrix, logging each command, state, actual reply, expected behavior, and any remaining generic fallback. Prioritize puzzle objects and common English phrasing before adding novelty lines.
