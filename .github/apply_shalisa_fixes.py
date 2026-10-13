from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    file_path = ROOT / path
    text = file_path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected one match, found {count}\n--- OLD ---\n{old}")
    file_path.write_text(text.replace(old, new, 1), encoding="utf-8")


def insert_before(path: str, marker: str, addition: str) -> None:
    replace_once(path, marker, addition + marker)


def insert_after(path: str, marker: str, addition: str) -> None:
    replace_once(path, marker, marker + addition)


# ---------------------------------------------------------------------------
# World data: time, forms, physical interactions, continuity chamber, and
# the new government-property checkpoint.
# ---------------------------------------------------------------------------
replace_once(
    "game-data.js",
    '      desc: "You are in Conference Room ECR-4, where you arrived for an Executive Continuity Review after receiving a calendar invitation bearing the Governor\'s name. The table is too long for one person and too clean for government property. A red EXIT sign glows above the east door. There is no west door. You are fairly certain there was one when you entered.\\n\\nOn the table: a leather agenda folder, a visitor badge, and a glass of water that has developed a skin.",',
    '      desc: "You are in Conference Room ECR-4, where you arrived for a 4:30 PM Executive Continuity Review after receiving a calendar invitation bearing the Governor\'s name. The meeting was scheduled to end at 5:00. A wall clock now says 5:17 and has not moved since you noticed it. The table is too long for one person and too clean for government property. A red EXIT sign glows above the east door. There is no west door. You are fairly certain there was one when you entered.\\n\\nOn the table: a leather agenda folder, a visitor badge, and a glass of water that has developed a skin.",',
)
replace_once(
    "game-data.js",
    '      items: ["agenda", "badge", "water"]',
    '      items: ["agenda", "badge", "water", "clock"]',
)
replace_once(
    "game-data.js",
    '      desc: "A government corridor extends north and south beneath fluorescent lights that buzz with the confidence of people who cannot be fired. West returns to the meeting room. East is an elevator with brass doors. A BREAK ROOM sign points north. RECORDS lies south.\\n\\nThe directory lists Floor 6, Floor 5, Floor 4, Floor 3, Floor 2, Floor 1, Basement, Sub-Basement, and \'Below.\'",',
    '      desc: "A government corridor extends north and south beneath fluorescent lights that buzz with the confidence of people who cannot be fired. West returns to the meeting room. East is an elevator with brass doors. A BREAK ROOM sign points north. RECORDS lies south.\\n\\nThe directory lists Floor 6, Floor 5, Floor 4, Floor 3, Floor 2, Floor 1, Basement, Sub-Basement, and \'Below.\' A small marker says: YOU ARE HERE — FLOOR 6: EXECUTIVE OFFICES.",',
)
replace_once(
    "game-data.js",
    '      desc: "A coffee machine wheezes beside a refrigerator covered in passive-aggressive notes. A jar of hazelnut creamer sits beneath a handwritten warning: \'JORGE ONLY.\' Someone has drawn three little stick figures on a napkin and labeled them ANGELA, JULIA, and AUDREY.\\n\\nThe vending machine displays exactly one item: BLACK CANDLE — OUT OF STOCK.",',
    '      desc: "A coffee machine wheezes beside a refrigerator covered in passive-aggressive notes. A jar of hazelnut creamer sits beneath a handwritten warning: \'JORGE ONLY.\' A laminated break-room memo is bolted to the wall beside the refrigerator. Someone has drawn three little stick figures on a napkin and labeled them ANGELA, JULIA, and AUDREY.\\n\\nThe vending machine displays exactly one item: BLACK CANDLE — OUT OF STOCK.",',
)
replace_once(
    "game-data.js",
    '      desc: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. A contract waits on a lectern beneath a sign reading SIGNATURE REQUIRED. The document is sixty-three pages long. Page sixty-four is visible underneath it.\\n\\nA rubber waiver stamp sits inside a locked acrylic box.",',
    '      desc: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. A contract waits on a lectern beneath a sign reading SIGNATURE REQUIRED. The document is sixty-three pages long. A detachable Page 64 labeled WAIVER FORM 4C is tucked underneath it.\\n\\nA rubber Waiver Stamp 4C sits inside a locked acrylic box.",',
)
replace_once(
    "game-data.js",
    '      items: ["contract", "stamp_box"]',
    '      items: ["contract", "waiver_form", "stamp_box"]',
)
replace_once(
    "game-data.js",
    '      desc: "Rows of office chairs face a purchasing counter set where an altar would normally be. Behind it stands a brass requisition machine with two slots: FORM and WAIVER.\\n\\nA sign reads: \'NO GOODS OR SERVICES MAY BE ACQUIRED WITHOUT DOCUMENTED BUSINESS NECESSITY, INCLUDING EXORCISMS.\'",',
    '      desc: "Rows of office chairs face a purchasing counter set where an altar would normally be. Behind it stands a brass requisition machine with two paper slots: FORM and WAIVER.\\n\\nA sign reads: \'NO GOODS OR SERVICES MAY BE ACQUIRED WITHOUT DOCUMENTED BUSINESS NECESSITY, INCLUDING EXORCISMS.\'",',
)
replace_once(
    "game-data.js",
    '      desc: "The carpet is mauve. The walls are bone. A tarot spread lies on an orientation table: THE FOOL, THE TOWER, and THE SUN. A sweet grey cat sits beside the cards with one paw raised, as though waiting for you to embarrass yourself. His tag says MERLIN.\\n\\nThe east wall has no door, although cold air is coming through it.",',
    '      desc: "The carpet is mauve. The walls are bone. HR has arranged three face-up tarot cards as a mandatory orientation assessment: THE FOOL, THE TOWER, and THE SUN. This is not how tarot works, which is how you know HR designed it. A sweet grey cat sits beside the cards with one paw raised, as though waiting for you to embarrass yourself. His tag says MERLIN.\\n\\nThe east wall has no door, although cold air is coming through it.",',
)
replace_once(
    "game-data.js",
    '      descByFlag: { tarotSolved: "The carpet is mauve. The walls are bone. The tarot spread remains on the table, and Merlin watches from beside it with one paw raised. The east wall has split open into a passage." },',
    '      descByFlag: { tarotSolved: "The carpet is mauve. The walls are bone. HR\'s face-up tarot assessment remains on the table, and Merlin watches from beside it with one paw raised. The east wall has split open into a passage." },',
)
replace_once(
    "game-data.js",
    '      desc: "Cubicles form a circle around a black stone conference table. A sweet black cat is curled asleep in an inbox tray. SALEM, according to the tag.\\n\\nThree framed children\'s drawings hang on the wall. Each depicts the same impossible building. The signatures read ANGELA, JULIA, and AUDREY. Beneath them, someone has written: \'THREE WITNESSES ESTABLISH CONTINUITY.\'\\n\\nA freight elevator waits to the south.",',
    '      desc: "Cubicles form a circle around a black stone conference table. A sweet black cat is curled asleep in an inbox tray. SALEM, according to the tag.\\n\\nThree framed children\'s drawings hang on the wall. Each child drew the same impossible building from a different angle. In every drawing, the same enormous door dominates the structure, surrounded by five cat-shaped marks. The signatures read ANGELA, JULIA, and AUDREY. Beneath them, someone has written: \'THREE WITNESSES ESTABLISH CONTINUITY.\'\\n\\nA freight elevator waits to the south.",',
)
replace_once(
    "game-data.js",
    '      desc: "The elevator opens into an archive built from limestone blocks older than the state above it. Filing cabinets have been mortared into the walls like tombs.\\n\\nA huge ledger rests on a pedestal. A black cat is hiding beneath it so completely that only two eyes are visible. LUNA appears on her collar. There is a narrow stair descending east.",',
    '      desc: "The elevator opens into an archive built from limestone blocks older than the state above it. Filing cabinets have been mortared into the walls like tombs.\\n\\nA huge ledger rests on a broad stone reading stand. The stand has an open arch beneath it, where a black cat is hiding so completely that only two eyes are visible. LUNA appears on her collar. There is a narrow stair descending east.",',
)
replace_once(
    "game-data.js",
    '      desc: "The chamber is circular and much larger than the building should permit. Five brass seals surround a central door. Each bears the silhouette of a cat.\\n\\nA huge white cat sits in front of the door. BOO looks up at you with the expression of an animal who has never once doubted his own authority.\\n\\nAbove the door: CONTINUITY IS NOT THE PRESERVATION OF GOVERNMENT. IT IS THE PRESERVATION OF RETURN.",',
    '      desc: "The chamber is circular and much larger than the building should permit. Five brass seals ring a central door. Each bears the silhouette of a cat. A tiny engraved arrow beside the uppermost seal points clockwise. Beneath the seals is a silver key slot.\\n\\nA huge white cat sits in front of the door. BOO looks up at you with the expression of an animal who has never once doubted his own authority.\\n\\nAbove the door: CONTINUITY IS NOT THE PRESERVATION OF GOVERNMENT. IT IS THE PRESERVATION OF RETURN.",',
)
replace_once(
    "game-data.js",
    '      exits: { west: "subbasement", east: "parking_exit" },',
    '      exits: { west: "subbasement", east: "asset_control" },',
)
insert_before(
    "game-data.js",
    '    parking_exit: {',
    '''    asset_control: {
      name: "Asset Control Vestibule",
      desc: "A waist-high return bin blocks the final exit. A scanner above the east door reads:\\n\\nALL STATE PROPERTY MUST BE SURRENDERED BEFORE SEPARATION. FAILURE TO COMPLY CONSTITUTES VOLUNTARY TERMINATION.\\n\\nThe scanner is already reviewing your inventory with professional disappointment.",
      exits: { west: "continuity_chamber", east: "parking_exit" },
      items: ["return_bin", "asset_scanner"]
    },
''',
)
replace_once(
    "game-data.js",
    '    water: { name: "glass of water", article: "the glass of water", aliases: ["water", "glass", "glass of water", "water glass"], portable: false, desc: "The water is room temperature and somehow looks judgmental." },',
    '''    water: { name: "glass of water", article: "the glass of water", aliases: ["water", "glass", "glass of water", "water glass"], portable: false, desc: "The water is room temperature and somehow looks judgmental." },
    clock: { name: "wall clock", aliases: ["clock", "wall clock", "time"], portable: false, desc: "The clock reads 5:17 PM. The meeting invitation was for 4:30 to 5:00. The second hand is not moving." },''',
)
replace_once(
    "game-data.js",
    '    memo: { name: "break-room memo", aliases: ["memo", "note", "break room memo"], portable: true, desc: "MEMO: Records staff are not to be fed after 5:00 PM except approved flavored creamers. This policy supersedes the 2019 incident." },',
    '    memo: { name: "break-room memo", aliases: ["memo", "note", "break room memo", "break-room note"], portable: false, desc: "A laminated memo bolted to the wall reads: Records staff are not to be fed after 5:00 PM except approved flavored creamers. This policy supersedes the 2019 incident." },',
)
replace_once(
    "game-data.js",
    '    form66b: { name: "Form 66-B", aliases: ["form", "form 66-b", "66b", "66-b"], portable: true, desc: "FORM 66-B: Emergency Acquisition of Ritual, Infernal, or Otherwise Noncompetitive Goods." },',
    '''    form66b: { name: "Form 66-B", aliases: ["form", "form 66-b", "66b", "66-b"], portable: true, desc: "FORM 66-B: Emergency Acquisition of Ritual, Infernal, or Otherwise Noncompetitive Goods. Every field is already completed in Scott's handwriting, including a business justification he does not remember writing." },
    waiver_form: { name: "Waiver Form 4C", aliases: ["waiver", "waiver form", "waiver form 4c", "page 64", "refusal form", "refusal page"], portable: true, desc: "A detachable refusal form labeled WAIVER FORM 4C. Its certification box is blank and requires Waiver Stamp 4C.", descByFlag: { waiverStamped: "Waiver Form 4C bears a fresh red imprint: DECLINED WITH PREJUDICE. It is ready for Procurement's WAIVER slot." } },''',
)
replace_once(
    "game-data.js",
    '    contract: { name: "continuity contract", aliases: ["contract", "document", "papers"], portable: false, desc: "The signature page grants the Agency \'continued use of identity, likeness, memory, and post-mortem administrative capacity.\' The fine print says: \'Refusal must be documented using Waiver Stamp 4C.\'" },',
    '    contract: { name: "continuity contract", aliases: ["contract", "document", "papers"], portable: false, desc: "The signature page grants the Agency \'continued use of identity, likeness, memory, and post-mortem administrative capacity.\' The fine print says: \'Refusal must be documented on detachable Waiver Form 4C using Waiver Stamp 4C.\'" },',
)
replace_once(
    "game-data.js",
    '    requisition_machine: { name: "requisition machine", aliases: ["machine", "requisition machine", "brass machine"], portable: false, desc: "Two slots labeled FORM and WAIVER. A third slot labeled SOUL has been taped over." },',
    '''    requisition_machine: { name: "requisition machine", aliases: ["machine", "requisition machine", "brass machine"], portable: false, desc: "Two paper slots are labeled FORM and WAIVER. A third slot labeled SOUL has been taped over." },
    procurement_receipt: { name: "Procurement receipt", aliases: ["receipt", "procurement receipt", "employee copy"], portable: true, desc: "PROCUREMENT RECEIPT: FORM RECEIVED. WAIVER FILED. ASSETS ISSUED. COST CENTER: POSTERITY. EMPLOYEE COPY." },''',
)
replace_once(
    "game-data.js",
    '    black_candle: { name: "black emergency candle", aliases: ["candle", "black candle", "emergency candle"], portable: true, desc: "PROCUREMENT ITEM 771-C. Emergency illumination for spaces where electricity has become ideologically opposed to you." },',
    '    black_candle: { name: "black emergency candle", aliases: ["candle", "black candle", "emergency candle"], portable: true, desc: "PROCUREMENT ITEM 771-C. A black emergency candle with a metal striker cap. Twist until it clicks. Matches are considered an unauthorized dependency." },',
)
replace_once(
    "game-data.js",
    '    tarot_spread: { name: "tarot spread", aliases: ["cards", "tarot", "spread", "tarot spread"], portable: false, desc: "Three cards wait on the table: THE FOOL, THE TOWER, and THE SUN. Merlin\'s paw favors THE TOWER." },',
    '    tarot_spread: { name: "tarot assessment", aliases: ["cards", "tarot", "spread", "tarot spread", "tarot assessment", "orientation assessment"], portable: false, desc: "HR has arranged three face-up cards as a mandatory orientation assessment: THE FOOL, THE TOWER, and THE SUN. This is not a proper tarot reading. Merlin\'s paw favors THE TOWER." },',
)
replace_once(
    "game-data.js",
    '    drawings: { name: "children\'s drawings", aliases: ["drawings", "drawing", "pictures", "children\'s drawings", "kids drawings"], portable: false, desc: "Three drawings, three signatures: Angela, Julia, Audrey. Each child drew the same door from a different angle. Together, the drawings show five cat-shaped marks around its frame." },',
    '    drawings: { name: "children\'s drawings", aliases: ["drawings", "drawing", "pictures", "children\'s drawings", "kids drawings"], portable: false, desc: "Three drawings, three signatures: Angela, Julia, Audrey. Each child drew the same impossible building from a different angle. In every drawing, the same enormous door dominates the structure, surrounded by five cat-shaped marks." },',
)
replace_once(
    "game-data.js",
    '    ledger: { name: "continuity ledger", aliases: ["ledger", "book", "huge ledger"], portable: false, desc: "The ledger lists thousands of state employees. Most names are crossed out. Scott\'s is not. In the margin: \'Invited by authority; retained by consent; released by anchor.\'" },',
    '    ledger: { name: "continuity ledger", aliases: ["ledger", "book", "huge ledger"], portable: false, desc: "The ledger is chained to a broad stone reading stand. It lists thousands of state employees. Most names are crossed out. Scott\'s is not. In the margin: \'Invited by authority; retained by consent; released by anchor.\'" },',
)
replace_once(
    "game-data.js",
    '    luna: { name: "Luna", aliases: ["luna", "black cat", "scared cat", "cat"], portable: false, desc: "Luna is very, very afraid of the stairway. This is the strongest evidence you have received all evening." },',
    '    luna: { name: "Luna", aliases: ["luna", "black cat", "scared cat", "cat"], portable: false, desc: "Luna hides in the open arch beneath the stone reading stand. She is very, very afraid of the stairway. This is the strongest evidence you have received all evening." },',
)
replace_once(
    "game-data.js",
    '    seals: { name: "five brass seals", aliases: ["seals", "brass seals", "five seals"], portable: false, desc: "Left to right: a huge white cat sitting upright as if it outranks the door; a black cat curled asleep; a small grey cat crouched high, as if on a shelf; a black cat with only its eyes showing; a grey cat with one paw raised." },',
    '    seals: { name: "five brass seals", aliases: ["seals", "brass seals", "five seals"], portable: false, desc: "Starting at the uppermost seal and following the engraved arrow clockwise: a huge white cat sitting upright as if it outranks the door; a black cat curled asleep; a small grey cat crouched high, as if on a shelf; a black cat with only its eyes showing; a grey cat with one paw raised." },',
)
replace_once(
    "game-data.js",
    '    final_plaque: { name: "continuity plaque", aliases: ["plaque", "final plaque", "sign"], portable: false, desc: "\'WHAT YOU RETURN TO IS WHAT RETURNS YOU.\' Below that, in smaller type: \'Do not submit a ticket for this door.\'" }',
    '''    final_plaque: { name: "continuity plaque", aliases: ["plaque", "final plaque", "sign"], portable: false, desc: "'WHAT YOU RETURN TO IS WHAT RETURNS YOU.' Below that, in smaller type: 'Do not submit a ticket for this door.'" },
    return_bin: { name: "state-property return bin", aliases: ["bin", "return bin", "property bin", "state property bin"], portable: false, desc: "A waist-high return bin marked STATE PROPERTY. It accepts objects more readily than the Agency accepts resignations." },
    asset_scanner: { name: "asset-control scanner", aliases: ["scanner", "asset scanner", "asset-control scanner", "property scanner"], portable: false, desc: "The scanner compares your inventory against an asset register. Its east-door indicator is red whenever state property remains in your possession." }''',
)

