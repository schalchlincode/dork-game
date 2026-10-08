# Dork player input audit: baseline lexicon

Captured from the repository before parser edits; this is accepted vocabulary baseline, not the post-change additions report.

## Verb aliases already registered

- **look:** `look`, `l`, `observe`, `view`, `see`, `survey`, `glance`, `peer`, `stare`
- **examine:** `examine`, `x`, `inspect`, `study`, `check`, `investigate`, `analyze`, `analyse`, `read`, `review`
- **take:** `take`, `get`, `grab`, `pick`, `pickup`, `collect`, `yoink`, `acquire`, `obtain`, `snag`, `steal`
- **drop:** `drop`, `discard`, `ditch`, `release`
- **leave:** `leave`, `exit`, `depart`
- **inventory:** `inventory`, `inv`, `i`, `items`, `stuff`, `possessions`
- **open:** `open`, `unseal`, `unlock`, `pry`
- **close:** `close`, `shut`, `seal`
- **use:** `use`, `apply`, `operate`, `activate`, `insert`, `put`, `place`, `select`, `choose`, `present`, `show`
- **give:** `give`, `offer`, `hand`, `feed`
- **talk:** `talk`, `speak`, `chat`, `address`, `greet`, `say`, `ask`, `tell`
- **attack:** `attack`, `hit`, `punch`, `kick`, `fight`, `stab`, `kill`, `murder`, `smack`, `strike`, `bash`
- **touch:** `touch`, `feel`, `poke`, `prod`, `pet`, `stroke`, `hug`
- **lick:** `lick`, `taste`, `tongue`
- **smell:** `smell`, `sniff`
- **listen:** `listen`, `hear`
- **push:** `push`, `shove`, `press`
- **pull:** `pull`, `yank`, `tug`
- **break:** `break`, `smash`, `destroy`, `crush`, `wreck`
- **burn:** `burn`, `ignite`, `light`, `torch`, `incinerate`
- **eat:** `eat`, `chew`, `bite`, `consume`
- **drink:** `drink`, `sip`, `gulp`
- **wear:** `wear`, `puton`, `don`
- **throw:** `throw`, `toss`, `hurl`, `chuck`
- **climb:** `climb`, `scale`, `ascend`
- **hide:** `hide`, `conceal`, `duck`
- **sit:** `sit`, `rest`
- **pray:** `pray`, `worship`, `invoke`, `beg`
- **threaten:** `threaten`, `intimidate`, `menace`
- **flatter:** `flatter`, `compliment`, `praise`
- **dance:** `dance`, `boogie`
- **sing:** `sing`, `hum`
- **jump:** `jump`, `leap`, `hop`
- **wait:** `wait`, `z`
- **help:** `help`, `commands`, `verbs`, `?`
- **hint:** `hint`, `clue`, `assist`
- **restart:** `restart`
- **sign:** `sign`, `autograph`, `initial`
- **refuse:** `refuse`, `reject`, `decline`
- **deaths:** `deaths`, `deathlog`, `obituary`
- **lore:** `lore`, `journal`, `archive`
- **save:** `save`
- **north:** `north`, `n`
- **south:** `south`, `s`
- **east:** `east`, `e`
- **west:** `west`, `w`

## Existing explicit parser forms and special inputs

