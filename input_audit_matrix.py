"""Compare each added action/target alias and grammar template in real Edge input."""
import asyncio
import csv
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).parent
ROWS = list(csv.DictReader((ROOT / "PLAYER_INPUT_AUDIT_ADDITIONS.csv").open(encoding="utf-8-sig", newline="")))

ACTION_CONTEXT = {
    "examine": ("meeting", [], {}, "agenda"),
    "take": ("meeting", [], {}, "badge"),
    "drop": ("meeting", ["badge"], {}, "badge"),
    "inventory": ("meeting", [], {}, ""),
    "give": ("records_lobby", ["creamer"], {}, "creamer to Jorge"),
    "talk": ("records_lobby", [], {}, "Jorge"),
    "touch": ("meeting", [], {}, "water"),
    "drink": ("meeting", [], {}, "water"),
    "throw": ("meeting", ["badge"], {}, "badge"),
    "flatter": ("records_lobby", [], {}, "Jorge"),
    "help": ("meeting", [], {}, ""),
}

# The examples are the actual patterns listed in the report. Canonical inputs
# establish the expected reply and state for the same room and possessions.
PATTERN_EQUIVALENTS = [
    ("please fetch badge", "take badge", "meeting", [], {}),
    ("could you inspect agenda", "examine agenda", "meeting", [], {}),
    ("can you take badge", "take badge", "meeting", [], {}),
    ("inspect agenda please", "examine agenda", "meeting", [], {}),
    ("take a sip of water", "drink water", "meeting", [], {}),
    ("take a whiff of water", "smell water", "meeting", [], {}),
    ("gulp down water", "drink water", "meeting", [], {}),
    ("slurp water down", "drink water", "meeting", [], {}),
    ("open up stamp box", "open stamp box", "legal_annex", ["badge"], {}),
    ("open stamp box up", "open stamp box", "legal_annex", ["badge"], {}),
    ("check out agenda", "examine agenda", "meeting", [], {}),
    ("pick badge up", "take badge", "meeting", [], {}),
    ("put down badge", "drop badge", "meeting", ["badge"], {}),
    ("put badge down", "drop badge", "meeting", ["badge"], {}),
    ("set down badge", "drop badge", "meeting", ["badge"], {}),
    ("set badge down", "drop badge", "meeting", ["badge"], {}),
    ("lay down badge", "drop badge", "meeting", ["badge"], {}),
    ("lay badge down", "drop badge", "meeting", ["badge"], {}),
    ("hand over creamer to Jorge", "give creamer to Jorge", "records_lobby", ["creamer"], {}),
    ("hand creamer over to Jorge", "give creamer to Jorge", "records_lobby", ["creamer"], {}),
    ("hand off creamer to Jorge", "give creamer to Jorge", "records_lobby", ["creamer"], {}),
    ("hand creamer off to Jorge", "give creamer to Jorge", "records_lobby", ["creamer"], {}),
    ("show my belongings", "inventory", "meeting", [], {}),
    ("what am I carrying", "inventory", "meeting", [], {}),
    ("show me the commands", "help", "meeting", [], {}),
    ("give me a clue", "hint", "meeting", [], {}),
    ("step south", "go south", "meeting", [], {}),
    ("step through the gate", "go south", "records_lobby", [], {"jorgeMoved": True}),
    ("step down the stairs", "go down stairs", "archives", ["black_candle"], {"candleLit": True}),
    ("proceed to records", "go to records", "executive_corridor", [], {}),
]


async def result(page, phrase, room, inventory, flags):
    seed = {"room": room, "inventory": inventory, "taken": inventory,
            "dropped": {}, "flags": flags, "visited": [room], "dead": False, "won": False}
    await page.evaluate("seed => {localStorage.setItem('dork_run_v1', JSON.stringify(seed)); localStorage.removeItem('dork_meta_v1')}", seed)
    await page.reload()
    await page.locator("#commandInput").fill(phrase)
    await page.locator("#commandInput").press("Enter")
    reply = await page.locator("#output p").last.inner_text()
    state = await page.evaluate("JSON.parse(localStorage.dork_run_v1)")
    return reply, state


async def main():
    assert len(ROWS) == 49
    assert len(PATTERN_EQUIVALENTS) == 30
    assert [row["example"] for row in ROWS if row["kind"] == "command pattern"] == [case[0] for case in PATTERN_EQUIVALENTS]
    cases = []
    for row in ROWS:
        if row["kind"] == "action alias":
            action = row["maps_to"]
            room, inventory, flags, obj = ACTION_CONTEXT[action]
            cases.append((row["addition"] + (" " + obj if obj else ""), action + (" " + obj if obj else ""), room, inventory, flags))
        elif row["kind"] == "target alias":
            obj = "badge" if row["maps_to"] == "badge" else "glass of water"
            cases.append(("examine " + row["addition"], "examine " + obj, "meeting", [], {}))
    cases += PATTERN_EQUIVALENTS
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True, channel="msedge")
        try:
            page = await browser.new_page()
            await page.goto((ROOT / "index.html").as_uri())
            for new, old, room, inventory, flags in cases:
                expected = await result(page, old, room, inventory, flags)
                actual = await result(page, new, room, inventory, flags)
                assert actual == expected, (new, old, actual, expected)
            print(f"Edge input matrix: {len(cases)} additions matched canonical replies and saved state")
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
