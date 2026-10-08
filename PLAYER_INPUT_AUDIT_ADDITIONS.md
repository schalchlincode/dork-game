# Dork player-input audit: reconciled additions

Compared captured pre-audit revision `60fa3c0` with the current parser and item table. The CSV is generated from the same reconciliation.

**Added:** 17 action aliases, 2 target aliases, 30 reusable command patterns. No registered action or target alias was removed.

## Original command inventory (developer-only: puzzle spoilers)

All baseline registered action words and abbreviations:

| Action | Previously accepted words | Added action aliases |
| --- | --- | --- |
| look | `look`, `l`, `observe`, `view`, `see`, `survey`, `glance`, `peer`, `stare` | None |
| examine | `examine`, `x`, `inspect`, `study`, `check`, `investigate`, `analyze`, `analyse`, `read`, `review` | `scrutinize`, `scrutinise`, `peruse`, `scan` |
| take | `take`, `get`, `grab`, `pick`, `pickup`, `collect`, `yoink`, `acquire`, `obtain`, `snag`, `steal` | `retrieve`, `fetch` |
| drop | `drop`, `discard`, `ditch`, `release` | `deposit` |
| leave | `leave`, `exit`, `depart` | None |
| inventory | `inventory`, `inv`, `i`, `items`, `stuff`, `possessions` | `belongings` |
| open | `open`, `unseal`, `unlock`, `pry` | None |
| close | `close`, `shut`, `seal` | None |
| use | `use`, `apply`, `operate`, `activate`, `insert`, `put`, `place`, `select`, `choose`, `present`, `show` | None |
| give | `give`, `offer`, `hand`, `feed` | `deliver` |
| talk | `talk`, `speak`, `chat`, `address`, `greet`, `say`, `ask`, `tell` | `converse` |
| attack | `attack`, `hit`, `punch`, `kick`, `fight`, `stab`, `kill`, `murder`, `smack`, `strike`, `bash` | None |
| touch | `touch`, `feel`, `poke`, `prod`, `pet`, `stroke`, `hug` | `pat` |
| lick | `lick`, `taste`, `tongue` | None |
| smell | `smell`, `sniff` | None |
| listen | `listen`, `hear` | None |
| push | `push`, `shove`, `press` | None |
| pull | `pull`, `yank`, `tug` | None |
| break | `break`, `smash`, `destroy`, `crush`, `wreck` | None |
| burn | `burn`, `ignite`, `light`, `torch`, `incinerate` | None |
| eat | `eat`, `chew`, `bite`, `consume` | None |
| drink | `drink`, `sip`, `gulp` | `swig`, `slurp` |
| wear | `wear`, `puton`, `don` | None |
| throw | `throw`, `toss`, `hurl`, `chuck` | `fling`, `lob` |
| climb | `climb`, `scale`, `ascend` | None |
| hide | `hide`, `conceal`, `duck` | None |
| sit | `sit`, `rest` | None |
| pray | `pray`, `worship`, `invoke`, `beg` | None |
| threaten | `threaten`, `intimidate`, `menace` | None |
| flatter | `flatter`, `compliment`, `praise` | `commend` |
| dance | `dance`, `boogie` | None |
| sing | `sing`, `hum` | None |
| jump | `jump`, `leap`, `hop` | None |
| wait | `wait`, `z` | None |
| help | `help`, `commands`, `verbs`, `?` | `instructions` |
| hint | `hint`, `clue`, `assist` | None |
| restart | `restart` | None |
| sign | `sign`, `autograph`, `initial` | None |
| refuse | `refuse`, `reject`, `decline` | None |
| deaths | `deaths`, `deathlog`, `obituary` | None |
| lore | `lore`, `journal`, `archive` | None |
| save | `save` | None |
| north | `north`, `n` | None |
| south | `south`, `s` | None |
| east | `east`, `e` | None |
| west | `west`, `w` | None |

Other original action routes: `search [object]`, `back/go back/return`, room-scoped named exits, `shuffle/mix` tarot, `stamp contract`, `buy candle`, `knock door`, `turn/switch on lights`, `follow arrow`, dialogue `ask/say`, and the exact ordered cat-name answer. Original room-scoped scenery, route aliases, special parser forms, and item aliases are recorded in [PLAYER_INPUT_AUDIT_BASELINE.md](PLAYER_INPUT_AUDIT_BASELINE.md).

## Newly accepted target aliases

| Target | Previously accepted names | Added name | Meaning and scope |
| --- | --- | --- | --- |
| badge | `badge`, `visitor badge`, `id`, `id badge` | `name badge` | Same visible or carried object |
| water | `water`, `glass`, `glass of water` | `water glass` | Same visible or carried object |

## Newly accepted command patterns

Alternatives in parentheses are one reusable grammar template; each object substitution is not a separate alias. Optional words are labeled in the restriction column.

