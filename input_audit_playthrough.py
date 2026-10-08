"""Play from a fresh save to the true ending using new input forms."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True, channel="msedge")
        try:
            page = await browser.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            await page.goto((Path(__file__).parent / "index.html").as_uri())
            steps = [
                ("please fetch badge", "meeting", "badge", None),
                ("could you retrieve agenda", "meeting", "agenda", None),
                ("step east", "executive_corridor", None, None),
                ("proceed to break room", "break_room", None, None),
                ("pick creamer up", "break_room", "creamer", None),
                ("step south", "executive_corridor", None, None),
                ("step south", "records_lobby", None, None),
                ("hand off creamer to Jorge", "records_lobby", None, "jorgeMoved"),
                ("step through gate", "records_stacks", None, None),
                ("fetch form", "records_stacks", "form66b", None),
                ("step east", "legal_annex", None, None),
                ("open the stamp box up", "legal_annex", "waiver_stamp", None),
                ("step south", "procurement", None, None),
                ("insert form into form slot", "procurement", None, "formInserted"),
                ("insert stamp into waiver slot", "procurement", None, "procured"),
                ("step east", "hr_reliquary", None, None),
                ("choose tower on tarot spread", "hr_reliquary", None, "tarotSolved"),
                ("step east", "occult_compliance", None, None),
                ("step south", "archives", None, None),
                ("light candle", "archives", None, "candleLit"),
                ("step down the stair", "subbasement", None, None),
                ("step east", "continuity_chamber", None, None),
                ("use key on seals", "continuity_chamber", None, "keyUsed"),
                ("say boo salem ash luna merlin", "continuity_chamber", None, "finalOpen"),
                ("step east", "parking_exit", None, None),
            ]
            for phrase, room, item, flag in steps:
                await page.locator("#commandInput").fill(phrase)
                await page.locator("#commandInput").press("Enter")
                state = await page.evaluate("JSON.parse(localStorage.dork_run_v1)")
                assert state["room"] == room, (phrase, state["room"], room)
                if item:
                    assert item in state["inventory"], (phrase, item, state["inventory"])
                if flag:
                    assert state["flags"].get(flag), (phrase, flag, state["flags"])
            assert state["won"] and "TRUE ENDING" in await page.locator("#output").inner_text()
            assert not errors, errors
            print(f"Fresh Edge playthrough: {len(steps)} commands, true ending and state checks OK")
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
