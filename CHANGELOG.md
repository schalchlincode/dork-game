# Dork changelog

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
