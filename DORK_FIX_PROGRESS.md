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

### Additional fresh-route Edge sample, 2026-10-04

Entered commands from the meeting room through Procurement in Edge and recorded the actual replies before editing. Five gaps were corrected: `ask for help` addressed an imaginary person, `open east door` gave a generic door line, `ride elevator` fell into parser confusion, `look at gate` ignored Jorge's blocked or cleared state, and `use machine` gave a generic workflow line. The new browser checks cover those replies and both elevator locations. The wider sample also included the badge, directory, break room, Jorge, Shelf 20, Ash, the file, and the Legal Annex. Those observed replies were either coherent or did not warrant a change. This remains a sample, not a complete count of authored responses or proof of exhaustive coverage.

### Published-build check and next player-style sample, 2026-10-04

The published `index.html`, `game.js`, `game-data.js`, and `browser_test.py` matched local bytes before this update. The full Edge browser regression passed against the published URL. A separate fresh-run Edge sample entered 32 commands from the meeting room through the Records lobby and recorded the actual replies. Seven observed phrasing gaps were corrected: the missing west door, the calendar invitation, calling the elevator, pressing a floor button, the corridor lights, Jorge's clipboard, and entering his gate. Browser assertions now cover those responses and both blocked and clear gate states. The broader sample still found generic replies for other natural commands, so this is not exhaustive coverage.

Source inventory for planning: 14 rooms, 31 items, 51 room/item description variants, and 115 `print(...)` call sites in `game.js` after this update. Call sites are not distinct responses: branches and interpolation can create several outputs, while one template can serve many commands. No verified total of distinct authored player-facing replies exists yet, and these figures do not demonstrate hundreds of coherent options. Continue the command matrix through the later rooms and count authored templates with an explicit, reproducible definition.
### Later-room live Edge sample, 2026-10-04

After confirming the preceding Dork update on GitHub Pages, entered 32 commands in Edge across HR Reliquary, Occult Compliance, Archives, Sub-Basement, and Continuity Chamber with fresh room states. The Occult Compliance freight elevator gave a vague `look at elevator` reply and rejected `go down elevator`; both are now corrected and covered by browser assertions. Descending from Archives without a lit candle caused a death as designed. Other generic or awkward replies remain, including taking the tarot spread, reading a nonexistent Sub-Basement sign, and asking for unnamed people in the chamber. These observations need a further state-aware review, not an assertion that every response is coherent.

### Later-room command follow-up, 2026-10-04

The prior elevator fix was published as `220e557`; GitHub Pages reported that build complete, its shipped JavaScript and HTML matched local bytes, and the full Edge regression passed against the public URL. A new isolated-state Edge sample across five later rooms found five response gaps: taking or shuffling the tarot spread, examining HR's table, taking the Occult Compliance inbox, and calling its already-present freight elevator. Focused replies and browser assertions now cover those inputs. Other observed responses remain for review, including the nonexistent Sub-Basement sign; this sample does not establish a distinct-response total.

### Published build and another player command sample, 2026-10-04

The published `game.js` matched local bytes before this update, and the full Edge regression passed against the published URL. In a fresh twelve-command Edge sample spanning Records Stacks through the Continuity Chamber, three replies were confusing: `buy candle` and `knock on door` fell into parser scolding, while `read sign` in the Sub-Basement described a nonexistent sign. These now explain the requisition requirements, the door's current puzzle state, and the painted arrow. The local full-route Edge regression passes with assertions for all three and the key-used door state. The other nine sampled replies were coherent; this sample does not establish exhaustive coverage or a distinct authored-response count.
### Later-room natural command sample, 2026-10-04

Entered 15 commands in the actual local Edge page across HR Reliquary, Occult Compliance, Archives, Sub-Basement, and Continuity Chamber. Eight replies were misleading, generic, or failed to follow a visible route: `take drawings`, `take ledger`, `open cabinets`, `ask for directions`, `follow arrow`, `open parking passage`, `ask for names`, and `ask the room about seals`. These now have scene-aware or state-aware replies. `follow arrow` moves east. The browser regression asserts the changed replies, both key states at the final seals, and movement; the full route passes. The other seven observed commands were coherent or out of scope for a new reply. This is a sampled review, not exhaustive command coverage. A reproducible distinct-response inventory and more fresh and progressed-state samples remain.