| Pattern | Maps to | Restriction | Example |
| --- | --- | --- | --- |
| `please [command]` | polite wrapper | Leading please; inner command keeps its normal meaning | `please fetch badge` |
| `could you [command]` | polite wrapper | Leading could you; normal action restrictions | `could you inspect agenda` |
| `can you [command]` | polite wrapper | Leading can you; normal action restrictions | `can you take badge` |
| `[command] please` | polite wrapper | Trailing please; normal action restrictions | `inspect agenda please` |
| `take a (sip|swig|slurp) of [object]` | drink | Visible target; no item acquisition | `take a sip of water` |
| `take a (sniff|whiff) of [object]` | smell | Visible target | `take a whiff of water` |
| `(gulp|slurp) down [object]` | drink | Visible target | `gulp down water` |
| `(gulp|slurp) [object] down` | drink | Visible target | `slurp water down` |
| `open up [object]` | open | Existing open preconditions; target remains required | `open up stamp box` |
| `open [object] up` | open | Existing open preconditions; target remains required | `open stamp box up` |
| `check out [object]` | examine | Accessible target | `check out agenda` |
| `pick [object] up` | take | Portable and accessible target | `pick badge up` |
| `put down [object]` | drop | Must possess target | `put down badge` |
| `put [object] down` | drop | Must possess target | `put badge down` |
| `set down [object]` | drop | Must possess target | `set down badge` |
| `set [object] down` | drop | Must possess target | `set badge down` |
| `lay down [object]` | drop | Must possess target | `lay down badge` |
| `lay [object] down` | drop | Must possess target | `lay badge down` |
| `hand over [item] to [recipient]` | give | Possession and valid recipient checks | `hand over creamer to Jorge` |
| `hand [item] over to [recipient]` | give | Possession and valid recipient checks | `hand creamer over to Jorge` |
| `hand off [item] to [recipient]` | give | Possession and valid recipient checks | `hand off creamer to Jorge` |
| `hand [item] off to [recipient]` | give | Possession and valid recipient checks | `hand creamer off to Jorge` |
| `show (my) (inventory|belongings)` | inventory | Exact utility phrase; my is optional | `show my belongings` |
| `what am i carrying` | inventory | Exact utility phrase | `what am I carrying` |
| `show (me) (the) (commands|instructions)` | help | Exact utility phrase; me and the are optional | `show me the commands` |
| `give me (a) (hint|clue)` | hint | Exact utility phrase; a is optional; increments hint count | `give me a clue` |
| `step [cardinal direction]` | movement | Actual room exit and gate restrictions | `step south` |
| `step (through|into|to) (the) [direction or known exit]` | movement | Room-scoped route and hazard checks | `step through the gate` |
| `step (up|down) (the) stair(s)` | movement | Room-scoped stair and candle checks | `step down the stairs` |
| `(travel|proceed) (through|into|to) (the) [direction or known exit]` | movement | Room-scoped route and hazard checks | `proceed to records` |

## Existing mappings corrected (developer-only: puzzle spoilers)

- An explicitly wrong recipient no longer moves Jorge when giving creamer; a wrong Procurement slot no longer consumes form or stamp.
- An explicitly unrelated tarot recipient or destination no longer selects a card or causes a death. The key no longer activates final seals when aimed at an unrelated target. Valid targets and omitted targets retain their original puzzle behavior.
- No registered alias was removed. These corrections narrow existing two-object commands that previously ignored the named second object.

## Ambiguity, exclusions, and limits

- Generic `cat`, `book`, `note`, `drawing`, and similar names retain the original room and longest-match resolution. New target aliases are specific and do not expose unseen items.
- `pick the lock`, `take off the hat`, `break open`, `look inside`, and `look under` are different actions from their superficially similar verb aliases; this audit does not remap them. `step on`, `fling open`, `pat down`, `sniff out`, bare `open up`, and unsupported destinations are likewise excluded.
- `not`, `never`, `dont`, and `don't` are rejected before action dispatch. Room, possession, puzzle progress, and fatal stair guards still apply. The five-cat answer remains exact.
- Research sources and individual sense decisions are linked in [PLAYER_INPUT_AUDIT_BASELINE.md](PLAYER_INPUT_AUDIT_BASELINE.md). English phrasing is open-ended; this documents implemented coverage, not every possible utterance.

## Verification

The full Edge browser regression passed. `input_audit_matrix.py` entered all 49 addition rows in Edge and compared each reply and saved run state with its canonical equivalent in the same context. It covers one concrete substitution for each reusable grammar pattern; alternatives within a pattern also have representative checks in `browser_test.py`. `input_audit_playthrough.py` entered 25 commands from a fresh save, using new phrasing through the true ending, and checked each room, material item/flag, and final win state. The required MechaJeeves release gate passed on 2026-10-08.