- `if (/^(?:look around|look room|look here|look at room|examine room|survey)$/.test(cleaned)) return {verb:'look', objectText:'', targetText:'', raw};`
- `if (/^(?:check inventory|look in bag|check my stuff)$/.test(cleaned)) return {verb:'inventory', objectText:'', targetText:'', raw};`
- `if (/^(?:ask for help|ask for a hint)$/.test(cleaned)) return {verb:cleaned.endsWith('hint') ? 'hint' : 'help', objectText:'', targetText:'', raw};`
- `if (/^(?:take all items|grab all of it)$/.test(cleaned)) return {verb:'take', objectText:'all', targetText:'', raw};`
- `if (/^(?:get out(?: of here)?|go out(?:side)?|go out (?:the )?door|walk out(?: (?:the )?door)?|exit)$/.test(cleaned)) return {verb:'leave', objectText:'', targetText:'', raw};`
- `if (/^(?:enter|step through) (?:the )?gate$/.test(cleaned)) return {verb:'exitAlias', objectText:'gate', targetText:'', raw};`
- `if (/^(?:call|summon) (?:the )?elevator$/.test(cleaned)) return {verb:'push', objectText:'elevator button', targetText:'', raw};`
- `if (/^(?:shuffle|mix) (?:the )?(?:cards|tarot|tarot spread)$/.test(cleaned)) return {verb:'shuffle', objectText:'tarot spread', targetText:'', raw};`
- `if (['north','south','east','west'].includes(direction)) return {verb:direction, objectText:'', targetText:'', raw};`
- `return {verb:'exitAlias', objectText:route, targetText:'', raw};`
- `if (/^(?:back|go back|return)$/.test(cleaned)) return {verb:'back', objectText:'', targetText:'', raw};`
- `if (/^(?:ride|enter|step into) (?:the )?elevator$/.test(cleaned)) return {verb:'exitAlias', objectText:'elevator', targetText:'', raw};`
- `if (/^(?:go|walk|move|head) down (?:the )?elevator$/.test(cleaned)) return {verb:'exitAlias', objectText:'elevator', targetText:'', raw};`
- `return {verb:'exitAlias', objectText:alias, targetText:'', raw};`
- `return {verb:'exitAlias', objectText:/\bup\b/.test(cleaned) ? 'up' : 'down', targetText:'', raw};`
- `if (['north','south','east','west'].includes(d)) return { verb:d, objectText:'', targetText:'', raw, verbToken };`

## Existing recognized object aliases (item ID ? displayed name: aliases)

