"""Exercise the shipped static page through real browser input, without a server."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright


URL = (Path(__file__).parent / "index.html").as_uri()


async def command(page, text):
    await page.locator("#commandInput").fill(text)
    await page.locator("#commandInput").press("Enter")


async def run():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True, channel="msedge")
        try:
            page = await browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True,
                                          device_scale_factor=3, has_touch=True)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            await page.goto(URL)
            await command(page, "look")
            await command(page, "take badge")
            await command(page, "take agenda")
            await command(page, "leave agenda")
            assert "Dropped: agenda folder" in (await page.locator("#output p").last.inner_text())
            await command(page, "take agenda")
            await command(page, "leave room")
            assert (await page.evaluate("JSON.parse(localStorage.dork_run_v1).room")) == "executive_corridor"
            await command(page, "leave room")
            assert "You can leave by going west, north, south, east" in (await page.locator("#output p").last.inner_text())
            assert (await page.evaluate("JSON.parse(localStorage.dork_run_v1).room")) == "executive_corridor"
            await page.reload()
            assert (await page.evaluate("JSON.parse(localStorage.dork_run_v1).room")) == "executive_corridor"
            await command(page, "north")
            await command(page, "take creamer")
            await command(page, "give creamer to jorge")
            assert not (await page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("jorgeMoved")
            await command(page, "drop creamer")
            await command(page, "take everything")
            assert {"mug", "creamer", "napkin", "memo"}.issubset(set(await page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")))
            await command(page, "south")
            await command(page, "south")
            await command(page, "give creamer to jorge")
            await command(page, "south")
            await command(page, "read file")
            await command(page, "attack boo")
            assert len(await page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")) == 0
            await command(page, "take form")
            await command(page, "east")
            await command(page, "read contract")
            await command(page, "take all")
            assert "There is nothing portable left" in (await page.locator("#output").inner_text())[-500:]
            await command(page, "open box")
            await command(page, "south")
            await command(page, "insert form into machine")
            await command(page, "insert stamp into machine")
            await command(page, "east")
            await command(page, "talk to merlin")
            await command(page, "look at the cat")
            await command(page, "choose the tower")
            await command(page, "east")
            await command(page, "read manual")
            await command(page, "look around")
            await command(page, "south")
            await command(page, "read ledger")
            await command(page, "light candle")
            await command(page, "east")
            await command(page, "east")
            await command(page, "apply key to seals")
            await command(page, "say boo salem ash luna merlin")
            await command(page, "east")
            assert "TRUE ENDING" in await page.locator("#output").inner_text(), (await page.locator("#output").inner_text())[-4500:]
            data = await page.evaluate("JSON.parse(localStorage.dork_run_v1)")
            assert data["room"] == "parking_exit" and data["won"]
            assert set(data["visited"]) == {"meeting", "executive_corridor", "break_room", "records_lobby",
                                            "records_stacks", "legal_annex", "procurement", "hr_reliquary",
                                            "occult_compliance", "archives", "subbasement", "continuity_chamber",
                                            "parking_exit"}
            await page.reload()
            assert "parking_exit" == await page.evaluate("JSON.parse(localStorage.dork_run_v1).room")
            await command(page, "restart")
            assert "meeting" == await page.evaluate("JSON.parse(localStorage.dork_run_v1).room")
            await command(page, "east")
            await command(page, "south")
            await command(page, "attack jorge")
            assert await page.evaluate("localStorage.getItem('dork_run_v1')") is None
            assert len(await page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")) == 1
            await command(page, "restart")
            assert "meeting" == await page.evaluate("JSON.parse(localStorage.dork_run_v1).room")
            assert len(await page.evaluate("JSON.parse(localStorage.dork_meta_v1).lore")) >= 4
            await command(page, "lick water")
            assert "lick" in (await page.locator("#output").inner_text()).lower()
            await command(page, "east")
            await command(page, "north")
            await command(page, "take creamer")
            await command(page, "south")
            await command(page, "south")
            await command(page, "give creamer to jorge")
            await command(page, "south")
            await command(page, "attack cat")
            await command(page, "restart")
            await command(page, "east")
            await command(page, "north")
            await command(page, "take creamer")
            await command(page, "south")
            await command(page, "south")
            await command(page, "give creamer to jorge")
            await command(page, "south")
            await command(page, "east")
            await command(page, "sign contract")
            assert len(await page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")) == 3
            for width, height in [(320, 568), (375, 667), (390, 390), (844, 390)]:
                await page.set_viewport_size({"width": width, "height": height})
                bounds = await page.locator("#commandInput").bounding_box()
                assert bounds and bounds["y"] >= 0 and bounds["y"] + bounds["height"] <= height, (width, height, bounds)
                output = await page.locator("#output").bounding_box()
                assert output and output["height"] >= 100 and output["y"] >= 0, (width, height, output)
                if width <= 620 and height > 520:
                    controls = await page.locator(".controls").bounding_box()
                    assert controls and controls["y"] > bounds["y"] + bounds["height"], (width, height, controls, bounds)

            parser_page = await browser.new_page(viewport={"width": 320, "height": 568},
                                                 is_mobile=True, has_touch=True)
            parser_page.on("pageerror", lambda error: errors.append(str(error)))
            await parser_page.goto(URL)
            await command(parser_page, "grab everything")
            assert set((await parser_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory"))) == {"badge", "agenda"}
            await parser_page.locator('[data-command="east"]').click()
            await command(parser_page, "go north")
            await command(parser_page, "pick up the creamer")
            await command(parser_page, "head south")
            await command(parser_page, "go south")
            await command(parser_page, "hand creamer to Jorge")
            await command(parser_page, "go south")
            await command(parser_page, "go east")
            await command(parser_page, "use badge on stamp box")
            assert "waiver_stamp" in await parser_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            await command(parser_page, "smell contract")
            assert "smell" in (await parser_page.locator("#output p").last.inner_text()).lower()
            assert not errors, errors
            print("Dork browser path, autosave, restart, death persistence, parser and narrow viewport: OK")
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(run())
