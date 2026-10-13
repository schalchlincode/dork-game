"""Expanded edition acceptance tests: real browser input, state, files, and layout.

CI executes Chromium and WebKit. DORK_BROWSER_EXECUTABLE selects a local Chromium.
DORK_TEST_URL can exercise an HTTP deployment; otherwise the shipped file is opened.
"""
import asyncio
import itertools
import json
import os
import traceback
from pathlib import Path
from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('DORK_TEST_URL', (ROOT / 'index.html').as_uri())
RESULTS = ROOT / 'test-results'
RESULTS.mkdir(exist_ok=True)

CORE_ROUTE = [
    'take badge', 'east', 'north', 'take creamer', 'south', 'south',
    'give creamer to jorge', 'south', 'take form', 'east', 'take waiver form',
    'open box', 'stamp waiver', 'south', 'insert form into form slot',
    'insert waiver into waiver slot', 'light candle', 'east', 'choose tower',
    'east', 'south', 'east', 'east', 'use key on key slot',
    'say boo salem ash luna merlin', 'east', 'return all', 'east'
]
EXPANDED_ROUTE = [
    'take badge', 'read agenda', 'east', 'north', 'take creamer', 'take napkin',
    'read napkin', 'south', 'south', 'give creamer to jorge', 'south', 'read file',
    'read note', 'wait', 'hide', 'take form', 'south', 'read ticket',
    'close ticket as duplicate', 'south', 'read console', 'read maintenance order',
    'north', 'east', 'read instructions', 'take fuse', 'pull lever', 'south',
    'insert fuse into socket', 'set dial to retain', 'reset relay',
    'set dial to return', 'reset relay', 'east', 'north', 'west', 'south',
    'south', 'east', 'read contract', 'take waiver', 'open box', 'stamp waiver',
    'south', 'insert form into form slot', 'insert waiver into waiver slot',
    'light candle', 'east', 'pet merlin', 'choose tower', 'east', 'read drawings',
    'read manual', 'pet salem', 'south', 'read ledger', 'pet luna',
    'west', 'west', 'north', 'west', 'west', 'read dossier', 'read index',
    'compare evidence', 'south', 'take revocation', 'north', 'east', 'south',
    'dispute lease', 'north', 'east', 'south', 'east', 'east', 'read engine',
    'insert revocation notice into revocation slot', 'west', 'south',
    'east', 'east', 'pet boo', 'use key on slot', 'say boo salem ash luna merlin',
    'east', 'return all', 'east'
]

async def command(page, text):
    await page.locator('#commandInput').fill(text)
    await page.locator('#commandInput').press('Enter')
    reply = await page.locator('#output p').last.inner_text()
    assert 'internal error' not in reply.lower(), (text, reply)
    return reply

async def run_state(page):
    return await page.evaluate("JSON.parse(localStorage.getItem('dork_run_v1'))")

async def meta_state(page):
    return await page.evaluate("JSON.parse(localStorage.getItem('dork_meta_v1'))")

async def seed(page, room, inventory=None, flags=None, **extras):
    payload = dict(room=room, previousRoom=None, inventory=inventory or [],
                   taken=list(inventory or []), dropped={}, flags=flags or {},
                   visited=[room], observed=[], dead=False, won=False, **extras)
    await page.evaluate("v=>localStorage.setItem('dork_run_v1',JSON.stringify(v))", payload)
    await page.reload()

async def close_panel(page):
    if await page.locator('#toolDialog').evaluate('(d)=>d.open'):
        await page.locator('[data-close]').click()