- `agenda` ? **agenda folder:** `agenda`, `folder`, `leather folder`
- `badge` ? **visitor badge:** `badge`, `visitor badge`, `id`, `id badge`
- `mug` ? **government mug:** `mug`, `cup`, `coffee mug`
- `creamer` ? **hazelnut creamer:** `creamer`, `hazelnut`, `hazelnut creamer`
- `napkin` ? **napkin drawing:** `napkin`, `drawing`, `stick figures`
- `memo` ? **break-room memo:** `memo`, `note`, `break room memo`
- `form66b` ? **Form 66-B:** `form`, `form 66-b`, `66b`, `66-b`
- `ash_note` ? **scratched shelf note:** `note`, `ash note`, `scratched note`
- `records_file` ? **continuity personnel file:** `file`, `records file`, `personnel file`
- `ash` ? **Ash:** `ash`, `grey cat`, `gray cat`, `cat`, `scared cat`
- `jorge` ? **Jorge:** `jorge`, `man`, `specialist`, `records specialist`
- `contract` ? **continuity contract:** `contract`, `document`, `papers`
- `stamp_box` ? **waiver stamp box:** `box`, `acrylic box`, `stamp box`
- `waiver_stamp` ? **Waiver Stamp 4C:** `stamp`, `waiver stamp`, `4c`, `stamp 4c`
- `requisition_machine` ? **requisition machine:** `machine`, `requisition machine`, `brass machine`
- `black_candle` ? **black emergency candle:** `candle`, `black candle`, `emergency candle`
- `silver_key` ? **silver continuity key:** `key`, `silver key`, `continuity key`
- `fool` ? **The Fool:** `fool`, `the fool`, `fool card`
- `tower` ? **The Tower:** `tower`, `the tower`, `tower card`
- `sun` ? **The Sun:** `sun`, `the sun`, `sun card`
- `tarot_spread` ? **tarot spread:** `cards`, `tarot`, `spread`, `tarot spread`
- `merlin` ? **Merlin:** `merlin`, `grey cat`, `gray cat`, `cat`
- `salem` ? **Salem:** `salem`, `black cat`, `cat`
- `drawings` ? **children's drawings:** `drawings`, `drawing`, `pictures`, `children's drawings`, `kids drawings`
- `compliance_manual` ? **Occult Compliance Manual:** `manual`, `compliance manual`, `book`
- `ledger` ? **continuity ledger:** `ledger`, `book`, `huge ledger`
- `luna` ? **Luna:** `luna`, `black cat`, `scared cat`, `cat`
- `boo` ? **Boo:** `boo`, `white cat`, `huge cat`, `cat`
- `seals` ? **five brass seals:** `seals`, `brass seals`, `five seals`
- `final_plaque` ? **continuity plaque:** `plaque`, `final plaque`, `sign`

## Existing item/target ambiguity to preserve or resolve explicitly

- Generic aliases collide: `note` (memo and scratched shelf note), `drawing` (napkin drawing and children?s drawings), `book` (manual and ledger), `grey/gray cat` (Ash and Merlin), `black cat` (Salem and Luna), and `cat` (five characters). Current `findItem` resolves by alias length, then candidate order, rather than asking.
- Dedicated branches handle movement, exits, elevator, gate, stairs, tarot shuffle, help/hint, inventory, all-items pickup, and return/back before general verb parsing.
- Current two-object separators: `on`, `with`, `to`, `into`, `in`, `at`, `using`; values fill `objectText` then `targetText`.
- Exact-answer puzzle text, restart confirmation, and negated signature handling are special behavior.

## Source snapshot

- Commit before this task: `60fa3c0846aa7130ef5e88a1c9ab8dbfd21f2cf4`.
- Maintenance snapshot before implementation: `60fa3c0846aa7130ef5e88a1c9ab8dbfd21f2cf4`.
- Core files: `game.js`, `game-data.js`, `browser_test.py`.
- Standalone uploaded file was not found under `C:\MechaJeeves`; request text was available in the current message.

## Initial dictionary research (2026-10-08)

- Cambridge Dictionary, [pick something up](https://dictionary.cambridge.org/dictionary/english/pick-up): supports the separable `pick [object] up` form as a take action. `Pick [lock]` is a different sense and is excluded from this pattern.
- Cambridge Dictionary, [put something down](https://dictionary.cambridge.org/dictionary/english/put-down): supports both `put down [object]` and `put [object] down` as placement/release phrasing when the object is in inventory.
- Cambridge Dictionary, [hand something over](https://dictionary.cambridge.org/dictionary/english/hand-over): supports giving an item to a recipient, including the separable word order. This pattern preserves the item and recipient roles.

These sources support the initial grammar change. Research and review of the remaining command groups is incomplete.

## Examination research continuation (2026-10-08)

- Cambridge Dictionary, [inspect](https://dictionary.cambridge.org/dictionary/english/inspect): lists `peruse` and `scan` for the careful-examination sense. Both map to `examine [object]`; this does not change reading or puzzle requirements.
- Cambridge Dictionary, [inspect](https://dictionary.cambridge.org/dictionary/english/inspect): lists `check something out` for examining. The added `check out [object]` grammar pattern removes `out` before target matching. The existing `check [object]` form remains accepted.

These are post-baseline additions, recorded here as research notes pending the final reconciled report and CSV. The full command and target review remains incomplete.

## Movement research continuation (2026-10-08)

- Cambridge Dictionary, [step](https://dictionary.cambridge.org/dictionary/english/step): documents movement with a following direction or preposition. Added `step [cardinal direction]`, `step into/to/through [known exit]`, and `step up/down [stair or stairs]` as movement patterns. Existing `step through gate` and `step into elevator` forms remain unchanged.
- The movement patterns retain room exits and blocked-route checks. In the Archives, `step down the stair` still causes death without the required lit candle. Negated `do not step south` does not move.
- Excluded `step on [object]`: that means placing a foot on something, not traveling to a room. Also excluded bare `step`, which gives no direction or target.

This movement slice is post-baseline work; the final additions report and CSV must reconcile it with all other slices.

## Additional original room-specific inputs found during source review

These are pre-edit behavior from `game.js`, not additions from the synonym audit. The initial verb table alone does not capture them:

- `search [object]` examines an accessible object; `search cabinets` in the Archives has a special response.
- `stamp contract` in Legal and `buy candle` in Procurement have contextual replies, without completing those puzzles.
- `knock door` in the Continuity Chamber gives a response based on seal progress.
- `turn on lights` and `switch on lights` in the Sub-Basement explain the failed emergency lights.
- `follow arrow`, optionally `the` or `painted`, moves east from the Sub-Basement. A raw `take arrow` branch exists, but the general `take` action dispatches first; do not list it as accepted movement without an interaction check.
- `push gate` in Records invokes its ordinary blocked south exit; elevator and vending buttons have room-specific responses.
- `ask for directions`, `ask for way out`, and `ask for exit` in the Sub-Basement, plus `ask for names` and `ask room about seals` in the Continuity Chamber, have special dialogue.
- Correct ordered cat names unlock the final door only after the silver key is used; this is an exact-answer puzzle and should not be broadened.
- The original item table also includes `water` (glass of water): `water`, `glass`, `glass of water`. This entry was omitted from the initial written list, though it existed in the captured game data. `water glass` was added later.
- Generic branches also recognize `drink water` and `sit table` in the meeting room; `use lights`, `listen breathing`, and `follow arrow` in the Sub-Basement; `touch drawings` in Occult Compliance; `touch seals` in the Continuity Chamber; and `read [object]` before falling back to ordinary inspection.
- `push elevator button` and floor labels in the executive corridor or elevator, `push vending button` in the break room, and `push gate` in Records have separate contextual responses. `coffee` in the break room also triggers a contextual response.

## Movement research continuation: travel and proceed (2026-10-08)

- Cambridge Dictionary, [go](https://dictionary.cambridge.org/dictionary/english/go) and [proceed](https://dictionary.cambridge.org/dictionary/english/proceed), document travel to a place and proceeding to a destination. Added reusable `travel/proceed to/into/through [direction or known exit]` forms. These use the same exit lookup and movement guards as `go to [exit]`.
- Browser tests exercised all six combinations with the Records route, a blocked gate, and a negated movement command. These forms were added after the baseline capture and belong in the final additions report.

Continue checking all other branches and `game-data.js` descriptions before treating this original-input inventory as complete.

## Sensory and drinking research continuation (2026-10-08)

- Cambridge Dictionary, [sip](https://dictionary.cambridge.org/dictionary/english/sip), [swig](https://dictionary.cambridge.org/dictionary/english/swig), and [slurp](https://dictionary.cambridge.org/dictionary/english/slurp): `swig` and `slurp` are drinking actions. Added those verb aliases and the reusable `take a sip/swig/slurp of [object]` pattern.
- Cambridge Dictionary, [gulp](https://dictionary.cambridge.org/dictionary/english/gulp) and [slurp](https://dictionary.cambridge.org/dictionary/english/slurp): added `gulp/slurp down [object]` and `gulp/slurp [object] down` patterns. They route through the existing drink handler.
- Cambridge Dictionary, [sniff](https://dictionary.cambridge.org/dictionary/english/sniff) and [whiff](https://dictionary.cambridge.org/us/dictionary/english/whiff): added `take a sniff/whiff of [object]` as smell patterns.
- Cambridge Dictionary, [pat](https://dictionary.cambridge.org/dictionary/english/pat): added `pat` as a touch alias. `Pat down` is excluded because it can mean search, and `sniff out` is excluded because it means locating something by smell.

These additions were made after the baseline capture. Browser checks enter every new form, verify the correct scene response and unchanged inventory, and reject a negated form. They belong in the final reconciled additions report and CSV.

## Social-command research continuation (2026-10-08)

- Cambridge Dictionary, [converse](https://dictionary.cambridge.org/us/dictionary/english/converse): conversation with someone. Added `converse` as a talk alias; both `converse Jorge` and `converse with Jorge` reach the existing room-specific dialogue.
- Cambridge Dictionary, [commend](https://dictionary.cambridge.org/us/dictionary/english/commend): formal praise. Added `commend` as a flatter alias. Jorge receives the same contextual compliment response as `praise Jorge`.
- Excluded `berate`: [Cambridge](https://dictionary.cambridge.org/dictionary/english/berate) defines angry criticism, which is neither the existing threat nor compliment action. Excluded `congratulate` because praising an achievement can differ from the game's general flattery action.
- Browser checks cover both new aliases, an unavailable named character, negation, and unchanged room and inventory. These are two action aliases, not new grammar patterns or target aliases.

## Existing route and scenery vocabulary (pre-audit, source verified)

These are original named targets and route aliases, not additions. Route aliases are room scoped: `elevator`, `records`, `break room`, and `meeting room` in the Executive Corridor; `gate` and `stacks` in Records; `passage` in HR; `elevator` in Occult Compliance; `down`, `stairs`, and `elevator` in Archives; `up` and `stairs` in the Sub-Basement; `door` in the Continuity Chamber. All four cardinal directions and their single-letter abbreviations are in the verb table. The routes still depend on the current room, blocked exits, and the lit-candle descent guard.

Examination also recognizes these room-scoped scenery phrases outside the item alias table:

| Room | Original scenery references |
| --- | --- |
| Meeting | west door, calendar invitation, invitation, exit sign, east door, under table, beneath table, table |
| Executive Corridor | directory, elevator button, lights |
| Break Room | fridge, refrigerator, warning, note on fridge, vending machine, machine button |
| Records Lobby | gate, clipboard, placard |
| Records Stacks | shelves, shelf 20 |
| Legal Annex | page 64, page sixty four, page sixty-four, sign |
| Procurement | slots, sign |
| HR Reliquary | wall, east wall, table |
| Occult Compliance | inbox, desk, elevator |
| Archives | stair, cabinets |
| Sub-Basement | roots, lights, arrow, sign |
| Continuity Chamber | door |

Some apparent synonyms have different effects by command: `look under table` examines, `open fridge` opens, `take inbox` refuses, `push gate` attempts movement, and `follow arrow` moves. They must be tested as separate command patterns. The `ask` and `say` dialogue paths can interpret full names, and the ordered five-cat answer is intentionally exact.

## Parser structure verified from current source

- General command shape is `[verb] [object] [separator] [target]`; the separator set is `on`, `with`, `to`, `into`, `in`, `at`, `using`. Article removal applies to a leading `the`, `a`, or `an` after the verb. `listen` and `pray` also remove leading `to`. The parser does not globally normalize every plausible word order.
- Leading `please`, `could you`, or `can you` and trailing `please` are post-baseline additions. `not`, `never`, `dont`, and `don't` are rejected before dispatch. Punctuation is normalized.
- `look at` routes to examination, while `look in bag` is a dedicated inventory pattern; `look under table` is scenery handling. These meanings should remain separate.
- `findItem` currently searches visible room items and carried items by longest matching alias, with candidate order breaking ties. The room-specific scenery list is examined before items. Generic `cat`, `black cat`, `grey cat`, `book`, `note`, and `drawing` can collide, so a new alias must not increase accidental target selection.
- `use` and `give` share the same handler, but the handler does not require every two-object target to match before using a held puzzle item. New grammar must preserve item/recipient roles and existing possession and room checks, and tests must check the actual state change.

