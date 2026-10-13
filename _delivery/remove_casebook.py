"""Remove the Casebook feature without deleting lore, saves, or shared game support."""
from pathlib import Path
import re


def edit(name, changes):
    p = Path(name)
    text = p.read_text()
    for before, after in changes:
        if before not in text:
            raise ValueError(f'{name}: expected source not found: {before[:100]}')
        text = text.replace(before, after)
    p.write_text(text)


def cut(name, start, end):
    p = Path(name)
    text = p.read_text()
    a, b = text.index(start), text.index(end)
    assert a < b
    p.write_text(text[:a] + text[b:])


original_game = Path('game.js').read_text()
edit('index.html', [
    ('        <button type="button" data-panel="casebook">CASEBOOK</button>\n', ''),
    ('src="casebook.js"', 'src="game-support.js"'),
])
edit('style.css', [('grid-template-columns:repeat(3,minmax(0,1fr))', 'grid-template-columns:repeat(2,minmax(0,1fr))')])
edit('parser.js', [("    casebook: ['casebook','notes','notebook'],\n", '')])
cut('interface.js', '    function casePanel() {', '    function mapPanel() {')
edit('interface.js', [
    ("casebook:'INVESTIGATIVE CASEBOOK',", ''),
    ('casebook:casePanel,', ''),
])
edit('game.js', [
    ("'help','casebook','map'", "'help','map'"),
    ("    casebook: () => { ui.open('casebook'); print('Casebook opened. Prior-run memory is labeled separately from this run.'); },\n", ''),
    ('This run is complete. The casebook and death reports remain available.', 'This run is complete. LORE and DEATHS remain available.'),
    ('DEATHS, LORE, CASEBOOK, MAP, SAVE, RESTART.', 'DEATHS, LORE, MAP, SAVE, RESTART.'),
    ('  function casebookSections(){ return DorkJournal.sections(state,meta,DORK_DATA); }\n', ''),
    ('store,casebook:casebookSections,map:', 'store,map:'),
    ('DorkJournal', 'DorkSupport'),
])
# Keep the original lore display and acquisition logic byte-for-byte.
for pattern in [r'  function showLore\(\).*?\n', r'  function discoverLore\(id\) \{.*?\n  \}']:
    assert re.search(pattern, original_game, re.S).group() == re.search(pattern, Path('game.js').read_text(), re.S).group()
