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
    pray: ["You pray at {o}. Something, somewhere, marks the request as received."],
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
    if (/^(?:take all items|grab all of it)$/.test(cleaned)) return {verb:'take', objectText:'all', targetText:'', raw};
    if (/^(?:get out(?: of here)?|go out(?:side)?|walk out|exit)$/.test(cleaned)) return {verb:'leave', objectText:'', targetText:'', raw};
    if (/^(?:back|go back|return)$/.test(cleaned)) return {verb:'back', objectText:'', targetText:'', raw};
    if (/^(?:(?:go|walk|move|head|take|use|climb)\s+)?(?:down|up|downstairs|upstairs|stairs|elevator)$/.test(cleaned) || cleaned === 'descend') {
      const alias = /elevator/.test(cleaned) ? 'elevator' : /stairs/.test(cleaned) && !/downstairs|upstairs/.test(cleaned) ? 'stairs' : /up/.test(cleaned) ? 'up' : 'down';
      return {verb:'exitAlias', objectText:alias, targetText:'', raw};
    }
    const words = cleaned.split(' ');
    let verbToken = words.shift();
    if (verbToken === 'pick' && words[0] === 'up') { words.shift(); verbToken = 'pickup'; }
    if (verbToken === 'put' && words[0] === 'on') { words.shift(); verbToken = 'puton'; }
    if (['go','walk','move','travel','head','proceed'].includes(verbToken) && words.length) {
      const d = verbMap[words[0]] || words[0];
      if (['north','south','east','west'].includes(d)) return { verb:d, objectText:'', targetText:'', raw, verbToken };
    }
    const verb = verbMap[verbToken] || verbToken;
    const rest = words.join(' ').replace(/^(the|a|an)\s+/,'').replace(/^at\s+/,'');
    const split = rest.split(/\s+(?:on|with|to|into|in|at|using)\s+/);
    return { verb, objectText: split[0] || '', targetText: split[1] || '', raw, verbToken };
  }

  const actions = {
    look: (c) => c.objectText ? examine(c.objectText) : describeRoom(true),
    examine: (c) => examine(c.objectText),
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
    if (!id) return print(`You cannot find ${text || 'that'} here. This is one of your better outcomes tonight.`);
    const item = DORK_DATA.items[id];
    if (id === 'jorge') return print('You cannot take Jorge. Records has already tried transferring him. The forms came back bitten.');
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

    if (a) return print(`You ${c.verbToken || 'use'} ${DORK_DATA.items[a].name}${b ? ` on ${typeof b === 'string' && DORK_DATA.items[b] ? DORK_DATA.items[b].name : c.targetText}` : ''}. The universe declines to recognize this workflow.`);
    print("Use what, exactly? Specificity is the thin line between magic and a meeting.");
  }

  function talkThing(c) {
    const t = `${c.objectText} ${c.targetText}`.trim();
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
    if (state.room === 'continuity_chamber' && /boo.*salem.*ash.*luna.*merlin/.test(r) && state.flags.keyUsed) return talkThing({objectText:r,targetText:''});
    if (/read/.test(r)) return examine(c.objectText);
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
    if (generic[c.verb]) {
      const arr = generic[c.verb]; const line = arr[Math.abs(hash(c.raw)) % arr.length];
      const name = id ? (DORK_DATA.items[id].article || (['boo','salem','ash','luna','merlin'].includes(id) ? DORK_DATA.items[id].name : `the ${DORK_DATA.items[id].name}`)) : (c.objectText || 'the situation');
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