### Published-room command sample, 2026-10-04

The preceding release was published as `cb04da1`; Pages reported it built, the shipped `game.js` matched local bytes, and the full Edge regression passed at the public URL. A ten-command Edge sample in five later rooms then found four gaps: `touch drawings` gave an unrelated generic touch line, `search cabinets` was rejected, `listen to breathing` said "to to," and `go through roots` denied the visible collapsed passage. Focused responses and browser assertions now cover those commands. The other six sampled replies were coherent. This remains sampled coverage.

### Public build and eleven-command sample, 2026-10-04

GitHub Pages completed build `9402b5d`. The public HTML, JavaScript, data, and CSS matched local bytes; the full Edge regression passed on the published URL. A separate local Edge sample entered eleven natural commands in isolated room states. Six gaps were observed: `search the table`, `ask jorge about creamer` from the break room, `search the shelves`, `read page 64`, `search the desk`, and `search the roots`. Those now have room-specific replies and browser assertions. The other five replies were coherent enough for the sampled state. The full local Edge route passes after the changes. Remaining: verify these fixes on the public build after publication, keep sampling fresh and progressed states, and produce a reproducible inventory of distinct authored responses. The earlier 191-literal figure is provisional and does not count playable options.

### Reproducible Edge response sample, 2026-10-04

GitHub Pages main is `210eac8`. Its HTML, JavaScript, data, and CSS matched local files, and the full Edge browser regression passed on the public URL. `response_inventory.py` now drives seven commands against each listed room item from a fresh isolated room state and records the actual reply in `RESPONSE_INVENTORY.json`. This first run covers 196 commands across 28 listed items in ten rooms and produces 131 distinct observed replies. The count excludes the echoed player command. It is not an exhaustive authored-response count or proof that 196 meaningful choices exist. The sample exposed 24 generic `use` replies and 24 generic `open` replies; these are concrete targets for the next room-by-room writing and state review.

### Item-action writing pass, 2026-10-04

Replayed the same 196-command Edge inventory after adding item-aware `use` and `open` replies. None of the 28 sampled `use` or 28 sampled `open` commands now reaches its prior stock fallback. The refreshed sample contains 123 distinct observed replies. This count fell because several actions now sensibly reuse an item's description or clue; it is not a count of all playable commands or proof of hundreds of distinct responses. The full Edge ending, death, save, parser, and narrow-layout regression passes with new assertions for representative changed replies. More verbs, target combinations, and progressed puzzle states need review before the broader coherence goal is verified.
### Item-touch writing pass, 2026-10-04

The fresh-state Edge inventory identified 16 stock `touch` replies among 28 visible-item commands. Each now has an object-specific reply; the waiver stamp box also distinguishes its open state. Replaying all 196 sampled item commands in Edge found zero stock `touch` replies, and the full ending, death, save, parser, and narrow-layout browser regression passed. The sample still contains 123 distinct observed replies; this does not count all possible player options or establish exhaustive coherence. Continue with other verbs, less literal phrasings, and progressed puzzle states.
### Sensory-command Edge sample, 2026-10-04

Expanded the reproducible fresh-state inventory to ten verbs per item. The baseline Edge sample found stock sensory fallbacks on visible objects, including the glass of water, creamer, mug, agenda, and tarot spread. It also found that `smell tarot spread` was interpreted as READ because `spread` contains `read`, and that generic tarot replies could say `the The Tower`. Scene-aware smell, listen, and taste replies now cover ten prominent objects, and the parser and article errors are corrected. The inventory remains a sampled set of fresh states; progressed puzzle states and other player phrasing still need review.
### Cat sensory-response review, 2026-10-04

The 280-command Edge inventory exposed stock replies that treated named cats like inanimate objects, including `taste Ash` and `listen to Salem`, plus `listen to Jorge` saying "the Jorge." Smell, listen, and taste now give each cat a relevant response; the Jorge article is corrected. The full local Edge route passed, and the refreshed inventory records 280 commands and 208 distinct observed replies. This is sampled coverage rather than an exhaustive count or proof that every command makes sense. Publish and verify this release, then continue testing progressed states and less literal commands.
