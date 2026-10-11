"""Apply the fixes found during the 79-turn blind playtest.

This file is intentionally removed by the application workflow after a successful
patch and regression run. Every replacement is assertion-backed so source drift
fails loudly instead of silently producing a partial update.
"""
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def replace_once(path: str, old: str, new: str) -> None:
    file_path = ROOT / path
    text = file_path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected one match, found {count}: {old[:100]!r}")
    file_path.write_text(text.replace(old, new, 1), encoding="utf-8")


def prepend_after(path: str, marker: str, addition: str) -> None:
    replace_once(path, marker, marker + addition)


# ---------------------------------------------------------------------------
# World text and state-aware room descriptions
# ---------------------------------------------------------------------------
replace_once(
    "game-data.js",
    '      descByFlag: { stampTaken: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract still waits on its lectern beneath SIGNATURE REQUIRED. The acrylic box is open and empty. Legal has not yet filed an objection." },',
    '''      descByFlag: {
        legalObjectionFiled: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract remains unsigned beneath SIGNATURE REQUIRED. The acrylic box is open and empty. A red FILED OBJECTION receipt now rests on the lectern. Legal can no longer treat your silence as consent.",
        stampTaken: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract still waits on its lectern beneath SIGNATURE REQUIRED. The acrylic box is open and empty. Legal has not yet filed an objection."
      },''',
)
replace_once(
    "game-data.js",
    '      desc: "The stair ends in a concrete tunnel. Emergency lights have failed. Something wet is breathing in the darkness ahead.\\n\\nA painted arrow points east: CONTINUITY CHAMBER. West, the stair leads back up to the Archives. A parking passage beyond the tunnel has collapsed behind a wall of black roots.",',
    '      desc: "The stair ends in a concrete tunnel. Emergency lights have failed. Something wet is breathing in the darkness ahead. A corroded stencil identifies this level as SUB-BASEMENT; whatever the directory called BELOW is not accessible from this route.\\n\\nA painted arrow points east: CONTINUITY CHAMBER. West, the stair leads back up to the Archives. A parking passage beyond the tunnel has collapsed behind a wall of black roots.",',
)
replace_once(
    "game-data.js",
    '    boo: { name: "Boo", aliases: ["boo", "white cat", "huge cat", "cat"], portable: false, desc: "Boo is an enormous white cat. He appears to have been appointed to something." },',
    '    boo: { name: "Boo", aliases: ["boo", "white cat", "huge cat", "cat"], portable: false, desc: "Boo is an enormous white cat. He appears to have been appointed to something. The silver key slot beneath the seals remains visible beside him." },',
)

