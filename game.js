(() => {
  const $ = (s) => document.querySelector(s);
  const out = $('#output');
  const input = $('#commandInput');
  const form = $('#commandForm');
  const runStatus = $('#runStatus');
  const roomStatus = $('#roomStatus');

  const META_KEY = 'dork_meta_v1';
  const RUN_KEY = 'dork_run_v1';

  const meta = Object.assign({ runs: 1, deaths: [], lore: [], hints: 0, won: false }, load(META_KEY, {}));
  let state = Object.assign(newRun(), load(RUN_KEY, {}));
  let restartPending = false;
  if (!DORK_DATA.rooms[state.room]) state = newRun();
  if (!state.dropped || typeof state.dropped !== 'object') state.dropped = {};

  const verbMap = buildVerbMap({
    look: ['look','l','observe','view','see','survey','glance','peer','stare'],
    examine: ['examine','x','inspect','study','check','investigate','analyze','analyse','read','review'],
    take: ['take','get','grab','pick','pickup','collect','yoink','acquire','obtain','snag','steal'],
    drop: ['drop','discard','ditch','release'],
    leave: ['leave','exit','depart'],
    inventory: ['inventory','inv','i','items','stuff','possessions'],
    open: ['open','unseal','unlock','pry'],
    close: ['close','shut','seal'],
    use: ['use','apply','operate','activate','insert','put','place','select','choose','present','show'],
    give: ['give','offer','hand','feed'],
    talk: ['talk','speak','chat','address','greet','say','ask','tell'],
    attack: ['attack','hit','punch','kick','fight','stab','kill','murder','smack','strike','bash'],
    touch: ['touch','feel','poke','prod','pet','stroke','hug'],
    lick: ['lick','taste','tongue'],
    smell: ['smell','sniff'],
    listen: ['listen','hear'],
    push: ['push','shove','press'],
    pull: ['pull','yank','tug'],
    break: ['break','smash','destroy','crush','wreck'],
    burn: ['burn','ignite','light','torch','incinerate'],
    eat: ['eat','chew','bite','consume'],
    drink: ['drink','sip','gulp'],
    wear: ['wear','puton','don'],
    throw: ['throw','toss','hurl','chuck'],
    climb: ['climb','scale','ascend'],
    hide: ['hide','conceal','duck'],
    sit: ['sit','rest'],
    pray: ['pray','worship','invoke','beg'],
    threaten: ['threaten','intimidate','menace'],
    flatter: ['flatter','compliment','praise'],
    dance: ['dance','boogie'],
    sing: ['sing','hum'],
    jump: ['jump','leap','hop'],
    wait: ['wait','z'],
    help: ['help','commands','verbs','?'],
    hint: ['hint','clue','assist'],
    restart: ['restart'],
    sign: ['sign','autograph','initial'],
    refuse: ['refuse','reject','decline'],
    deaths: ['deaths','deathlog','obituary'],
    lore: ['lore','journal','archive'],
    save: ['save'],
    north: ['north','n'], south: ['south','s'], east: ['east','e'], west: ['west','w']
  });

  const generic = {
    touch: ["You touch {o}. It does not improve the situation.", "{O} tolerates this briefly."],
    lick: ["You lick {o}. The narrator records this without comment. The narrator is lying.", "{O} tastes like dust, copper, and a decision you can no longer defend."],
    smell: ["{O} smells institutional.", "You smell {o}. There are easier ways to disappoint your ancestors."],
    listen: ["You listen to {o}. Mostly, you hear the building pretending to be empty."],
    push: ["You push {o}. Bureaucracy has prepared it for resistance."],
    pull: ["You pull {o}. Nothing useful happens, which makes it unusually compliant."],
    break: ["You attempt to break {o}. The Agency has already budgeted for your failure."],
    burn: ["Setting {o} on fire would create paperwork. Even here, some lines remain uncrossed."],
    eat: ["You consider eating {o}. This thought is permitted to pass without action."],
    drink: ["Drinking {o} would be medically uninteresting and administratively inconvenient."],
    wear: ["You try to wear {o}. It does not become fashion through confidence alone."],
    throw: ["You throw {o}. It lands with the dignity of a midyear performance review."],
    climb: ["You assess {o} for climbability. Your assessment is negative."],
    hide: ["You attempt to hide near {o}. You are a grown executive crouching in a government building. Reflect on this."],
    sit: ["You sit near {o}. The building continues without your leadership."],
    pray: ["You pray to {o}. Something, somewhere, marks the request as received."],
    threaten: ["You threaten {o}. Your executive presence is noted and ignored."],
    flatter: ["You compliment {o}. This is beneath both of you."],
    dance: ["You dance. There are no witnesses you can prove exist."],
    sing: ["You sing. The fluorescent lights dim in what may be self-defense."],
    jump: ["You jump. Gravity remains the only agency function operating normally."],
    wait: ["You wait. Somewhere, a deadline becomes overdue."]
  };

  boot();

  function boot() {
    print(`<div class="title">DORK</div><div class="dim">A SCOTT ADVENTURE</div>`, '', true);
    print(`You are Scott. Somewhere, trouble has already completed the necessary forms.`);
    if (meta.deaths.length) print(`The system remembers ${meta.deaths.length} prior separation event${meta.deaths.length === 1 ? '' : 's'}. It is trying not to look pleased.`, 'dim');
    describeRoom();
    updateStatus();
    input.focus();
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); const c = input.value.trim(); input.value = ''; if (c) execute(c); });
  document.querySelectorAll('[data-command]').forEach(b => b.addEventListener('click', () => { execute(b.dataset.command); input.focus(); }));
  document.addEventListener('click', (e) => { if (!e.target.closest('button')) input.focus(); });

  function execute(raw) {
    print(`> ${raw}`, 'dim');
    if (restartPending && raw.toLowerCase().trim() !== 'restart') restartPending = false;
    const cmd = parse(raw);
    if (!cmd) return print("That sentence has defeated both you and the parser. Rephrase it with fewer ambitions.");
    if (cmd.verb === 'restart' && raw.toLowerCase().trim() !== 'restart') {
      restartPending = false;
      return print('Type RESTART by itself if you want to begin again.');
    }
    if (state.dead && !['restart','deaths','lore','help'].includes(cmd.verb)) {
      return print("You are dead. Even state government has limits. Type RESTART.");
    }
    if (state.won && !['restart','deaths','lore','help','look','inventory'].includes(cmd.verb)) {
      return print("You've already left. The Agency cannot approve further activity from outside its walls.");
    }
    if (['north','south','east','west'].includes(cmd.verb)) {
      move(cmd.verb);
      saveRun(); updateStatus(); scrollBottom();
      return;
    }
    const fn = actions[cmd.verb];
    if (fn) fn(cmd);
    else genericAction(cmd);
    saveRun(); updateStatus(); scrollBottom();
  }

  function parse(raw) {
    const cleaned = raw.trim() === '?' ? 'help' : raw.toLowerCase().replace(/[!?.,]/g,' ').replace(/\s+/g,' ').trim();
    if (!cleaned) return null;
    if (/^(?:look around|look room|look here|look at room|examine room|survey)$/.test(cleaned)) return {verb:'look', objectText:'', targetText:'', raw};
    if (/^(?:check inventory|look in bag|check my stuff)$/.test(cleaned)) return {verb:'inventory', objectText:'', targetText:'', raw};
    if (/^(?:ask for help|ask for a hint)$/.test(cleaned)) return {verb:cleaned.endsWith('hint') ? 'hint' : 'help', objectText:'', targetText:'', raw};
    if (/^(?:take all items|grab all of it)$/.test(cleaned)) return {verb:'take', objectText:'all', targetText:'', raw};
    if (/^(?:get out(?: of here)?|go out(?:side)?|go out (?:the )?door|walk out(?: (?:the )?door)?|exit)$/.test(cleaned)) return {verb:'leave', objectText:'', targetText:'', raw};
    if (/^(?:enter|step through) (?:the )?gate$/.test(cleaned)) return {verb:'exitAlias', objectText:'gate', targetText:'', raw};
    if (/^(?:call|summon) (?:the )?elevator$/.test(cleaned)) return {verb:'push', objectText:'elevator button', targetText:'', raw};
    if (/^(?:shuffle|mix) (?:the )?(?:cards|tarot|tarot spread)$/.test(cleaned)) return {verb:'shuffle', objectText:'tarot spread', targetText:'', raw};
    const through = cleaned.match(/^(?:go|walk|move|head)\s+(?:through|into|to)\s+(?:the\s+)?(.+)$/);
    if (through) {
      const route = through[1].replace(/\s+(?:door|passage|exit|way)$/,'');
      const direction = verbMap[route];
      if (['north','south','east','west'].includes(direction)) return {verb:direction, objectText:'', targetText:'', raw};
      return {verb:'exitAlias', objectText:route, targetText:'', raw};
    }
    if (/^(?:back|go back|return)$/.test(cleaned)) return {verb:'back', objectText:'', targetText:'', raw};
    if (/^(?:ride|enter|step into) (?:the )?elevator$/.test(cleaned)) return {verb:'exitAlias', objectText:'elevator', targetText:'', raw};
    if (/^(?:go|walk|move|head) down (?:the )?elevator$/.test(cleaned)) return {verb:'exitAlias', objectText:'elevator', targetText:'', raw};
    if (/^(?:(?:go|walk|move|head|take|use|climb)\s+)?(?:down|up|downstairs|upstairs|stairs|elevator)$/.test(cleaned) || cleaned === 'descend') {
      const alias = /elevator/.test(cleaned) ? 'elevator' : /stairs/.test(cleaned) && !/downstairs|upstairs/.test(cleaned) ? 'stairs' : /up/.test(cleaned) ? 'up' : 'down';
      return {verb:'exitAlias', objectText:alias, targetText:'', raw};
    }
    if (/^(?:go|walk|move|head|climb)\s+(?:down|up)\s+(?:the\s+)?stairs?$/.test(cleaned))
      return {verb:'exitAlias', objectText:/\bup\b/.test(cleaned) ? 'up' : 'down', targetText:'', raw};
    const words = cleaned.split(' ');
    let verbToken = words.shift();
    if (verbToken === 'pick' && words[0] === 'up') { words.shift(); verbToken = 'pickup'; }
    if (verbToken === 'put' && words[0] === 'on') { words.shift(); verbToken = 'puton'; }
    if (['go','walk','move','travel','head','proceed'].includes(verbToken) && words.length) {
      const d = verbMap[words[0]] || words[0];
      if (['north','south','east','west'].includes(d)) return { verb:d, objectText:'', targetText:'', raw, verbToken };
    }
    const verb = verbMap[verbToken] || verbToken;
    let rest = words.join(' ').replace(/^(the|a|an)\s+/,'').replace(/^at\s+/,'');
    if (['listen', 'pray'].includes(verb)) rest = rest.replace(/^to\s+/,'');
    const split = rest.split(/\s+(?:on|with|to|into|in|at|using)\s+/);
    return { verb, objectText: split[0] || '', targetText: split[1] || '', raw, verbToken };
  }

    const actions = {
    look: (c) => c.objectText ? examine(c.objectText) : describeRoom(true),
    examine: (c) => examine(c.objectText),
    search: (c) => genericAction(c),
    inventory: inventory,
    take: (c) => c.objectText === 'all' || c.objectText === 'everything' ? takeAll() : chooseCard(c) || take(c.objectText),
    drop: (c) => ['all','everything'].includes(c.objectText) ? dropAll() : drop(c.objectText),
    leave: (c) => {
      if (findInventory(c.objectText)) return drop(c.objectText);
      leaveRoom();
    },
    back: () => {
      const direction = Object.keys(roomNow().exits || {}).find(d => roomNow().exits[d] === state.previousRoom);
      if (direction) move(direction);
      else print('There is no direct way back. The building enjoys this distinction.');
    },
    exitAlias: (c) => {
      const direction = roomNow().exitAliases?.[c.objectText];
      if (direction) move(direction);
      else if (state.room === 'records_lobby' && c.objectText === 'gate') move('south');
      else if (state.room === 'elevator' && c.objectText === 'elevator') print('You are already in the elevator. The buttons are dead; west returns to the corridor.');
      else if (state.room === 'subbasement' && /parking|roots/.test(c.objectText)) print('Black roots have collapsed the parking passage. The marked route east leads to the Continuity Chamber.');
      else print(`There is no ${c.objectText} route from here.`);
    },
    open: (c) => openThing(c.objectText),
    use: (c) => chooseCard(c) || useThing(c),
    burn: (c) => {
      if (hasWord(c.objectText, 'candle')) return useThing({objectText:c.objectText,targetText:'',raw:c.raw});
      genericAction(c);
    },
    give: useThing,
    touch: (c) => chooseCard(c) || genericAction(c),
    talk: talkThing,
    attack: attackThing,
    help: help,
    hint: hint,
    restart: () => restart(false),
    sign: (c) => {
      const target = `${c.objectText} ${c.targetText}`;
      if (state.room === 'legal_annex' && hasWord(target, 'contract') && !/\b(?:not|never|refuse|dont|don't)\b/i.test(c.raw)) {
        return die('contract', "You sign the contract without reading the fine print.\n\nThis is especially embarrassing given the law degree.\n\nYour body remains employed after your death. Your benefits do not.");
      }
      print("You decline to make that signature binding. Legal seems disappointed to retain only your attention.");
    },
    refuse: (c) => {
      if (state.room === 'legal_annex' && (hasWord(c.objectText, 'contract') || /\brefuse to sign\b/i.test(c.raw)))
        return print('You refuse the contract. Legal requires Waiver Stamp 4C to record that refusal; the stamp is locked in the acrylic box.');
      print(`You decline ${c.objectText || 'the offer'}. The Agency records your lack of enthusiasm.`);
    },
    deaths: showDeaths,
    lore: showLore,
    save: () => { saveRun(); print('Run state saved locally. Even bureaucracy occasionally works.'); }
  };

  function move(dir) {
    const room = roomNow();
    const dest = room.exits[dir];
    if (!dest) return print(`There is no useful way ${dir}. There may be a useless one.`);
    if (room.blocked && room.blocked[dir]) {
      const key = room.blocked[dir];
      if (key === 'jorge' && !state.flags.jorgeMoved) return print("Jorge occupies the southern gate with the passive completeness of a collapsed bridge.");
      if (key === 'tarot' && !state.flags.tarotSolved) return print("The east wall remains a wall. HR considers this a successful boundary.");
      if (key === 'final_seal' && !state.flags.finalOpen) return print("The final door does not open. Boo watches you fail with professional interest.");
    }
    if (dest === 'subbasement' && (!state.flags.candleLit || !state.inventory.includes('black_candle'))) return die('darkness', 'You descend without a light. Something waits until the stair door closes, because unlike you it understands timing. The sound is brief. The paperwork is not.');
    state.previousRoom = state.room;
    state.room = dest;
    if (!state.visited.includes(dest)) state.visited.push(dest);
    describeRoom();
    if (DORK_DATA.rooms[dest].ending) win();
  }

  function examine(text) {
    if (!text) return describeRoom(true);
    if (state.room === 'hr_reliquary' && /^(?:the )?wall$/.test(text)) return examine('east wall');
    if (state.room === 'meeting' && /\bwest door\b/.test(text)) return print('There is no west door anymore. The red EXIT sign points east to the corridor.');
    if (state.room === 'meeting' && /\b(?:calendar invitation|invitation)\b/.test(text)) return print("The invitation bore the Governor's name and called this an Executive Continuity Review. It said nothing about the missing west door.");
    if (state.room === 'meeting' && /\b(?:exit sign|east door)\b/.test(text)) return print('The red EXIT sign points east. The door beneath it leads to the corridor; the west door you entered through is gone.');
    if (state.room === 'records_lobby' && hasWord(text, 'gate')) return print(state.flags.jorgeMoved ? 'Jorge has rolled aside. The southern gate into the stacks is clear.' : 'Jorge and his desk block the southern gate into the stacks. He keeps glancing toward the break room.');
    if (state.room === 'records_lobby' && hasWord(text, 'clipboard')) return print(state.flags.jorgeMoved ? 'Jorge has resumed his clipboard duties. The southern gate is clear.' : "Jorge's clipboard lists a break-room delivery. He glances toward the creamer whenever you look at it.");
    if (state.room === 'meeting' && /\b(?:under table|beneath table)\b/.test(text)) return print('Beneath the table: polished legs, immaculate carpet, and no hidden exit. The red EXIT sign points east.');
    if (state.room === 'meeting' && hasWord(text, 'table')) return print('The polished table holds the agenda folder, visitor badge, and a glass of water with a skin. Nothing useful is hidden beneath it.');
    if (state.room === 'break_room' && /\b(?:fridge|refrigerator)\b/.test(text)) return print("The refrigerator is plastered with warnings about Jorge's creamer. Inside are expired lunches and no safer alternative.");
    if (state.room === 'break_room' && /\b(?:warning|note on fridge)\b/.test(text)) return print("The warning reserves the hazelnut creamer for Jorge. The fridge contains expired lunches and no useful substitute.");
    if (state.room === 'break_room' && /\b(?:vending machine|machine button)\b/.test(text)) return print('The vending machine lists one black candle as OUT OF STOCK. Procurement handles emergency supplies now.');
    if (state.room === 'legal_annex' && /\b(?:page 64|page sixty four|page sixty-four)\b/.test(text)) return print("Page sixty-four is the refusal clause: Waiver Stamp 4C records your refusal. The stamp is locked in the acrylic box.");
    const scenery = {
      executive_corridor: { directory: 'The directory lists ordinary floors, two basements, and BELOW. The elevator is out of service; Records lies south.', 'elevator button': 'The elevator call button is dark. The brass doors open east onto a car that goes nowhere.', lights: 'The fluorescent lights buzz overhead. They illuminate the corridor but offer no route out; Records lies south.' },
      records_lobby: { placard: 'JORGE — RECORDS MANAGEMENT SPECIALIST III. His desk blocks the southern gate to the stacks.' },
      records_stacks: { shelves: 'The shelves hold files dated years into the future. Shelf 20 bears a scratched warning beside Ash.', 'shelf 20': DORK_DATA.items.ash_note.desc },
      legal_annex: { sign: 'SIGNATURE REQUIRED, says the sign. The contract itself explains that refusal needs Waiver Stamp 4C.' },
      procurement: { slots: 'The brass machine has a FORM slot and a WAIVER slot. Its SOUL slot is taped over.', sign: 'The sign requires documented business necessity for every purchase, including exorcisms. The brass machine wants a form and a waiver.' },
      hr_reliquary: { 'east wall': state.flags.tarotSolved ? 'The east wall has split open. A passage leads into Occult Compliance.' : 'The east wall is solid, though cold air slips through. Merlin keeps pointing at The Tower.', table: 'The orientation table holds THE FOOL, THE TOWER, and THE SUN. Merlin keeps one paw near The Tower.' },
      occult_compliance: { inbox: 'Salem sleeps in the inbox tray marked ITEMS REQUIRING IMMEDIATE ACTION. The tray contains no useful paperwork.', desk: 'The desk holds Salem in the empty inbox. The compliance manual and three witness drawings carry the useful clues.', elevator: 'The freight elevator waits to the south. Its doors are open; the Archives are below.' },
      archives: { stair: 'The narrow stair descends east into darkness. Luna hides from it; take a lit candle with you.', cabinets: 'Filing cabinets are mortared into the limestone walls. The ledger on the pedestal is the record you can actually read.' },
      subbasement: { roots: 'Black roots have collapsed the parking passage. The marked way forward is east to the Continuity Chamber.', lights: 'The emergency lights are dead. Your black candle is the only useful light here.', arrow: 'The painted arrow points east to the Continuity Chamber. The parking passage is still blocked by black roots.', sign: 'There is no sign here. A painted arrow points east to the Continuity Chamber; black roots block the parking passage.' },
      continuity_chamber: { door: state.flags.finalOpen ? 'The eastern door stands open. You can leave.' : state.flags.keyUsed ? 'The key has woken five seals, but the eastern door still waits for their names.' : 'Five seals surround the eastern door. A silver key slot waits beneath them.' }
    };
    const detail = Object.entries(scenery[state.room] || {}).find(([phrase]) => hasWord(text, phrase));
    if (detail) return print(detail[1]);
    const id = findItem(text);
    if (!id) {
      if (/jorge/.test(text) && state.room === 'records_lobby') return print("Jorge is at least seven feet tall when seated, which raises questions you do not have clearance to ask. His smile contains excellent dental benefits.");
      return print(`You examine ${text}. It remains disappointingly nonspecific.`);
    }
    const item = DORK_DATA.items[id]; print(flagDescription(item));
    discoverLore(id);
  }

  function take(text) {
    const id = findItem(text, true);
    if (state.room === 'occult_compliance' && hasWord(text, 'inbox')) return print('The inbox is fixed to the desk, and Salem is asleep inside it. The tray contains no useful paperwork.');
    if (state.room === 'legal_annex' && hasWord(text, 'stamp') && state.flags.stampTaken) return print(state.inventory.includes('waiver_stamp') ? 'You already carry Waiver Stamp 4C. The acrylic box is empty.' : 'The acrylic box is open and empty. Waiver Stamp 4C is no longer here.');
    if (state.room === 'legal_annex' && hasWord(text, 'stamp') && !state.flags.stampTaken) return print('Waiver Stamp 4C is locked in the acrylic box. Your visitor badge might pry it open.');
    if (!id) return print(`You cannot find ${text || 'that'} here. This is one of your better outcomes tonight.`);
    const item = DORK_DATA.items[id];
    if (id === 'jorge') return print('You cannot take Jorge. Records has already tried transferring him. The forms came back bitten.');
    if (id === 'tarot_spread') return print('The tarot spread stays on the orientation table. Choose a card; Merlin favors The Tower.');
    if (id === 'drawings') return print("The children's drawings are fixed to the wall. Read their signatures here; the three witnesses matter later.");
    if (id === 'ledger') return print('The ledger is chained to its pedestal. Read it here before taking the eastern stair.');
    if (!item.portable && id === 'water') return print('You lift the glass, but the skin on the water stirs. You set it back on the table.');
    if (!item.portable) return print(`You attempt to take ${item.name}. It declines the transfer.`);
    if (state.inventory.includes(id)) return print(`You already have ${item.name}. Hoarding is not leadership.`);
    state.inventory.push(id); if (!state.taken.includes(id)) state.taken.push(id);
    delete state.dropped[id]; print(`Taken: ${item.name}.`);
  }

  function takeAll() {
    const here = [...(roomNow().items || []), ...Object.keys(state.dropped).filter(id => state.dropped[id] === state.room)];
    const available = [...new Set(here)].filter(id => DORK_DATA.items[id].portable &&
      (!state.taken.includes(id) || state.dropped[id] === state.room) && !state.inventory.includes(id));
    if (!available.length) return print('There is nothing portable left here. The building retains ownership of the rest.');
    available.forEach(id => take(DORK_DATA.items[id].aliases[0]));
  }

  function leaveRoom() {
    const exits = Object.keys(roomNow().exits || {});
    if (!exits.length) return print('There is no way out from here.');
    if (exits.length > 1) return print(`You can leave by going ${exits.join(', ')}. Choose a direction.`);
    move(exits[0]);
  }

  function drop(text) {
    const id = findInventory(text); if (!id) return print("You are not carrying that.");
    state.inventory = state.inventory.filter(x => x !== id);
    state.dropped[id] = state.room;
    print(`Dropped: ${DORK_DATA.items[id].name}. You immediately distrust the decision.`);
  }
  function dropAll() {
    if (!state.inventory.length) return print('You are carrying nothing to drop. Efficient, for once.');
    [...state.inventory].forEach(id => drop(DORK_DATA.items[id].aliases[0]));
  }

  function chooseCard(c) {
    if (state.room !== 'hr_reliquary') return false;
    const id = findItem(c.objectText, true);
    if (!['fool','tower','sun'].includes(id)) return false;
    if (c.verb === 'take' && c.verbToken === 'take' && id !== 'tower') {
      print('Choose a card. Do not pocket it.'); return true;
    }
    useThing({...c, objectText:id}); return true;
  }

  function openThing(text) {
    const id = findInventory(text) || findItem(text);
    if (['ash','merlin','salem','luna','boo','jorge'].includes(id)) return print(`${DORK_DATA.items[id].name} is a living being, not a container. Try talking instead.`);
    if (['memo','ash_note','contract','compliance_manual','drawings','final_plaque','form66b','napkin'].includes(id)) return examine(text);
    if (id === 'badge') return print('The visitor badge is a solid plastic card. It may still be useful as a pry tool.');
    if (id === 'water') return print('The glass is already open. The skin across the water makes drinking it a separate bad idea.');
    if (id === 'mug') return print('The mug has no lid. Its chipped rim is the least alarming thing in this room.');
    if (id === 'creamer') return print('The creamer cup has a peel-back seal. Jorge in Records is its intended recipient.');
    if (id === 'tarot_spread') return print('The three cards are already laid out. Choose one; Merlin keeps pointing at The Tower.');
    if (id === 'requisition_machine') return print(state.flags.procured ? 'The requisition drawer stands open and empty. The machine has issued everything it intends to.' : 'The requisition drawer is shut. Feed the FORM and WAIVER slots before expecting a candle or key.');
    if (id === 'fool') return print('The Fool is a flat card, not a door. Its traveler approaches a cliff without reading the signage.');
    if (id === 'tower') return print('The Tower is a flat card. Its lightning-struck building is marked CHANGE MANAGEMENT.');
    if (id === 'sun') return print('The Sun is a flat card. Its cheerful radiance is precisely why it should worry you.');
    if (id === 'seals') return print(state.flags.keyUsed ? 'The five brass seals are lit, but each remains fixed in the door. Name the cats in the order their poses show.' : 'The five brass seals are fixed in the door. A silver key slot sits beneath them.');
    if (state.room === 'meeting' && hasWord(text, 'west door')) return print('The west door is gone. The only exit is east, beneath the red sign.');
    if (state.room === 'meeting' && hasWord(text, 'east door')) return print('The east door opens onto the Executive Corridor. Go east to leave the meeting room.');
    if (state.room === 'meeting' && hasWord(text, 'agenda')) return examine('agenda');
    if (state.room === 'break_room' && /\b(?:fridge|refrigerator)\b/.test(text)) return print("You open the refrigerator. Expired lunches crowd around Jorge's hazelnut creamer; the warning on the door is apparently for your benefit.");
    if (state.room === 'executive_corridor' && hasWord(text, 'elevator')) return print('The elevator doors open east, but the car is out of service. You can step in; it will not take you to another floor.');
    if (state.room === 'records_stacks' && hasWord(text, 'file')) return examine('file');
    if (state.room === 'archives' && hasWord(text, 'ledger')) return examine('ledger');
    if (state.room === 'occult_compliance' && hasWord(text, 'inbox')) return examine('inbox');
    if (state.room === 'archives' && hasWord(text, 'cabinets')) return print('The filing cabinets are mortared into the limestone walls. Their drawers cannot open; the ledger on its pedestal can be read.');
    if (state.room === 'subbasement' && /parking|passage/.test(text)) return print('Black roots have collapsed the parking passage. The painted arrow points east to the Continuity Chamber.');
    if (state.room === 'records_lobby' && hasWord(text, 'gate')) return move('south');
    if (state.room === 'continuity_chamber' && hasWord(text, 'door')) return examine('door');
    if (/box|stamp/.test(text) && state.room === 'legal_annex') {
      if (state.flags.stampTaken) return print('The acrylic box is already open and, like most safeguards, retrospectively decorative.');
      if (!state.inventory.includes('badge')) return print('The box needs a thin pry tool. Your visitor badge might survive the job.');
      state.flags.stampTaken = true; state.inventory.push('waiver_stamp'); print("You pry open the cheap acrylic box with the visitor badge. Law school did not teach this, but tuition has finally produced a return.\n\nTaken: Waiver Stamp 4C."); return;
    }
    if (/door|exit/.test(text)) return print("The relevant door is already participating as much as policy permits. Try a direction.");
    print(`You try to open ${text || 'that'}. Nothing opens except a small space in your schedule where optimism used to be.`);
  }

  function useThing(c) {
    const a = findInventory(c.objectText) || findItem(c.objectText);
    const b = c.targetText ? (findItem(c.targetText) || specialTarget(c.targetText)) : null;
    if (state.room === 'break_room' && hasWord(c.objectText, 'coffee machine')) return print('The coffee machine wheezes out something dark. The useful hazelnut creamer is reserved for Jorge in Records.');
    if (state.room === 'procurement' && /^(?:requisition )?machine$/.test(c.objectText)) return print('The requisition machine has FORM and WAIVER slots. Insert Form 66-B and Waiver Stamp 4C to request the candle and key.');

    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');

    if ((a === 'creamer' || /creamer/.test(c.objectText)) && (b === 'jorge' || state.room === 'records_lobby')) {
      if (state.room !== 'records_lobby') return print('Jorge is in Records. Even the Agency requires you to deliver his creamer in person.');
      if (!state.inventory.includes('creamer')) return print("You have no creamer. Jorge notices this before you do.");
      state.flags.jorgeMoved = true; state.inventory = state.inventory.filter(x => x !== 'creamer');
      print("You offer Jorge the hazelnut creamer.\n\nHe studies you. Then the creamer. Then you again.\n\n'Approved,' he says.\n\nHe drinks it directly from the little plastic cup without breaking eye contact and rolls his chair six feet sideways, clearing the gate. Nobody involved acknowledges the femur."); return;
    }

    if (state.room === 'procurement' && (a === 'form66b' || a === 'waiver_stamp' || /form|stamp/.test(c.objectText))) {
      if ((hasWord(c.objectText, 'form') && state.flags.formInserted) || (hasWord(c.objectText, 'stamp') && state.flags.stampInserted)) return print('The machine already has that. It is unusually possessive about paperwork.');
      if (!['form66b','waiver_stamp'].includes(a) || !state.inventory.includes(a)) return print('The machine requires a real form or waiver stamp in your possession. Imaginary paperwork is handled upstairs.');
      if (a === 'form66b') state.flags.formInserted = true;
      if (a === 'waiver_stamp') state.flags.stampInserted = true;
      state.inventory = state.inventory.filter(x => x !== a);
      print(`${DORK_DATA.items[a].name} accepted by the requisition machine.`);
      if (state.flags.formInserted && state.flags.stampInserted && !state.flags.procured) {
        state.flags.procured = true; ['black_candle','silver_key'].forEach(x => state.inventory.push(x));
        print("The machine groans like a committee reaching consensus. A drawer opens.\n\nIssued: BLACK EMERGENCY CANDLE.\nIssued: SILVER CONTINUITY KEY.\n\nA receipt prints for $0.00 and twelve human years.");
      }
      return;
    }

    if (state.room === 'hr_reliquary' && (a === 'tower' || /tower/.test(c.objectText))) {
      state.flags.tarotSolved = true; print("You select THE TOWER. Merlin purrs.\n\nThe east wall splits down the middle with the sound of a building reconsidering its benefits package. A passage appears.\n\nHR has successfully facilitated change."); return;
    }

    if (state.room === 'hr_reliquary' && (a === 'fool' || a === 'sun')) {
      return die('orientation', a === 'fool' ? "You select THE FOOL. HR appreciates your self-identification. The floor opens beneath you." : "You select THE SUN. It is not the sun. Your shadow notices first.");
    }

    if (state.room === 'continuity_chamber' && (a === 'silver_key' || /key/.test(c.objectText))) {
      if (!state.inventory.includes('silver_key')) return print('You need the silver key in your hand, not merely in a sentence.');
      state.flags.keyUsed = true; print("The silver key fits a slot beneath the five seals. It turns once. Five small lights wake above the door.\n\nThe chamber waits for names."); return;
    }

    if (a === 'black_candle' || hasWord(c.objectText, 'candle')) {
      if (!state.inventory.includes('black_candle')) return print('There is no candle in your inventory to light.');
      state.flags.candleLit = true; print("You light the black candle. Its flame is green. The tunnel ahead becomes visible enough to regret."); return;
    }

    if (a && !c.targetText) {
      const replies = {
        agenda: 'The agenda is for reading, not signing. Its five empty lines are the warning.',
        badge: 'The badge might pry open the acrylic stamp box in Legal. It will not open any electronic door.',
        water: 'The water has formed a skin. Drinking it would be a management decision, and you are not management here.',
        mug: 'The mug is empty. The break room has a coffee machine, but Jorge wants the hazelnut creamer.',
        creamer: 'The creamer is marked JORGE ONLY. Bring it to him at the Records gate.',
        memo: 'Read the memo. Its feeding policy is more useful than it deserves to be.',
        napkin: 'The napkin drawing says HOME IS A PASSWORD. Keep that in mind when you reach the final door.',
        jorge: state.flags.jorgeMoved ? 'Jorge has moved aside. The Records gate is clear; go south.' : 'Jorge is blocking the Records gate. He might accept the creamer from the break room.',
        form66b: 'Form 66-B belongs in the FORM slot of the Procurement machine, alongside Waiver Stamp 4C.',
        ash_note: 'Read the scratched warning on Shelf 20. Ash may know when to leave.',
        records_file: 'The personnel file is evidence, not equipment. Read what the Agency wrote about Scott.',
        contract: 'The contract wants a signature. Refuse it, then find Waiver Stamp 4C to document that refusal.',
        stamp_box: state.flags.stampTaken ? 'The acrylic box is open and empty.' : 'The acrylic box can be pried open with the visitor badge.',
        tarot_spread: 'Choose a card from the spread. Merlin keeps his paw by The Tower.',
        drawings: 'Read the three signatures. The drawings show the final door and its five cat-shaped marks.',
        compliance_manual: 'Read section 8.4 of the manual. It explains what wakes the final seals.',
        ledger: 'Read the ledger. The margin gives a clue about leaving the Agency.',
        seals: state.flags.keyUsed ? 'The five seals are awake. Read their poses and name the cats in order.' : 'The seals are dark. Put the silver key in the slot beneath them first.',
        final_plaque: 'Read the plaque. It offers a clue, though no escape authorization.'
      };
      if (replies[a]) return print(replies[a]);
      if (['ash','merlin','salem','luna','boo'].includes(a)) return print(`${DORK_DATA.items[a].name} is a cat, not a tool. Observe the cat; its pose may matter later.`);
    }

    if (a) return print(`You ${c.verbToken || 'use'} ${DORK_DATA.items[a].name}${b ? ` on ${typeof b === 'string' && DORK_DATA.items[b] ? DORK_DATA.items[b].name : c.targetText}` : ''}. The universe declines to recognize this workflow.`);
    print("Use what, exactly? Specificity is the thin line between magic and a meeting.");
  }

  function talkThing(c) {
    const t = `${c.objectText} ${c.targetText}`.trim();
    if (state.room === 'break_room' && hasWord(t, 'jorge')) return print('Jorge is at his Records desk to the south. His creamer is here beneath the JORGE ONLY warning.');
    if (state.room === 'subbasement' && /^(?:for )?(?:directions|way out|exit)$/.test(t)) return print('The painted arrow points east to the Continuity Chamber. Black roots block the parking passage.');
    if (state.room === 'continuity_chamber' && /^(?:for )?names$|^(?:the )?room about seals$/.test(t)) return print(state.flags.keyUsed ? 'Read the five lit seals from left to right. Their poses match the five cats you met; name each in that order.' : 'The five seals are dark. Use the silver key in the slot beneath them, then read their poses.');
    const names = ['boo','salem','ash','luna','merlin'];
    if (state.room === 'continuity_chamber' && state.flags.keyUsed && names.every(n => new RegExp(`\\b${n}\\b`).test(t))) {
      if (!/\bboo\b.*\bsalem\b.*\bash\b.*\bluna\b.*\bmerlin\b/.test(t)) return print('The five seals flicker, then go dark. Match their poses from left to right.');
      state.flags.finalOpen = true;
      print("You name them: BOO. SALEM. ASH. LUNA. MERLIN.\n\nOne by one, the brass seals illuminate. The enormous door unlocks with a sound like five hundred filing cabinets opening at once.\n\nBoo stands, stretches, and moves aside.\n\nFor the first time tonight, you have been cleared to leave."); return;
    }
    if (state.room === 'records_lobby' && /jorge/.test(t)) return print(state.flags.jorgeMoved ? "Jorge says, 'Records retention is forever.' He smiles. You suspect this is not metaphorical." : "Jorge looks up. 'Do you have something for me?'\n\nHis eyes move briefly toward the break-room side of the building.");
    if (state.room === 'records_stacks' && (hasWord(t, 'ash') || hasWord(t, 'cat'))) return print('Ash watches from Shelf 20. He recommends, without words, that you leave before the filing starts.');
    if (state.room === 'hr_reliquary' && /merlin|cat/.test(t)) return print("Merlin taps THE TOWER once with a paw, then looks at you. This is humiliatingly clear guidance.");
    if (state.room === 'occult_compliance' && /salem|cat/.test(t)) return print("Salem opens one eye. 'Mrrp.'\n\nYou have received more actionable guidance from this than from several executive briefings.");
    if (state.room === 'archives' && /luna|cat/.test(t)) return print("Luna retreats farther beneath the ledger when you mention the stair. Strong no.");
    if (state.room === 'continuity_chamber' && /boo|cat/.test(t)) return print(state.flags.keyUsed ? "Boo looks at the five seals, then at you. Naming things is apparently your department now." : "Boo sits directly on the key slot. Leadership obstruction at its purest.");

    if (/angela/.test(t) && /julia/.test(t) && /audrey/.test(t)) return print("The three names seem to matter here, but not as the final key. Their drawings were witnesses, not anchors.");
    print(`You address ${t || 'the room'}. The Agency appreciates stakeholder engagement and offers nothing in return.`);
  }

  function attackThing(c) {
    const t = c.objectText;
    if (state.room === 'records_lobby' && ['jorge','man','employee'].some(n => hasWord(t, n))) return die('jorge', "You attack Jorge.\n\nThere is a brief administrative misunderstanding.\n\nJorge resolves it manually.\n\nThe last thing you see is your visitor badge landing face-up in something that was previously inside you.");
    if (['cat','boo','salem','ash','luna','merlin'].some(n => hasWord(t, n))) {
      const catsHere = { records_stacks:'ash', hr_reliquary:'merlin', occult_compliance:'salem', archives:'luna', continuity_chamber:'boo' };
      if (!catsHere[state.room] || (!hasWord(t, 'cat') && !hasWord(t, catsHere[state.room]))) return print('That cat is not within reach. They have excellent judgment.');
      return die('cat', "You choose violence against a cat.\n\nThe building itself appears to take this personally.\n\nYour death is immediate, comprehensive, and difficult to appeal.");
    }
    print(`You attack ${t || 'the concept of restraint'}. It accomplishes less than you hoped.`);
  }

  function genericAction(c) {
    // direct puzzle phrases / natural-language easter eggs
    const r = c.raw.toLowerCase();
    if (state.room === 'meeting' && c.verb === 'drink' && hasWord(c.objectText, 'water')) return print('You lift the glass. The skin on the water moves against the rim. You put it down without drinking.');
    if (state.room === 'meeting' && c.verb === 'sit' && hasWord(c.objectText, 'table')) return print('You sit at the conference table. The agenda and badge remain in reach; the east door is the only exit.');
    if (state.room === 'subbasement' && c.verb === 'use' && hasWord(c.objectText, 'lights')) return print('The emergency lights have failed. Your black candle is the light that still works.');
    if (state.room === 'subbasement' && /^(?:turn|switch) on (?:the )?lights$/.test(r)) return print('The emergency lights have failed. Your black candle is the light that still works.');
    if (state.room === 'subbasement' && /^(?:follow|take) (?:the )?(?:painted )?arrow$/.test(r)) return move('east');
    if (state.room === 'occult_compliance' && c.verb === 'touch' && hasWord(c.objectText, 'drawings')) return print("The frames are cold beneath your fingers. Angela, Julia, and Audrey each drew the same door; their signatures are the three witnesses.");
    if (state.room === 'archives' && c.verb === 'search' && hasWord(c.objectText, 'cabinets')) return print('The cabinets are mortared shut. The ledger on its pedestal is the record you can actually read.');
    if (c.verb === 'search') return examine(c.objectText);
    if (state.room === 'subbasement' && c.verb === 'listen' && hasWord(c.objectText, 'breathing')) return print('The breathing comes from beyond the collapsed parking passage. The painted arrow points east, away from it.');
    if (state.room === 'legal_annex' && c.verb === 'stamp' && hasWord(c.objectText, 'contract')) return print('The waiver stamp documents your refusal. Procurement accepts it with Form 66-B; stamping the contract here will not release you.');
    if (state.room === 'procurement' && c.verb === 'buy' && hasWord(c.objectText, 'candle')) return print('The requisition machine does not take money. Feed it Form 66-B and Waiver Stamp 4C to receive the black candle.');
    if (state.room === 'records_lobby' && c.verb === 'push' && hasWord(c.objectText, 'gate')) return move('south');
    if (state.room === 'hr_reliquary' && c.verb === 'shuffle') return print('You shuffle the three cards. Merlin puts a paw on The Tower again. HR calls this a randomized process.');
    if (state.room === 'occult_compliance' && c.verb === 'push' && hasWord(c.objectText, 'elevator button')) return print('The freight elevator is already here with its doors open. Go south or down to reach the Archives.');
    if ((state.room === 'executive_corridor' || state.room === 'elevator') && c.verb === 'push' && /elevator|button|floor\s*\d|\b(?:b|sb|below)\b/.test(c.objectText)) return print('You press the elevator button. Nothing lights up. The car is out of service.');
    if (state.room === 'continuity_chamber' && c.verb === 'touch' && hasWord(c.objectText, 'seals')) return print(state.flags.keyUsed ? 'The seals glow under your fingers. Their five poses are a naming clue, not buttons.' : 'The brass seals are cold. The silver key slot beneath them is still empty.');
    if (state.room === 'continuity_chamber' && c.verb === 'knock' && hasWord(c.objectText, 'door')) return print(state.flags.finalOpen ? 'The door is already open. Go east to leave.' : state.flags.keyUsed ? 'Your knock echoes behind the sealed door. The five lit seals still wait for their names.' : 'The door does not answer. A silver key slot sits beneath the five seals.');
    if (state.room === 'break_room' && c.verb === 'push' && /vending|button/.test(c.objectText)) return print('You press the vending machine button. OUT OF STOCK stays lit. Procurement has the candle now.');
    if (state.room === 'continuity_chamber' && /boo.*salem.*ash.*luna.*merlin/.test(r) && state.flags.keyUsed) return talkThing({objectText:r,targetText:''});
    if (/\bread\b/.test(r)) return examine(c.objectText);
    if (/coffee/.test(r) && state.room === 'break_room') return print("The coffee machine produces a liquid that is technically darker than the cup. You decide Jorge deserves the creamer more than you deserve this.");
    const id = findItem(c.objectText) || findInventory(c.objectText);
    if (id === 'jorge') {
      const responses = {
        touch: 'Jorge permits one finger on his sleeve. The fabric is warm. He was not.',
        lick: 'Jorge looks at you. Even the femur seems disappointed.',
        smell: 'Jorge smells of toner, hazelnut creamer, and a sealed personnel file.',
        flatter: "Jorge accepts the compliment as if it were overdue paperwork.",
        threaten: 'Jorge writes your threat on the clipboard under VOLUNTARY DISCLOSURES.',
        hide: 'You crouch behind Jorge. He moves six inches, revealing you to the entire lobby.'
      };
      if (responses[c.verb]) return print(responses[c.verb]);
    }
    if (c.verb === 'touch' && ['ash','merlin','salem','luna','boo'].includes(id)) {
      const lines = {
        ash: 'Ash accepts one careful touch from Shelf 20, then resumes supervising your survival from a safer altitude.',
        merlin: 'Merlin leans into your hand and raises one paw. Even the cat is giving clearer direction than HR.',
        salem: 'Salem purrs without opening his eyes. Your performance review remains less favorable.',
        luna: 'Luna allows a brief touch, then retreats beneath the ledger. She has better instincts than you.',
        boo: 'Boo accepts your attention as tribute. The door remains unimpressed.'
      };
      return print(lines[id]);
    }
    if (['smell', 'listen', 'lick'].includes(c.verb) && ['ash','merlin','salem','luna','boo'].includes(id)) {
      const cats = {
        ash: {smell: 'Ash smells faintly of dust from Shelf 20.', listen: 'Ash makes a small warning sound from the shelf. Something here frightens him.', lick: 'Ash retreats higher on Shelf 20. That is a reasonable response to your proposal.'},
        merlin: {smell: 'Merlin smells of old paper and the HR table. His paw stays beside The Tower.', listen: 'Merlin purrs, then taps The Tower with one paw.', lick: 'Merlin moves away from your face and points you back toward The Tower.'},
        salem: {smell: 'Salem smells of warm fur and the paper in the nearby inbox.', listen: 'Salem purrs beside the empty inbox. The freight elevator is quieter.', lick: 'Salem withdraws from this terrible plan. The inbox remains available for normal investigation.'},
        luna: {smell: 'Luna smells of dry paper from beneath the ledger.', listen: 'Luna breathes softly beneath the ledger pedestal. She is hiding from something below.', lick: 'Luna slips farther beneath the ledger. Leave the frightened cat alone.'},
        boo: {smell: 'Boo smells of clean fur and the cold metal of the chamber door.', listen: 'Boo purrs beside the five seals, then falls silent as you study them.', lick: 'Boo gives you a look that would end a lesser administration.'}
      };
      return print(cats[id][c.verb]);
    }
    if (c.verb === 'touch') {
      const lines = {
        agenda: 'The leather folder is cool and stiff. Five blank signature lines wait inside; touching them signs nothing.',
        badge: 'The plastic badge warms in your hand. SCOTT is still printed beneath your photograph.',
        water: 'The skin on the water clings to your fingertip for a moment. You wipe it on the table.',
        mug: 'The chipped rim is rough beneath your thumb. The government slogan has worn down to almost nothing.',
        creamer: 'The creamer bottle is cold. JORGE ONLY is written across the label in a firm hand.',
        napkin: 'Purple marker has bled through the napkin. The three stick figures still hold hands around a door.',
        memo: 'The memo curls at the corner. Its rule about feeding Records staff remains unpleasantly specific.',
        form66b: 'The form is thin enough to feel the printed boxes through the paper. Procurement has a slot for it.',
        ash_note: 'The warning is scratched into Shelf 20, not written on paper. Ash keeps watch above it.',
        records_file: 'The personnel file is dusty, but its impossible creation date is clear on the cover.',
        contract: 'Page sixty-four is tucked under the contract. The signature line above it is still blank.',
        stamp_box: state.flags.stampTaken ? 'The acrylic box is open and empty; the cheap lock hangs loose.' : 'The acrylic is smooth and the lock is cheap. Waiver Stamp 4C is still inside.',
        requisition_machine: 'The brass is cold. Its FORM and WAIVER slots are open; the SOUL slot is taped shut.',
        compliance_manual: 'The manual has stiff pages and a worn spine. Section 8.4 is marked for a reason.',
        ledger: 'The ledger is heavy and dry beneath your fingers. Luna stays hidden under its pedestal.',
        final_plaque: 'The letters are cut into cold metal. The plaque gives advice, but no way to open the door.'
      };
      if (lines[id]) return print(lines[id]);
    }
    const sensory = {
      water: {
        smell: 'The water smells faintly of a closed aquarium. The skin on top stays perfectly still.',
        listen: 'The glass is silent. The fluorescent lights above it buzz for both of you.',
        lick: 'You touch the water to your tongue. The surface skin clings to it; you stop before taking a drink.'
      },
      creamer: {
        smell: "The sealed creamer smells of hazelnut. Jorge's name is written across the label.",
        listen: 'You shake the creamer. It sloshes; Jorge is still waiting in Records.',
        lick: "You taste a drop of hazelnut creamer. Jorge needs the bottle, not your review of it."
      },
      mug: {
        smell: 'The mug smells of old coffee. The chipped rim has outlived its government slogan.',
        listen: 'The empty mug gives a dull ceramic ring when you tap it. The coffee machine keeps wheezing.',
        lick: 'The chipped mug tastes of stale coffee and ceramic dust. You have learned nothing useful.'
      },
      agenda: {
        smell: 'The leather agenda smells new. Its five signature lines are still blank.',
        listen: 'The agenda makes no sound when you lift it. The east exit sign hums across the room.'
      },
      badge: {
        smell: 'The plastic badge smells of fresh laminate. Your temporary access has a longer shelf life than expected.',
        listen: 'The badge clicks against its clip. It has no electronics to answer you.'
      },
      napkin: {
        smell: 'The napkin smells of purple marker and old coffee. Three names circle the drawn door.',
        listen: 'The napkin rustles. Angela, Julia, and Audrey left a written clue, not a recording.'
      },
      requisition_machine: {
        smell: 'The brass machine smells of hot metal and paper. FORM and WAIVER are its open slots.',
        listen: 'A mechanism ticks behind the FORM and WAIVER slots. The SOUL slot stays taped shut.'
      },
      tarot_spread: {
        smell: 'The cards smell of old paper. Merlin keeps his paw beside The Tower.',
        listen: 'The cards are quiet. Merlin taps the table once beside The Tower.'
      },
      ledger: {
        smell: 'The ledger smells of dry paper and limestone. Luna hides beneath its pedestal.',
        listen: 'Pages settle with a soft crackle. Beneath the pedestal, Luna breathes very quietly.'
      },
      seals: {
        smell: state.flags.keyUsed ? 'The warm brass seals smell of old metal. The silver key rests in its slot.' : 'The brass seals smell of old metal. The key slot beneath them is empty.',
        listen: state.flags.keyUsed ? 'The five awakened seals hum together. They still wait for five names.' : 'The cold seals make no sound. A silver key fits the slot beneath them.'
      }
    };
    if (sensory[id] && sensory[id][c.verb]) return print(sensory[id][c.verb]);
    if (generic[c.verb]) {
      const arr = generic[c.verb]; const line = arr[Math.abs(hash(c.raw)) % arr.length];
      const name = id ? (DORK_DATA.items[id].article || (['jorge','boo','salem','ash','luna','merlin'].includes(id) || /^the /i.test(DORK_DATA.items[id].name) ? DORK_DATA.items[id].name : `the ${DORK_DATA.items[id].name}`)) : (c.objectText || 'the situation');
      return print(line.replace('{o}', name).replace('{O}', cap(name)));
    }
    if (verbMap[c.verb]) return print("You attempt that. The result is technically an action but not a useful one.");
    print(`The parser recognizes that you want something. It does not recognize what kind of person would phrase it as '${c.raw}'. Try HELP if this condition persists.`);
  }

  function hint() {
    meta.hints++; saveMeta();
    const hints = {
      meeting: "The badge is more useful than the water. This is the only normal sentence the game will give you.",
      executive_corridor: "Records is blocked by someone with a clearly documented preference.",
      break_room: "JORGE ONLY is not subtle. Neither is Jorge.",
      records_lobby: state.flags.jorgeMoved ? "Go south before Jorge decides the creamer was inadequate." : "Government runs on incentives. Jorge's incentive is in the break room.",
      records_stacks: "Take the form. Read the file if you enjoy being unsettled.",
      legal_annex: state.flags.stampTaken ? "Procurement wants a form and a waiver." : "Read the contract. Then acquire the waiver stamp by a method Legal would dislike.",
      procurement: "Insert Form 66-B and Waiver Stamp 4C into the machine.",
      hr_reliquary: "Merlin is looking at the answer. Try to keep up.",
      occult_compliance: "Read the manual. Remember the drawings. Continue south.",
      archives: "Read the ledger. Keep the candle with you. Luna's fear is not decorative.",
      subbasement: "Light was procured for a reason.",
      continuity_chamber: state.flags.keyUsed ? "Five household anchors. Five cats. Name them all." : "Use the silver key first.",
      parking_exit: "You won. Please stop requesting assistance."
    };
    print(`MANAGEMENT ASSISTANCE REQUIRED #${meta.hints}: ${hints[state.room]}`);
  }

  function inventory() {
    if (!state.inventory.length) return print("You are carrying nothing except professional confidence.");
    print("You are carrying:\n" + state.inventory.map(id => `- ${DORK_DATA.items[id].name}`).join('\n'));
  }

  function help() {
    print("DORK understands a broad parser vocabulary. Useful examples:\n\nLOOK / EXAMINE BADGE / TAKE FORM / DROP MUG\nN, S, E, W or NORTH, SOUTH, EAST, WEST\nUSE KEY ON DOOR / GIVE CREAMER TO JORGE\nTALK TO MERLIN / ASK JORGE ABOUT RECORDS\nOPEN BOX / READ CONTRACT / INVENTORY / LEAVE ROOM\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\n\nMeta commands: HINT, DEATHS, LORE, SAVE, RESTART.\n\nTry unreasonable things. The game has opinions.");
  }

  function showDeaths() { print(meta.deaths.length ? "PERSONNEL SEPARATION LOG:\n" + meta.deaths.map((d,i)=>`${i+1}. ${d}`).join('\n') : "PERSONNEL SEPARATION LOG: No deaths recorded. This is temporary."); }
  function showLore() { print(meta.lore.length ? "DISCOVERED ARCHIVE:\n" + meta.lore.map((x,i)=>`${i+1}. ${x}`).join('\n') : "DISCOVERED ARCHIVE: Empty. Ignorance remains your most complete record."); }

  function describeRoom(force=false) {
    const room = roomNow(); print(`\n[${room.name.toUpperCase()}]\n${flagDescription(room)}`);
    const visible = [...(room.items || []), ...Object.keys(state.dropped).filter(id => state.dropped[id] === state.room)]
      .filter(id => !state.taken.includes(id) || !DORK_DATA.items[id].portable || state.dropped[id] === state.room);
    if (visible.length) print(`Visible: ${visible.map(id=>DORK_DATA.items[id].name).join(', ')}.`, 'dim');
    const exits = Object.keys(room.exits || {}); if (exits.length) print(`Exits: ${exits.join(', ')}.`, 'dim');
    updateStatus();
  }

  function flagDescription(entry) {
    const active = Object.entries(entry.descByFlag || {}).find(([flag]) => state.flags[flag]);
    return active ? active[1] : entry.desc;
  }

  function win() {
    if (state.won) return;
    state.won = true;
    meta.won = true; saveMeta();
    print("\n*** TRUE ENDING: RELEASED FROM CONTINUITY ***\n\nScott has escaped the Agency. The Agency has not escaped Scott.\n\nYour run is complete. Type DEATHS, LORE, or RESTART if you have learned nothing.", 'death');
  }

  function die(code, text) {
    print(`\n${text}\n\n*** EMPLOYMENT STATUS: TERMINATED ***`, 'death');
    const labels = { darkness:'Entered unlit continuity infrastructure', orientation:'Failed mandatory orientation', jorge:'Initiated unauthorized Jorge interaction', cat:'Committed an unforgivable policy violation', contract:'Executed contract without adequate review' };
    meta.deaths.push(labels[code] || 'Administrative death'); meta.runs++; saveMeta();
    localStorage.removeItem(RUN_KEY);
    print("\nType RESTART to begin a new run. The narrator will remember this.");
    state.dead = true;
  }

  function restart() {
    if (!state.dead && !state.won && !restartPending) {
      restartPending = true;
      return print('RESTART will erase this run. Type RESTART again as your next command to confirm.');
    }
    restartPending = false;
    state = newRun(); saveRun(); print("\n--- NEW RUN ---\nThe building has reset. Your dignity has not.\n"); describeRoom();
  }

  function findItem(text, roomOnly=false) {
    const t = (text||'').toLowerCase().replace(/^(the|a|an)\s+/,'');
    const here = [...(roomNow().items || []), ...Object.keys(state.dropped).filter(id => state.dropped[id] === state.room)];
    const candidates = roomOnly ? here : [...here, ...state.inventory];
    const matches = [];
    for (const [priority, id] of candidates.entries()) {
      const it = DORK_DATA.items[id]; if (!it) continue;
      if (state.taken.includes(id) && it.portable && !state.inventory.includes(id) && state.dropped[id] !== state.room) continue;
      const aliasLength = Math.max(0, ...it.aliases.filter(a => hasWord(t, a)).map(a => a.length));
      if (aliasLength) matches.push({ id, aliasLength, priority });
    }
    matches.sort((a, b) => b.aliasLength - a.aliasLength || a.priority - b.priority);
    return matches[0]?.id || null;
  }
  function findInventory(text) {
    const t = (text || '').toLowerCase();
    return state.inventory.find(id => DORK_DATA.items[id].aliases.some(a => hasWord(t, a))) || null;
  }
  function hasWord(text, phrase) {
    const escaped = String(phrase).toLowerCase().trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    return !!escaped && new RegExp(`(?:^|\\b)${escaped}(?:$|\\b)`, 'i').test(String(text || '').toLowerCase());
  }
  function specialTarget(t) { return hasWord(t, 'jorge') ? 'jorge' : null; }

  function discoverLore(id) {
    const loreMap = {
      records_file: "Scott's personnel file predates his involvement with the Agency.",
      contract: "The Agency can retain identity and post-mortem administrative capacity through consent.",
      drawings: "Angela, Julia, and Audrey's drawings act as three witnesses to the Continuity door.",
      compliance_manual: "Five household anchors must be named to release a Continuity seal.",
      ledger: "Scott was invited by authority, retained by consent, and may be released by an anchor."
    };
    if (loreMap[id] && !meta.lore.includes(loreMap[id])) { meta.lore.push(loreMap[id]); saveMeta(); print("[ARCHIVE UPDATED]", 'dim'); }
  }

  function roomNow(){ return DORK_DATA.rooms[state.room]; }
  function newRun(){ return { room:DORK_DATA.startRoom, previousRoom:null, inventory:[], taken:[], dropped:{}, flags:{}, visited:[DORK_DATA.startRoom], dead:false, won:false }; }
  function saveRun(){ if (!state.dead) localStorage.setItem(RUN_KEY, JSON.stringify(state)); }
  function saveMeta(){ localStorage.setItem(META_KEY, JSON.stringify(meta)); }
  function load(k,f){ try { return JSON.parse(localStorage.getItem(k)) || f; } catch { return f; } }
  function buildVerbMap(groups){ const m={}; Object.entries(groups).forEach(([k,arr])=>arr.forEach(v=>m[v]=k)); return m; }
  function hash(s){ let h=0; for(let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0; return h; }
  function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
  function print(content, cls='', trusted=false){ const p=document.createElement('p'); if(cls) p.className=cls; p.innerHTML=trusted ? content : escapeText(content); out.appendChild(p); scrollBottom(); }
  function escapeText(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }
  function scrollBottom(){ requestAnimationFrame(()=>{ out.scrollTop=out.scrollHeight; }); }
  function updateStatus(){ runStatus.textContent=`RUN ${meta.runs} · DEATHS ${meta.deaths.length} · HINTS ${meta.hints}`; roomStatus.textContent=roomNow().name.toUpperCase(); }
})();
