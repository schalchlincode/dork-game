"""Exercise the shipped static page through real browser input, without a server."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright


URL = (Path(__file__).parent / "index.html").as_uri()


async def command(page, text):
    await page.locator("#commandInput").fill(text)
    await page.locator("#commandInput").press("Enter")


async def run():
    readme = (Path(__file__).parent / "README.md").read_text(encoding="utf-8")
    solution = (Path(__file__).parent / "SOLUTION.md").read_text(encoding="utf-8")
    assert "See `SOLUTION.md`" in readme and "Boo, Salem, Ash, Luna, Merlin" not in readme
    assert "Boo, Salem, Ash, Luna, Merlin" in solution
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
            boundary_page = await browser.new_page(viewport={"width": 390, "height": 844})
            boundary_page.on("pageerror", lambda error: errors.append(str(error)))
            await boundary_page.goto(URL)
            await boundary_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'meeting', inventory:['badge'], taken:['badge'], dropped:{}, flags:{}, visited:['meeting'], dead:false, won:false}))")
            await boundary_page.reload()
            await command(boundary_page, "look inside fridge")
            assert "VISITOR: SCOTT" not in (await boundary_page.locator("#output").inner_text())
            await boundary_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'hr_reliquary', inventory:[], taken:[], dropped:{}, flags:{}, visited:['meeting','procurement','hr_reliquary'], dead:false, won:false}))")
            await boundary_page.reload()
            await command(boundary_page, "attack application")
            assert len(await boundary_page.evaluate("(JSON.parse(localStorage.getItem('dork_meta_v1') || '{}').deaths || [])")) == 0
            await boundary_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'records_lobby', inventory:[], taken:[], dropped:{}, flags:{}, visited:['meeting','executive_corridor','records_lobby'], dead:false, won:false}))")
            await boundary_page.reload()
            await command(boundary_page, "hit manual")
            assert len(await boundary_page.evaluate("(JSON.parse(localStorage.getItem('dork_meta_v1') || '{}').deaths || [])")) == 0
            await boundary_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'legal_annex', inventory:[], taken:[], dropped:{}, flags:{}, visited:['meeting','executive_corridor','records_lobby','records_stacks','legal_annex'], dead:false, won:false}))")
            await boundary_page.reload()
            await command(boundary_page, "examine inbox")
            assert "locked acrylic box" not in (await boundary_page.locator("#output p").last.inner_text())
            await boundary_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'occult_compliance', inventory:['napkin'], taken:['napkin'], dropped:{}, flags:{}, visited:['meeting','executive_corridor','break_room','records_lobby','records_stacks','legal_annex','procurement','hr_reliquary','occult_compliance'], dead:false, won:false}))")
            await boundary_page.reload()
            await command(boundary_page, "examine drawing")
            assert "five cat-shaped marks" in (await boundary_page.locator("#output").inner_text()), await boundary_page.locator("#output").inner_text()

            fix_page = await browser.new_page()
            fix_page.on("pageerror", lambda error: errors.append(str(error)))
            await fix_page.goto(URL)
            await command(fix_page, "reset machine")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "meeting"
            await command(fix_page, "restart")
            assert "Type RESTART again" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "look")
            await command(fix_page, "restart")
            assert "Type RESTART again" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "restart")
            assert "NEW RUN" in await fix_page.locator("#output").inner_text()
            await command(fix_page, "<span class=x>hi</span>")
            assert await fix_page.locator("#output span.x").count() == 0
            assert "<span class=x>hi</span>" in await fix_page.locator("#output").inner_text()
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'legal_annex', inventory:[], taken:[], dropped:{}, flags:{}, visited:['legal_annex'], dead:false, won:false}))")
            await fix_page.reload()
            for phrase in ("refuse to sign contract", "don't sign contract", "smell contract signature", "tear up contract instead of signing"):
                await command(fix_page, phrase)
                assert len(await fix_page.evaluate("(JSON.parse(localStorage.getItem('dork_meta_v1') || '{}').deaths || [])")) == 0, phrase
            await command(fix_page, "sign contract")
            assert len(await fix_page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")) == 1
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'parking_exit', inventory:[], taken:[], dropped:{}, flags:{}, visited:['parking_exit'], dead:false, won:true}))")
            await fix_page.reload()
            await command(fix_page, "east")
            assert "already left" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "look")
            assert "PARKING" in await fix_page.locator("#output").inner_text()
            await command(fix_page, "restart")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "meeting"

            await command(fix_page, "leave meeting")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "executive_corridor"
            await command(fix_page, "go back")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "meeting"
            await command(fix_page, "get out")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "executive_corridor"
            await command(fix_page, "take elevator")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "elevator"
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'procurement', previousRoom:'legal_annex', inventory:['black_candle'], taken:['black_candle'], dropped:{}, flags:{}, visited:['procurement'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "light candle")
            assert (await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("candleLit")
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'archives', previousRoom:'occult_compliance', inventory:['black_candle'], taken:['black_candle'], dropped:{}, flags:{candleLit:true}, visited:['archives'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "go down")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "subbasement"
            await command(fix_page, "go up")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "archives"
            await command(fix_page, "drop candle")
            await command(fix_page, "descend")
            assert len(await fix_page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")) == 2
            assert await fix_page.evaluate("localStorage.getItem('dork_run_v1')") is None

            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'meeting', inventory:[], taken:[], dropped:{}, flags:{}, visited:['meeting'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "look around")
            assert "Exits: east" in await fix_page.locator("#output").inner_text()
            await command(fix_page, "look at exit sign")
            assert "points east" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "drink water")
            assert "skin on the water" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "go through east door")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "executive_corridor"
            await command(fix_page, "north")
            for phrase, expected in (("look in fridge", "warnings"), ("open fridge", "You open the refrigerator"),
                                     ("press vending machine button", "OUT OF STOCK")):
                await command(fix_page, phrase)
                assert expected in await fix_page.locator("#output p").last.inner_text(), phrase
            await command(fix_page, "south")
            await command(fix_page, "south")
            await command(fix_page, "go through gate")
            assert "Jorge occupies" in await fix_page.locator("#output p").last.inner_text()
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "records_lobby"
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'legal_annex', inventory:[], taken:[], dropped:{}, flags:{}, visited:['legal_annex'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "refuse contract")
            assert "Waiver Stamp 4C" in await fix_page.locator("#output p").last.inner_text()
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'meeting', inventory:[], taken:[], dropped:{}, flags:{}, visited:['meeting'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "take all items")
            assert {"badge", "agenda"}.issubset(set(await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")))
            await command(fix_page, "check inventory")
            assert "visitor badge" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "drop everything")
            assert not await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            await command(fix_page, "?")
            assert "DORK understands" in await fix_page.locator("#output p").last.inner_text()
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'hr_reliquary', inventory:[], taken:[], dropped:{}, flags:{}, visited:['hr_reliquary'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "take the fool")
            assert "Do not pocket it" in await fix_page.locator("#output p").last.inner_text()
            assert len(await fix_page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")) == 2
            await command(fix_page, "examine tarot spread")
            assert "Three cards" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "pick the tower")
            assert (await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("tarotSolved")
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'procurement', inventory:['badge','form66b','waiver_stamp'], taken:['badge','form66b','waiver_stamp'], dropped:{}, flags:{}, visited:['procurement'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "show badge to machine")
            assert "You show" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "insert form into machine")
            await command(fix_page, "insert form into machine")
            assert "already has that" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "insert stamp into machine")
            inventory = await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert "form66b" not in inventory and "waiver_stamp" not in inventory and inventory.count("silver_key") == 1
            # Batch 5: entry information, seal poses, key placement, geography, articles.
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'meeting', inventory:[], taken:[], dropped:{}, flags:{}, visited:['meeting'], dead:false, won:false}))")
            await fix_page.reload()
            assert "Visible: agenda folder, visitor badge, glass of water." in await fix_page.locator("#output").inner_text()
            await command(fix_page, "lick water")
            assert "the glass of water" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "east")
            assert "Exits: west, north, south, east." in await fix_page.locator("#output").inner_text()
            await command(fix_page, "east")
            assert "PENDING PROCUREMENT" not in await fix_page.locator("#output").inner_text()
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'archives', inventory:['black_candle'], taken:['black_candle'], dropped:{}, flags:{candleLit:true}, visited:['archives'], dead:false, won:false}))")
            await fix_page.reload()
            assert "silver continuity key" not in await fix_page.locator("#output").inner_text()
            await command(fix_page, "hint")
            assert "Take anything useful" not in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "east")
            assert "West, the stair leads back up" in await fix_page.locator("#output").inner_text()
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'continuity_chamber', inventory:['silver_key'], taken:['silver_key'], dropped:{}, flags:{keyUsed:true}, visited:['continuity_chamber'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "examine seals")
            seal_text = await fix_page.locator("#output p").last.inner_text()
            assert all(pose in seal_text for pose in ("sitting upright", "curled asleep", "crouched high", "eyes showing", "one paw raised"))
            await command(fix_page, "say merlin luna ash salem boo")
            assert "poses" in await fix_page.locator("#output p").last.inner_text()
            # Batch 6: descriptions follow the run's puzzle flags.
            for room, flags, room_line, item_command, item_line in (
                ("legal_annex", {"stampTaken": True}, "open and empty", "examine box", "open and empty"),
                ("hr_reliquary", {"tarotSolved": True}, "split open into a passage", "examine cards", "Three cards"),
                ("records_lobby", {"jorgeMoved": True}, "chair aside", "look", "chair aside"),
                ("continuity_chamber", {"keyUsed": True}, "key rests in its slot", "look", "key rests in its slot"),
                ("continuity_chamber", {"keyUsed": True, "finalOpen": True}, "door stands open", "look", "door stands open"),
            ):
                await fix_page.evaluate("data => localStorage.setItem('dork_run_v1', JSON.stringify({room:data.room, inventory:[], taken:[], dropped:{}, flags:data.flags, visited:[data.room], dead:false, won:false}))", {"room": room, "flags": flags})
                await fix_page.reload()
                assert room_line in await fix_page.locator("#output").inner_text(), (room, room_line)
                await command(fix_page, item_command)
                assert item_line in await fix_page.locator("#output").inner_text(), (room, item_line)
            # Batch 7: Ash and Jorge are room objects; each cat has its own touch response.
            for room, cat, expected in (
                ("records_stacks", "Ash", "safer altitude"),
                ("hr_reliquary", "Merlin", "clearer direction"),
                ("occult_compliance", "Salem", "performance review"),
                ("archives", "Luna", "better instincts"),
                ("continuity_chamber", "Boo", "tribute"),
            ):
                await fix_page.evaluate("room => localStorage.setItem('dork_run_v1', JSON.stringify({room, inventory:[], taken:[], dropped:{}, flags:{}, visited:[room], dead:false, won:false}))", room)
                await fix_page.reload()
                await command(fix_page, f"hug {cat}")
                assert expected in await fix_page.locator("#output p").last.inner_text(), cat
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'records_stacks', inventory:[], taken:[], dropped:{}, flags:{}, visited:['records_stacks'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "examine ash")
            assert "Shelf 20" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "talk to ash")
            assert "watches from Shelf 20" in await fix_page.locator("#output p").last.inner_text()
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'records_lobby', inventory:[], taken:[], dropped:{}, flags:{}, visited:['records_lobby'], dead:false, won:false}))")
            await fix_page.reload()
            for phrase, expected in (("touch jorge", "sleeve"), ("lick jorge", "femur"), ("smell jorge", "toner"), ("take jorge", "cannot take"), ("flatter jorge", "compliment"), ("threaten jorge", "clipboard"), ("hide behind jorge", "crouch"), ("examine jorge", "seven feet")):
                await command(fix_page, phrase)
                assert expected in await fix_page.locator("#output p").last.inner_text(), phrase
            # Player-style probes for scenery and physical interactions in later rooms.
            for room, phrase, expected in (
                ("executive_corridor", "read directory", "Records lies south"),
                ("executive_corridor", "press elevator button", "out of service"),
                ("records_stacks", "look at shelves", "Shelf 20"),
                ("records_stacks", "open file", "CANDIDATE"),
                ("legal_annex", "read sign", "Waiver Stamp 4C"),
                ("procurement", "look at slots", "FORM slot"),
                ("hr_reliquary", "look at east wall", "Merlin"),
                ("occult_compliance", "look at inbox", "Salem"),
                ("archives", "look at stair", "lit candle"),
                ("archives", "open ledger", "Invited by authority"),
                ("subbasement", "look at roots", "parking passage"),
                ("subbasement", "look at lights", "black candle"),
                ("continuity_chamber", "look at door", "silver key slot"),
                ("continuity_chamber", "touch seals", "silver key slot"),
                ("continuity_chamber", "open door", "silver key slot"),
            ):
                await fix_page.evaluate("room => localStorage.setItem('dork_run_v1', JSON.stringify({room, inventory:[], taken:[], dropped:{}, flags:{}, visited:[room], dead:false, won:false}))", room)
                await fix_page.reload()
                await command(fix_page, phrase)
                replies = await fix_page.locator("#output p").all_inner_texts()
                assert expected in " ".join(replies[-2:]), (room, phrase, replies[-2:])
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'executive_corridor', inventory:[], taken:[], dropped:{}, flags:{}, visited:['executive_corridor'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "open elevator")
            assert "out of service" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "go to records")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "records_lobby"
            # Additional observed player phrasings, checked in their actual rooms.
            for room, phrase, expected in (
                ("meeting", "look under table", "no hidden exit"),
                ("meeting", "open agenda", "Establish continuity"),
                ("break_room", "read warning", "reserves"),
                ("break_room", "use coffee machine", "creamer"),
                ("records_lobby", "read placard", "SPECIALIST III"),
                ("records_stacks", "read shelf 20", "ASH HIDES"),
                ("legal_annex", "stamp contract", "Procurement"),
            ):
                await fix_page.evaluate("room => localStorage.setItem('dork_run_v1', JSON.stringify({room, inventory:[], taken:[], dropped:{}, flags:{}, visited:[room], dead:false, won:false}))", room)
                await fix_page.reload()
                await command(fix_page, phrase)
                assert expected in await fix_page.locator("#output p").last.inner_text(), (room, phrase)
            await fix_page.evaluate("localStorage.setItem('dork_run_v1', JSON.stringify({room:'archives', inventory:['black_candle'], taken:['black_candle'], dropped:{}, flags:{candleLit:true}, visited:['archives'], dead:false, won:false}))")
            await fix_page.reload()
            await command(fix_page, "go down stairs")
            assert await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "subbasement"
            assert not errors, errors
            print("Dork browser path, autosave, restart, death persistence, parser and narrow viewport: OK")
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(run())
