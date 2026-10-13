# Dork changelog

## 2026-10-13 - Preserve discovery; remove PACK and HELP spoilers

- Remove PACK and its carried/visible-object insertion menu completely. Keep the ordinary INVENTORY, INV, and I commands and button.
- Limit Tab completion to carried items so it cannot become a replacement catalog of nearby interactions.
- Rewrite HELP as a syntax reference with imaginary examples; remove tarot instructions and the property-return checkpoint command.
- Keep Casebook, Map, Tools, game content, puzzle logic, and saves unchanged pending separate design decisions.
- Extend Chromium/WebKit acceptance coverage for absent PACK controls, carried-only completion, HELP aliases, and neutral HELP across early and late rooms.

## 2026-10-13 — Expanded Edition 2.0.0

- Unify object resolution, ask about ambiguity, and make all tarot-taking synonyms consistently nonlethal. Preserve explicit target and possession checks.
- Add a persistent observation-only casebook, recorded document excerpts, three-stage state-aware hints for all rooms, and a discovered-area map.
- Add eight connected optional rooms across IT, Facilities, Investigations, and Below. Implement duplicate-ticket resolution, a safely isolated relay repair, lift shortcuts, a four-source evidence comparison, and identity-lease revocation.
- Add topic-aware Jorge conversations, five cat scenes, cause-specific death reports and narrator callbacks, brief revisits, and optional investigation payoffs in the existing true ending.
- Make returned state assets reclaimable and protect backtracking after candle surrender.
- Add accessible PACK/CASEBOOK/MAP/TOOLS panels, history, known-name insertion, readable/large-text/reduced-motion settings, a real input caret, versioned transcript exports, and confirmed save imports.
- Validate and migrate saves; continue in memory when storage is unavailable; preserve unsupported future saves without overwriting them.
- Separate parser, core state, scenery, expansion rules, journal, and interface modules while retaining static/offline deployment.
- Extend regression coverage with pure invariants, the updated varied-input route, and Chromium/WebKit acceptance tests including the complete 23-room investigation.


## 2026-10-12 - Shalisa playtest revision

- Establish the 4:30–5:00 meeting schedule and the stopped 5:17 wall clock; mark the Executive Corridor as Floor 6.
- Make the break-room memo wall-mounted and nonportable, Form 66-B visibly pre-completed, and the Procurement receipt a real employee-copy item.
- Replace the nonsensical stamp-in-slot workflow with a detachable Waiver Form 4C that must be stamped and then submitted as paper.
- Add authored joke responses, self-lighting candle hardware and clearer unlit-candle failure feedback.
- Reconcile the building/door drawings, clarify Luna's reading-stand hiding place, and support furniture-inspection attempts.
- Expose the final key slot, consume the inserted key, and preserve the cat deduction by revealing poses rather than names in clockwise order.
- Add an Asset Control Vestibule: attempting to leave with registered state property now causes termination; RETURN ALL permits the true ending.
- Expand browser regressions for all revised interactions and save migrations.

## 2026-10-11 - Blind playtest revision

- Replace HELP examples that exposed real later puzzles with neutral parser examples.
- Accept NAME as a final-sequence synonym, explain the key prerequisite, and remove the false implication that Boo must be moved before the key can be used.
- Redirect natural waiver/form stamping attempts to Procurement's separate FORM and WAIVER slots.
- Make Page 64, the Legal Annex, the napkin callback, and legacy LORE entries state-aware.
- Preserve the five-anchor sequence requirement in LORE and ground the personnel-file summary in observed text.
- Give stairway and tunnel examinations a useful candle-related clue, acknowledge that BELOW is still elsewhere, improve unsupported USE diagnostics, and keep the opening title visible.
- Add browser regressions for each blind-playtest finding while retaining the complete true-ending route.

## 2026-10-09 - Optional Records discovery payoff

