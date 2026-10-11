from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {path}: found {count}\n--- OLD ---\n{old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def insert_after(path: Path, marker: str, addition: str) -> None:
    replace_once(path, marker, marker + addition)


game = ROOT / "game.js"
data = ROOT / "game-data.js"
tests = ROOT / "browser_test.py"
changelog = ROOT / "CHANGELOG.md"

# Migrate lore summaries that lost important details, and normalize old saves.
replace_once(
    game,
    """  const meta = Object.assign({ runs: 1, deaths: [], lore: [], hints: 0, won: false }, load(META_KEY, {}));
  let state = Object.assign(newRun(), load(RUN_KEY, {}));
  let restartPending = false;
  if (!DORK_DATA.rooms[state.room]) state = newRun();
  if (!state.dropped || typeof state.dropped !== 'object') state.dropped = {};
""",
    """  const meta = Object.assign({ runs: 1, deaths: [], lore: [], hints: 0, won: false }, load(META_KEY, {}));
  const legacyLore = {
    \"Scott's personnel file predates his involvement with the Agency.\": \"Scott's personnel file was created before his law-school graduation.\",
    \"Five household anchors must be named to release a Continuity seal.\": \"Five household anchors must be named in the correct sequence to release a Continuity seal.\"
  };
  meta.lore = [...new Set((meta.lore || []).map(entry => legacyLore[entry] || entry))];
  let state = Object.assign(newRun(), load(RUN_KEY, {}));
  let restartPending = false;
  if (!DORK_DATA.rooms[state.room]) state = newRun();
  if (!state.dropped || typeof state.dropped !== 'object') state.dropped = {};
  if (!state.flags || typeof state.flags !== 'object') state.flags = {};
  if (state.flags.procured) state.flags.objectionFiled = true;
  saveMeta();
""",
)

# NAME should be a natural synonym for SAY/TELL at the final sequence.
replace_once(
    game,
    """    talk: ['talk','speak','chat','address','greet','say','ask','tell','converse'],
""",
    """    talk: ['talk','speak','chat','address','greet','say','ask','tell','converse','name'],
""",
)

# Keep the opening title visible instead of immediately auto-scrolling it away.
replace_once(
    game,
    """    describeRoom();
    updateStatus();
    input.focus();
""",
    """    describeRoom();
    updateStatus();
    input.focus();
    requestAnimationFrame(() => { out.scrollTop = 0; });
""",
)

# Page 64 must describe the current run state, not a stamp that has already moved.
replace_once(
    game,
    """  function examine(text) {
""",
    """  function page64Text() {
    if (state.flags.objectionFiled || state.flags.procured)
      return 'Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. Procurement has filed the waiver with Form 66-B; the acrylic box is empty.';
    if (state.flags.stampTaken)
      return 'Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. You have already removed the stamp from the acrylic box.';
    return 'Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. The stamp is locked in the acrylic box.';
  }

  function examine(text) {
""",
)
replace_once(
    game,
    """    if (state.room === 'legal_annex' && /\\b(?:page 64|page sixty four|page sixty-four)\\b/.test(text)) return print(\"Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. The stamp is locked in the acrylic box.\");
""",
    """    if (state.room === 'legal_annex' && /\\b(?:page 64|page sixty four|page sixty-four)\\b/.test(text)) return print(page64Text());
    if (state.room === 'archives' && /\\b(?:stair|stairs|stairway|tunnel)\\b/.test(text))
      return print(state.flags.candleLit
        ? 'The green candle reveals a concrete tunnel below. The emergency lights are dead, but the marked route continues east.'
        : \"The stair descends into a tunnel where the emergency lights have failed. Luna's warning and the black emergency candle now seem related.\");
    if (state.room === 'subbasement' && /\\btunnel\\b/.test(text))
      return print('The green candle shows a concrete tunnel, dead emergency lights, and a painted arrow pointing east to the Continuity Chamber.');
""",
)

# Track whether the optional napkin password was actually discovered.
replace_once(
    game,
    """    const item = DORK_DATA.items[id]; print(flagDescription(item));
    if (id === 'records_file') state.flags.readPersonnelFile = true;
    discoverLore(id);
""",
    """    const item = DORK_DATA.items[id]; print(flagDescription(item));
    if (id === 'records_file') state.flags.readPersonnelFile = true;
    if (id === 'napkin') state.flags.readNapkin = true;
    discoverLore(id);
""",
)

# Natural attempts to combine the waiver and paperwork should redirect to the actual two-slot workflow.
replace_once(
    game,
    """    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');

    if ((a === 'creamer' || /creamer/.test(c.objectText)) && (b === 'jorge' || state.room === 'records_lobby')) {
""",
    """    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');

    const paperwork = new Set([a, b].filter(Boolean));
    if (state.room !== 'procurement' && paperwork.has('waiver_stamp') && (paperwork.has('contract') || paperwork.has('form66b')))
      return print('Waiver Stamp 4C and Form 66-B are submitted separately to Procurement. Put the form in the FORM slot and the stamp in the WAIVER slot; do not stamp the contract or form directly.');

    if ((a === 'creamer' || /creamer/.test(c.objectText)) && (b === 'jorge' || state.room === 'records_lobby')) {
""",
)

# Procurement submission is the filed legal objection.
replace_once(
    game,
    """        state.flags.procured = true; ['black_candle','silver_key'].forEach(x => state.inventory.push(x));
""",
    """        state.flags.procured = true; state.flags.objectionFiled = true; ['black_candle','silver_key'].forEach(x => state.inventory.push(x));
""",
)

# Make the final key sequence state-aware and stop pretending Boo physically blocks a usable slot.
replace_once(
    game,
    """    if (state.room === 'continuity_chamber' && (a === 'silver_key' || /key/.test(c.objectText))) {
      if (!state.inventory.includes('silver_key')) return print('You need the silver key in your hand, not merely in a sentence.');
      if (c.targetText && !/^(?:(?:the|a|an) )?(?:five (?:brass )?seals|(?:brass )?seals|key slot|silver key slot|slot(?: beneath (?:the )?(?:five )?seals)?|(?:final |eastern |east )?door)$/.test(c.targetText))
        return print('The key fits the slot beneath the five seals, not that target.');
      state.flags.keyUsed = true; print(\"The silver key fits a slot beneath the five seals. It turns once. Five small lights wake above the door.\\n\\nTheir poses resolve in the light: Boo upright, Salem curled asleep, Ash high on his shelf, Luna peering out, Merlin raising one paw. Not decorations. A household, filed as infrastructure.\\n\\nThe napkin's words return: HOME IS A PASSWORD. The chamber waits for the five names.\"); return;
    }
""",
    """    if (state.room === 'continuity_chamber' && (a === 'silver_key' || /key/.test(c.objectText))) {
      if (!state.inventory.includes('silver_key')) return print('You need the silver key in your hand, not merely in a sentence.');
      if (c.targetText && !/^(?:(?:the|a|an) )?(?:five (?:brass )?seals|(?:brass )?seals|key slot|silver key slot|slot(?: beneath (?:the )?(?:five )?seals)?|(?:final |eastern |east )?door)$/.test(c.targetText))
        return print('The key fits the slot beneath the five seals, not that target.');
      if (state.flags.keyUsed) return print('The silver key is already turned. Five lit seals still wait for the five names.');
      state.flags.keyUsed = true;
      const passwordLine = state.flags.readNapkin
        ? \"The napkin's words return: HOME IS A PASSWORD.\"
        : 'A phrase resolves above the seals: HOME IS A PASSWORD.';
      print(`Boo lifts one paw with executive reluctance. The silver key fits the slot beneath the five seals and turns once. Five small lights wake above the door.\\n\\nTheir poses resolve in the light: Boo upright, Salem curled asleep, Ash high on his shelf, Luna peering out, Merlin raising one paw. Not decorations. A household, filed as infrastructure.\\n\\n${passwordLine} The chamber waits for the five names.`); return;
    }
""",
)

# Using the napkin should count as discovering its password, not only READ/EXAMINE.
replace_once(
    game,
    """    if (a && !c.targetText) {
      const replies = {
""",
    """    if (a && !c.targetText) {
      if (a === 'napkin') {
        state.flags.readNapkin = true;
        return print('The napkin drawing says HOME IS A PASSWORD. Keep that in mind when you reach the final door.');
      }
      const replies = {
""",
)

# Unsupported USE combinations should distinguish recognized objects from an unknown target.
replace_once(
    game,
    """    if (a) return print(`You ${c.verbToken || 'use'} ${DORK_DATA.items[a].name}${b ? ` on ${typeof b === 'string' && DORK_DATA.items[b] ? DORK_DATA.items[b].name : c.targetText}` : ''}. The universe declines to recognize this workflow.`);
""",
    """    if (a) {
      const diagnosis = b
        ? 'Both objects are recognized; this is the wrong target or location.'
        : c.targetText
          ? 'The item is recognized, but the target is not.'
          : 'The item is recognized, but this action is not useful here.';
      return print(`You ${c.verbToken || 'use'} ${DORK_DATA.items[a].name}${b ? ` on ${typeof b === 'string' && DORK_DATA.items[b] ? DORK_DATA.items[b].name : c.targetText}` : ''}. The universe declines to recognize this workflow. ${diagnosis}`);
    }
""",
)

# The five-name phrase should explain the missing prerequisite, then accept NAME as well as SAY.
replace_once(
    game,
    """    const names = ['boo','salem','ash','luna','merlin'];
    if (state.room === 'continuity_chamber' && state.flags.keyUsed && names.every(n => new RegExp(`\\\\b${n}\\\\b`).test(t))) {
      if (!/\\bboo\\b.*\\bsalem\\b.*\\bash\\b.*\\bluna\\b.*\\bmerlin\\b/.test(t)) return print('The five seals flicker, then go dark. Match their poses from left to right.');
      state.flags.finalOpen = true;
      print(\"You name them: BOO. SALEM. ASH. LUNA. MERLIN.\\n\\nOne by one, the brass seals illuminate. The enormous door unlocks with a sound like five hundred filing cabinets opening at once.\\n\\nBoo stands, stretches, and moves aside.\\n\\nFor the first time tonight, you have been cleared to leave.\"); return;
    }
""",
    """    const names = ['boo','salem','ash','luna','merlin'];
    const allFiveNames = names.every(n => new RegExp(`\\\\b${n}\\\\b`).test(t));
    if (state.room === 'continuity_chamber' && allFiveNames && !state.flags.keyUsed)
      return print('You say the five names, but the seals remain dark. Use the silver continuity key first.');
    if (state.room === 'continuity_chamber' && state.flags.keyUsed && allFiveNames) {
      if (!/\\bboo\\b.*\\bsalem\\b.*\\bash\\b.*\\bluna\\b.*\\bmerlin\\b/.test(t)) return print('The five seals flicker, then go dark. Match their poses from left to right.');
      state.flags.finalOpen = true;
      print(\"You name them: BOO. SALEM. ASH. LUNA. MERLIN.\\n\\nOne by one, the brass seals illuminate. The enormous door unlocks with a sound like five hundred filing cabinets opening at once.\\n\\nBoo stands, stretches, and moves aside.\\n\\nFor the first time tonight, you have been cleared to leave.\"); return;
    }
""",
)
replace_once(
    game,
    """    if (state.room === 'continuity_chamber' && /boo|cat/.test(t)) return print(state.flags.keyUsed ? \"Boo looks at the five seals, then at you. Naming things is apparently your department now.\" : \"Boo sits directly on the key slot. Leadership obstruction at its purest.\");
""",
    """    if (state.room === 'continuity_chamber' && /boo|cat/.test(t)) return print(state.flags.keyUsed ? \"Boo looks at the five seals, then at you. Naming things is apparently your department now.\" : \"Boo sits beside the key slot and watches you ignore the silver continuity key. Leadership oversight at its purest.\");
""",
)

# Correctly solved paperwork intent should not degrade into arbitrary verb guessing.
replace_once(
    game,
    """    if (state.room === 'legal_annex' && c.verb === 'stamp' && hasWord(c.objectText, 'contract')) return print('The waiver stamp documents your refusal. Procurement accepts it with Form 66-B; stamping the contract here will not release you.');
""",
    """    if (c.verb === 'stamp' && (hasWord(c.objectText, 'contract') || hasWord(c.objectText, 'form') || hasWord(c.objectText, '66-b') || hasWord(c.objectText, '66b')))
      return print('Waiver Stamp 4C and Form 66-B are submitted separately to Procurement. Put the form in the FORM slot and the stamp in the WAIVER slot; do not stamp the contract or form directly.');
""",
)

# Spoiler-free HELP examples.
replace_once(
    game,
    """    print(\"DORK understands a broad parser vocabulary. Useful examples:\\n\\nLOOK / EXAMINE BADGE / TAKE FORM / DROP MUG\\nN, S, E, W or NORTH, SOUTH, EAST, WEST\\nUSE KEY ON DOOR / GIVE CREAMER TO JORGE\\nTALK TO MERLIN / ASK JORGE ABOUT RECORDS\\nOPEN BOX / READ CONTRACT / INVENTORY / LEAVE ROOM\\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\\n\\nMeta commands: HINT, DEATHS, LORE, SAVE, RESTART.\\n\\nTry unreasonable things. The game has opinions.\");
""",
    """    print(\"DORK understands a broad parser vocabulary. Useful examples:\\n\\nLOOK / EXAMINE POSTER / TAKE PENCIL / DROP PENCIL\\nN, S, E, W or NORTH, SOUTH, EAST, WEST\\nUSE SCREWDRIVER ON PANEL / GIVE PARCEL TO RECEPTIONIST\\nTALK TO RECEPTIONIST / ASK RECEPTIONIST ABOUT HOURS\\nOPEN DRAWER / READ NOTICE / INVENTORY / LEAVE ROOM\\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\\n\\nMeta commands: HINT, DEATHS, LORE, SAVE, RESTART.\\n\\nTry unreasonable things. The game has opinions.\");
""",
)

# Preserve the mechanically important qualifier in LORE and ground the personnel-file summary.
replace_once(
    game,
    """      records_file: \"Scott's personnel file predates his involvement with the Agency.\",
      contract: \"The Agency can retain identity and post-mortem administrative capacity through consent.\",
      drawings: \"Angela, Julia, and Audrey's drawings act as three witnesses to the Continuity door.\",
      compliance_manual: \"Five household anchors must be named to release a Continuity seal.\",
""",
    """      records_file: \"Scott's personnel file was created before his law-school graduation.\",
      contract: \"The Agency can retain identity and post-mortem administrative capacity through consent.\",
      drawings: \"Angela, Julia, and Audrey's drawings act as three witnesses to the Continuity door.\",
      compliance_manual: \"Five household anchors must be named in the correct sequence to release a Continuity seal.\",
""",
)

# State-aware Legal text and a deliberate acknowledgement that BELOW is not this destination.
replace_once(
    data,
    """      descByFlag: { stampTaken: \"The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract still waits on its lectern beneath SIGNATURE REQUIRED. The acrylic box is open and empty. Legal has not yet filed an objection.\" },
""",
    """      descByFlag: {
        objectionFiled: \"The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract remains unsigned beneath SIGNATURE REQUIRED. The acrylic box is open and empty. Procurement has filed your refusal, and Legal is pretending this was its idea.\",
        stampTaken: \"The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract still waits on its lectern beneath SIGNATURE REQUIRED. The acrylic box is open and empty. Legal has not yet filed an objection.\"
      },
""",
)
replace_once(
    data,
    """      desc: \"The stair ends in a concrete tunnel. Emergency lights have failed. Something wet is breathing in the darkness ahead.\\n\\nA painted arrow points east: CONTINUITY CHAMBER. West, the stair leads back up to the Archives. A parking passage beyond the tunnel has collapsed behind a wall of black roots.\",
""",
    """      desc: \"The stair ends in a concrete tunnel. Emergency lights have failed. Something wet is breathing in the darkness ahead.\\n\\nA painted arrow points east: CONTINUITY CHAMBER. West, the stair leads back up to the Archives. A parking passage beyond the tunnel has collapsed behind a wall of black roots. The directory called this the Sub-Basement. Whatever it meant by BELOW is still somewhere else.\",
""",
)

# Browser regression helper for concise state-specific tests.
replace_once(
    tests,
    """async def command(page, text):
    await page.locator(\"#commandInput\").fill(text)
    await page.locator(\"#commandInput\").press(\"Enter\")


async def run():
""",
    """async def command(page, text):
    await page.locator(\"#commandInput\").fill(text)
    await page.locator(\"#commandInput\").press(\"Enter\")


async def set_run(page, room, *, inventory=None, taken=None, flags=None, visited=None):
    payload = {
        \"room\": room,
        \"previousRoom\": None,
        \"inventory\": inventory or [],
        \"taken\": taken or [],
        \"dropped\": {},
        \"flags\": flags or {},
        \"visited\": visited or [room],
        \"dead\": False,
        \"won\": False,
    }
    await page.evaluate(\"payload => localStorage.setItem('dork_run_v1', JSON.stringify(payload))\", payload)
    await page.reload()


async def run():
""",
)

regression_block = r'''
            # Blind-playtest regressions: spoiler-free HELP, state-aware clues,
            # natural parser phrasing, and final-sequence prerequisites.
            review_page = await browser.new_page(viewport={"width": 390, "height": 520})
            review_page.on("pageerror", lambda error: errors.append(str(error)))
            await review_page.goto(URL)
            await review_page.evaluate("localStorage.clear()")
            await review_page.reload()
            await review_page.wait_for_timeout(100)
            assert await review_page.evaluate("document.querySelector('#output').scrollTop") == 0

            await command(review_page, "help")
            help_reply = await review_page.locator("#output p").last.inner_text()
            for spoiler in ("JORGE", "MERLIN", "CREAMER", "CONTRACT", "WAIVER"):
                assert spoiler not in help_reply, help_reply
            assert "RECEPTIONIST" in help_reply and "PENCIL" in help_reply

            await review_page.evaluate("""localStorage.setItem('dork_meta_v1', JSON.stringify({
                runs:1, deaths:[], hints:0, won:false,
                lore:["Scott's personnel file predates his involvement with the Agency.",
                      "Five household anchors must be named to release a Continuity seal."]
            }))""")
            await review_page.reload()
            await command(review_page, "lore")
            migrated_lore = await review_page.locator("#output p").last.inner_text()
            assert "before his law-school graduation" in migrated_lore
            assert "correct sequence" in migrated_lore
            assert "predates his involvement" not in migrated_lore

            await set_run(review_page, "legal_annex", inventory=["waiver_stamp"],
                          taken=["waiver_stamp"], flags={"stampTaken": True})
            await command(review_page, "read page 64")
            assert "already removed" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use waiver stamp on continuity contract")
            assert "submitted separately to Procurement" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "records_stacks", inventory=["form66b", "waiver_stamp"],
                          taken=["form66b", "waiver_stamp"], flags={"stampTaken": True})
            await command(review_page, "stamp Form 66-B")
            assert "submitted separately to Procurement" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use waiver stamp on Form 66-B")
            assert "submitted separately to Procurement" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "legal_annex", flags={"stampTaken": True, "procured": True})
            annex_text = await review_page.locator("#output").inner_text()
            assert "Procurement has filed your refusal" in annex_text
            await command(review_page, "read page 64")
            assert "filed the waiver with Form 66-B" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "break_room")
            await command(review_page, "read napkin")
            assert (await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("readNapkin")

            await set_run(review_page, "continuity_chamber", inventory=["silver_key"],
                          taken=["silver_key"], flags={})
            await command(review_page, "talk to Boo")
            boo_reply = await review_page.locator("#output p").last.inner_text()
            assert "beside the key slot" in boo_reply and "directly on" not in boo_reply
            await command(review_page, "say Boo Salem Ash Luna Merlin")
            assert "Use the silver continuity key first" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use silver continuity key on door")
            key_reply = await review_page.locator("#output p").last.inner_text()
            assert "Boo lifts one paw" in key_reply
            assert "A phrase resolves above the seals" in key_reply
            assert "napkin's words return" not in key_reply.lower()
            await command(review_page, "name Boo Salem Ash Luna Merlin")
            run = await review_page.evaluate("JSON.parse(localStorage.dork_run_v1)")
            assert run["flags"].get("finalOpen")

            await set_run(review_page, "continuity_chamber", inventory=["silver_key"],
                          taken=["silver_key"], flags={"readNapkin": True})
            await command(review_page, "use silver continuity key on door")
            assert "The napkin's words return" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "archives")
            await command(review_page, "examine stairway")
            stair_reply = await review_page.locator("#output p").last.inner_text()
            assert "emergency lights have failed" in stair_reply and "black emergency candle" in stair_reply
            await command(review_page, "examine tunnel")
            assert "emergency lights have failed" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "subbasement", inventory=["black_candle"],
                          taken=["black_candle"], flags={"candleLit": True})
            room_text = await review_page.locator("#output").inner_text()
            assert "Whatever it meant by BELOW is still somewhere else" in room_text
            await command(review_page, "examine tunnel")
            assert "painted arrow pointing east" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "meeting", inventory=["badge"], taken=["badge"])
            await command(review_page, "use visitor badge on glass of water")
            assert "Both objects are recognized" in await review_page.locator("#output p").last.inner_text()
'''
replace_once(
    tests,
    """            assert not errors, errors
            print(\"Dork browser path, autosave, restart, death persistence, parser, input aliases and narrow viewport: OK\")
""",
    regression_block + """            assert not errors, errors
            print(\"Dork browser path, autosave, restart, death persistence, parser, input aliases, blind-playtest fixes and narrow viewport: OK\")
""",
)

# Record the revision in the repository changelog.
replace_once(
    changelog,
    "# Dork changelog\n\n",
    """# Dork changelog

## 2026-10-11 - Blind playtest revision

- Replace HELP examples that exposed real later puzzles with neutral parser examples.
- Accept NAME as a final-sequence synonym, explain the key prerequisite, and remove the false implication that Boo must be moved before the key can be used.
- Redirect natural waiver/form stamping attempts to Procurement's separate FORM and WAIVER slots.
- Make Page 64, the Legal Annex, the napkin callback, and legacy LORE entries state-aware.
- Preserve the five-anchor sequence requirement in LORE and ground the personnel-file summary in observed text.
- Give stairway and tunnel examinations a useful candle-related clue, acknowledge that BELOW is still elsewhere, improve unsupported USE diagnostics, and keep the opening title visible.
- Add browser regressions for each blind-playtest finding while retaining the complete true-ending route.

""",
)

print("Blind-playtest fixes applied.")