# ---------------------------------------------------------------------------
# Game logic and parser.
# ---------------------------------------------------------------------------
replace_once(
    "game.js",
    '''  if (!state.flags || typeof state.flags !== 'object') state.flags = {};
  if (state.flags.procured) state.flags.objectionFiled = true;
  saveMeta();''',
    '''  if (!state.flags || typeof state.flags !== 'object') state.flags = {};
  if (!Array.isArray(state.inventory)) state.inventory = [];
  if (!Array.isArray(state.taken)) state.taken = [];
  if (state.flags.procured) state.flags.objectionFiled = true;
  if (state.flags.stampInserted && !state.flags.waiverInserted) {
    state.flags.waiverInserted = true;
    state.flags.waiverStamped = true;
    delete state.flags.stampInserted;
  }
  if (state.flags.keyUsed) state.inventory = state.inventory.filter(id => id !== 'silver_key');
  if (state.flags.procured && !state.taken.includes('procurement_receipt')) {
    state.taken.push('procurement_receipt');
    if (!state.inventory.includes('procurement_receipt')) state.inventory.push('procurement_receipt');
  }
  saveMeta();''',
)
replace_once(
    "game.js",
    "    take: ['take','get','grab','pick','pickup','collect','yoink','acquire','obtain','snag','steal','retrieve','fetch'],",
    "    take: ['take','get','grab','pick','pickup','collect','yoink','acquire','obtain','snag','steal','retrieve','fetch','lift'],",
)
replace_once(
    "game.js",
    "    push: ['push','shove','press'],",
    "    push: ['push','shove','press','move'],",
)
replace_once(
    "game.js",
    "    burn: ['burn','ignite','light','torch','incinerate'],",
    "    burn: ['burn','ignite','light','torch','incinerate','strike','twist'],",
)
replace_once(
    "game.js",
    "    wait: ['wait','z'],",
    "    wait: ['wait','z'],\n    joke: ['joke'],\n    stamp: ['stamp'],",
)
insert_before(
    "game.js",
    "  boot();",
    '''  const GOVERNMENT_PROPERTY = new Set([
    'agenda', 'badge', 'mug', 'memo', 'form66b', 'waiver_form', 'waiver_stamp',
    'records_file', 'compliance_manual', 'black_candle', 'silver_key'
  ]);

''',
)
replace_once(
    "game.js",
    '''    if (!cleaned) return null;
    if (/\\b(?:not|never|dont|don't)\\b/.test(cleaned)) return null;
    let sensory = cleaned.match''',
    '''    if (!cleaned) return null;
    if (/\\b(?:not|never|dont|don't)\\b/.test(cleaned)) return null;
    if (/^(?:what time is it|what is the time|tell me the time|check the time)$/.test(cleaned))
      return {verb:'examine', objectText:'clock', targetText:'', raw, verbToken:'check'};
    const jokePhrase = cleaned.match(/^(?:make|tell|crack)(?: me)? (?:a )?joke(?: about (.+))?$/);
    if (jokePhrase) return {verb:'joke', objectText:jokePhrase[1] || '', targetText:'', raw, verbToken:'joke'};
    const takeOut = cleaned.match(/^(?:take|get|pull|bring) (?:the )?(.+?) out$/);
    if (takeOut) return {verb:'take', objectText:takeOut[1], targetText:'', raw, verbToken:'take out'};
    if (state.room === 'asset_control') {
      if (/^(?:return|surrender|deposit)(?: all| everything| all property| government property| state property| all government property| all state property)$/.test(cleaned))
        return {verb:'returnProperty', objectText:'all', targetText:'', raw, verbToken:'return'};
      const returnOne = cleaned.match(/^(?:return|surrender|deposit) (?:the )?(.+?)(?: (?:in|into|to) (?:the )?(?:return )?bin)?$/);
      if (returnOne) return {verb:'returnProperty', objectText:returnOne[1], targetText:'', raw, verbToken:'return'};
    }
    let sensory = cleaned.match''',
)
replace_once(
    "game.js",
    "    take: (c) => c.objectText === 'all' || c.objectText === 'everything' ? takeAll() : chooseCard(c) || take(c.objectText),",
    "    take: (c) => c.objectText === 'all' || c.objectText === 'everything' ? takeAll() : chooseCard(c) || take(c.objectText, c.raw),",
)
replace_once(
    "game.js",
    '''    touch: (c) => chooseCard(c) || genericAction(c),
    talk: talkThing,
    attack: attackThing,''',
    '''    touch: (c) => chooseCard(c) || genericAction(c),
    talk: talkThing,
    joke: joke,
    stamp: stampThing,
    returnProperty: (c) => returnProperty(c.objectText),
    attack: attackThing,''',
)
insert_before(
    "game.js",
    "  function move(dir) {",
    '''  function joke() {
    if (state.flags.readPersonnelFile) {
      state.flags.joked = true;
      return print("You make a joke about administrative continuity.\\n\\nSomewhere inside the wall, a printer emits one approving click.\\n\\n[HUMOR RESPONSE CONFIRMED]");
    }
    print('You make a joke. The building does not laugh. Somewhere in Records, something adds a note to your file.');
  }

  function stampWaiver() {
    if (!state.inventory.includes('waiver_stamp')) return print('You need Waiver Stamp 4C in your possession. It is locked in the acrylic box in Legal.');
    if (!state.inventory.includes('waiver_form')) return print('You need the detachable Waiver Form 4C from beneath the continuity contract.');
    if (state.flags.waiverStamped) return print('Waiver Form 4C is already stamped DECLINED WITH PREJUDICE. Procurement is ready to misunderstand it.');
    state.flags.waiverStamped = true;
    print('You press Waiver Stamp 4C onto the certification box.\\n\\nThe paper now reads: DECLINED WITH PREJUDICE.\\n\\nWaiver Form 4C is ready for Procurement.');
  }

  function stampThing(c) {
    const target = `${c.objectText} ${c.targetText}`.trim();
    if (hasWord(target, 'waiver') || hasWord(target, 'page 64') || hasWord(target, 'refusal form')) return stampWaiver();
    if (hasWord(target, 'form 66-b') || hasWord(target, '66-b') || hasWord(target, '66b'))
      return print('Form 66-B is already completed. Stamp the detachable Waiver Form 4C instead.');
    if (hasWord(target, 'contract')) return print('Do not stamp the contract. Stamp detachable Waiver Form 4C, then submit that paper to Procurement.');
    print('Stamp what? Legal requires the detachable Waiver Form 4C, not a general display of force.');
  }

  function carriedGovernmentProperty() {
    return state.inventory.filter(id => GOVERNMENT_PROPERTY.has(id));
  }

  function assetList(ids) {
    return ids.map(id => DORK_DATA.items[id]?.name || id).join(', ');
  }

  function returnAssetById(id) {
    if (!id || !state.inventory.includes(id)) return print('You are not carrying that asset. Asset Control is disappointed but unsurprised.');
    if (!GOVERNMENT_PROPERTY.has(id)) return print(`${DORK_DATA.items[id].name} is not registered state property. The scanner declines custody.`);
    state.inventory = state.inventory.filter(item => item !== id);
    state.flags.returnedAssets = state.flags.returnedAssets || [];
    if (!state.flags.returnedAssets.includes(id)) state.flags.returnedAssets.push(id);
    delete state.dropped[id];
    print(`Returned: ${DORK_DATA.items[id].name}. Asset Control accepts the surrender without forgiving it.`);
  }

  function returnProperty(text) {
    if (state.room !== 'asset_control') return print('There is no authorized property-return point here. Dropping things is not the same as compliance.');
    if (!text || ['all','everything','property','government property','state property'].includes(text)) {
      const assets = carriedGovernmentProperty();
      if (!assets.length) return print('The scanner detects no state property in your possession. The east-door indicator turns green.');
      assets.forEach(id => returnAssetById(id));
      return;
    }
    const id = findInventory(text);
    returnAssetById(id);
  }

''',
)
replace_once(
    "game.js",
    '''    if (room.blocked && room.blocked[dir]) {
      const key = room.blocked[dir];
      if (key === 'jorge' && !state.flags.jorgeMoved) return print("Jorge occupies the southern gate with the passive completeness of a collapsed bridge.");
      if (key === 'tarot' && !state.flags.tarotSolved) return print("The east wall remains a wall. HR considers this a successful boundary.");
      if (key === 'final_seal' && !state.flags.finalOpen) return print("The final door does not open. Boo watches you fail with professional interest.");
    }
    if (dest === 'subbasement' && (!state.flags.candleLit || !state.inventory.includes('black_candle'))) return die('darkness', 'You descend without a light. Something waits until the stair door closes, because unlike you it understands timing. The sound is brief. The paperwork is not.');''',
    '''    if (room.blocked && room.blocked[dir]) {
      const key = room.blocked[dir];
      if (key === 'jorge' && !state.flags.jorgeMoved) return print("Jorge occupies the southern gate with the passive completeness of a collapsed bridge.");
      if (key === 'tarot' && !state.flags.tarotSolved) return print("The east wall remains a wall. HR considers this a successful boundary.");
      if (key === 'final_seal' && !state.flags.finalOpen) return print("The final door does not open. Boo watches you fail with professional interest.");
    }
    if (state.room === 'asset_control' && dir === 'east') {
      const assets = carriedGovernmentProperty();
      if (assets.length) return die('property', `The asset scanner identifies unauthorized state property: ${assetList(assets).toUpperCase()}.\\n\\nA pleasant voice says, "Thank you for self-reporting."\\n\\nThe parking-garage door opens downward.`);
    }
    if (dest === 'subbasement' && (!state.flags.candleLit || !state.inventory.includes('black_candle'))) {
      const message = state.inventory.includes('black_candle')
        ? 'You descend with the correct emergency candle still unlit in your pocket. Something in the tunnel appreciates your commitment to owning the proper equipment without using it.'
        : 'You descend without a light. Something waits until the stair door closes, because unlike you it understands timing. The sound is brief. The paperwork is not.';
      return die('darkness', message);
    }''',
)
replace_once(
    "game.js",
    '''  function page64Text() {
    if (state.flags.objectionFiled || state.flags.procured)
      return 'Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. Procurement has filed the waiver with Form 66-B; the acrylic box is empty.';
    if (state.flags.stampTaken)
      return 'Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. You have already removed the stamp from the acrylic box.';
    return 'Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. The stamp is locked in the acrylic box.';
  }''',
    '''  function page64Text() {
    if (state.flags.objectionFiled || state.flags.procured)
      return 'Page sixty-four is the detachable Waiver Form 4C. Procurement has filed the stamped waiver with Form 66-B; the acrylic stamp box is empty.';
    if (state.flags.waiverStamped)
      return 'Page sixty-four is the detachable Waiver Form 4C. You stamped it DECLINED WITH PREJUDICE; it is ready for Procurement.';
    if (state.inventory.includes('waiver_form') || state.taken.includes('waiver_form'))
      return 'Page sixty-four is the detachable Waiver Form 4C. You removed it from beneath the contract, but its certification box still needs Waiver Stamp 4C.';
    return 'Page sixty-four is a detachable refusal form labeled WAIVER FORM 4C. Stamp that paper with Waiver Stamp 4C, then submit it to Procurement.';
  }''',
)
replace_once(
    "game.js",
    '    if (state.room === \'meeting\' && /\\b(?:calendar invitation|invitation)\\b/.test(text)) return print("The invitation bore the Governor\'s name and called this an Executive Continuity Review. It said nothing about the missing west door.");',
    '    if (state.room === \'meeting\' && /\\b(?:calendar invitation|invitation)\\b/.test(text)) return print("The invitation bore the Governor\'s name and scheduled the Executive Continuity Review for 4:30 to 5:00 PM. The wall clock says 5:17. It said nothing about the missing west door.");\n    if (state.room === \'meeting\' && /\\b(?:clock|time)\\b/.test(text)) return print("The wall clock says 5:17 PM. The invitation was for 4:30 to 5:00. The second hand has stopped, but the after-5:00 break-room policy is definitely in effect.");',
)
insert_before(
    "game.js",
    "    const scenery = {",
    '''    if (state.room === 'archives' && /\\b(?:under|beneath) (?:the )?(?:ledger|book)\\b/.test(text))
      return print('The ledger lies flat on the stone reading stand. Luna is beneath the stand, not beneath the book.');
    if (state.room === 'archives' && /\\b(?:under|beneath) (?:the )?(?:stand|reading stand|pedestal)\\b/.test(text))
      return print('Luna watches from the open arch beneath the stone reading stand and declines extraction.');
    if (state.room === 'asset_control' && /\\b(?:scanner|property|assets?)\\b/.test(text)) {
      const assets = carriedGovernmentProperty();
      return print(assets.length ? `The scanner flags: ${assetList(assets)}. Return them before going east.` : 'The scanner detects no state property. The east-door indicator is green.');
    }
    if (state.room === 'asset_control' && /\\b(?:bin|return bin)\\b/.test(text))
      return print('The return bin accepts registered state property. RETURN ALL is an approved phrase for once.');
''',
)
replace_once(
    "game.js",
    "      executive_corridor: { directory: 'The directory lists ordinary floors, two basements, and BELOW. The elevator is out of service; Records lies south.',",
    "      executive_corridor: { directory: 'The directory lists ordinary floors, two basements, and BELOW. A marker says YOU ARE HERE — FLOOR 6: EXECUTIVE OFFICES. The elevator is out of service; Records lies south.',",
)
replace_once(
    "game.js",
    "      procurement: { slots: 'The brass machine has a FORM slot and a WAIVER slot. Its SOUL slot is taped over.', sign: 'The sign requires documented business necessity for every purchase, including exorcisms. The brass machine wants a form and a waiver.' },",
    "      procurement: { slots: 'The brass machine has a FORM paper slot and a WAIVER paper slot. Its SOUL slot is taped over.', sign: 'The sign requires documented business necessity for every purchase, including exorcisms. The brass machine wants completed Form 66-B and a stamped Waiver Form 4C.' },",
)
replace_once(
    "game.js",
    "      hr_reliquary: { 'east wall': state.flags.tarotSolved ? 'The east wall has split open. A passage leads into Occult Compliance.' : 'The east wall is solid, though cold air slips through. Merlin keeps pointing at The Tower.', table: 'The orientation table holds THE FOOL, THE TOWER, and THE SUN. Merlin keeps one paw near The Tower.' },",
    "      hr_reliquary: { 'east wall': state.flags.tarotSolved ? 'The east wall has split open. A passage leads into Occult Compliance.' : 'The east wall is solid, though cold air slips through. Merlin keeps pointing at The Tower.', table: 'HR has arranged three face-up cards as an orientation assessment: THE FOOL, THE TOWER, and THE SUN. Merlin keeps one paw near The Tower.' },",
)
replace_once(
    "game.js",
    "      archives: { stair: 'The narrow stair descends east into darkness. Luna hides from it; take a lit candle with you.', cabinets: 'Filing cabinets are mortared into the limestone walls. The ledger on the pedestal is the record you can actually read.' },",
    "      archives: { stair: 'The narrow stair descends east into darkness. Luna hides from it; take a lit candle with you.', cabinets: 'Filing cabinets are mortared into the limestone walls. The ledger on the stone reading stand is the record you can actually read.', 'reading stand': 'The broad stone reading stand is mortared to the floor. An open arch beneath it shelters Luna.', pedestal: 'The broad stone reading stand is mortared to the floor. An open arch beneath it shelters Luna.' },",
)
replace_once(
    "game.js",
    "      continuity_chamber: { door: state.flags.finalOpen ? 'The eastern door stands open. You can leave.' : state.flags.keyUsed ? 'The key has woken five seals, but the eastern door still waits for their names.' : 'Five seals surround the eastern door. A silver key slot waits beneath them.' }",
    "      continuity_chamber: { door: state.flags.finalOpen ? 'The eastern door stands open. You can leave.' : state.flags.keyUsed ? 'The silver key rests in its slot. Five awakened seals still wait for names in clockwise order.' : 'Five seals ring the eastern door. An engraved arrow points clockwise, and a silver key slot waits beneath them.' },\n      asset_control: { scanner: 'The scanner compares your inventory against the state asset register.', bin: 'The return bin accepts registered government property.' }",
)
replace_once(
    "game.js",
    "  function take(text) {\n    const id = findItem(text, true);",
    "  function take(text, raw='') {\n    if (hasWord(text, 'receipt') && state.inventory.includes('procurement_receipt')) return print('You already have the Procurement receipt. It is the employee copy, which is the closest thing here to a gift.');\n    if (hasWord(text, 'key') && state.flags.keyUsed) return print('The silver key is locked into the continuity mechanism. The Agency has retained the asset before you could.');\n    if (hasWord(text, 'candle') && state.inventory.includes('black_candle') && /(?:take|get|pull|bring).+out/i.test(raw)) return print(state.flags.candleLit ? 'You take out the black candle. Its green flame is already lit.' : 'You take out the black candle. Its striker cap remains untwisted; the candle is still unlit.');\n    const id = findItem(text, true);",
)
replace_once(
    "game.js",
    "    if (id === 'drawings') return print(\"The children's drawings are fixed to the wall. Read their signatures here; the three witnesses matter later.\");\n    if (id === 'ledger') return print('The ledger is chained to its pedestal. Read it here before taking the eastern stair.');",
    "    if (id === 'drawings') return print(\"The children's drawings are fixed to the wall. Read their signatures here; the three witnesses matter later.\");\n    if (id === 'memo') return print('The break-room memo is laminated and bolted to the wall. It has already exceeded its telework allowance.');\n    if (id === 'ledger') return print('The ledger is chained to the stone reading stand and weighs approximately one unresolved fiscal year. Read it here before taking the eastern stair.');",
)
replace_once(
    "game.js",
    '''  function drop(text) {
    const id = findInventory(text); if (!id) return print("You are not carrying that.");
    state.inventory = state.inventory.filter(x => x !== id);''',
    '''  function drop(text) {
    const id = findInventory(text); if (!id) return print("You are not carrying that.");
    if (state.room === 'asset_control' && GOVERNMENT_PROPERTY.has(id)) return returnAssetById(id);
    state.inventory = state.inventory.filter(x => x !== id);''',
)
replace_once(
    "game.js",
    "    if (['memo','ash_note','contract','compliance_manual','drawings','final_plaque','form66b','napkin'].includes(id)) return examine(text);",
    "    if (['memo','ash_note','contract','compliance_manual','drawings','final_plaque','form66b','waiver_form','procurement_receipt','napkin'].includes(id)) return examine(text);",
)
replace_once(
    "game.js",
    "    if (id === 'requisition_machine') return print(state.flags.procured ? 'The requisition drawer stands open and empty. The machine has issued everything it intends to.' : 'The requisition drawer is shut. Feed the FORM and WAIVER slots before expecting a candle or key.');",
    "    if (id === 'requisition_machine') return print(state.flags.procured ? 'The requisition drawer stands open and empty. The machine has issued everything it intends to.' : 'The requisition drawer is shut. Insert completed Form 66-B into FORM and stamped Waiver Form 4C into WAIVER.');",
)
replace_once(
    "game.js",
    "      state.flags.stampTaken = true; state.inventory.push('waiver_stamp'); print(\"You pry open the cheap acrylic box with the visitor badge. Law school did not teach this, but tuition has finally produced a return.\\n\\nTaken: Waiver Stamp 4C.\"); return;",
    "      state.flags.stampTaken = true; if (!state.inventory.includes('waiver_stamp')) state.inventory.push('waiver_stamp'); if (!state.taken.includes('waiver_stamp')) state.taken.push('waiver_stamp'); print(\"You pry open the cheap acrylic box with the visitor badge. Law school did not teach this, but tuition has finally produced a return.\\n\\nTaken: Waiver Stamp 4C.\"); return;",
)
replace_once(
    "game.js",
    '''    if (state.room === 'break_room' && hasWord(c.objectText, 'coffee machine')) return print('The coffee machine wheezes out something dark. The useful hazelnut creamer is reserved for Jorge in Records.');
    if (state.room === 'procurement' && /^(?:requisition )?machine$/.test(c.objectText)) return print('The requisition machine has FORM and WAIVER slots. Insert Form 66-B and Waiver Stamp 4C to request the candle and key.');

    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');

    const paperwork = new Set([a, b].filter(Boolean));
    if (state.room !== 'procurement' && paperwork.has('waiver_stamp') && (paperwork.has('contract') || paperwork.has('form66b')))
      return print('Waiver Stamp 4C and Form 66-B are submitted separately to Procurement. Put the form in the FORM slot and the stamp in the WAIVER slot; do not stamp the contract or form directly.');''',
    '''    if (state.room === 'asset_control' && b === 'return_bin' && a) return returnAssetById(a);
    if (state.room === 'break_room' && hasWord(c.objectText, 'coffee machine')) return print('The coffee machine wheezes out something dark. The useful hazelnut creamer is reserved for Jorge in Records.');
    if (state.room === 'procurement' && /^(?:requisition )?machine$/.test(c.objectText)) return print('The requisition machine has FORM and WAIVER paper slots. Insert completed Form 66-B and stamped Waiver Form 4C to request the candle and key.');

    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');

    const paperwork = new Set([a, b].filter(Boolean));
    if (paperwork.has('waiver_stamp') && paperwork.has('waiver_form')) return stampWaiver();
    if (paperwork.has('waiver_stamp') && paperwork.has('form66b')) return print('Form 66-B is already completed. Use Waiver Stamp 4C on the detachable Waiver Form 4C instead.');
    if (paperwork.has('waiver_stamp') && paperwork.has('contract')) return print('Do not stamp the contract. Stamp detachable Waiver Form 4C, then submit that paper to Procurement.');''',
)
replace_once(
    "game.js",
    '''    if (state.room === 'procurement' && (a === 'form66b' || a === 'waiver_stamp' || /form|stamp/.test(c.objectText))) {
      if (c.targetText) {
        const destination = c.targetText.replace(/^(?:the|a|an)\\s+/, '').trim();
        const machine = /^(?:(?:requisition|brass)\\s+)?machine$/.test(destination);
        const correctSlot = a === 'form66b' ? 'form slot' : 'waiver slot';
        if (!machine && destination !== correctSlot) return print(`That is not the ${correctSlot} or the requisition machine. Keep the paperwork.`);
      }
      if ((hasWord(c.objectText, 'form') && state.flags.formInserted) || (hasWord(c.objectText, 'stamp') && state.flags.stampInserted)) return print('The machine already has that. It is unusually possessive about paperwork.');
      if (!['form66b','waiver_stamp'].includes(a) || !state.inventory.includes(a)) return print('The machine requires a real form or waiver stamp in your possession. Imaginary paperwork is handled upstairs.');
      if (a === 'form66b') state.flags.formInserted = true;
      if (a === 'waiver_stamp') state.flags.stampInserted = true;
      state.inventory = state.inventory.filter(x => x !== a);
      print(`${DORK_DATA.items[a].name} accepted by the requisition machine.`);
      if (state.flags.formInserted && state.flags.stampInserted && !state.flags.procured) {
        state.flags.procured = true; state.flags.objectionFiled = true; ['black_candle','silver_key'].forEach(x => state.inventory.push(x));
        print("The machine groans like a committee reaching consensus. A drawer opens.\\n\\nIssued: BLACK EMERGENCY CANDLE.\\nIssued: SILVER CONTINUITY KEY.\\n\\nA receipt prints for $0.00 and twelve human years.");
      }
      return;
    }''',
    '''    if (state.room === 'procurement' && (a === 'form66b' || a === 'waiver_form' || /form|waiver/.test(c.objectText))) {
      if (a === 'waiver_stamp') return print('The machine accepts waiver paperwork, not the rubber stamp itself. Stamp Waiver Form 4C first.');
      if (c.targetText) {
        const destination = c.targetText.replace(/^(?:the|a|an)\\s+/, '').trim();
        const machine = /^(?:(?:requisition|brass)\\s+)?machine$/.test(destination);
        const correctSlot = a === 'form66b' ? 'form slot' : 'waiver slot';
        if (!machine && destination !== correctSlot) return print(`That is not the ${correctSlot} or the requisition machine. Keep the paperwork.`);
      }
      if (a === 'waiver_form' && !state.flags.waiverStamped) return print('The WAIVER slot rejects the blank page. Stamp Waiver Form 4C with Waiver Stamp 4C first.');
      if ((a === 'form66b' && state.flags.formInserted) || (a === 'waiver_form' && state.flags.waiverInserted)) return print('The machine already has that. It is unusually possessive about paperwork.');
      if (!['form66b','waiver_form'].includes(a) || !state.inventory.includes(a)) return print('The machine requires the completed form or stamped waiver paper in your possession. Imaginary paperwork is handled upstairs.');
      if (a === 'form66b') state.flags.formInserted = true;
      if (a === 'waiver_form') state.flags.waiverInserted = true;
      state.inventory = state.inventory.filter(x => x !== a);
      print(`${DORK_DATA.items[a].name} accepted by the requisition machine.`);
      if (state.flags.formInserted && state.flags.waiverInserted && !state.flags.procured) {
        state.flags.procured = true;
        state.flags.objectionFiled = true;
        for (const id of ['black_candle','silver_key','procurement_receipt']) {
          if (!state.inventory.includes(id)) state.inventory.push(id);
          if (!state.taken.includes(id)) state.taken.push(id);
        }
        print("The machine groans like a committee reaching consensus. A drawer opens.\\n\\nIssued: BLACK EMERGENCY CANDLE.\\nIssued: SILVER CONTINUITY KEY.\\n\\nA receipt prints for $0.00 and twelve human years. It curls directly into your hand before you can decline custody.");
      }
      return;
    }''',
)
replace_once(
    "game.js",
    '''    if (state.room === 'continuity_chamber' && (a === 'silver_key' || /key/.test(c.objectText))) {
      if (!state.inventory.includes('silver_key')) return print('You need the silver key in your hand, not merely in a sentence.');
      if (c.targetText && !/^(?:(?:the|a|an) )?(?:five (?:brass )?seals|(?:brass )?seals|key slot|silver key slot|slot(?: beneath (?:the )?(?:five )?seals)?|(?:final |eastern |east )?door)$/.test(c.targetText))
        return print('The key fits the slot beneath the five seals, not that target.');
      if (state.flags.keyUsed) return print('The silver key is already turned. Five lit seals still wait for the five names.');
      state.flags.keyUsed = true;
      const passwordLine = state.flags.readNapkin
        ? "The napkin's words return: HOME IS A PASSWORD."
        : 'A phrase resolves above the seals: HOME IS A PASSWORD.';
      print(`Boo lifts one paw with executive reluctance. The silver key fits the slot beneath the five seals and turns once. Five small lights wake above the door.\\n\\nTheir poses resolve in the light: Boo upright, Salem curled asleep, Ash high on his shelf, Luna peering out, Merlin raising one paw. Not decorations. A household, filed as infrastructure.\\n\\n${passwordLine} The chamber waits for the five names.`); return;
    }''',
    '''    if (state.room === 'continuity_chamber' && (a === 'silver_key' || /key/.test(c.objectText))) {
      if (state.flags.keyUsed) return print('The silver key is already locked into the mechanism. Five lit seals still wait for the five names.');
      if (!state.inventory.includes('silver_key')) return print('You need the silver key in your hand, not merely in a sentence.');
      if (c.targetText && !/^(?:(?:the|a|an) )?(?:five (?:brass )?seals|(?:brass )?seals|key slot|silver key slot|slot(?: beneath (?:the )?(?:five )?seals)?|(?:final |eastern |east )?door)$/.test(c.targetText))
        return print('The key fits the slot beneath the five seals, not that target.');
      state.flags.keyUsed = true;
      state.inventory = state.inventory.filter(id => id !== 'silver_key');
      const passwordLine = state.flags.readNapkin
        ? "The napkin's words return: HOME IS A PASSWORD."
        : 'A phrase resolves above the seals: HOME IS A PASSWORD.';
      print(`Boo lifts one paw with executive reluctance. The silver key fits the slot beneath the five seals, turns once, and locks in place. Five small lights wake above the door.\\n\\nStarting at the uppermost seal and following the engraved arrow clockwise, the poses resolve in the light: a huge white cat sitting upright; a black cat curled asleep; a small grey cat crouched high; a black cat peering from concealment; a grey cat with one paw raised. Not decorations. A household, filed as infrastructure.\\n\\n${passwordLine} The chamber waits for the five names.`); return;
    }''',
)
replace_once(
    "game.js",
    '''    if (a === 'black_candle' || hasWord(c.objectText, 'candle')) {
      if (!state.inventory.includes('black_candle')) return print('There is no candle in your inventory to light.');
      state.flags.candleLit = true; print("You light the black candle. Its flame is green. The tunnel ahead becomes visible enough to regret."); return;
    }''',
    '''    if (a === 'black_candle' || hasWord(c.objectText, 'candle')) {
      if (!state.inventory.includes('black_candle')) return print('There is no candle in your inventory to light.');
      if (state.flags.candleLit) return print('The black emergency candle is already burning with a green flame.');
      state.flags.candleLit = true;
      print("You twist the candle's metal striker cap until it clicks. The black candle lights itself. Its flame is green. The tunnel ahead becomes visible enough to regret."); return;
    }''',
)
replace_once(
    "game.js",
    "        form66b: 'Form 66-B belongs in the FORM slot of the Procurement machine, alongside Waiver Stamp 4C.',",
    "        form66b: 'Form 66-B is already completed and belongs in Procurement\'s FORM slot.',\n        waiver_form: state.flags.waiverStamped ? 'Waiver Form 4C is stamped and belongs in Procurement\'s WAIVER slot.' : 'Waiver Form 4C still needs Waiver Stamp 4C before Procurement will accept it.',\n        waiver_stamp: 'Use Waiver Stamp 4C on the detachable Waiver Form 4C. The rubber stamp itself does not go into Procurement.',\n        procurement_receipt: 'The receipt is the employee copy. Read it or keep it; Asset Control does not want it back.',",
)
replace_once(
    "game.js",
    "    if (state.room === 'continuity_chamber' && /^(?:for )?names$|^(?:the )?room about seals$/.test(t)) return print(state.flags.keyUsed ? 'Read the five lit seals from left to right. Their poses match the five cats you met; name each in that order.' : 'The five seals are dark. Use the silver key in the slot beneath them, then read their poses.');",
    "    if (state.room === 'continuity_chamber' && /^(?:for )?names$|^(?:the )?room about seals$/.test(t)) return print(state.flags.keyUsed ? 'Start at the uppermost lit seal and follow the engraved arrow clockwise. Match each pose to one of the five cats you met.' : 'The five seals are dark. Use the silver key in the visible slot beneath them, then follow the engraved arrow.');",
)
replace_once(
    "game.js",
    "      if (!/\\bboo\\b.*\\bsalem\\b.*\\bash\\b.*\\bluna\\b.*\\bmerlin\\b/.test(t)) return print('The five seals flicker, then go dark. Match their poses from left to right.');",
    "      if (!/\\bboo\\b.*\\bsalem\\b.*\\bash\\b.*\\bluna\\b.*\\bmerlin\\b/.test(t)) return print('The five seals flicker, then go dark. Start at the uppermost seal and follow the engraved arrow clockwise.');",
)
replace_once(
    "game.js",
    '    if (state.room === \'archives\' && /luna|cat/.test(t)) return print("Luna retreats farther beneath the ledger when you mention the stair. Strong no.");',
    '    if (state.room === \'archives\' && /luna|cat/.test(t)) return print("Luna retreats farther into the open arch beneath the stone reading stand when you mention the stair. Strong no.");',
)
replace_once(
    "game.js",
    '    if (state.room === \'occult_compliance\' && c.verb === \'touch\' && hasWord(c.objectText, \'drawings\')) return print("The frames are cold beneath your fingers. Angela, Julia, and Audrey each drew the same door; their signatures are the three witnesses.");',
    '    if (state.room === \'occult_compliance\' && c.verb === \'touch\' && hasWord(c.objectText, \'drawings\')) return print("The frames are cold beneath your fingers. Angela, Julia, and Audrey each drew the same impossible building; the same marked door dominates all three views.");',
)
insert_before(
    "game.js",
    "    if (state.room === 'archives' && c.verb === 'search' && hasWord(c.objectText, 'cabinets'))",
    '''    if (state.room === 'archives' && ['push','pull'].includes(c.verb) && /(?:stand|reading stand|pedestal)/.test(c.objectText))
      return print('The broad stone reading stand is mortared to the floor. Bureaucracy has prepared it for resistance literally.');
''',
)
replace_once(
    "game.js",
    '''    if (c.verb === 'stamp' && (hasWord(c.objectText, 'contract') || hasWord(c.objectText, 'form') || hasWord(c.objectText, '66-b') || hasWord(c.objectText, '66b')))
      return print('Waiver Stamp 4C and Form 66-B are submitted separately to Procurement. Put the form in the FORM slot and the stamp in the WAIVER slot; do not stamp the contract or form directly.');''',
    '''    if (c.verb === 'stamp') return stampThing(c);''',
)
replace_once(
    "game.js",
    "    if (state.room === 'procurement' && c.verb === 'buy' && hasWord(c.objectText, 'candle')) return print('The requisition machine does not take money. Feed it Form 66-B and Waiver Stamp 4C to receive the black candle.');",
    "    if (state.room === 'procurement' && c.verb === 'buy' && hasWord(c.objectText, 'candle')) return print('The requisition machine does not take money. Insert completed Form 66-B and stamped Waiver Form 4C to receive the black candle.');",
)
replace_once(
    "game.js",
    "        luna: 'Luna allows a brief touch, then retreats beneath the ledger. She has better instincts than you.',",
    "        luna: 'Luna allows a brief touch, then retreats into the open arch beneath the stone reading stand. She has better instincts than you.',",
)
replace_once(
    "game.js",
    "        luna: {smell: 'Luna smells of dry paper from beneath the ledger.', listen: 'Luna breathes softly beneath the ledger pedestal. She is hiding from something below.', lick: 'Luna slips farther beneath the ledger. Leave the frightened cat alone.'},",
    "        luna: {smell: 'Luna smells of dry paper from beneath the stone reading stand.', listen: 'Luna breathes softly in the open arch beneath the stand. She is hiding from something below.', lick: 'Luna slips farther beneath the stand. Leave the frightened cat alone.'},",
)
replace_once(
    "game.js",
    "        ledger: 'The ledger is heavy and dry beneath your fingers. Luna stays hidden under its pedestal.',",
    "        ledger: 'The ledger is heavy, dry, and chained to the stone reading stand. Luna stays hidden in the open arch beneath the stand.',",
)
replace_once(
    "game.js",
    '''      legal_annex: state.flags.stampTaken ? "Procurement wants a form and a waiver." : "Read the contract. Then acquire the waiver stamp by a method Legal would dislike.",
      procurement: "Insert Form 66-B and Waiver Stamp 4C into the machine.",''',
    '''      legal_annex: state.flags.waiverStamped ? "Take the completed Form 66-B and stamped Waiver Form 4C to Procurement." : state.flags.stampTaken ? "Take Page 64, then use Waiver Stamp 4C on that detachable waiver paper." : "Read the contract. Take detachable Waiver Form 4C, then acquire the rubber stamp by a method Legal would dislike.",
      procurement: "Insert completed Form 66-B into FORM and stamped Waiver Form 4C into WAIVER.",''',
)
replace_once(
    "game.js",
    '      continuity_chamber: state.flags.keyUsed ? "Five household anchors. Five cats. Name them all." : "Use the silver key first.",\n      parking_exit: "You won. Please stop requesting assistance."',
    '      continuity_chamber: state.flags.keyUsed ? "Five household anchors. Follow the engraved arrow clockwise and name the cats by their poses." : "Use the silver key first.",\n      asset_control: "Return every registered state asset before going east. RETURN ALL is accepted.",\n      parking_exit: "You won. Please stop requesting assistance."',
)
replace_once(
    "game.js",
    '''    const visible = [...(room.items || []), ...Object.keys(state.dropped).filter(id => state.dropped[id] === state.room)]
      .filter(id => !state.taken.includes(id) || !DORK_DATA.items[id].portable || state.dropped[id] === state.room);
    if (visible.length) print(`Visible: ${visible.map(id=>DORK_DATA.items[id].name).join(', ')}.`, 'dim');
    const exits = Object.keys(room.exits || {}); if (exits.length) print(`Exits: ${exits.join(', ')}.`, 'dim');
    updateStatus();''',
    '''    const visible = [...(room.items || []), ...Object.keys(state.dropped).filter(id => state.dropped[id] === state.room)]
      .filter(id => !state.taken.includes(id) || !DORK_DATA.items[id].portable || state.dropped[id] === state.room);
    if (visible.length) print(`Visible: ${visible.map(id=>DORK_DATA.items[id].name).join(', ')}.`, 'dim');
    const exits = Object.keys(room.exits || {}); if (exits.length) print(`Exits: ${exits.join(', ')}.`, 'dim');
    if (state.room === 'asset_control') {
      const assets = carriedGovernmentProperty();
      print(assets.length ? `SCANNER FLAGS: ${assetList(assets)}.` : 'SCANNER: NO STATE PROPERTY DETECTED. EAST DOOR GREEN.', 'dim');
    }
    updateStatus();''',
)
replace_once(
    "game.js",
    "    const labels = { darkness:'Entered unlit continuity infrastructure', orientation:'Failed mandatory orientation', jorge:'Initiated unauthorized Jorge interaction', cat:'Committed an unforgivable policy violation', contract:'Executed contract without adequate review' };",
    "    const labels = { darkness:'Entered unlit continuity infrastructure', orientation:'Failed mandatory orientation', jorge:'Initiated unauthorized Jorge interaction', cat:'Committed an unforgivable policy violation', contract:'Executed contract without adequate review', property:'Attempted unauthorized removal of state property' };",
)
replace_once(
    "game.js",
    '    print("DORK understands a broad parser vocabulary. Useful examples:\\n\\nLOOK / EXAMINE POSTER / TAKE PENCIL / DROP PENCIL\\nN, S, E, W or NORTH, SOUTH, EAST, WEST\\nUSE SCREWDRIVER ON PANEL / GIVE PARCEL TO RECEPTIONIST\\nTALK TO RECEPTIONIST / ASK RECEPTIONIST ABOUT HOURS\\nOPEN DRAWER / READ NOTICE / INVENTORY / LEAVE ROOM\\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\\n\\nMeta commands: HINT, DEATHS, LORE, SAVE, RESTART.\\n\\nTry unreasonable things. The game has opinions.");',
    '    print("DORK understands a broad parser vocabulary. Useful examples:\\n\\nLOOK / EXAMINE POSTER / TAKE PENCIL / DROP PENCIL\\nN, S, E, W or NORTH, SOUTH, EAST, WEST\\nUSE SCREWDRIVER ON PANEL / GIVE PARCEL TO RECEPTIONIST\\nTALK TO RECEPTIONIST / ASK RECEPTIONIST ABOUT HOURS\\nOPEN DRAWER / READ NOTICE / MAKE A JOKE / INVENTORY / LEAVE ROOM\\nRETURN ALL works at an authorized property-return station.\\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\\n\\nMeta commands: HINT, DEATHS, LORE, SAVE, RESTART.\\n\\nTry unreasonable things. The game has opinions.");',
)