- Reading Scott's personnel file is optional, but if the player examines it, the true ending now recalls its impossible date and frames it as evidence the Agency cannot answer. Skipping the file preserves the original ending.
- Extend the Edge browser regression to complete the discovery route and verify both ending variants.

## 2026-10-08 - Continuity reveal

- Turn the final key moment into a payoff for the napkin clue and the five cats? established poses. The reveal clarifies why the seals are household anchors while preserving the existing name puzzle and route.
- Add a live browser assertion for the reveal, unchanged progression state, and the existing full ending regression.

## 2026-10-08 - Player input audit: reconciled report and varied route

- Generate a complete before/after action and item-alias reconciliation plus a CSV inventory of 30 reusable command patterns. The additions are 17 action aliases and 2 target aliases; no registered alias was removed.
- Add a 49-row Edge equivalence matrix comparing each addition with the canonical reply and saved state, and a 25-command fresh-save playthrough using new phrasing through the true ending. The full browser regression and required MechaJeeves release gate passed.

## 2026-10-08 - Player input audit: card recipients

- Keep an explicitly named unrelated recipient from selecting or triggering a tarot card through the general `give` handler. Edge checks cover both safe and fatal cards. This correction adds no vocabulary.

## 2026-10-08 - Player input audit: setting items down

- Accept both word orders of `set [object] down` and `lay [object] down` through the existing drop action. Browser checks cover all four forms, room placement, negation, unsupported destinations, and unowned items.

## 2026-10-08 - Player-input audit in progress

- Accept `belongings` as inventory and `instructions` as help, plus exact natural requests to show inventory, show commands, and ask for a hint or clue. Edge checks verify each form, hint counts, and negation.
- Add `converse` for talking and `commend` for flattering, with live Edge checks for contextual dialogue, inaccessible targets, negation, and unchanged state.
- Accept `swig` and `slurp` as drinking verbs and `pat` as a touch verb, plus separable drinking and sensory expressions; verify each new form in Edge against actual responses and state.
- Reconcile the original room-scoped route and scenery vocabulary with the parser, item table, and special command handlers in the baseline inventory; no gameplay behavior changed in this documentation slice.
- Accept `step [direction]`, `step into/to/through [known exit]`, and `step up/down [stair or stairs]` through the existing route and hazard checks.
- Accept `travel` and `proceed` with `to`, `into`, or `through` before a direction or known exit, using existing route and blocked-exit checks.
- Verify new movement forms, negation, and lethal stair guard in the Edge browser regression.
- Add `peruse` and `scan` as examination verbs and parse `check out [object]` as examination while preserving the target.
- Exercise those forms through Edge, including an unseen object and a negated request.
- Add `scrutinize` and `scrutinise` for examining, plus `name badge` and `water glass` as visible-object references.
- Accept both separable `hand off [item] to [recipient]` word orders while retaining possession checks.
- Add `retrieve` and `fetch` for taking, `deposit` for dropping, and `deliver` for giving.
- Accept `pick [object] up`, `put [object] down`, `put down [object]`, and both `hand over [item] to [recipient]` word orders.
- Accept optional leading polite requests and a trailing `please`; reject negated phrases before action dispatch.
- Cover each new action alias and grammar pattern with live browser input and game-state assertions.

The wider command and target audit, final additions report, CSV, and varied full playthrough are still in progress.
# 2026-10-08 — Player input audit: opening phrases

- Accept `open up [object]` and `open [object] up` as forms of the existing open action, preserving the stamp box's badge requirement. Browser coverage verifies both forms, missing badge, negation, and an unrelated target.
# 2026-10-08 — Player input audit: throwing and two-object targets

- Accept `fling` and `lob` as throwing verbs, with browser checks for unchanged game state.
- Reject explicitly wrong recipients for Jorge's creamer and mismatched Procurement slots; retain valid machine and slot commands.
- Verify the new inputs and target guards with actual Edge browser commands, including negation and puzzle-state assertions.