# ---------------------------------------------------------------------------
# Parser, state migration, clues, and feedback
# ---------------------------------------------------------------------------
replace_once(
    "game.js",
    "  if (!DORK_DATA.rooms[state.room]) state = newRun();\n  if (!state.dropped || typeof state.dropped !== 'object') state.dropped = {};",
    "  if (!DORK_DATA.rooms[state.room]) state = newRun();\n  if (!state.dropped || typeof state.dropped !== 'object') state.dropped = {};\n  if (!state.flags || typeof state.flags !== 'object') state.flags = {};\n  if (state.flags.procured) state.flags.legalObjectionFiled = true;",
)
replace_once(
    "game.js",
    "    talk: ['talk','speak','chat','address','greet','say','ask','tell','converse'],",
    "    talk: ['talk','speak','chat','address','greet','say','ask','tell','converse','name','recite'],",
)
replace_once(
    "game.js",
    "    describeRoom();\n    updateStatus();\n    input.focus();",
    "    describeRoom();\n    updateStatus();\n    // Initial narration should open at the title, not halfway down the first screen.\n    requestAnimationFrame(() => { out.scrollTop = 0; });\n    input.focus();",
)
replace_once(
    "game.js",
    "    if (state.room === 'legal_annex' && /\\b(?:page 64|page sixty four|page sixty-four)\\b/.test(text)) return print(\"Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. The stamp is locked in the acrylic box.\");",
    '''    if (state.room === 'legal_annex' && /\\b(?:page 64|page sixty four|page sixty-four)\\b/.test(text)) {
      if (state.flags.legalObjectionFiled) return print("Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. A red FILED notation confirms that Legal received the objection.");
      if (state.flags.stampTaken) return print("Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. The clause says the stamp is ordinarily stored in the acrylic box; the box is now open and empty.");
      return print("Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. The clause specifies that the stamp is stored under seal in the acrylic box.");
    }''',
)
replace_once(
    "game.js",
    "    const scenery = {",
    '''    if (state.room === 'archives' && /\\b(?:stair|stairs|stairway|tunnel)\\b/.test(text)) {
      return print(state.flags.candleLit && state.inventory.includes('black_candle')
        ? 'The black candle reveals that the stair becomes a concrete tunnel below. The electric emergency lights are dead; the green flame is the only dependable illumination.'
        : 'The narrow stair drops into a lightless concrete tunnel. Luna will not approach it. You need a dependable light before going down.');
    }
    if (state.room === 'subbasement' && /\\b(?:stair|stairs|stairway|tunnel)\\b/.test(text)) {
      return print('The concrete tunnel is lit only by the black candle. Wet breathing comes from beyond the collapsed parking passage; the painted arrow points east to the Continuity Chamber.');
    }
    const scenery = {''',
)
replace_once(
    "game.js",
    "    if (id === 'records_file') state.flags.readPersonnelFile = true;\n    discoverLore(id);",
    "    if (id === 'records_file') state.flags.readPersonnelFile = true;\n    if (id === 'napkin') state.flags.napkinRead = true;\n    discoverLore(id);",
)
replace_once(
    "game.js",
    '''    refuse: (c) => {
      if (state.room === 'legal_annex' && (hasWord(c.objectText, 'contract') || /\\brefuse to sign\\b/i.test(c.raw)))
        return print('You refuse the contract. Legal requires Waiver Stamp 4C to record that refusal; the stamp is locked in the acrylic box.');
      print(`You decline ${c.objectText || 'the offer'}. The Agency records your lack of enthusiasm.`);
    },''',
    '''    refuse: (c) => {
      if (state.room === 'legal_annex' && (hasWord(c.objectText, 'contract') || /\\brefuse to sign\\b/i.test(c.raw))) {
        if (state.flags.legalObjectionFiled) return print('You already refused the contract. Legal has filed the objection and can no longer convert your attendance into consent.');
        if (state.flags.stampTaken) return print('You refuse the contract. Take Waiver Stamp 4C and Form 66-B to Procurement; its FORM and WAIVER slots file the objection separately.');
        return print('You refuse the contract. Legal requires Waiver Stamp 4C to record that refusal; the stamp is locked in the acrylic box.');
      }
      print(`You decline ${c.objectText || 'the offer'}. The Agency records your lack of enthusiasm.`);
    },''',
)
replace_once(
    "game.js",
    "    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');",
    '''    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');

    if ((a === 'waiver_stamp' && ['contract','form66b'].includes(b)) ||
        (b === 'waiver_stamp' && ['contract','form66b'].includes(a))) {
      if (state.flags.legalObjectionFiled) return print('Your refusal is already filed. Legal has no remaining consent to manufacture.');
      const documentName = a === 'contract' || b === 'contract' ? 'continuity contract' : 'Form 66-B';
      return print(`Waiver Stamp 4C is not applied directly to the ${documentName}. Procurement files Form 66-B and the waiver separately through its FORM and WAIVER slots.`);
    }''',
)
replace_once(
    "game.js",
    "        state.flags.procured = true; ['black_candle','silver_key'].forEach(x => state.inventory.push(x));",
    "        state.flags.procured = true;\n        state.flags.legalObjectionFiled = true;\n        ['black_candle','silver_key'].forEach(x => state.inventory.push(x));",
)
replace_once(
    "game.js",
    '''      state.flags.keyUsed = true; print("The silver key fits a slot beneath the five seals. It turns once. Five small lights wake above the door.\\n\\nTheir poses resolve in the light: Boo upright, Salem curled asleep, Ash high on his shelf, Luna peering out, Merlin raising one paw. Not decorations. A household, filed as infrastructure.\\n\\nThe napkin's words return: HOME IS A PASSWORD. The chamber waits for the five names."); return;''',
    '''      state.flags.keyUsed = true;
      const passwordLine = state.flags.napkinRead
        ? "The napkin's words return: HOME IS A PASSWORD."
        : "A phrase resolves above the seals: HOME IS A PASSWORD.";
      print(`The silver key fits a slot beneath the five seals. It turns once. Five small lights wake above the door.\\n\\nTheir poses resolve in the light: Boo upright, Salem curled asleep, Ash high on his shelf, Luna peering out, Merlin raising one paw. Not decorations. A household, filed as infrastructure.\\n\\n${passwordLine} The chamber waits for the five names.`);
      return;''',
)
replace_once(
    "game.js",
    "        form66b: 'Form 66-B belongs in the FORM slot of the Procurement machine, alongside Waiver Stamp 4C.',",
    "        form66b: 'Form 66-B belongs in the FORM slot of the Procurement machine, alongside Waiver Stamp 4C.',\n        waiver_stamp: 'Waiver Stamp 4C belongs in Procurement\'s WAIVER slot, separate from Form 66-B.',",
)
replace_once(
    "game.js",
    r'''    const names = ['boo','salem','ash','luna','merlin'];
    if (state.room === 'continuity_chamber' && state.flags.keyUsed && names.every(n => new RegExp(`\\b${n}\\b`).test(t))) {
      if (!/\bboo\b.*\bsalem\b.*\bash\b.*\bluna\b.*\bmerlin\b/.test(t)) return print('The five seals flicker, then go dark. Match their poses from left to right.');
      state.flags.finalOpen = true;
      print("You name them: BOO. SALEM. ASH. LUNA. MERLIN.\n\nOne by one, the brass seals illuminate. The enormous door unlocks with a sound like five hundred filing cabinets opening at once.\n\nBoo stands, stretches, and moves aside.\n\nFor the first time tonight, you have been cleared to leave."); return;
    }''',
    r'''    const names = ['boo','salem','ash','luna','merlin'];
    const hasAllNames = names.every(n => new RegExp(`\\b${n}\\b`).test(t));
    if (state.room === 'continuity_chamber' && hasAllNames && !state.flags.keyUsed) {
      return print('The five seals are dark. The names may be right, but the chamber is not listening yet. Use the silver continuity key first.');
    }
    if (state.room === 'continuity_chamber' && state.flags.keyUsed && hasAllNames) {
      if (!/\bboo\b.*\bsalem\b.*\bash\b.*\bluna\b.*\bmerlin\b/.test(t)) return print('The five seals flicker, then go dark. Match their poses from left to right.');
      state.flags.finalOpen = true;
      print("You name them: BOO. SALEM. ASH. LUNA. MERLIN.\n\nOne by one, the brass seals illuminate. The enormous door unlocks with a sound like five hundred filing cabinets opening at once.\n\nBoo stands, stretches, and moves aside.\n\nFor the first time tonight, you have been cleared to leave."); return;
    }''',
)
replace_once(
    "game.js",
    '''    if (state.room === 'continuity_chamber' && /boo|cat/.test(t)) return print(state.flags.keyUsed ? "Boo looks at the five seals, then at you. Naming things is apparently your department now." : "Boo sits directly on the key slot. Leadership obstruction at its purest.");''',
    '''    if (state.room === 'continuity_chamber' && /boo|cat/.test(t)) return print(state.flags.keyUsed ? "Boo looks at the five seals, then at you. Naming things is apparently your department now." : "Boo sits beside the key slot as if assigned to supervise it. The slot itself remains accessible to the silver key.");''',
)
replace_once(
    "game.js",
    "    if (state.room === 'legal_annex' && c.verb === 'stamp' && hasWord(c.objectText, 'contract')) return print('The waiver stamp documents your refusal. Procurement accepts it with Form 66-B; stamping the contract here will not release you.');",
    '''    if (c.verb === 'stamp' && (hasWord(c.objectText, 'contract') || hasWord(c.objectText, 'form 66-b') || hasWord(c.objectText, 'form'))) {
      return print('Do not stamp that document directly. Procurement files Form 66-B and Waiver Stamp 4C separately through its FORM and WAIVER slots.');
    }''',
)
replace_once(
    "game.js",
    '''    if (verbMap[c.verb]) return print("You attempt that. The result is technically an action but not a useful one.");
    print(`The parser recognizes that you want something. It does not recognize what kind of person would phrase it as '${c.raw}'. Try HELP if this condition persists.`);''',
    '''    const targetId = c.targetText ? (findItem(c.targetText) || findInventory(c.targetText)) : null;
    const recognizedId = id || targetId;
    if (recognizedId) {
      const label = DORK_DATA.items[recognizedId]?.name || c.objectText || c.targetText;
      return print(`The parser recognizes ${label}, but not the action "${c.verbToken || c.verb}" in this context. Try a simpler verb or HELP.`);
    }
    if (verbMap[c.verb]) return print("You attempt that. The result is technically an action but not a useful one.");
    print(`The parser cannot identify a usable action or object in '${c.raw}'. Try a simpler verb or HELP.`);''',
)
replace_once(
    "game.js",
    '''    if (a) return print(`You ${c.verbToken || 'use'} ${DORK_DATA.items[a].name}${b ? ` on ${typeof b === 'string' && DORK_DATA.items[b] ? DORK_DATA.items[b].name : c.targetText}` : ''}. The universe declines to recognize this workflow.`);
    print("Use what, exactly? Specificity is the thin line between magic and a meeting.");''',
    '''    if (a) {
      const action = `You ${c.verbToken || 'use'} ${DORK_DATA.items[a].name}${b ? ` on ${typeof b === 'string' && DORK_DATA.items[b] ? DORK_DATA.items[b].name : c.targetText}` : ''}.`;
      if (c.targetText && !b) return print(`${action} The first object is recognized, but the target is not available here.`);
      if (b) return print(`${action} Both objects are recognized, but that combination has no defined effect here.`);
      return print(`${action} It has no defined use here; EXAMINE it or provide a more specific target.`);
    }
    print("Use what, exactly? Specificity is the thin line between magic and a meeting.");''',
)
replace_once(
    "game.js",
    '''    print("DORK understands a broad parser vocabulary. Useful examples:\\n\\nLOOK / EXAMINE BADGE / TAKE FORM / DROP MUG\\nN, S, E, W or NORTH, SOUTH, EAST, WEST\\nUSE KEY ON DOOR / GIVE CREAMER TO JORGE\\nTALK TO MERLIN / ASK JORGE ABOUT RECORDS\\nOPEN BOX / READ CONTRACT / INVENTORY / LEAVE ROOM\\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\\n\\nMeta commands: HINT, DEATHS, LORE, SAVE, RESTART.\\n\\nTry unreasonable things. The game has opinions.");''',
    '''    print("DORK understands a broad parser vocabulary. Useful examples:\\n\\nLOOK / EXAMINE NOTICE / TAKE PEN / DROP PEN\\nN, S, E, W or NORTH, SOUTH, EAST, WEST\\nUSE COIN ON SLOT / GIVE NOTE TO CLERK\\nTALK TO RECEPTIONIST / ASK CLERK ABOUT HOURS\\nOPEN DRAWER / READ SIGN / INVENTORY / LEAVE ROOM\\nSAY PASSWORD / NAME RED BLUE GREEN\\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\\n\\nMeta commands: HINT, DEATHS, LORE, SAVE, RESTART.\\n\\nTry unreasonable things. The game has opinions.");''',
)
replace_once(
    "game.js",
    '''      records_file: "Scott's personnel file predates his involvement with the Agency.",''',
    '''      records_file: "Scott's personnel file predates his law-school graduation and marks him as a candidate.",''',
)
replace_once(
    "game.js",
    '''      compliance_manual: "Five household anchors must be named to release a Continuity seal.",''',
    '''      compliance_manual: "Five household anchors must be named in the correct sequence to release a Continuity seal.",''',
)