## Utility command research continuation (2026-10-08)

- Cambridge Dictionary, [belongings](https://dictionary.cambridge.org/dictionary/english/belongings): portable possessions. Added `belongings` as an inventory action alias. Excluded `backpack` because Scott has no visible backpack.
- Cambridge Dictionary, [instructions](https://dictionary.cambridge.org/us/dictionary/english/instructions): guidance on how to use something. Added `instructions` as a help action alias. Excluded bare `directions`, which can request navigation in a room.
- Cambridge Dictionary, [hint](https://dictionary.cambridge.org/dictionary/english/hint): advice that helps someone do something. Added exact `give me [a] hint/clue` forms, which call the existing room hint and increment the existing hint counter.
- Ordinary request patterns added: `show [my] inventory/belongings`, `what am I carrying`, and `show [me] [the] commands/instructions`. These exact patterns run before the general `show` and `give` handlers, so items and recipients are not reinterpreted. Negated requests still stop before dispatch.
- Browser tests entered every new alias and pattern variant, checked the inventory/help reply or hint counter, and checked that a negated request changed no hint count. No existing mappings were changed or removed in this slice.

## Opening phrase research continuation (2026-10-08)

- Cambridge Dictionary, [open (something) up](https://dictionary.cambridge.org/dictionary/english/open-up): supports `open up [object]` and separable `open [object] up` for opening a container or door. Both new reusable patterns map to the existing `open` action; no new action or target alias was added.
- Browser tests used both forms on the legal stamp box with a visitor badge and confirmed the same stamp acquisition. Without the badge, the box stayed shut. Negation and an unrelated key target did not acquire the stamp.
- Bare `open up` is excluded because it can mean talking about feelings and has no clear target. `Break open` is excluded because it may imply damage and is not equivalent to `open`.

## Putting carried objects down (2026-10-08)

- [Cambridge, set](https://dictionary.cambridge.org/dictionary/english/set) describes `set something down` as placing it on a surface. [Cambridge, lay](https://dictionary.cambridge.org/dictionary/english/lay) defines `lay` as putting something down carefully. Added four reusable forms: `set down [object]`, `set [object] down`, `lay down [object]`, and `lay [object] down`. They call the existing `drop` action and require the item in inventory.
- Edge checks exercised all four forms on the badge and verified the item left inventory and appeared in the room. Negated wording, an unsupported destination (`set the badge on the table`), and an unowned key did not drop the badge.
- Bare `lay [object]` is excluded because it may describe positioning rather than releasing an item. `Lay down [rules]` and `set down [words]` can mean stating or writing them; the game only acts on a carried object. These forms are post-baseline additions: 0 action aliases, 0 target aliases, 4 command patterns.

## Throwing vocabulary and two-object target checks (2026-10-08)

- [Cambridge, fling](https://dictionary.cambridge.org/dictionary/english/fling) and [Cambridge, lob](https://dictionary.cambridge.org/us/dictionary/english/lob) both document throwing an object. Added `fling` and `lob` as **two throw action aliases**. They retain the existing throw reply and its current lack of an inventory change. `Fling open` is excluded: that is an opening action, not throwing.
- The audit found that `give creamer to Scott` in Records could move Jorge, and `insert form into waiver slot` could consume the form. These were existing two-object mappings, not new aliases. The handler now requires an explicit creamer recipient to resolve to Jorge and an explicit form/stamp destination to be the requisition machine or the matching labeled slot. Omitted destinations retain their prior behavior.
- Edge checks entered both aliases, a negated throw, mismatched recipients and slots, and valid named slots. State assertions confirmed the wrong targets do not move Jorge, consume paperwork, or complete Procurement. These mapping changes belong in the final report's changed-existing-behavior section.

## Tarot and final-key target checks (2026-10-08)

- Existing two-object commands could ignore the named destination: `use fool on badge` selected a lethal card, and `use key on Jorge` woke the final seals. The handlers now require an explicit tarot destination to be the visible spread or orientation table, and an explicit key destination to be the final door, seals, or their key slot. Omitted destinations retain their existing puzzle behavior.
- Edge checks confirmed three mismatched tarot destinations leave the player alive and the puzzle unsolved; `choose tower on tarot spread` still solves it. Three mismatched key destinations leave the seals dark; `use key on door` still wakes them. The full browser regression passed.
- These are corrections to existing two-object mappings: **0 action aliases, 0 target aliases, 0 new command patterns**. Include them in the final report's changed-existing-behavior section.