# ---------------------------------------------------------------------------
# Solution and changelog.
# ---------------------------------------------------------------------------
replace_once(
    "SOLUTION.md",
    '''Take the badge; visit the break room for Jorge's creamer; give it to him in
Records. Take Form 66-B in the stacks. Open the Legal stamp box with your badge.
Insert the form and stamp in Procurement. Choose The Tower in HR. Read the
Compliance manual, then light the black candle in the Archives before taking
the east stair. In the chamber, use the silver key and name the cats in seal
order: Boo, Salem, Ash, Luna, Merlin. Go east through the released door.
''',
    '''Take the badge; visit the break room for Jorge's creamer; give it to him in
Records. Take the already-completed Form 66-B in the stacks. In Legal, take the
detachable Waiver Form 4C, open the acrylic box with the visitor badge, and use
Waiver Stamp 4C on the waiver paper. Insert Form 66-B in Procurement's FORM slot
and the stamped waiver in its WAIVER slot. Choose The Tower in HR. Read the
Compliance manual, then twist/light the black emergency candle in the Archives
before taking the east stair. In the chamber, use the silver key. Starting at the
uppermost seal and following the engraved arrow clockwise, name the cats by pose:
Boo, Salem, Ash, Luna, Merlin. Go east into Asset Control, RETURN ALL registered
state property, then go east again. Leaving with government property terminates
the run.
''',
)
insert_after(
    "CHANGELOG.md",
    "# Dork changelog\n",
    '''
## 2026-10-12 - Shalisa playtest revision

- Establish the 4:30–5:00 meeting schedule and the stopped 5:17 wall clock; mark the Executive Corridor as Floor 6.
- Make the break-room memo wall-mounted and nonportable, Form 66-B visibly pre-completed, and the Procurement receipt a real employee-copy item.
- Replace the nonsensical stamp-in-slot workflow with a detachable Waiver Form 4C that must be stamped and then submitted as paper.
- Add authored joke responses, self-lighting candle hardware and clearer unlit-candle failure feedback.
- Reconcile the building/door drawings, clarify Luna's reading-stand hiding place, and support furniture-inspection attempts.
- Expose the final key slot, consume the inserted key, and preserve the cat deduction by revealing poses rather than names in clockwise order.
- Add an Asset Control Vestibule: attempting to leave with registered state property now causes termination; RETURN ALL permits the true ending.
- Expand browser regressions for all revised interactions and save migrations.
''',
)

