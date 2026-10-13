"""Apply the scoped, user-approved discovery/HELP revision. Fail on source drift."""
from pathlib import Path
import hashlib
import json


def replace_once(name, old, new):
    path = Path(name)
    text = path.read_text(encoding='utf-8')
    if text.count(old) != 1:
        raise ValueError(f'{name}: expected exactly one replacement target')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')


def between(name, start, end, new):
    path = Path(name)
    text = path.read_text(encoding='utf-8')
    if text.count(start) != 1 or text.count(end) != 1:
        raise ValueError(f'{name}: missing/ambiguous section boundary')
    a, b = text.index(start), text.index(end)
    if b <= a:
        raise ValueError(f'{name}: reversed section boundary')
    path.write_text(text[:a] + new + text[b:], encoding='utf-8')


for name, expected in {
    'game.js': '0b1daf052f251de61fc1d9223e05d141efaadb60',
    'interface.js': 'b64e947a87a8ae55dbef91c8a05426135771a0ed',
    'index.html': '084a7e683179b808ee7c8544982e637761071260',
}.items():
    data = Path(name).read_bytes()
    actual = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
    if actual != expected:
        raise ValueError(f'{name}: source changed; review before applying')

replace_once('index.html', '        <button type="button" data-panel="inventory">PACK</button>\n', '')
between('interface.js', '    function inventoryPanel() {\n', '    function casePanel() {\n', '')
replace_once('interface.js', "{inventory:'INVENTORY & SURROUNDINGS',casebook:", "{casebook:")
replace_once('interface.js', '{inventory:inventoryPanel,casebook:', '{casebook:')
replace_once('interface.js', 'Tab completes a visible or carried object name.', 'Tab completes only carried object names; it does not reveal your surroundings.')
replace_once('interface.js', '[...new Set([...api.visible(),...api.state().inventory])]', '[...new Set(api.state().inventory)]')
replace_once('game.js', 'store,visible:visibleItems,casebook:', 'store,casebook:')
replace_once('style.css', '.utility-controls { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; }', '.utility-controls { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }')
for line in [
    '.inventory-item { display:flex; gap:8px; margin:8px 0; align-items:stretch; }\n',
    '.inventory-item .item-name { flex:1; text-align:left; overflow-wrap:anywhere; }\n',
    '.inventory-item button:last-child { font-size:11px; }\n',
]:
    replace_once('style.css', line, '')

help_text = '''DORK understands commands such as VERB OBJECT or VERB OBJECT ON/TO TARGET.
The examples below use imaginary objects and people. They are not clues.

LOOK / EXAMINE POSTER / TAKE PENCIL / DROP PENCIL
N, S, E, W or NORTH, SOUTH, EAST, WEST
USE SCREWDRIVER ON PANEL / GIVE PARCEL TO RECEPTIONIST
TALK TO RECEPTIONIST / ASK RECEPTIONIST ABOUT HOURS
OPEN SUITCASE / READ POSTCARD / MAKE A JOKE / INVENTORY / LEAVE ROOM
LICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.

INVENTORY (or INV / I) lists only what you are carrying.
HELP explains commands. HINT offers optional, increasingly explicit puzzle assistance.
Other commands: DEATHS, LORE, CASEBOOK, MAP, SAVE, RESTART.
TOOLS contains display settings, command history, save import/export, and transcript export.

Try unreasonable things. The game has opinions.'''
between('game.js', '  function help() {\n', '  function showDeaths()', '  function help() {\n    print(' + json.dumps(help_text, ensure_ascii=False) + ');\n  }\n\n')

# Preserve the existing tools/import tests; replace only the deleted PACK assertion.
replace_once('tests/expanded_test.py', '''        await p.locator('[data-panel="inventory"]').click()
        await p.get_by_role('button',name='visitor badge',exact=True).click()
        assert await p.locator('#commandInput').input_value()=='visitor badge'
''', '''        await p.locator('#commandInput').fill('use vis')
        await p.locator('#commandInput').press('Tab')
        assert await p.locator('#commandInput').input_value()=='use visitor badge'
''')