async def browser_suite(browser, browser_name):
    cases = []
    errors = []
    async def page():
        p = await browser.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True)
        p.set_default_timeout(6000)
        p.on('pageerror', lambda e: errors.append(str(e)))
        # Internal controller errors are caught to protect state; tests must still fail on them.
        p.on('console', lambda m: errors.append(m.text) if m.type=='error' and 'DORK action failed' in m.text else None)
        await p.goto(URL)
        return p
    async def check(name, fn):
        print(f'{browser_name}: {name}', flush=True)
        try:
            await fn()
            cases.append({'case':name,'status':'passed'})
        except Exception:
            cases.append({'case':name,'status':'failed','trace':traceback.format_exc()})
            (RESULTS / f'{browser_name}-results.json').write_text(json.dumps(cases,indent=2))
            raise

    async def original_route():
        p=await page()
        for c in CORE_ROUTE: await command(p,c)
        s=await run_state(p)
        assert s['won'] and s['room']=='parking_exit', s
        assert not (await meta_state(p))['deaths']
        await p.reload()
        assert (await run_state(p))['won']
        await p.screenshot(path=str(RESULTS / f'{browser_name}-core-ending.png'))
        await p.close()
    await check('Original route reaches the true ending without optional departments', original_route)

    async def all_content():
        p=await page()
        for c in EXPANDED_ROUTE:
            reply=await command(p,c)
            assert 'TERMINATED' not in reply, (c,reply)
        s=await run_state(p)
        for key in ['ticketResolved','liftRestored','evidenceCompared','identityDisputed','identityReleased','ashScene','merlinScene','salemScene','lunaScene','booScene']:
            assert s['flags'].get(key), (key,s)
        assert s['won'] and len(s['visited'])==23, s
        text=await p.locator('#output').inner_text()
        assert 'It can no longer confuse remembering him with owning him' in text
        assert 'one route through the building will be shorter' in text
        assert 'The file you read in Records' in text
        assert not (await meta_state(p))['deaths']
        await p.reload()
        assert (await run_state(p))['flags']['identityReleased']
        await p.locator('[data-panel="casebook"]').click()
        assert 'unsupported identity claim revoked' in (await p.locator('.tool-body').inner_text()).lower()
        await p.screenshot(path=str(RESULTS / f'{browser_name}-casebook.png'))
        await close_panel(p)
        await p.locator('[data-panel="map"]').click()
        assert await p.locator('.map-room').count()==23
        await p.screenshot(path=str(RESULTS / f'{browser_name}-map.png'))
        await p.close()
    await check('Complete 23-room investigation, every department puzzle, scenes, and ending payoffs', all_content)

    async def names_and_aliases():
        p=await page()
        for inventory in itertools.permutations(['form66b','waiver_form','waiver_stamp']):
            for name,wanted in [('waiver form','waiver_form'),('waiver stamp','waiver_stamp'),('form 66-b','form66b')]:
                await seed(p,'procurement',list(inventory))
                await command(p,f'drop {name}')
                s=await run_state(p)
                assert wanted not in s['inventory'] and set(s['inventory'])==set(inventory)-{wanted}, (name,s)
        aliases=await p.evaluate("Object.entries(DorkParser.verbMap).filter(([k,v])=>v==='take').map(([k])=>k)")
        for card in ['fool','sun','tower']:
            for alias in aliases:
                await seed(p,'hr_reliquary')
                deaths=len((await meta_state(p))['deaths'])
                reply=await command(p,f'{alias} {card}')
                assert 'Do not pocket it' in reply,(alias,card,reply)
                assert len((await meta_state(p))['deaths'])==deaths
                assert not (await run_state(p))['flags'].get('tarotSolved')
        await seed(p,'hr_reliquary')
        await command(p,'choose tower');assert (await run_state(p))['flags']['tarotSolved']
        await seed(p,'hr_reliquary')
        await command(p,'choose sun');assert await run_state(p) is None
        await p.close()
    await check('Inventory permutations and all taking aliases have consistent consequences', names_and_aliases)

    async def ambiguity_and_targets():
        p=await page()
        await seed(p,'archives',['compliance_manual'])
        before=await run_state(p)
        assert 'Which object?' in await command(p,'read book')
        assert await run_state(p)==before
        reply=await command(p,'continuity ledger')
        assert 'ARCHIVE UPDATED' in reply or 'ledger' in reply.lower()
        assert 'ledger' in (await run_state(p))['observed']
        await command(p,'read book');await command(p,'cancel')
        before=await run_state(p)
        assert 'Canceled' in await p.locator('#output p').last.inner_text()
        await seed(p,'archives',['black_candle'])
        before=await run_state(p)
        await command(p,'use candle on luna')
        assert await run_state(p)==before
        await command(p,'burn candle with ledger')
        assert await run_state(p)==before
        await seed(p,'relay_chamber',['replacement_fuse'],{'relayIsolated':True})
        before=await run_state(p)
        await command(p,'insert fuse into dial')
        assert await run_state(p)==before
        await p.close()
    await check('Ambiguity asks before acting; explicit wrong targets cannot mutate state', ambiguity_and_targets)

    async def clues_and_hint_levels():
        p=await page()
        await p.locator('[data-panel="casebook"]').click()
        text=await p.locator('.tool-body').inner_text()
        assert 'TICKET SCOTT' not in text and 'Merlin —' not in text and 'BOO, SALEM' not in text
        await close_panel(p)
        await p.locator('[data-panel="map"]').click()
        text=await p.locator('.tool-body').inner_text()
        assert 'Executive Corridor' not in text and 'Unexplored' in text
        assert await p.locator('.map-room').count()==1
        await close_panel(p)
        await seed(p,'hr_reliquary')
        a=await command(p,'hint');b=await command(p,'hint');c=await command(p,'hint')
        assert 'HINT 1/3' in a and 'HINT 2/3' in b and 'HINT 3/3' in c
        assert 'CHOOSE THE TOWER' not in a and 'CHOOSE THE TOWER' in c
        await command(p,'choose tower')
        d=await command(p,'hint');assert 'HINT 1/3' in d and 'wall has changed' in d
        await seed(p,'elevator');assert 'undefined' not in await command(p,'hint')
        # Inspecting a clue persists knowledge, not inventory or puzzle flags.
        await seed(p,'records_stacks')
        await command(p,'read file');await command(p,'attack ash');await command(p,'restart')
        s=await run_state(p)
        assert not s['inventory'] and not s['flags']
        assert 'records_file' in (await meta_state(p))['observations']
        await p.locator('[data-panel="casebook"]').click()
        await p.get_by_text('OBSERVED FACTS & EXCERPTS',exact=True).click()
        assert 'prior-run memory' in await p.locator('.tool-body').inner_text()
        await p.close()
    await check('No unobserved casebook/map spoilers; three-stage hints reset with puzzle progress', clues_and_hint_levels)

    async def reclaim_and_hazards():
        p=await page()
        await seed(p,'asset_control',['black_candle','badge'],{'finalOpen':True,'keyUsed':True,'candleLit':True})
        await command(p,'return all');await command(p,'west');reply=await command(p,'west')
        assert 'RECLAIM CANDLE' in reply and (await run_state(p))['room']=='continuity_chamber'
        await command(p,'east');await command(p,'reclaim candle')
        assert (await run_state(p))['inventory']==['black_candle']
        await command(p,'west');await command(p,'west')
        assert (await run_state(p))['room']=='subbasement'
        assert not (await meta_state(p))['deaths']
        await seed(p,'relay_chamber',['replacement_fuse'])
        await command(p,'insert fuse into socket');assert await run_state(p) is None
        m=await meta_state(p);assert m['reports'][-1]['code']=='electrical' and m['reports'][-1]['warningSeen']
        await command(p,'restart')
        assert 'unsuitable conductors' in await p.locator('#output').inner_text()
        assert not (await run_state(p))['inventory']
        await seed(p,'below',flags={'liftRestored':True,'identityDisputed':True})
        await command(p,'sit in chair');assert await run_state(p) is None
        await p.close()
    await check('Returned candle is recoverable; new lethal actions have reports and clean restarts', reclaim_and_hazards)

    async def converse_and_guardrails():
        p=await page()
        await seed(p,'records_lobby')
        replies=[await command(p,t) for t in ['ask jorge about the exit','ask jorge about the file','ask jorge about the agency','ask jorge about facilities']]
        assert len(set(replies))==4
        await seed(p,'it_helpdesk')
        before=await run_state(p)
        await command(p,'close ticket as duplicate')
        assert not (await run_state(p))['flags'].get('ticketResolved')
        await command(p,'south');assert (await run_state(p))['room']=='it_helpdesk'
        await seed(p,'investigations')
        await command(p,'compare evidence');assert not (await run_state(p))['flags'].get('evidenceCompared')
        await seed(p,'server_room',['revocation_notice'])
        await command(p,'dispute lease');assert not (await run_state(p))['flags'].get('identityDisputed')
        await seed(p,'service_lift',flags={'liftRestored':True})
        await command(p,'east');assert (await run_state(p))['room']=='service_lift'
        await p.close()
    await check('Topic-aware dialogue and all optional progression gates enforce prerequisites', converse_and_guardrails)

    async def ui_tools_and_files():
        p=await page()
        await command(p,'take badge')
        await p.locator('#commandInput').fill('draft command')
        await p.locator('#commandInput').press('ArrowUp')
        assert await p.locator('#commandInput').input_value()=='take badge'
        await p.locator('#commandInput').press('ArrowDown')
        assert await p.locator('#commandInput').input_value()=='draft command'
        await p.locator('#commandInput').fill('')
        before=await run_state(p)
        await p.locator('[data-panel="inventory"]').click()
        await p.get_by_role('button',name='visitor badge',exact=True).click()
        assert await p.locator('#commandInput').input_value()=='visitor badge'
        assert await run_state(p)==before
        await p.locator('[data-panel="settings"]').click()
        await p.locator('#setting-readable').check();await p.locator('#setting-largeText').check();await p.locator('#setting-reducedMotion').check()
        assert await p.locator('body').evaluate("e=>e.classList.contains('readable') && e.classList.contains('reduce-motion')")
        async with p.expect_download() as event: await p.get_by_role('button',name='EXPORT SAVE',exact=True).click()
        download=await event.value
        path=RESULTS/f'{browser_name}-save.json';await download.save_as(str(path))
        data=json.loads(path.read_text());assert data['gameVersion']=='2.0.0' and 'badge' in data['run']['inventory']
        async with p.expect_download() as event: await p.get_by_role('button',name='EXPORT TRANSCRIPT',exact=True).click()
        transcript=await event.value
        text_path=RESULTS/f'{browser_name}-transcript.txt';await transcript.save_as(str(text_path))
        assert 'DORK 2.0.0' in text_path.read_text() and '> take badge' in text_path.read_text()
        await close_panel(p);await command(p,'drop badge')
        await p.locator('[data-panel="settings"]').click()
        await p.locator('#importSave').set_input_files(str(path))
        assert 'badge' not in (await run_state(p))['inventory']
        await p.get_by_role('button',name='CANCEL',exact=True).click()
        await expect(p.locator('.import-feedback')).to_contain_text('Import canceled')
        assert 'badge' not in (await run_state(p))['inventory']
        await p.locator('#importSave').set_input_files(str(path))
        await p.get_by_role('button',name='CONFIRM REPLACE',exact=True).click()
        assert 'badge' in (await run_state(p))['inventory']
        await p.locator('[data-panel="settings"]').click()
        bad=RESULTS/'invalid-save.json';bad.write_text('{"format":"dork-backup","schemaVersion":99,"run":{},"meta":{}}')
        previous=await run_state(p)
        await p.locator('#importSave').set_input_files(str(bad))
        await expect(p.locator('.import-feedback')).to_contain_text('Import rejected')
        assert await run_state(p)==previous
        # A slow, earlier selection must never replace feedback for the latest file.
        await p.evaluate("""() => {
            window.originalFileText=File.prototype.text;
            File.prototype.text=function() {
                if(this.name==='slow.json') return new Promise(resolve=>{window.releaseOldImport=resolve;});
                return window.originalFileText.call(this);
            };
        }""")
        await p.locator('#importSave').set_input_files({'name':'slow.json','mimeType':'application/json','buffer':path.read_bytes()})
        await p.wait_for_function("typeof window.releaseOldImport==='function'")
        await p.locator('#importSave').set_input_files({'name':'latest-invalid.json','mimeType':'application/json','buffer':b'not json'})
        await expect(p.locator('.import-feedback')).to_contain_text('Import rejected')
        await p.evaluate("text=>{window.releaseOldImport(text);File.prototype.text=window.originalFileText;}",path.read_text())
        await p.evaluate("()=>new Promise(resolve=>setTimeout(resolve,0))")
        await expect(p.locator('.import-feedback')).to_contain_text('Import rejected')
        assert await p.get_by_role('button',name='CONFIRM REPLACE',exact=True).count()==0
        assert await run_state(p)==previous
        await close_panel(p);await p.reload()
        assert await p.locator('body').evaluate("e=>e.classList.contains('readable')")
        await p.close()
    await check('History, safe object insertion, readable display, real exports, and confirmed imports', ui_tools_and_files)

    async def persistence_failures():
        p=await page()
        await p.evaluate("localStorage.setItem('dork_run_v1', '{broken');localStorage.setItem('dork_meta_v1', JSON.stringify({deaths:{},lore:42,runs:'bad'}))")
        await p.reload()
        await command(p,'take badge')
        assert 'badge' in (await run_state(p))['inventory']
        await p.close()
        context=await browser.new_context(viewport={'width':390,'height':844})
        await context.add_init_script("Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Denied','SecurityError')}})")
        p=await context.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
        await p.goto(URL)
        assert await p.locator('#storageNotice').is_visible()
        assert 'Taken: visitor badge' in await command(p,'take badge')
        assert 'Saving is unavailable' in await command(p,'save')
        await p.locator('[data-panel="settings"]').click()
        async with p.expect_download() as event: await p.get_by_role('button',name='EXPORT SAVE',exact=True).click()
        download=await event.value;path=RESULTS/f'{browser_name}-no-storage.json';await download.save_as(str(path))
        assert 'badge' in json.loads(path.read_text())['run']['inventory']
        await context.close()
    await check('Corrupt or denied storage does not crash gameplay or falsely report a save', persistence_failures)

    async def version_and_observation_integrity():
        p=await page()
        await seed(p,'legal_annex',['badge','waiver_form','waiver_stamp'],{'stampTaken':True})
        await command(p,'drop waiver stamp');await command(p,'take waiver stamp')
        assert 'waiver_stamp' in (await run_state(p))['inventory']
        await command(p,'stamp badge with waiver stamp')
        assert not (await run_state(p))['flags'].get('waiverStamped')
        await command(p,'read waiver form')
        assert 'blank' in (await run_state(p))['evidence']['waiver_form']
        await command(p,'stamp waiver form');await command(p,'read waiver form')
        assert 'DECLINED WITH PREJUDICE' in (await run_state(p))['evidence']['waiver_form']
        await p.locator('[data-panel="casebook"]').click()
        await p.get_by_text('OBSERVED FACTS & EXCERPTS',exact=True).click()
        assert 'DECLINED WITH PREJUDICE' in await p.locator('.tool-body').inner_text()
        await close_panel(p)
        await seed(p,'hr_reliquary')
        await command(p,'choose tower')
        assert 'east' in (await run_state(p))['knownExits']['hr_reliquary']
        await command(p,'choose sun')
        assert await run_state(p) is not None
        future={'schemaVersion':99,'gameVersion':'future','room':'not_built_yet','inventory':['unreleased_item']}
        future_meta={'schemaVersion':99,'runs':18,'future_knowledge':'preserve me'}
        await p.evaluate("v=>{localStorage.setItem('dork_run_v1',JSON.stringify(v[0]));localStorage.setItem('dork_meta_v1',JSON.stringify(v[1]));}",[future,future_meta])
        await p.reload()
        await command(p,'take badge');await command(p,'restart');await command(p,'restart')
        assert await run_state(p)==future and await meta_state(p)==future_meta
        await p.locator('[data-panel="settings"]').click()
        async with p.expect_download() as event:
            await p.get_by_role('button',name='EXPORT PRESERVED ORIGINAL',exact=True).click()
        download=await event.value;path=RESULTS/f'{browser_name}-preserved-future.json';await download.save_as(str(path))
        preserved=json.loads(path.read_text())
        assert preserved['run']==future and preserved['meta']==future_meta and preserved['schemaVersion']==99
        await p.close()
    await check('Observed excerpts update; dropped tools remain recoverable; future saves are never overwritten', version_and_observation_integrity)

    async def viewport_and_accessibility():
        p=await page()
        for width,height in [(320,568),(390,844),(430,932),(844,390),(1280,800),(390,420)]:
            await p.set_viewport_size({'width':width,'height':height})
            await p.wait_for_timeout(80)
            bounds=await p.locator('#commandInput').bounding_box()
            assert bounds and bounds['y']>=0 and bounds['y']+bounds['height']<=height+1,(width,height,bounds)
            out=await p.locator('#output').bounding_box()
            assert out and out['height']>24,(width,height,out)
            assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,height)
            await p.locator('[data-panel="casebook"]').click()
            dialog=await p.locator('#toolDialog').bounding_box()
            assert dialog and dialog['y']>=0 and dialog['y']+dialog['height']<=height+1,(width,height,dialog)
            await p.keyboard.press('Escape')
            assert not await p.locator('#toolDialog').evaluate('(d)=>d.open')
        await p.set_viewport_size({'width':390,'height':844})
        await p.locator('[data-panel="settings"]').click()
        await p.locator('#setting-readable').check()
        await close_panel(p)
        caret=await p.locator('#commandInput').evaluate('e=>getComputedStyle(e).caretColor')
        assert caret not in ['transparent','rgba(0, 0, 0, 0)']
        await p.screenshot(path=str(RESULTS/f'{browser_name}-readable-mobile.png'))
        # Output taps must not steal focus back to the input while reading.
        await p.locator('#output').focus()
        assert await p.evaluate("document.activeElement.id==='output'")
        await p.close()
    await check('Narrow portrait, landscape, keyboard-sized viewport, focus, and display accessibility', viewport_and_accessibility)
    assert not errors, errors
    (RESULTS/f'{browser_name}-results.json').write_text(json.dumps(cases,indent=2))
    return cases

async def run():
    all_results={}
    async with async_playwright() as playwright:
        local=os.environ.get('DORK_BROWSER_EXECUTABLE')
        targets=['chromium'] if local else ['chromium','webkit']
        for target in targets:
            launch={'headless':True}
            if local: launch.update(executable_path=local,args=['--no-sandbox'])
            browser=await getattr(playwright,target).launch(**launch)
            try: all_results[target]=await browser_suite(browser,target)
            finally: await browser.close()
    (RESULTS/'summary.json').write_text(json.dumps(all_results,indent=2))
    print('Expanded edition acceptance suite: ALL PASSED',flush=True)

if __name__=='__main__':asyncio.run(run())
