"""Record deterministic player-facing replies from the real Dork page.

This is a sampled command inventory, not an exhaustive count of parser outputs.
Run from the repository root with Python and pass --url to sample Pages.
"""

import argparse
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright


HERE = Path(__file__).resolve().parent
VERBS = ("look at", "read", "open", "take", "use", "touch", "search", "smell", "listen to", "taste")


async def collect(url):
    rows = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True, channel="msedge")
        try:
            page = await browser.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            await page.goto(url)
            targets = await page.evaluate("""() => Object.entries(DORK_DATA.rooms).map(([id, room]) => ({
                id, name: room.name,
                items: (room.items || []).map(key => DORK_DATA.items[key].name)
            }))""")
            for room in targets:
                for item in room["items"]:
                    for verb in VERBS:
                        phrase = f"{verb} {item}"
                        # Reload a fresh, isolated room state before every command.
                        await page.evaluate("""room => {
                            localStorage.removeItem('dork_meta_v1');
                            localStorage.setItem('dork_run_v1', JSON.stringify({
                                room, inventory:[], taken:[], dropped:{}, flags:{},
                                visited:[room], dead:false, won:false
                            }));
                        }""", room["id"])
                        await page.reload()
                        before = await page.locator("#output p").count()
                        await page.locator("#commandInput").fill(phrase)
                        await page.locator("#commandInput").press("Enter")
                        replies = await page.locator("#output p").all_inner_texts()
                        response = replies[before:]
                        if response and response[0] == f"> {phrase}":
                            response = response[1:]
                        state = await page.evaluate("""() => {
                            const saved = localStorage.getItem('dork_run_v1');
                            return saved ? JSON.parse(saved) : null;
                        }""")
                        rows.append({
                            "room": room["id"], "item": item, "command": phrase,
                            "reply": "\n".join(response),
                            "room_after": state["room"] if state else None,
                            "dead": state["dead"] if state else None,
                        })
            if errors:
                raise RuntimeError(f"Page errors: {errors}")
        finally:
            await browser.close()
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=(HERE / "index.html").as_uri())
    parser.add_argument("--output", type=Path, default=HERE / "RESPONSE_INVENTORY.json")
    args = parser.parse_args()
    rows = asyncio.run(collect(args.url))
    args.output.write_text(json.dumps({
        "method": "Fresh isolated room state; ten verbs per visible room item; actual Edge input and output.",
        "source": "index.html" if args.url == (HERE / "index.html").as_uri() else args.url,
        "distinct_reply_count": len({row["reply"] for row in rows}),
        "rows": rows,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Recorded {len(rows)} commands and {len({row['reply'] for row in rows})} distinct observed replies in {args.output}")


if __name__ == "__main__":
    main()
