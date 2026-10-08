"""Reconcile the player-input additions with the captured pre-audit revision."""
import csv
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent
BASE = "60fa3c0846aa7130ef5e88a1c9ab8dbfd21f2cf4"


def original(name):
    return subprocess.check_output(
        ["git", "show", f"{BASE}:projects/dork_release/{name}"],
        cwd=ROOT, text=True, encoding="utf-8",
    )


def verbs(source):
    block = source.split("const verbMap = buildVerbMap({", 1)[1].split("});", 1)[0]
    return {name: re.findall(r"'([^']+)'", values)
            for name, values in re.findall(r"(\w+):\s*\[([^\]]+)\]", block)}


def targets(source):
    return {name: re.findall(r'"([^"]+)"', values)
            for name, values in re.findall(r"^\s*(\w+):\s*\{[^\n]*?aliases:\s*\[([^\]]+)\]", source, re.M)}


# One row is one reusable grammar template. Alternatives inside a template are
# shown explicitly; object substitutions are not counted as separate aliases.
PATTERNS = [
    ("please [command]", "polite wrapper", "Leading please; inner command keeps its normal meaning", "please fetch badge"),
    ("could you [command]", "polite wrapper", "Leading could you; normal action restrictions", "could you inspect agenda"),
    ("can you [command]", "polite wrapper", "Leading can you; normal action restrictions", "can you take badge"),
    ("[command] please", "polite wrapper", "Trailing please; normal action restrictions", "inspect agenda please"),
    ("take a (sip|swig|slurp) of [object]", "drink", "Visible target; no item acquisition", "take a sip of water"),
    ("take a (sniff|whiff) of [object]", "smell", "Visible target", "take a whiff of water"),
    ("(gulp|slurp) down [object]", "drink", "Visible target", "gulp down water"),
    ("(gulp|slurp) [object] down", "drink", "Visible target", "slurp water down"),
    ("open up [object]", "open", "Existing open preconditions; target remains required", "open up stamp box"),
    ("open [object] up", "open", "Existing open preconditions; target remains required", "open stamp box up"),
    ("check out [object]", "examine", "Accessible target", "check out agenda"),
    ("pick [object] up", "take", "Portable and accessible target", "pick badge up"),
    ("put down [object]", "drop", "Must possess target", "put down badge"),
    ("put [object] down", "drop", "Must possess target", "put badge down"),
    ("set down [object]", "drop", "Must possess target", "set down badge"),
    ("set [object] down", "drop", "Must possess target", "set badge down"),
    ("lay down [object]", "drop", "Must possess target", "lay down badge"),
    ("lay [object] down", "drop", "Must possess target", "lay badge down"),
    ("hand over [item] to [recipient]", "give", "Possession and valid recipient checks", "hand over creamer to Jorge"),
    ("hand [item] over to [recipient]", "give", "Possession and valid recipient checks", "hand creamer over to Jorge"),
    ("hand off [item] to [recipient]", "give", "Possession and valid recipient checks", "hand off creamer to Jorge"),
    ("hand [item] off to [recipient]", "give", "Possession and valid recipient checks", "hand creamer off to Jorge"),
    ("show (my) (inventory|belongings)", "inventory", "Exact utility phrase; my is optional", "show my belongings"),
    ("what am i carrying", "inventory", "Exact utility phrase", "what am I carrying"),
    ("show (me) (the) (commands|instructions)", "help", "Exact utility phrase; me and the are optional", "show me the commands"),
    ("give me (a) (hint|clue)", "hint", "Exact utility phrase; a is optional; increments hint count", "give me a clue"),
    ("step [cardinal direction]", "movement", "Actual room exit and gate restrictions", "step south"),
    ("step (through|into|to) (the) [direction or known exit]", "movement", "Room-scoped route and hazard checks", "step through the gate"),
    ("step (up|down) (the) stair(s)", "movement", "Room-scoped stair and candle checks", "step down the stairs"),
    ("(travel|proceed) (through|into|to) (the) [direction or known exit]", "movement", "Room-scoped route and hazard checks", "proceed to records"),
]