# ---------------------------------------------------------------------------
# Existing full browser test route and focused regressions.
# ---------------------------------------------------------------------------
replace_once(
    "browser_test.py",
    '            assert {"mug", "creamer", "napkin", "memo"}.issubset(set(await page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")))',
    '            assert {"mug", "creamer", "napkin"}.issubset(set(await page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")))\n            assert "memo" not in await page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")',
)
replace_once(
    "browser_test.py",
    '            await command(page, "insert form into machine")\n            await command(page, "insert stamp into machine")',
    '            await command(page, "insert form into machine")\n            await command(page, "use waiver stamp on waiver form")\n            await command(page, "insert waiver into machine")\n            assert "procurement_receipt" in await page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")',
)
replace_once(
    "browser_test.py",
    '''            await command(page, "apply key to seals")
            await command(page, "say boo salem ash luna merlin")
            await command(page, "east")
            assert "TRUE ENDING" in await page.locator("#output").inner_text(), (await page.locator("#output").inner_text())[-4500:]''',
    '''            await command(page, "apply key to seals")
            assert "silver_key" not in await page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            await command(page, "say boo salem ash luna merlin")
            await command(page, "east")
            assert await page.evaluate("JSON.parse(localStorage.dork_run_v1).room") == "asset_control"
            await command(page, "return all")
            await command(page, "east")
            assert "TRUE ENDING" in await page.locator("#output").inner_text(), (await page.locator("#output").inner_text())[-4500:]''',
)
replace_once(
    "browser_test.py",
    '''                                            "occult_compliance", "archives", "subbasement", "continuity_chamber",
                                            "parking_exit"}''',
    '''                                            "occult_compliance", "archives", "subbasement", "continuity_chamber",
                                            "asset_control", "parking_exit"}''',
)
replace_once(
    "browser_test.py",
    '''            await page.reload()
            await command(page, "east")
            ending = (await page.locator("#output").inner_text())[-1200:]''',
    '''            await page.reload()
            await command(page, "east")
            await command(page, "east")
            ending = (await page.locator("#output").inner_text())[-1200:]''',
)
replace_once(
    "browser_test.py",
    '            assert "Visible: agenda folder, visitor badge, glass of water." in await fix_page.locator("#output").inner_text()',
    '            assert "Visible: agenda folder, visitor badge, glass of water, wall clock." in await fix_page.locator("#output").inner_text()',
)
replace_once(
    "browser_test.py",
    '            await fix_page.evaluate("localStorage.setItem(\'dork_run_v1\', JSON.stringify({room:\'procurement\', inventory:[\'badge\',\'form66b\',\'waiver_stamp\'], taken:[\'badge\',\'form66b\',\'waiver_stamp\'], dropped:{}, flags:{}, visited:[\'procurement\'], dead:false, won:false}))")',
    '            await fix_page.evaluate("localStorage.setItem(\'dork_run_v1\', JSON.stringify({room:\'procurement\', inventory:[\'badge\',\'form66b\',\'waiver_stamp\',\'waiver_form\'], taken:[\'badge\',\'form66b\',\'waiver_stamp\',\'waiver_form\'], dropped:{}, flags:{}, visited:[\'procurement\'], dead:false, won:false}))")',
)
replace_once(
    "browser_test.py",
    '''            await command(fix_page, "insert stamp into machine")
            inventory = await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert "form66b" not in inventory and "waiver_stamp" not in inventory and inventory.count("silver_key") == 1''',
    '''            await command(fix_page, "insert waiver into machine")
            assert "Stamp Waiver Form 4C" in await fix_page.locator("#output p").last.inner_text()
            await command(fix_page, "use waiver stamp on waiver form")
            await command(fix_page, "insert waiver into machine")
            inventory = await fix_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert "form66b" not in inventory and "waiver_form" not in inventory
            assert "waiver_stamp" in inventory and inventory.count("silver_key") == 1 and "procurement_receipt" in inventory''',
)
replace_once(
    "browser_test.py",
    '''            await set_run(review_page, "legal_annex", inventory=["waiver_stamp"],
                          taken=["waiver_stamp"], flags={"stampTaken": True})
            await command(review_page, "read page 64")
            assert "already removed" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use waiver stamp on continuity contract")
            assert "submitted separately to Procurement" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "records_stacks", inventory=["form66b", "waiver_stamp"],
                          taken=["form66b", "waiver_stamp"], flags={"stampTaken": True})
            await command(review_page, "stamp Form 66-B")
            assert "submitted separately to Procurement" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use waiver stamp on Form 66-B")
            assert "submitted separately to Procurement" in await review_page.locator("#output p").last.inner_text()''',
    '''            await set_run(review_page, "legal_annex", inventory=["waiver_stamp", "waiver_form"],
                          taken=["waiver_stamp", "waiver_form"], flags={"stampTaken": True})
            await command(review_page, "read page 64")
            assert "still needs Waiver Stamp 4C" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use waiver stamp on continuity contract")
            assert "Do not stamp the contract" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use waiver stamp on waiver form")
            assert (await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("waiverStamped")

            await set_run(review_page, "records_stacks", inventory=["form66b", "waiver_stamp"],
                          taken=["form66b", "waiver_stamp"], flags={"stampTaken": True})
            await command(review_page, "stamp Form 66-B")
            assert "already completed" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "use waiver stamp on Form 66-B")
            assert "detachable Waiver Form 4C" in await review_page.locator("#output p").last.inner_text()''',
)
insert_before(
    "browser_test.py",
    '            assert not errors, errors\n            print("Dork browser path, autosave, restart, death persistence, parser, input aliases, blind-playtest fixes and narrow viewport: OK")',
    '''            # Shalisa playtest regressions.
            await set_run(review_page, "meeting")
            opening = await review_page.locator("#output").inner_text()
            assert "4:30 PM" in opening and "5:17" in opening
            await command(review_page, "what time is it")
            assert "after-5:00" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "east")
            await command(review_page, "examine directory")
            assert "YOU ARE HERE — FLOOR 6" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "break_room")
            await command(review_page, "take memo")
            assert "bolted to the wall" in await review_page.locator("#output p").last.inner_text()
            assert "memo" not in await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")

            await set_run(review_page, "records_stacks")
            await command(review_page, "read file")
            await command(review_page, "make a joke")
            assert "HUMOR RESPONSE CONFIRMED" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "read form 66-b")
            assert "already completed" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "archives", inventory=["black_candle"], taken=["black_candle"])
            await command(review_page, "take candle out")
            assert not (await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("candleLit")
            await command(review_page, "east")
            deaths = await review_page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")
            assert deaths[-1] == "Entered unlit continuity infrastructure"

            await set_run(review_page, "archives", inventory=["black_candle"], taken=["black_candle"])
            await command(review_page, "twist candle")
            assert (await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).flags")).get("candleLit")
            assert "striker cap" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "look under ledger")
            assert "beneath the stand, not beneath the book" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "move pedestal")
            assert "mortared to the floor" in await review_page.locator("#output p").last.inner_text()
            await command(review_page, "lift ledger")
            assert "chained to the stone reading stand" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "occult_compliance")
            await command(review_page, "examine drawings")
            drawing_text = await review_page.locator("#output p").last.inner_text()
            assert "impossible building" in drawing_text and "enormous door" in drawing_text

            await set_run(review_page, "continuity_chamber", inventory=["silver_key"], taken=["silver_key"])
            chamber = await review_page.locator("#output").inner_text()
            assert "silver key slot" in chamber and "clockwise" in chamber
            await command(review_page, "use silver key on door")
            key_reply = await review_page.locator("#output p").last.inner_text()
            assert "silver_key" not in await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert all(name not in key_reply for name in ("Salem", "Ash", "Luna", "Merlin"))
            await command(review_page, "take key")
            assert "locked into the continuity mechanism" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "procurement", inventory=["form66b", "waiver_form", "waiver_stamp"],
                          taken=["form66b", "waiver_form", "waiver_stamp"], flags={"waiverStamped": True})
            await command(review_page, "insert form into machine")
            await command(review_page, "insert waiver into machine")
            inventory = await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert "procurement_receipt" in inventory and "waiver_stamp" in inventory
            await command(review_page, "read receipt")
            assert "EMPLOYEE COPY" in await review_page.locator("#output p").last.inner_text()

            await set_run(review_page, "asset_control", inventory=["badge", "black_candle", "waiver_stamp", "procurement_receipt"],
                          taken=["badge", "black_candle", "waiver_stamp", "procurement_receipt"])
            await command(review_page, "east")
            deaths = await review_page.evaluate("JSON.parse(localStorage.dork_meta_v1).deaths")
            assert deaths[-1] == "Attempted unauthorized removal of state property"

            await set_run(review_page, "asset_control", inventory=["badge", "black_candle", "waiver_stamp", "procurement_receipt"],
                          taken=["badge", "black_candle", "waiver_stamp", "procurement_receipt"])
            await command(review_page, "return all")
            inventory = await review_page.evaluate("JSON.parse(localStorage.dork_run_v1).inventory")
            assert inventory == ["procurement_receipt"]
            await command(review_page, "east")
            assert "TRUE ENDING" in await review_page.locator("#output").inner_text()

''',
)

print("Shalisa playtest fixes applied.")