new_test = '''    async def discovery_and_help():
        p=await page()
        assert await p.locator('[data-panel="inventory"]').count()==0
        assert await p.get_by_role('button',name='PACK',exact=True).count()==0
        assert await p.locator('[data-panel]').count()==3
        await command(p,'look')
        before=await run_state(p)
        for text in ['take vis','examine wall','examine age']:
            await p.locator('#commandInput').fill(text)
            await p.locator('#commandInput').press('Tab')
            assert await p.locator('#commandInput').input_value()==text
        assert await run_state(p)==before
        await command(p,'pack')
        assert not await p.locator('#toolDialog').evaluate('(d)=>d.open')
        assert await run_state(p)==before
        await command(p,'take badge')
        before=await run_state(p)
        for alias in ['inventory','inv','i']:
            reply=await command(p,alias)
            assert 'visitor badge' in reply and 'agenda folder' not in reply and 'wall clock' not in reply
            assert 'VISIBLE HERE' not in reply
            assert not await p.locator('#toolDialog').evaluate('(d)=>d.open')
        assert await run_state(p)==before
        await p.locator('#commandInput').fill('use vis')
        await p.locator('#commandInput').press('Tab')
        assert await p.locator('#commandInput').input_value()=='use visitor badge'
        assert await run_state(p)==before
        await command(p,'drop badge')
        await p.locator('#commandInput').fill('take vis')
        await p.locator('#commandInput').press('Tab')
        assert await p.locator('#commandInput').input_value()=='take vis'
        forbidden=['TAROT','TOWER','THE FOOL','THE SUN','JORGE','MERLIN','WAIVER','CANDLE',
                   'KEY SLOT','SEALS','RETURN ALL','PROPERTY-RETURN','REVOCATION','RELAY',
                   'DUPLICATE','PACK','CERTIFICATION']
        for room in ['meeting','hr_reliquary','asset_control']:
            await seed(p,room)
            await command(p,'look')
            before=await run_state(p)
            for alias in ['help','commands','verbs','?','instructions','show commands','ask for help']:
                reply=await command(p,alias)
                for spoiler in forbidden: assert spoiler not in reply.upper(), (alias,spoiler,reply)
                assert 'PENCIL' in reply and 'RECEPTIONIST' in reply and 'imaginary' in reply
                assert await run_state(p)==before
            await p.locator('[data-command="help"]').click()
            reply=await p.locator('#output p').last.inner_text()
            for spoiler in forbidden: assert spoiler not in reply.upper(), (spoiler,reply)
            assert await run_state(p)==before
        await seed(p,'meeting')
        await p.locator('[data-command="help"]').click()
        await p.screenshot(path=str(RESULTS/f'{browser_name}-spoiler-free-help.png'))
        await p.close()
    await check('No PACK or surroundings completion; inventory-only recall and spoiler-free HELP aliases', discovery_and_help)

'''
replace_once('tests/expanded_test.py', '    async def ui_tools_and_files():\n', new_test + '    async def ui_tools_and_files():\n')
replace_once('README.md', 'Equivalent taking verbs do not secretly choose a fatal tarot card; selection is a separate action.', 'HELP teaches syntax with imaginary examples, not actual puzzles or their special commands.')
replace_once('README.md', 'PACK lists carried and visible objects. Its buttons only insert names or prepare EXAMINE commands; they do not execute actions.', 'INVENTORY (INV / I) lists only carried items in the transcript. There is no PACK panel or clickable surroundings catalog; discover interactions by reading and experimenting.')
replace_once('README.md', 'Tab can complete a single unambiguous known object name.', 'Tab can complete a single unambiguous carried object name, never a nearby or undiscovered object.')
replace_once('DESIGN.md', 'Avoid endless "I don\'t understand" responses.', '''Avoid endless "I don't understand" responses.

Discovery must not become an interaction menu. Do not add a PACK panel, clickable surroundings catalog, or environmental-name autocomplete. INVENTORY lists possessions only; Tab completion is limited to carried objects. HELP is a syntax reference using imaginary examples, never real puzzle objects, hazards, answers, or checkpoint-specific commands. Actual guidance belongs in the world or in deliberately requested HINT responses.''')
path = Path('CHANGELOG.md')
text = path.read_text(encoding='utf-8')
heading = '# Dork changelog\n'
if not text.startswith(heading):
    raise ValueError('Unexpected changelog heading')
path.write_text(heading + '''
## 2026-10-13 - Preserve discovery; remove PACK and HELP spoilers

- Remove PACK and its carried/visible-object insertion menu completely. Keep the ordinary INVENTORY, INV, and I commands and button.
- Limit Tab completion to carried items so it cannot become a replacement catalog of nearby interactions.
- Rewrite HELP as a syntax reference with imaginary examples; remove tarot instructions and the property-return checkpoint command.
- Keep Casebook, Map, Tools, game content, puzzle logic, and saves unchanged pending separate design decisions.
- Extend Chromium/WebKit acceptance coverage for absent PACK controls, carried-only completion, HELP aliases, and neutral HELP across early and late rooms.
''' + text[len(heading):], encoding='utf-8')
path = Path('EXPANDED_EDITION.md')
text = path.read_text(encoding='utf-8')
text += '''
## Discovery-focused interface revision (2026-10-13)

PACK and its object-insertion menu have been removed at the author's request. The ordinary inventory command remains. Tab completion is restricted to carried items; it must not reveal an environmental object list. HELP now contains imaginary syntax examples only, without tarot or property-return instructions. Casebook, Map, Tools, the world, puzzle rules, and save data were not removed or altered by this revision. Cross-browser acceptance includes these discovery constraints.
'''
path.write_text(text, encoding='utf-8')
print('Applied scoped discovery/HELP revision.')
