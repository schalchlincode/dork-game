"""Verify published assets and play both routes through the actual hosted page."""
import asyncio
import hashlib
import json
import os
import time
from pathlib import Path
from urllib.request import Request, urlopen
from playwright.async_api import async_playwright
from expanded_test import CORE_ROUTE, EXPANDED_ROUTE, command, run_state

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://schalchlincode.github.io/dork-game/'
RESULTS = ROOT / 'test-results'
ASSETS = ['index.html', 'style.css', 'engine-core.js', 'parser.js', 'game-data.js',
          'expansion-data.js', 'world-content.js', 'expansion.js', 'casebook.js',
          'interface.js', 'game.js']


def verify_assets():
    expected = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in ASSETS}
    last = []
    for attempt in range(20):
        last = []
        for name, wanted in expected.items():
            try:
                request = Request(SITE + name, headers={'Cache-Control': 'no-cache', 'User-Agent': 'DORK-release-check'})
                with urlopen(request, timeout=20) as response:
                    actual = hashlib.sha256(response.read()).hexdigest()
                if actual != wanted:
                    last.append(name + ': previous asset still served')
            except Exception as error:
                last.append(name + ': ' + str(error))
        if not last:
            return expected
        print('Waiting for publication:', '; '.join(last), flush=True)
        if attempt < 19:
            time.sleep(15)
    raise AssertionError('Published files do not match the tested commit: ' + '; '.join(last))


async def play_routes():
    results = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        try:
            for name, route in [('original', CORE_ROUTE), ('expanded', EXPANDED_ROUTE)]:
                context = await browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
                page = await context.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.on('console', lambda message: errors.append(message.text) if message.type == 'error' and 'DORK action failed' in message.text else None)
                await page.goto(SITE, wait_until='networkidle')
                assert await page.evaluate('DorkCore.VERSION') == '2.0.0'
                for text in route:
                    await command(page, text)
                saved = await run_state(page)
                assert saved['won'] and saved['room'] == 'parking_exit', saved
                if name == 'expanded':
                    assert len(saved['visited']) == 23 and saved['flags']['identityReleased'], saved
                await page.reload(wait_until='networkidle')
                assert (await run_state(page))['won']
                assert not errors, errors
                await page.screenshot(path=str(RESULTS / ('published-' + name + '.png')))
                results.append({'route': name, 'commands': len(route), 'visited': len(saved['visited']), 'won': True, 'reloadPreserved': True})
                await context.close()
        finally:
            await browser.close()
    return results


if __name__ == '__main__':
    RESULTS.mkdir(exist_ok=True)
    hashes = verify_assets()
    report = {'site': SITE, 'commit': os.environ.get('TESTED_COMMIT', ''), 'assets': hashes, 'routes': asyncio.run(play_routes())}
    (RESULTS / 'published-results.json').write_text(json.dumps(report, indent=2))
    print('Published DORK 2.0: all 11 runtime assets match; original and expanded routes win and survive reload.')