cut('casebook.js', '  function sections(state, meta, data) {', '  function map(state, meta, data, getExits, blocked) {')
edit('casebook.js', [
    ('/* Observations, not omniscience. The journal preserves knowledge, never puzzle state. */', '/* Shared map, opt-in hints, and death callbacks. No Casebook or objectives interface. */'),
    ('DorkJournal', 'DorkSupport'),
    ('return {sections, map, hint, lessons, callbacks, catFacts}', 'return {map, hint, lessons, callbacks, catFacts}'),
    ('The casebook keeps the evidence, not a prearranged final answer.', 'LORE retains selected discoveries, not a prearranged final answer.'),
    ('The casebook retains their names and appearances.', 'Recall their appearances or revisit them to compare.'),
    ('The casebook and separation reports remain available.', 'LORE and DEATHS remain available.'),
])
Path('casebook.js').rename('game-support.js')
edit('expansion.js', [("observed evidence or your casebook\\'s prior-run observations are admissible.", 'observed evidence or your prior-run recollections are admissible.')])
edit('tests/core_test.js', [("'casebook.js'", "'game-support.js'"), ('DorkJournal', 'DorkSupport')])
cut('tests/core_test.js', "check('Fresh casebook and map", "check('Save failure retains")
p = Path('tests/core_test.js')
t = p.read_text()
t = t.replace("check('Save failure retains", """check('Casebook commands and summaries are removed; lore aliases remain',()=>{
  for(const token of ['lore','journal','archive'])assert.equal(execute(`DorkParser.parse('${token}',{room:'meeting'}).verb`),'lore');
  for(const token of ['casebook','notes','notebook'])assert.equal(execute(`DorkParser.verbMap['${token}']`),undefined);
  assert.equal(execute('DorkSupport.sections'),undefined);
  assert(!fs.existsSync(path.join(root,'casebook.js')));
});
check('Fresh map exposes no destination or evidence before discovery',()=>{
  const rooms=snapshot(`DorkSupport.map({...DorkCore.newRun(DORK_DATA),knownExits:{meeting:['east']}},DorkCore.validateMeta({}),DORK_DATA,id=>DORK_DATA.rooms[id].exits,()=>false)`);
  assert.equal(rooms.length,1);assert.equal(rooms[0].id,'meeting');assert.equal(rooms[0].routes[0].target,'Unexplored');
});
check('Save failure retains""")
p.write_text(t)
edit('tests/expanded_test.py', [
    ("        await p.locator('[data-panel=\"casebook\"]').click()\n        assert 'unsupported identity claim revoked' in (await p.locator('.tool-body').inner_text()).lower()\n        await p.screenshot(path=str(RESULTS / f'{browser_name}-casebook.png'))\n        await close_panel(p)\n", "        reply=await command(p,'lore')\n        assert 'DISCOVERED ARCHIVE:' in reply and 'personnel file' in reply\n        await p.screenshot(path=str(RESULTS / f'{browser_name}-lore.png'))\n"),
    ("        await p.locator('[data-panel=\"casebook\"]').click()\n        text=await p.locator('.tool-body').inner_text()\n        assert 'TICKET SCOTT' not in text and 'Merlin —' not in text and 'BOO, SALEM' not in text\n        await close_panel(p)\n", "        text=await command(p,'lore')\n        assert text=='DISCOVERED ARCHIVE: Empty. Ignorance remains your most complete record.'\n"),
    ("        await p.locator('[data-panel=\"casebook\"]').click()\n        await p.get_by_text('OBSERVED FACTS & EXCERPTS',exact=True).click()\n        assert 'prior-run memory' in await p.locator('.tool-body').inner_text()\n", "        assert 'personnel file' in await command(p,'lore')\n"),
    ('No unobserved casebook/map spoilers; three-stage hints reset with puzzle progress', 'Lore and map preserve discovery; three-stage hints reset with puzzle progress'),
    ("        assert await p.locator('[data-panel]').count()==3", "        assert await p.locator('[data-panel]').count()==2"),
    ("'DUPLICATE','PACK','CERTIFICATION'", "'DUPLICATE','PACK','CASEBOOK','CERTIFICATION'"),
    ("        await p.locator('[data-panel=\"casebook\"]').click()\n        await p.get_by_text('OBSERVED FACTS & EXCERPTS',exact=True).click()\n        assert 'DECLINED WITH PREJUDICE' in await p.locator('.tool-body').inner_text()\n        await close_panel(p)\n", "        await p.reload()\n        assert 'DECLINED WITH PREJUDICE' in (await meta_state(p))['evidence']['waiver_form']\n"),
    ("            await p.locator('[data-panel=\"casebook\"]').click()", "            await p.locator('[data-panel=\"map\"]').click()"),
])
# Dedicated regression covers the removal, existing saves, all LORE aliases, death,
# restart, and actual confirmed file import/export. No replacement objectives UI.
p = Path('tests/expanded_test.py')
t = p.read_text()
addition = '''    async def lore_without_casebook():
        p=await page()
        assert await p.locator('[data-panel="casebook"]').count()==0
        assert await p.get_by_role('button',name='CASEBOOK',exact=True).count()==0
        assert await p.locator('script[src="casebook.js"]').count()==0
        await command(p,'look')
        before=await run_state(p); previous=await meta_state(p)
        for text in ['casebook','notes','notebook']:
            await command(p,text)
            assert not await p.locator('#toolDialog').evaluate('(d)=>d.open')
            assert await run_state(p)==before and await meta_state(p)==previous
        for alias in ['lore','journal','archive']:
            reply=await command(p,alias)
            assert reply=='DISCOVERED ARCHIVE: Empty. Ignorance remains your most complete record.'
            assert await run_state(p)==before and await meta_state(p)==previous
        await seed(p,'records_stacks')
        # An existing save with old observation fields must load without losing lore.
        remembered=["Scott's personnel file was created before his law-school graduation."]
        old=await meta_state(p)
        old.update(lore=remembered,observations=['records_file'],evidence={'records_file':'Previously examined record.'})
        await p.evaluate("v=>localStorage.setItem('dork_meta_v1',JSON.stringify(v))",old)
        await p.reload()
        before=await run_state(p); previous=await meta_state(p)
        for alias in ['lore','journal','archive']:
            assert await command(p,alias)=='DISCOVERED ARCHIVE:\\n1. '+remembered[0]
            assert await run_state(p)==before and await meta_state(p)==previous
            assert not await p.locator('#toolDialog').evaluate('(d)=>d.open')
        await command(p,'read file')
        assert (await meta_state(p))['lore']==remembered
        await command(p,'attack ash')
        assert await run_state(p) is None
        assert remembered[0] in await command(p,'lore')
        await command(p,'restart')
        assert (await meta_state(p))['lore']==remembered
        assert not (await run_state(p))['inventory'] and not (await run_state(p))['flags']
        await p.reload()
        assert remembered[0] in await command(p,'lore')
        await p.locator('[data-panel="settings"]').click()
        async with p.expect_download() as event:
            await p.get_by_role('button',name='EXPORT SAVE',exact=True).click()
        download=await event.value; path=RESULTS/f'{browser_name}-lore-save.json'
        await download.save_as(str(path))
        assert json.loads(path.read_text())['meta']['lore']==remembered
        await p.locator('#importSave').set_input_files(str(path))
        await p.get_by_role('button',name='CONFIRM REPLACE',exact=True).click()
        assert (await meta_state(p))['lore']==remembered
        assert remembered[0] in await command(p,'lore')
        assert 'casebook' not in (await command(p,'help')).lower()
        await p.close()
    await check('Casebook removed; existing lore survives aliases, death, restart, reload, and backup import', lore_without_casebook)

'''
assert '    async def ui_tools_and_files():' in t
t = t.replace('    async def ui_tools_and_files():', addition + '    async def ui_tools_and_files():')
p.write_text(t)
edit('tests/deployed_smoke.py', [("'casebook.js'", "'game-support.js'")])
# Verify the removed panel and preserved command on the live site as well.
edit('tests/deployed_smoke.py', [
    ("                assert await page.evaluate('DorkCore.VERSION') == '2.0.0'", """                assert await page.evaluate('DorkCore.VERSION') == '2.0.0'
                assert await page.locator('[data-panel="casebook"]').count() == 0
                assert await page.locator('[data-panel]').count() == 2
                assert 'CASEBOOK' not in (await command(page, 'help')).upper()
                assert 'DISCOVERED ARCHIVE:' in await command(page, 'lore')"""),
    ("                assert (await run_state(page))['won']", """                assert (await run_state(page))['won']
                assert 'DISCOVERED ARCHIVE:' in await command(page, 'lore')
                assert (await run_state(page))['won']"""),
])
edit('README.md', [
    ('CASEBOOK keeps observed evidence, current procedures, questions, known hazards, and prior-run death reports separate.', 'LORE (also JOURNAL / ARCHIVE) prints selected discoveries in the transcript and retains them between runs. There is no Casebook panel, automatic objectives list, or hazard-summary interface.'),
    ('| `casebook.js` | Evidence presentation, discovered map, graduated hints, death lessons |', '| `game-support.js` | Discovered map, graduated hints, death lessons, and observation metadata |'),
])
edit('DESIGN.md', [
    ('Casebook facts must come from observed material. Preserve the distinction between remembered evidence and current inventory or solved puzzles.', 'Do not reintroduce the Casebook panel, its objectives, evidence catalog, or hazard summaries. Keep the text-only LORE command and its selected discoveries. Preserve internal observations for existing puzzles and save compatibility, not as a replacement checklist.'),
])
edit('SOLUTION.md', [('Hints, inspection, casebook reading, map reading,', 'Hints, inspection, reading LORE, map reading,')])
edit('EXPANDED_EDITION.md', [
    ('| Investigative support | Observation-only persistent casebook with recorded excerpts, current procedures, open questions, hazards, and prior-run labels | Fresh-game spoiler checks; observed evidence; restart and hint-state tests |', '| Persistent lore | Original text-only LORE command; selected discoveries survive death. Casebook removed at the author\'s request. | Alias equivalence, existing saves, death/restart/reload, and confirmed backup import |'),
    ('The casebook records observations, not an omniscient puzzle checklist.', 'The Casebook interface and summary generator have been removed. LORE remains unchanged; internal observation fields are retained for puzzles and compatible saves.'),
])
p=Path('EXPANDED_EDITION.md')
p.write_text(p.read_text()+'''\n## Casebook removal (2026-10-13)\n\nRemove the button, panel, CASEBOOK/NOTES/NOTEBOOK command registration, procedural summaries, and references in HELP or puzzle feedback. Keep LORE/JOURNAL/ARCHIVE unchanged, including previously discovered lore. Shared map, hints, and death callbacks now live in `game-support.js`; they do not expose a Casebook. Map, Tools, ordinary inventory, puzzles, and storage schema are unchanged. Browser coverage explicitly verifies retained lore after death, restart, reload, export, and confirmed import.\n''')
p=Path('CHANGELOG.md')
p.write_text(p.read_text().replace('# Dork changelog\n', '''# Dork changelog

## 2026-10-13 - Remove Casebook; preserve LORE

- Remove the Casebook button, panel, command aliases, summary generator, and remaining player-facing references. Do not replace it with another objectives or interaction catalog.
- Preserve the original LORE, JOURNAL, and ARCHIVE commands, discovered entries, save format, and internal observations used by puzzles.
- Keep Map, Tools, hints, death callbacks, and both game routes. Move their shared support code out of the removed casebook module.
- Add regression coverage for old saves, unchanged lore output, death/restart/reload, backup export/import, and the published interface.
''', 1))
print('Casebook removed; original lore functions unchanged. Shared support and saves preserved.')
