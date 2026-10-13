# Expanded Edition 2.0.0 — implementation and acceptance

## Scope

The original 15-room game is preserved and expanded to 23 rooms. Eight additional rooms form a connected optional investigation: IT Helpdesk, server room, Facilities, relay chamber, service lift, Investigations, evidence room, and Below. Legal, Procurement, the household deduction, Asset Control, and the original true ending remain valid without that investigation.

The implementation is an incremental separation of the existing engine, not a framework rewrite. There is no generated-at-runtime story, paid service, conventional combat, randomized critical solution, hidden timer, or persistent puzzle buff.

## Delivered design changes

| Recommendation | Implementation | Acceptance evidence |
| --- | --- | --- |
| Trustworthy parser | One shared exact-name-first resolver; ambiguity clarification; target guards; consistent tarot-taking aliases; no fictional object movement | Core invariants; inventory permutations; action-equivalence matrix; browser failure-path checks |
| Persistent lore | Original text-only LORE command; selected discoveries survive death. Casebook removed at the author's request. | Alias equivalence, existing saves, death/restart/reload, and confirmed backup import |
| Graduated help and map | Three stages for all 23 rooms, resetting with progress; visited-room map with hidden destinations and blocked routes | Every-room hint invariant; hint progression; complete 23-room map |
| Interconnected world | Four related department puzzles; repaired lift links the elevator, Archives, and new departments | Full expanded route and gate rejection tests |
| Meaningful repeat attempts | Cause-specific reports/callbacks, observed warning records, brief revisits, safe command history | Multiple deaths/restarts; no retained inventory or puzzle flags |
| Fair late backtracking | Returned assets are tracked and reclaimable; missing surrendered light produces a recovery instruction | Return/reclaim/restart and blocked backtracking tests |
| Characters and mystery | Topic-aware Jorge, five cat scenes, linked evidence chain, identity-lease dispute, authored ending callbacks | Dialogue tests and full investigation ending |
| Mobile and accessibility | Native dialogs, focus restoration, readable/large-text/reduced-motion settings, real caret, viewport adaptation | Portrait/landscape/keyboard-sized bounds, keyboard actions, screenshots |
| Portability and diagnosis | Confirmed, validated backup import; real backup/transcript downloads; version-tagged records | Playwright download contents, preview/cancel/confirm, corrupt imports |
| Reliability | Versioned and sanitized saves, older-save migration, denied/quota fallback, unsupported-version preservation, transactional action errors | Pure storage tests and real-browser persistence failures |

## Important compatibility decisions

The existing browser storage keys are retained. Version-one paperwork, issued receipt, and inserted-key states migrate. Optional rooms never become a prerequisite for an old save's escape. Imported dead runs still require RESTART. A saved winning run stays won.

All taking synonyms now refuse to pocket all three orientation cards. An old test that intentionally used PICK to select The Tower now uses CHOOSE. Hint aliases still increase the hint count, but the text intentionally changes as the player requests deeper assistance; the historical fixed-text assertion was updated accordingly. The varied-input walkthrough is updated for the real stamped waiver and Asset Control introduced in the preceding release.

The Casebook interface and summary generator have been removed. LORE remains unchanged; internal observation fields are retained for puzzles and compatible saves. Current room connections are observed through room descriptions and updated when the room changes. Prior-run location names are a separate memory section, not a revealed current map. Reading a document updates its stored excerpt so a later inspection of a stamped form supersedes the earlier blank-form observation.

Saving failures never intentionally block play. A memory fallback cannot survive closing the tab, so the warning directs players to export. Future-version saves remain untouched while a temporary compatible run is available; an export of the original is provided. Backups are explicitly a portability tool, not an intended permadeath bypass.

## Test execution

`node tests/core_test.js` checks pure invariants. `browser_test.py` is the retained original full Edge regression. `input_audit_matrix.py` checks 49 vocabulary additions against canonical replies and saved state. `input_audit_playthrough.py` exercises a complete fresh route with varied wording. `tests/expanded_test.py` executes both core and expanded routes and grouped acceptance checks on Chromium and WebKit, saving JSON reports and screenshots under `test-results/`.

A network-free local DOM harness was also used during development; its mocked storage is not counted as proof of browser storage behavior. Release validation uses the shipped files in actual CI browsers, including real localStorage, imports, and downloads.

Mobile-size emulation and WebKit rendering are tested. Physical iPhone hardware, its actual on-screen keyboard, VoiceOver, and every assistive-technology combination are not available in the development environment and must not be represented as tested.

## Maintenance

Keep exact actions and their narrated consequences aligned. Add new objects/scenery to the shared resolver rather than inventing another substring lookup. New departments should remain data plus explicit puzzle transitions. Add a test for every irreversible action, every new state flag, its restart behavior, and its saved-state migration. Preserve the authored narrator and single true ending.

## Discovery-focused interface revision (2026-10-13)

PACK and its object-insertion menu have been removed at the author's request. The ordinary inventory command remains. Tab completion is restricted to carried items; it must not reveal an environmental object list. HELP now contains imaginary syntax examples only, without tarot or property-return instructions. Casebook, Map, Tools, the world, puzzle rules, and save data were not removed or altered by this revision. Cross-browser acceptance includes these discovery constraints.

## Casebook removal (2026-10-13)

Remove the button, panel, CASEBOOK/NOTES/NOTEBOOK command registration, procedural summaries, and references in HELP or puzzle feedback. Keep LORE/JOURNAL/ARCHIVE unchanged, including previously discovered lore. Shared map, hints, and death callbacks now live in `game-support.js`; they do not expose a Casebook. Map, Tools, ordinary inventory, puzzles, and storage schema are unchanged. Browser coverage explicitly verifies retained lore after death, restart, reload, export, and confirmed import.