def main():
    before_verbs, after_verbs = verbs(original("game.js")), verbs((ROOT / "game.js").read_text(encoding="utf-8"))
    before_targets, after_targets = targets(original("game-data.js")), targets((ROOT / "game-data.js").read_text(encoding="utf-8"))
    added_verbs = [(name, word) for name, words in after_verbs.items() for word in words if word not in before_verbs.get(name, [])]
    added_targets = [(name, word) for name, words in after_targets.items() for word in words if word not in before_targets.get(name, [])]
    removed_verbs = [(name, word) for name, words in before_verbs.items() for word in words if word not in after_verbs.get(name, [])]
    removed_targets = [(name, word) for name, words in before_targets.items() for word in words if word not in after_targets.get(name, [])]
    assert (len(added_verbs), len(added_targets), len(PATTERNS)) == (17, 2, 30)
    assert not removed_verbs and not removed_targets, (removed_verbs, removed_targets)
    assert len(PATTERNS) == len({p[0] for p in PATTERNS})
    rows = []
    for name, word in added_verbs:
        rows.append(("action alias", name, word, ", ".join(before_verbs[name]), "Same handler and state rules as original action", f"{word} badge" if name not in ("inventory", "help") else word))
    for name, word in added_targets:
        rows.append(("target alias", name, word, ", ".join(before_targets[name]), "Only when target is visible or carried", f"examine {word}"))
    for pattern, meaning, restriction, example in PATTERNS:
        rows.append(("command pattern", meaning, pattern, "See baseline parser forms", restriction, example))
    with (ROOT / "PLAYER_INPUT_AUDIT_ADDITIONS.csv").open("w", newline="", encoding="utf-8-sig") as out:
        writer = csv.writer(out)
        writer.writerow(("kind", "maps_to", "addition", "previously_accepted", "restriction", "example"))
        writer.writerows(rows)
    lines = [
        "# Dork player-input audit: reconciled additions",
        "",
        f"Compared captured pre-audit revision `{BASE[:7]}` with the current parser and item table. The CSV is generated from the same reconciliation.",
        "",
        f"**Added:** {len(added_verbs)} action aliases, {len(added_targets)} target aliases, {len(PATTERNS)} reusable command patterns. No registered action or target alias was removed.",
        "",
        "## Original command inventory (developer-only: puzzle spoilers)",
        "",
        "All baseline registered action words and abbreviations:", "",
        "| Action | Previously accepted words | Added action aliases |",
        "| --- | --- | --- |",
    ]
    for name, words in before_verbs.items():
        new = [word for action, word in added_verbs if action == name]
        lines.append(f"| {name} | {', '.join(f'`{word}`' for word in words)} | {', '.join(f'`{word}`' for word in new) or 'None'} |")
    lines += [
        "", "Other original action routes: `search [object]`, `back/go back/return`, room-scoped named exits, `shuffle/mix` tarot, `stamp contract`, `buy candle`, `knock door`, `turn/switch on lights`, `follow arrow`, dialogue `ask/say`, and the exact ordered cat-name answer. Original room-scoped scenery, route aliases, special parser forms, and item aliases are recorded in [PLAYER_INPUT_AUDIT_BASELINE.md](PLAYER_INPUT_AUDIT_BASELINE.md).",
        "", "## Newly accepted target aliases", "", "| Target | Previously accepted names | Added name | Meaning and scope |", "| --- | --- | --- | --- |",
    ]
    for name, word in added_targets:
        lines.append(f"| {name} | {', '.join(f'`{a}`' for a in before_targets[name])} | `{word}` | Same visible or carried object |")
    lines += ["", "## Newly accepted command patterns", "", "Alternatives in parentheses are one reusable grammar template; each object substitution is not a separate alias. Optional words are labeled in the restriction column.", "", "| Pattern | Maps to | Restriction | Example |", "| --- | --- | --- | --- |"]
    for pattern, meaning, restriction, example in PATTERNS:
        lines.append(f"| `{pattern}` | {meaning} | {restriction} | `{example}` |")
    lines += [
        "", "## Existing mappings corrected (developer-only: puzzle spoilers)", "",
        "- An explicitly wrong recipient no longer moves Jorge when giving creamer; a wrong Procurement slot no longer consumes form or stamp.",
        "- An explicitly unrelated tarot recipient or destination no longer selects a card or causes a death. The key no longer activates final seals when aimed at an unrelated target. Valid targets and omitted targets retain their original puzzle behavior.",
        "- No registered alias was removed. These corrections narrow existing two-object commands that previously ignored the named second object.",
        "", "## Ambiguity, exclusions, and limits", "",
        "- Generic `cat`, `book`, `note`, `drawing`, and similar names retain the original room and longest-match resolution. New target aliases are specific and do not expose unseen items.",
        "- `pick the lock`, `take off the hat`, `break open`, `look inside`, and `look under` are different actions from their superficially similar verb aliases; this audit does not remap them. `step on`, `fling open`, `pat down`, `sniff out`, bare `open up`, and unsupported destinations are likewise excluded.",
        "- `not`, `never`, `dont`, and `don't` are rejected before action dispatch. Room, possession, puzzle progress, and fatal stair guards still apply. The five-cat answer remains exact.",
        "- Research sources and individual sense decisions are linked in [PLAYER_INPUT_AUDIT_BASELINE.md](PLAYER_INPUT_AUDIT_BASELINE.md). English phrasing is open-ended; this documents implemented coverage, not every possible utterance.",
        "", "## Verification", "",
        "The full Edge browser regression passed. `input_audit_matrix.py` entered all 49 addition rows in Edge and compared each reply and saved run state with its canonical equivalent in the same context. It covers one concrete substitution for each reusable grammar pattern; alternatives within a pattern also have representative checks in `browser_test.py`. `input_audit_playthrough.py` entered 25 commands from a fresh save, using new phrasing through the true ending, and checked each room, material item/flag, and final win state. The required MechaJeeves release gate passed on 2026-10-08.",
        "",
    ]
    (ROOT / "PLAYER_INPUT_AUDIT_ADDITIONS.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Reconciled {len(added_verbs)} action aliases, {len(added_targets)} target aliases, {len(PATTERNS)} command patterns")


if __name__ == "__main__":
    main()