# Browser regression can run against bundled Chromium in CI, while local users can
# still request Edge with DORK_BROWSER_CHANNEL=msedge.
replace_once(
    "browser_test.py",
    "import asyncio\nfrom pathlib import Path",
    "import asyncio\nimport os\nfrom pathlib import Path",
)
replace_once(
    "browser_test.py",
    '        browser = await playwright.chromium.launch(headless=True, channel="msedge")',
    '        channel = os.environ.get("DORK_BROWSER_CHANNEL")\n        browser = await playwright.chromium.launch(headless=True, **({"channel": channel} if channel else {}))',
)

# Documentation and changelog.
replace_once(
    "README.md",
    "Run the browser regression check from the MechaJeeves root with\n`.venv\\Scripts\\python.exe projects\\dork_release\\browser_test.py`.\nIt uses the installed Playwright and Edge browser; the game itself needs neither.",
    "Run the browser regression check from the MechaJeeves root with\n`.venv\\Scripts\\python.exe projects\\dork_release\\browser_test.py`.\nIt uses Playwright's bundled Chromium by default. Set `DORK_BROWSER_CHANNEL=msedge` to use an installed Edge browser; the game itself needs neither.",
)
prepend_after(
    "CHANGELOG.md",
    "# Dork changelog\n",
    "\n## 2026-10-11 - Blind playtest revision\n\n- Replace HELP examples that exposed later characters, objects, and puzzle solutions.\n- Accept NAME/RECITE for the five-anchor sequence and redirect premature naming to the silver key.\n- Make waiver/form failures diagnostic and route natural STAMP/USE phrasing toward Procurement's separate slots.\n- Track filed objections and optional napkin discovery so Legal, Page 64, and the final callback reflect the actual run.\n- Clarify that Boo supervises rather than blocks the key slot.\n- Preserve the required sequence in LORE and ground the personnel-file entry in observed text.\n- Reward examining the stairway/tunnel with a candle clue, explicitly reframe BELOW, and keep the opening title visible.\n- Add focused blind-playtest regressions and cross-platform browser CI.\n",
)
prepend_after(
    "DORK_FIX_PROGRESS.md",
    "# Dork Fix Progress\n",
    "\n## Blind-playtest revision, 2026-10-11\n\nImplemented the complete 79-turn blind-playtest recommendation set: spoiler-free HELP, final NAME aliases, waiver diagnostics, state-aware Legal/Page 64/napkin text, Boo/key-slot clarity, useful stair/tunnel inspection, sequence-preserving LORE, grounded archive wording, an intentional BELOW callback, opening scroll correction, and more diagnostic parser fallbacks. The permanent browser workflow runs both the full route regression and a focused playtest regression.\n",
)

