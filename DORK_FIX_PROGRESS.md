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

### Wider Edge command matrix

Method: each input was entered through the actual Edge page in the named room with late-game puzzle items available. The initial reply was recorded before code changes. The corrected cases are covered by `browser_test.py`; the true-ending route and mobile checks pass too.

| Room | Input | Initial reply problem | Resolution |
|---|---|---|---|
| Executive Corridor | `read directory`; `press elevator button`; `open elevator`; `go to records` | Nonspecific or generic reply; named route rejected | Directory, dead button, and elevator now explain the route; Records is a south exit alias. |
| Records Stacks | `look at shelves`; `open file` | Nonspecific shelves; file did not open | Shelves describe Shelf 20; opening the file reads it. |
| Legal Annex | `read sign` | Nonspecific sign | Sign points to the waiver stamp. |
| Procurement | `look at slots` | Nonspecific slots | Describes both required slots and the taped-over third. |
| HR Reliquary | `look at east wall` | Nonspecific wall | Describes the blocked or opened passage based on tarot state. |
| Occult Compliance | `look at inbox` | Nonspecific inbox | Describes Salem and the empty tray. |
| Archives | `look at stair`; `open ledger` | Nonspecific stair; ledger did not open | Stair warns of darkness; opening ledger reads it. |
| Sub-Basement | `look at roots`; `look at lights` | Nonspecific replies | Explains the blocked parking passage and failed lights. |
| Continuity Chamber | `look at door`; `touch seals`; `open door` | Nonspecific door; ungrammatical seal reply; generic opening response | Replies track the key and door state and point to the five-name clue. |

Remaining review: test more natural phrasings and novelty verbs per room in both fresh and progressed states. This matrix verifies observed commands, not a count of distinct authored responses or exhaustive parser coverage.

### Additional Edge command sample, 2026-10-04

Fresh states were loaded in the actual Edge page. The first reply below was observed before editing; the corrected replies now have browser assertions and the full ending regression passes.

| Room | Input | Initial reply problem | Resolution |
|---|---|---|---|
| Meeting | `look under table`; `open agenda` | Nonspecific table; agenda said nothing opens | Table names what is under it; opening the agenda reads its contents. |
| Break room | `read warning`; `use coffee machine` | Nonspecific warning; use rejected the machine | Both now describe visible context and point toward Jorge's creamer. |
| Records lobby | `read placard` | Nonspecific placard | Gives Jorge's title and the gate context. |
| Records stacks | `read shelf 20` | Nonspecific shelf | Reads the scratched warning. |
| Legal Annex | `stamp contract` | Parser rejected a plausible refusal action | Explains that the waiver stamp goes to Procurement with Form 66-B. |
| Archives | `go down stairs` | Parser rejected a natural route phrase | Descends when a lit candle is carried; the existing darkness rule still applies. |

`read drawings` was also checked in Occult Compliance: it describes the drawings and then prints an archive update. No change was needed. More fresh and progressed puzzle states remain to be sampled; this is still not an exhaustive response count.

### Fresh-room Edge sample, 2026-10-04

Entered 31 commands in Edge across ten rooms with the named room loaded. Each reply and room state was inspected. The existing full-route regression was replayed after the changes below.

| Room | Input | Observed problem | Resolution |
|---|---|---|---|
| Meeting | `go out the door`; `take water`; `sit at table` | Exit rejected; glass gave a generic refusal; sitting gave a generic line | Exit goes east; glass and table replies reflect visible scene. |
| Records lobby | `open gate` | Generic failure even when Jorge had moved | Uses the gate's normal blocked or clear movement rule. |
| Legal Annex | `refuse to sign`; `take stamp` | Refusal missed waiver clue; locked stamp was reported absent | Both now point to the waiver stamp and acrylic box. |
| Procurement | `read sign` | Nonspecific reply | Explains documented necessity and the machine's two required inputs. |
| Occult Compliance | `open inbox` | Generic failure | Describes Salem and the tray. |
| Archives | `look at cabinets` | Nonspecific reply | Describes the mortared cabinets and points to the ledger. |
| Sub-Basement | `go to parking`; `look at arrow`; `turn on lights` | Route and scenery replies missed the visible blockade or failed lights | Names the black roots, eastern route, and candle. |

The sampled commands that already made sense were left alone. The browser regression now asserts these corrected replies and both blocked and clear gate states. This is another observed sample, not exhaustive parser coverage or evidence of hundreds of distinct coherent replies.

### Progressed-state Edge sample, 2026-10-04

Entered commands through the Edge page after loading puzzle states with Jorge moved, the stamp taken, the tarot solved, and the final door open. Recorded the actual reply and room before making changes; the corrected cases have browser assertions.

| State / room | Input | Observed problem | Resolution |
|---|---|---|---|
| Jorge moved / Records lobby | `push gate` | Generic push line, no movement | Opens the clear gate and enters the stacks. |
| Stamp carried / Legal Annex | `take stamp` | Claimed the stamp could not be found | Says it is already carried and the box is empty. |
| Tarot solved / HR Reliquary | `look at wall`; `go through passage` | Vague wall description; visible passage rejected | Describes the open wall and follows the passage east. |
| Final door open / Continuity Chamber | `go through door` | Visible exit rejected | Enters the parking garage. |

Other sampled replies were coherent or gave a fair clue: Jorge's dialogue after moving, the open acrylic box, the chamber seals and door, and the final door's open description. `say the five names` does not solve the puzzle without names; that is expected. This review is still sampled rather than exhaustive, and it does not establish hundreds of distinct authored responses.
