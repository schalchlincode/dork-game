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
    '''            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'procurement', inventory:['badge','form66b','waiver_stamp'], taken:['badge','form66b','waiver_stamp'], dropped:{}, flags:{}, visited:['procurement'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "show badge to machine")
            assert "You show" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "insert form into machine")
            await command(fix_page, "insert form into machine")
            assert "already has that" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "insert stamp into machine")
            inventory = await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert "form66b" not in inventory and "waiver_stamp" not in inventory and inventory.count("silver_key") == 1''',
    '''            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'procurement', inventory:['badge','form66b','waiver_stamp','waiver_form'], taken:['badge','form66b','waiver_stamp','waiver_form'], dropped:{}, flags:{stampTaken:true}, visited:['procurement'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "show badge to machine")
            assert "You show" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "insert form into machine")
            await command(fix_page, "insert form into machine")
            assert "already has that" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "use waiver stamp on waiver form")
            assert "DECLINED WITH PREJUDICE" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "insert waiver into machine")
            inventory = await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert "form66b" not in inventory and "waiver_form" not in inventory and "waiver_stamp" in inventory and inventory.count("silver_key") == 1 and "procurement_receipt" in inventory''',
)

print("Generated Shalisa files normalized.")