# Focused browser regression for every issue observed in the blind run.
(ROOT / "playtest_regression_test.py").write_text(r'''"""Focused regressions for issues found in the 79-turn blind playtest."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright


URL = (Path(__file__).parent / "index.html").as_uri()


async def command(page, text):
    await page.locator("#commandInput").fill(text)
    await page.locator("#commandInput").press("Enter")


async def set_run(page, room, *, inventory=None, flags=None, taken=None, reset_meta=False):
    payload = {
        "room": room,
        "previousRoom": None,
        "inventory": inventory or [],
        "taken": taken if taken is not None else list(inventory or []),
        "dropped": {},
        "flags": flags or {},
        "visited": [room],
        "dead": False,
        "won": False,
    }
    await page.evaluate("data => localStorage.setItem('dork_run_v1', JSON.stringify(data))", payload)
    if reset_meta:
        await page.evaluate("localStorage.setItem('dork_meta_v1', JSON.stringify({runs:1,deaths:[],lore:[],hints:0,won:false}))")
    await page.reload()


async def last_reply(page):
    return await page.locator("#output p").last.inner_text()


async def run():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        try:
            page = await browser.new_page(viewport={"width": 390, "height": 844})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            await page.goto(URL)
            await page.wait_for_timeout(100)
            assert await page.evaluate("document.querySelector('#output').scrollTop") == 0

            await command(page, "help")
            help_text = await last_reply(page)
            for spoiler in ("JORGE", "MERLIN", "CREAMER", "CONTRACT", "WAIVER", "TOWER"):
                assert spoiler not in help_text.upper(), spoiler

            await set_run(page, "meeting")
            await command(page, "polish visitor badge")
            reply = await last_reply(page)
            assert "recognizes visitor badge" in reply and '"polish"' in reply

            await set_run(page, "legal_annex", inventory=["waiver_stamp", "form66b"], flags={"stampTaken": True})
            for phrase in ("use waiver stamp on continuity contract", "use waiver stamp on Form 66-B", "stamp Form 66-B"):
                await command(page, phrase)
                reply = await last_reply(page)
                assert "FORM and WAIVER slots" in reply and "universe declines" not in reply and "what kind of person" not in reply, (phrase, reply)
            await command(page, "read page 64")
            assert "open and empty" in await last_reply(page)

            await set_run(page, "legal_annex", flags={"stampTaken": True, "legalObjectionFiled": True})
            await command(page, "read page 64")
            assert "FILED" in await last_reply(page)

            await set_run(page, "procurement", inventory=["form66b", "waiver_stamp"])
            await command(page, "insert Form 66-B into FORM slot")
            await command(page, "insert Waiver Stamp 4C into WAIVER slot")
            assert (await page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("legalObjectionFiled")
            await command(page, "north")
            legal_text = await page.locator("#output").inner_text()
            assert "FILED OBJECTION" in legal_text and "not yet filed" not in legal_text

            await set_run(page, "continuity_chamber", inventory=["silver_key"])
            await command(page, "name Boo Salem Ash Luna Merlin")
            reply = await last_reply(page)
            assert "Use the silver continuity key first" in reply and "key slot" not in reply
            await command(page, "talk to Boo")
            reply = await last_reply(page)
            assert "slot itself remains accessible" in reply and "directly on the key slot" not in reply
            await command(page, "use silver continuity key on door")
            reply = await last_reply(page)
            assert "A phrase resolves above the seals" in reply and "napkin's words return" not in reply.lower()
            await command(page, "name Boo Salem Ash Luna Merlin")
            assert (await page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("finalOpen")

            await set_run(page, "continuity_chamber", inventory=["silver_key"], flags={"napkinRead": True})
            await command(page, "use silver continuity key on door")
            assert "The napkin's words return" in await last_reply(page)

            await set_run(page, "archives")
            await command(page, "examine stairway")
            assert "lightless concrete tunnel" in await last_reply(page)
            await set_run(page, "archives", inventory=["black_candle"], flags={"candleLit": True})
            await command(page, "examine tunnel")
            assert "electric emergency lights are dead" in await last_reply(page)
            await set_run(page, "subbasement", inventory=["black_candle"], flags={"candleLit": True})
            await command(page, "examine tunnel")
            assert "painted arrow points east" in await last_reply(page)
            room_text = await page.locator("#output").inner_text()
            assert "whatever the directory called BELOW is not accessible" in room_text

            await set_run(page, "occult_compliance", reset_meta=True)
            await command(page, "read Occult Compliance Manual")
            await command(page, "lore")
            assert "correct sequence" in await last_reply(page)

            await set_run(page, "records_stacks", reset_meta=True)
            await command(page, "read continuity personnel file")
            await command(page, "lore")
            lore = await last_reply(page)
            assert "law-school graduation" in lore and "marks him as a candidate" in lore

            assert not errors, errors
            print("Blind-playtest fixes: OK")
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(run())
''', encoding="utf-8")

# Permanent CI for the full route plus focused playtest regressions.
workflow_dir = ROOT / ".github" / "workflows"
workflow_dir.mkdir(parents=True, exist_ok=True)
(workflow_dir / "regression.yml").write_text('''name: Dork regression

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  browser:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: python -m pip install --disable-pip-version-check playwright
      - run: python -m playwright install --with-deps chromium
      - run: node --check game.js
      - run: python browser_test.py
      - run: python playtest_regression_test.py
''', encoding="utf-8")

# The application workflow and this script are one-shot scaffolding.
(ROOT / ".github" / "workflows" / "apply-playtest-fixes.yml").unlink(missing_ok=True)
Path(__file__).unlink(missing_ok=True)
