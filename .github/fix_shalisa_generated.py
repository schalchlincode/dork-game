from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected one match, found {count}: {old[:120]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


game = Path("game.js")
game_text = game.read_text(encoding="utf-8")
game_text = game_text.replace("Procurement's", "Procurement\\'s")
game.write_text(game_text, encoding="utf-8")

replace_once(
    game,
    """  function useThing(c) {
    const a = findInventory(c.objectText) || findItem(c.objectText);""",
    """  function useThing(c) {
    if (/^(?:waiver stamp|stamp 4c|4c)$/.test(c.objectText) && /^(?:waiver|waiver form|waiver form 4c|page 64|refusal form|refusal page)$/.test(c.targetText)) return stampWaiver();
    const a = findInventory(c.objectText) || findItem(c.objectText);""",
)
replace_once(
    game,
    """    if (state.room === 'procurement' && (a === 'form66b' || a === 'waiver_form' || /form|waiver/.test(c.objectText))) {
      if (a === 'waiver_stamp') return print('The machine accepts waiver paperwork, not the rubber stamp itself. Stamp Waiver Form 4C first.');""",
    """    if (state.room === 'procurement' && (a === 'form66b' || a === 'waiver_form' || /form|waiver/.test(c.objectText))) {
      if (state.flags.formInserted && /^(?:form|form 66-b|66-b|66b)$/.test(c.objectText)) return print('The machine already has that. It is unusually possessive about paperwork.');
      if (state.flags.waiverInserted && /waiver/.test(c.objectText)) return print('The machine already has that. It is unusually possessive about paperwork.');
      if (a === 'waiver_stamp') return print('The machine accepts waiver paperwork, not the rubber stamp itself. Stamp Waiver Form 4C first.');""",
)
replace_once(
    game,
    "The five seals flicker, then go dark. Start at the uppermost seal and follow the engraved arrow clockwise.",
    "The five seals flicker, then go dark. Match the poses: start at the uppermost seal and follow the engraved arrow clockwise.",
)
replace_once(
    game,
    "Start at the uppermost lit seal and follow the engraved arrow clockwise. Match each pose to one of the five cats you met.",
    "Start at the uppermost of the five lit seals and follow the engraved arrow clockwise. Match each pose to one of the five cats you met.",
)
replace_once(
    game,
    "The brass machine has a FORM paper slot and a WAIVER paper slot. Its SOUL slot is taped over.",
    "The brass machine has a FORM slot for completed paper and a WAIVER slot for stamped paper. Its SOUL slot is taped over.",
)
replace_once(
    game,
    "The requisition machine has FORM and WAIVER paper slots. Insert completed Form 66-B and stamped Waiver Form 4C to request the candle and key.",
    "The requisition machine has FORM and WAIVER slots for paper. Insert completed Form 66-B and stamped Waiver Form 4C to request the candle and key.",
)
replace_once(
    game,
    "The frames are cold beneath your fingers. Angela, Julia, and Audrey each drew the same impossible building; the same marked door dominates all three views.",
    "The frames are cold beneath your fingers. Angela, Julia, and Audrey each drew the same impossible building; the same marked door dominates all three views, and their signatures remain the three witnesses.",
)

browser_test = Path("browser_test.py")
replace_once(
    browser_test,
    '            assert "There is nothing portable left" in (await page.locator("#output").inner_text())[-500:]',
    '            assert "waiver_form" in await page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")',
)
replace_once(
    browser_test,
    '            assert "Three cards" in await fix_page.locator("#output p").last.inner_text()',
    '            assert "orientation assessment" in await fix_page.locator("#output p").last.inner_text()',
)
replace_once(
    browser_test,
    '("hr_reliquary", {"tarotSolved": True}, "split open into a passage", "examine cards", "Three cards"),',
    '("hr_reliquary", {"tarotSolved": True}, "split open into a passage", "examine cards", "orientation assessment"),',
)
replace_once(
    browser_test,
    '("hr_reliquary", "look at the table", "orientation table"),',
    '("hr_reliquary", "look at the table", "orientation assessment"),',
)
replace_once(
    browser_test,
    '''            await command(fix_page, "insert form into machine")
            await command(fix_page, "insert form into machine")
            assert "already has that" in await fix_page.locator("#output p").last.inner_text()''',
    '''            await command(fix_page, "insert form into machine")
            await command(fix_page, "insert Form 66-B into machine")
            assert "already has that" in await fix_page.locator("#output p").last.inner_text()''',
)
replace_once(
    browser_test,
    '            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "parking_exit"',
    '            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "asset_control"',
)
replace_once(
    browser_test,
    '("procurement", "buy candle", "Form 66-B and Waiver Stamp 4C"),',
    '("procurement", "buy candle", "stamped Waiver Form 4C"),',
)
replace_once(
    browser_test,
    '("archives", "take ledger", "chained to its pedestal", {}),',
    '("archives", "take ledger", "chained to the stone reading stand", {}),',
)

print("Generated Shalisa files normalized.")
