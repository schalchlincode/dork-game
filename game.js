(() => {
  const $ = (s) => document.querySelector(s);
  const out = $('#output');
  const input = $('#commandInput');
  const form = $('#commandForm');
  const runStatus = $('#runStatus');
  const roomStatus = $('#roomStatus');

  const META_KEY = 'dork_meta_v1';
  const RUN_KEY = 'dork_run_v1';

  let ui = null;
  let storageFailed = false;
  const store = DorkCore.storage(() => { storageFailed = true; ui?.notifyStorage(); });
  const loadedMeta = store.read(META_KEY, {});
  let meta = DorkCore.validateMeta(loadedMeta);
  let state;
  let rejectedSave = null;
  const loadedRun = store.read(RUN_KEY, {});
  try {
    if (Number(loadedMeta?.schemaVersion) > DorkCore.SAVE_VERSION) throw new Error('Newer DORK memory format.');
    state = DorkCore.validateRun(loadedRun, DORK_DATA);
  }
  catch (error) { state = newRun(); rejectedSave = loadedRun; storageFailed = true; }
  let restartPending = false;
  let pendingClarification = null;
  let currentCommand = '';
  const verbMap = DorkParser.verbMap;


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
    throw: ["You throw nothing. Moving {o} without a receiving department would be an unauthorized transfer. It stays where it is."],
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

  const GOVERNMENT_PROPERTY = new Set([
    'agenda', 'badge', 'mug', 'memo', 'form66b', 'waiver_form', 'waiver_stamp',
    'records_file', 'compliance_manual', 'black_candle', 'silver_key'
  ]);
  for (const [id,item] of Object.entries(DORK_DATA.items)) if(item.government) GOVERNMENT_PROPERTY.add(id);

  function boot() {
    print(`<div class="title">DORK</div><div class="dim">A SCOTT ADVENTURE</div>`, '', true);
    print(`You are Scott. Somewhere, trouble has already completed the necessary forms.`);
    if (meta.deaths.length) print(`The system remembers ${meta.deaths.length} prior separation event${meta.deaths.length === 1 ? '' : 's'}. It is trying not to look pleased.`, 'dim');
    const report = meta.reports[meta.reports.length - 1];
    if (report && DorkSupport.callbacks[report.code]) print(DorkSupport.callbacks[report.code], 'dim');
    describeRoom(true);
    updateStatus();
    if (storageFailed) ui.notifyStorage();
    if (rejectedSave) print('The stored run requires a newer DORK version. It has been preserved without modification. TOOLS can export that original save; this temporary run will not overwrite it.','dim');
    if (state.dead) print('This imported run ended in termination. Type RESTART.');
    if (matchMedia('(pointer: fine)').matches) input.focus();
    requestAnimationFrame(() => { out.scrollTop = 0; });
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); const c = input.value.trim(); input.value = ''; if (c) execute(c); });
  document.querySelectorAll('[data-command]').forEach(b => b.addEventListener('click', () => { execute(b.dataset.command); input.focus(); }));

  function execute(raw) {
    raw = String(raw).trim();
    if (!raw) return;
    currentCommand = raw;
    ui.command(raw);
    print(`> ${raw}`, 'dim');
    if (restartPending && raw.toLowerCase().trim() !== 'restart') restartPending = false;
    let cmd = parse(raw);
    if (pendingClarification) {
      const pending = pendingClarification;
      const numbered = /^\d+$/.test(raw) ? pending.matches[Number(raw)-1] : null;
      const named = DorkCore.resolve(raw, pending.matches, DORK_DATA.items).id;
      if (numbered || named) {
        const id = numbered || named;
        cmd = {...pending.command, [pending.field]: DORK_DATA.items[id].name};
        pendingClarification = null;
      } else if (DorkCore.normalize(raw) === 'cancel') {
        pendingClarification = null;
        return print('Canceled. No action was taken.');
      } else {
        pendingClarification = null;
        // A new command abandons the pending action rather than accidentally completing it.
      }
    }
    if (!cmd) return print('That sentence has defeated both you and the parser. Rephrase it with fewer ambitions.');
    if (cmd.verb === 'restart' && raw.toLowerCase().trim() !== 'restart') {
      restartPending = false;
      return print('Type RESTART by itself if you want to begin again.');
    }
    const utilities = ['restart','deaths','lore','help','map','save','tools','settings','export','history'];
    if (state.dead && !utilities.includes(cmd.verb)) return print('You are dead. Even state government has limits. Type RESTART.');
    if (state.won && ![...utilities,'look','inventory'].includes(cmd.verb)) return print("You've already left. The Agency cannot approve further activity from outside its walls.");
    const objectVerbs = ['examine','look','search','take','drop','open','close','use','give','touch','burn','push','pull','attack','wear','throw','stamp','returnProperty','reclaim'];
    if (objectVerbs.includes(cmd.verb)) {
      for (const field of ['objectText','targetText']) {
        if (!cmd[field] || ['all','everything'].includes(cmd[field])) continue;
        const scope = field === 'objectText' && ['drop','returnProperty'].includes(cmd.verb) ? state.inventory : scopedItems();
        const resolution = DorkCore.resolve(cmd[field],scope,DORK_DATA.items);
        if (resolution.matches.length > 1) {
          pendingClarification = {command:cmd,field,matches:resolution.matches};
          return print('Which object? The Agency has spent considerable money ensuring there are several.\n' + resolution.matches.map((id,i)=>`${i+1}. ${DORK_DATA.items[id].name}`).join('\n') + '\nType its name or number, or CANCEL.');
        }
      }
    }
    const before = JSON.stringify(state), metaBefore = JSON.stringify(meta);
    try {
      if (['north','south','east','west'].includes(cmd.verb)) move(cmd.verb);
      else if (!expansion.handle(cmd)) {
        const fn = actions[cmd.verb];
        if (fn) fn(cmd); else genericAction(cmd);
      }
      // Count only world-changing actions, not failed wording or reading time.
      if (!utilities.includes(cmd.verb) && !['hint','inventory'].includes(cmd.verb) && JSON.stringify(state) !== before) state.turns++;
      refreshObservedExits(); saveRun(); saveMeta(); updateStatus(); ui.refresh(); scrollBottom(true);
    } catch (error) {
      state = JSON.parse(before); meta = JSON.parse(metaBefore);
      pendingClarification = null;
      saveRun(); saveMeta(); updateStatus();
      console.error('DORK action failed:', error);
      print('That command encountered an internal error. Its state changes were rolled back. Export the transcript from TOOLS to report it.');
    }
  }

  function parse(raw) { return DorkParser.parse(raw, state); }

    const actions = {
    look: (c) => c.objectText ? examine(c.objectText) : describeRoom(true),
    examine: (c) => examine(c.objectText),
    search: (c) => genericAction(c),
    inventory: inventory,
    take: (c) => c.objectText === 'all' || c.objectText === 'everything' ? takeAll() : chooseCard(c) || take(c.objectText, c.raw),
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
      if (hasWord(c.objectText, 'candle')) return useThing(c);
      genericAction(c);
    },
    give: useThing,
    touch: (c) => chooseCard(c) || genericAction(c),
    talk: talkThing,
    joke: joke,
    stamp: stampThing,
    returnProperty: (c) => returnProperty(c.objectText),
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
    map: () => { ui.open('map'); print('Discovered map opened. Unexplored destinations remain unnamed.'); },
    reclaim: (c) => reclaimProperty(c.objectText),
    tools: () => ui.open('settings'),
    settings: () => ui.open('settings'),
    history: () => ui.open('settings'),
    export: () => ui.open('settings'),
    save: () => { const saved=saveRun(); print(saved ? 'Run state saved locally. Even bureaucracy occasionally works.' : 'Saving is unavailable. This tab still works; export a backup from TOOLS before closing it.'); }

  };

  function joke() {
    if (state.flags.readPersonnelFile) {
      state.flags.joked = true;
      return print("You make a joke about administrative continuity.\n\nSomewhere inside the wall, a printer emits one approving click.\n\n[HUMOR RESPONSE CONFIRMED]");
    }
    print('You make a joke. The building does not laugh. Somewhere in Records, something adds a note to your file.');
  }

  function stampWaiver() {
    if (!state.inventory.includes('waiver_stamp')) return print('You need Waiver Stamp 4C in your possession. It is locked in the acrylic box in Legal.');
    if (!state.inventory.includes('waiver_form')) return print('You need the detachable Waiver Form 4C from beneath the continuity contract.');
    if (state.flags.waiverStamped) return print('Waiver Form 4C is already stamped DECLINED WITH PREJUDICE. Procurement is ready to misunderstand it.');
    state.flags.waiverStamped = true;
    print('You press Waiver Stamp 4C onto the certification box.\n\nThe paper now reads: DECLINED WITH PREJUDICE.\n\nWaiver Form 4C is ready for Procurement.');
  }

  function stampThing(c) {
    const subject=findItem(c.objectText);
    const instrument=c.targetText ? findItem(c.targetText) : null;
    if(c.targetText && instrument!=='waiver_stamp') return print('Use Waiver Stamp 4C as the instrument. That target cannot certify the document; nothing is stamped.');
    if(subject==='waiver_form' || /^(?:the )?(?:waiver|waiver form|waiver form 4c|page 64|refusal form|refusal page)$/.test(c.objectText)) return stampWaiver();
    if(subject==='form66b') return print('Form 66-B is already completed. Stamp the detachable Waiver Form 4C instead.');
    if(subject==='contract') return print('Do not stamp the contract. Stamp detachable Waiver Form 4C, then submit that paper to Procurement.');
    print('Stamp what? Name the detachable Waiver Form 4C. Naming a stamp does not authorize stamping an unrelated object.');
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

  function move(dir) {
    const room = roomNow();
    const dest = room.exits[dir];
    if (!dest) return print(`There is no useful way ${dir}. There may be a useless one.`);
    if (room.blocked && room.blocked[dir]) {
      const key = room.blocked[dir];
      const denial = expansion.blocked(key);
      if (denial) return print(denial);
      if (key === 'jorge' && !state.flags.jorgeMoved) return print("Jorge occupies the southern gate with the passive completeness of a collapsed bridge.");
      if (key === 'tarot' && !state.flags.tarotSolved) return print("The east wall remains a wall. HR considers this a successful boundary.");
      if (key === 'final_seal' && !state.flags.finalOpen) return print("The final door does not open. Boo watches you fail with professional interest.");
    }
    if (state.room === 'asset_control' && dir === 'east') {
      const assets = carriedGovernmentProperty();
      if (assets.length) return die('property', `The asset scanner identifies unauthorized state property: ${assetList(assets).toUpperCase()}.\n\nA pleasant voice says, "Thank you for self-reporting."\n\nThe parking-garage door opens downward.`);
    }
    if (dest === 'subbasement' && (!state.flags.candleLit || !state.inventory.includes('black_candle'))) {
      if (state.flags.returnedAssets?.includes('black_candle')) return print('Your candle is in Asset Control. Do not reenter the dark tunnel without it. Return to the vestibule and RECLAIM CANDLE; the hatch permits a temporary checkout.');
      const message = state.inventory.includes('black_candle')
        ? 'You descend with the correct emergency candle still unlit in your pocket. Something in the tunnel appreciates your commitment to owning the proper equipment without using it.'
        : 'You descend without a light. Something waits until the stair door closes, because unlike you it understands timing. The sound is brief. The paperwork is not.';
      return die('darkness', message);
    }
    state.previousRoom = state.room;
    state.room = dest;
    if (!state.visited.includes(dest)) state.visited.push(dest);
    describeRoom();
    if (DORK_DATA.rooms[dest].ending) win();
  }

  function page64Text() {
    if (state.flags.objectionFiled || state.flags.procured)
      return 'Page sixty-four is the detachable refusal clause, Waiver Form 4C. Procurement has filed the stamped waiver with Form 66-B; the acrylic stamp box is empty.';
    if (state.flags.waiverStamped)
      return 'Page sixty-four is the detachable refusal clause, Waiver Form 4C. You stamped it DECLINED WITH PREJUDICE; it is ready for Procurement.';
    if (state.inventory.includes('waiver_form') || state.taken.includes('waiver_form'))
      return 'Page sixty-four is the detachable refusal clause, Waiver Form 4C. You removed it from beneath the contract, but its certification box still needs Waiver Stamp 4C.';
    return 'Page sixty-four is the detachable refusal clause, labeled WAIVER FORM 4C. Stamp that paper with Waiver Stamp 4C, then submit it to Procurement.';
  }

  function examine(text) {
    if (!text) return describeRoom(true);
    const observedId = findItem(text);
    if (observedId) observe(observedId);
    if (state.room === 'hr_reliquary' && /^(?:the )?wall$/.test(text)) return examine('east wall');
    if (state.room === 'meeting' && /\bwest door\b/.test(text)) return print('There is no west door anymore. The red EXIT sign points east to the corridor.');
    if (state.room === 'meeting' && /\b(?:calendar invitation|invitation)\b/.test(text)) return print("The invitation bore the Governor's name and scheduled the Executive Continuity Review for 4:30 to 5:00 PM. The wall clock says 5:17. It said nothing about the missing west door.");
    if (state.room === 'meeting' && /\b(?:clock|time)\b/.test(text)) return print("The wall clock says 5:17 PM. The invitation was for 4:30 to 5:00. The second hand has stopped, but the after-5:00 break-room policy is definitely in effect.");
    if (state.room === 'meeting' && /\b(?:exit sign|east door)\b/.test(text)) return print('The red EXIT sign points east. The door beneath it leads to the corridor; the west door you entered through is gone.');
    if (state.room === 'records_lobby' && hasWord(text, 'gate')) return print(state.flags.jorgeMoved ? 'Jorge has rolled aside. The southern gate into the stacks is clear.' : 'Jorge and his desk block the southern gate into the stacks. He keeps glancing toward the break room.');
    if (state.room === 'records_lobby' && hasWord(text, 'clipboard')) return print(state.flags.jorgeMoved ? 'Jorge has resumed his clipboard duties. The southern gate is clear.' : "Jorge's clipboard lists a break-room delivery. He glances toward the creamer whenever you look at it.");
    if (state.room === 'meeting' && /\b(?:under table|beneath table)\b/.test(text)) return print('Beneath the table: polished legs, immaculate carpet, and no hidden exit. The red EXIT sign points east.');
    if (state.room === 'meeting' && hasWord(text, 'table')) return print('The polished table holds the agenda folder, visitor badge, and a glass of water with a skin. Nothing useful is hidden beneath it.');
    if (state.room === 'break_room' && /\b(?:fridge|refrigerator)\b/.test(text)) return print("The refrigerator is plastered with warnings about Jorge's creamer. Inside are expired lunches and no safer alternative.");
    if (state.room === 'break_room' && /\b(?:warning|note on fridge)\b/.test(text)) return print("The warning reserves the hazelnut creamer for Jorge. The fridge contains expired lunches and no useful substitute.");
    if (state.room === 'break_room' && /\b(?:vending machine|machine button)\b/.test(text)) return print('The vending machine lists one black candle as OUT OF STOCK. Procurement handles emergency supplies now.');
    if (state.room === 'legal_annex' && /\b(?:page 64|page sixty four|page sixty-four)\b/.test(text)) return print(page64Text());
    if (state.room === 'archives' && /\b(?:stair|stairs|stairway|tunnel)\b/.test(text))
      return print(state.flags.candleLit
        ? 'The green candle reveals a concrete tunnel below. The emergency lights are dead, but the marked route continues east.'
        : "The stair descends into a tunnel where the emergency lights have failed. Luna refuses to approach it; take a lit candle—the black emergency candle is the obvious candidate.");
    if (state.room === 'subbasement' && /\btunnel\b/.test(text))
      return print('The green candle shows a concrete tunnel, dead emergency lights, and a painted arrow pointing east to the Continuity Chamber.');
    if (state.room === 'archives' && /\b(?:under|beneath) (?:the )?(?:ledger|book)\b/.test(text))
      return print('The ledger lies flat on the stone reading stand. Luna is beneath the stand, not beneath the book.');
    if (state.room === 'archives' && /\b(?:under|beneath) (?:the )?(?:stand|reading stand|pedestal)\b/.test(text))
      return print('Luna watches from the open arch beneath the stone reading stand and declines extraction.');
    if (state.room === 'asset_control' && /\b(?:scanner|property|assets?)\b/.test(text)) {
      const assets = carriedGovernmentProperty();
      return print(assets.length ? `The scanner flags: ${assetList(assets)}. Return them before going east.` : 'The scanner detects no state property. The east-door indicator is green.');
    }
    if (state.room === 'asset_control' && /\b(?:bin|return bin)\b/.test(text))
      return print('The return bin accepts registered state property. RETURN ALL is an approved phrase for once. RECLAIM CANDLE checks out a surrendered light for backtracking; return it again before departure.');
    const id = findItem(text);
    if (!id) {
      if (/jorge/.test(text) && state.room === 'records_lobby') return print("Jorge is at least seven feet tall when seated, which raises questions you do not have clearance to ask. His smile contains excellent dental benefits.");
      return print(`You examine ${text}. It remains disappointingly nonspecific.`);
    }
    const item = DORK_DATA.items[id]; print(expansion.specialDescription(id) || DorkWorld.description(id,state) || flagDescription(item));
    if (id === 'records_file') state.flags.readPersonnelFile = true;
    if (id === 'napkin') state.flags.readNapkin = true;
    discoverLore(id);
  }

  function take(text, raw='') {
    if (hasWord(text, 'receipt') && state.inventory.includes('procurement_receipt')) return print('You already have the Procurement receipt. It is the employee copy, which is the closest thing here to a gift.');
    if (hasWord(text, 'key') && state.flags.keyUsed) return print('The silver key is locked into the continuity mechanism. The Agency has retained the asset before you could.');
    if (hasWord(text, 'candle') && state.inventory.includes('black_candle') && /(?:take|get|pull|bring).+out/i.test(raw)) return print(state.flags.candleLit ? 'You take out the black candle. Its green flame is already lit.' : 'You take out the black candle. Its striker cap remains untwisted; the candle is still unlit.');
    const id = findItem(text, true) || findInventory(text);
    if (state.room === 'occult_compliance' && hasWord(text, 'inbox')) return print('The inbox is fixed to the desk, and Salem is asleep inside it. The tray contains no useful paperwork.');
    if (state.room === 'legal_annex' && hasWord(text, 'stamp') && state.flags.stampTaken && state.dropped.waiver_stamp !== state.room) return print(state.inventory.includes('waiver_stamp') ? 'You already carry Waiver Stamp 4C. The acrylic box is empty.' : 'The acrylic box is open and empty. Waiver Stamp 4C is no longer here.');
    if (state.room === 'legal_annex' && hasWord(text, 'stamp') && !state.flags.stampTaken) return print('Waiver Stamp 4C is locked in the acrylic box. Your visitor badge might pry it open.');
    if (!id) return print(`You cannot find ${text || 'that'} here. This is one of your better outcomes tonight.`);
    const item = DORK_DATA.items[id];
    if (id === 'jorge') return print('You cannot take Jorge. Records has already tried transferring him. The forms came back bitten.');
    if (id === 'tarot_spread') return print('The tarot spread stays on the orientation table. Choose a card; Merlin favors The Tower.');
    if (id === 'drawings') return print("The children's drawings are fixed to the wall. Read their signatures here; the three witnesses matter later.");
    if (id === 'memo') return print('The break-room memo is laminated and bolted to the wall. It has already exceeded its telework allowance.');
    if (id === 'ledger') return print('The ledger is chained to the stone reading stand and weighs approximately one unresolved fiscal year. Read it here before taking the eastern stair.');
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
    if (state.room === 'asset_control' && GOVERNMENT_PROPERTY.has(id)) return returnAssetById(id);
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
    if (c.targetText && findItem(c.targetText, true) !== 'tarot_spread' && !/^(?:the )?(?:orientation )?table$/.test(c.targetText)) {
      print('That is not the tarot spread. The card stays where it is.'); return true;
    }
    if (c.verb === 'take') {
      print('Choose a card. Do not pocket it.'); return true;
    }
    useThing({...c, objectText:id}); return true;
  }

  function openThing(text) {
    const id = findItem(text);
    if (['ash','merlin','salem','luna','boo','jorge'].includes(id)) return print(`${DORK_DATA.items[id].name} is a living being, not a container. Try talking instead.`);
    if (['memo','ash_note','contract','compliance_manual','drawings','final_plaque','form66b','waiver_form','procurement_receipt','napkin'].includes(id)) return examine(text);
    if (id === 'badge') return print('The visitor badge is a solid plastic card. It may still be useful as a pry tool.');
    if (id === 'water') return print('The glass is already open. The skin across the water makes drinking it a separate bad idea.');
    if (id === 'mug') return print('The mug has no lid. Its chipped rim is the least alarming thing in this room.');
    if (id === 'creamer') return print('The creamer cup has a peel-back seal. Jorge in Records is its intended recipient.');
    if (id === 'tarot_spread') return print('The three cards are already laid out. Choose one; Merlin keeps pointing at The Tower.');
    if (id === 'requisition_machine') return print(state.flags.procured ? 'The requisition drawer stands open and empty. The machine has issued everything it intends to.' : 'The requisition drawer is shut. Insert completed Form 66-B into FORM and stamped Waiver Form 4C into WAIVER.');
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
      state.flags.stampTaken = true; if (!state.inventory.includes('waiver_stamp')) state.inventory.push('waiver_stamp'); if (!state.taken.includes('waiver_stamp')) state.taken.push('waiver_stamp'); print("You pry open the cheap acrylic box with the visitor badge. Law school did not teach this, but tuition has finally produced a return.\n\nTaken: Waiver Stamp 4C."); return;
    }
    if (/door|exit/.test(text)) return print("The relevant door is already participating as much as policy permits. Try a direction.");
    print(`You try to open ${text || 'that'}. Nothing opens except a small space in your schedule where optimism used to be.`);
  }

  function useThing(c) {
    if (/^(?:waiver stamp|stamp 4c|4c)$/.test(c.objectText) && /^(?:waiver|waiver form|waiver form 4c|page 64|refusal form|refusal page)$/.test(c.targetText)) return stampWaiver();
    const a = findItem(c.objectText);
    const b = c.targetText ? (findItem(c.targetText) || specialTarget(c.targetText)) : null;
    if (state.room === 'asset_control' && b === 'return_bin' && a) return returnAssetById(a);
    if (state.room === 'break_room' && hasWord(c.objectText, 'coffee machine')) return print('The coffee machine wheezes out something dark. The useful hazelnut creamer is reserved for Jorge in Records.');
    if (state.room === 'procurement' && /^(?:requisition )?machine$/.test(c.objectText)) return print('The requisition machine has FORM and WAIVER slots for paper. Insert completed Form 66-B and stamped Waiver Form 4C to request the candle and key.');

    if (state.room === 'legal_annex' && a === 'badge' && /box|stamp/.test(c.targetText)) return openThing('box');

    const paperwork = new Set([a, b].filter(Boolean));
    if (paperwork.has('waiver_stamp') && paperwork.has('waiver_form')) return stampWaiver();
    if (paperwork.has('waiver_stamp') && paperwork.has('form66b')) return print('Form 66-B is already completed. Use Waiver Stamp 4C on the detachable Waiver Form 4C instead.');
    if (paperwork.has('waiver_stamp') && paperwork.has('contract')) return print('Do not stamp the contract. Stamp detachable Waiver Form 4C, then submit that paper to Procurement.');

    if ((a === 'creamer' || /creamer/.test(c.objectText)) && (b === 'jorge' || state.room === 'records_lobby')) {
      if (state.room !== 'records_lobby') return print('Jorge is in Records. Even the Agency requires you to deliver his creamer in person.');
      if (c.targetText && b !== 'jorge') return print('That recipient is not Jorge. His creamer stays with you.');
      if (!state.inventory.includes('creamer')) return print("You have no creamer. Jorge notices this before you do.");
      state.flags.jorgeMoved = true; state.inventory = state.inventory.filter(x => x !== 'creamer');
      print("You offer Jorge the hazelnut creamer.\n\nHe studies you. Then the creamer. Then you again.\n\n'Approved,' he says.\n\nHe drinks it directly from the little plastic cup without breaking eye contact and rolls his chair six feet sideways, clearing the gate. Nobody involved acknowledges the femur."); return;
    }

    if (state.room === 'procurement' && a === 'waiver_stamp')
      return print('The rubber stamp is not the form or waiver paperwork. Stamp Waiver Form 4C; submit that paper instead.');
    if (state.room === 'procurement' && (a === 'form66b' || a === 'waiver_form' || /form|waiver/.test(c.objectText))) {
      if (state.flags.formInserted && /^(?:form|form 66-b|66-b|66b)$/.test(c.objectText)) return print('The machine already has that. It is unusually possessive about paperwork.');
      if (state.flags.waiverInserted && /waiver/.test(c.objectText)) return print('The machine already has that. It is unusually possessive about paperwork.');
      if (c.targetText) {
        const destination = c.targetText.replace(/^(?:the|a|an)\s+/, '').trim();
        const machine = /^(?:(?:requisition|brass)\s+)?machine$/.test(destination);
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
        print("The machine groans like a committee reaching consensus. A drawer opens.\n\nIssued: BLACK EMERGENCY CANDLE.\nIssued: SILVER CONTINUITY KEY.\n\nA receipt prints for $0.00 and twelve human years. It curls directly into your hand before you can decline custody.");
      }
      return;
    }

    if (state.room === 'hr_reliquary' && state.flags.tarotSolved && ['tower','fool','sun'].includes(a))
      return print('Orientation is already complete. The eastern passage is open; the cards stay on the table.');
    if (state.room === 'hr_reliquary' && (a === 'tower' || /tower/.test(c.objectText))) {
      if (c.targetText && b !== 'tarot_spread' && !/^(?:the )?(?:orientation )?table$/.test(c.targetText))
        return print('That is not the tarot spread. The card stays where it is.');
      state.flags.tarotSolved = true; print("You select THE TOWER. Merlin purrs.\n\nThe east wall splits down the middle with the sound of a building reconsidering its benefits package. A passage appears.\n\nHR has successfully facilitated change."); return;
    }

    if (state.room === 'hr_reliquary' && (a === 'fool' || a === 'sun')) {
      if (c.targetText && b !== 'tarot_spread' && !/^(?:the )?(?:orientation )?table$/.test(c.targetText))
        return print('That is not the tarot spread. The card stays where it is.');
      return die('orientation', a === 'fool' ? "You select THE FOOL. HR appreciates your self-identification. The floor opens beneath you." : "You select THE SUN. It is not the sun. Your shadow notices first.");
    }

    if (state.room === 'continuity_chamber' && (a === 'silver_key' || /key/.test(c.objectText))) {
      if (state.flags.keyUsed) return print(state.flags.finalOpen ? 'The silver key remains locked into the mechanism. The household door is already open.' : 'The silver key is already locked into the mechanism. Five lit seals still wait for the five names.');
      if (!state.inventory.includes('silver_key')) return print('You need the silver key in your hand, not merely in a sentence.');
      if (c.targetText && !/^(?:(?:the|a|an) )?(?:five (?:brass )?seals|(?:brass )?seals|key slot|silver key slot|slot(?: beneath (?:the )?(?:five )?seals)?|(?:final |eastern |east )?door)$/.test(c.targetText))
        return print('The key fits the slot beneath the five seals, not that target.');
      state.flags.keyUsed = true;
      state.inventory = state.inventory.filter(id => id !== 'silver_key');
      const passwordLine = state.flags.readNapkin
        ? "The napkin's words return: HOME IS A PASSWORD."
        : 'A phrase resolves above the seals: HOME IS A PASSWORD.';
      print(`Boo lifts one paw with executive reluctance. The silver key fits the slot beneath the five seals, turns once, and locks in place. Five small lights wake above the door.\n\nStarting at the uppermost seal and following the engraved arrow clockwise, the poses resolve in the light: a huge white cat sitting upright; a black cat curled asleep; a small grey cat crouched high; a black cat peering from concealment; a grey cat with one paw raised. Not decorations. A household, filed as infrastructure.\n\n${passwordLine} The chamber waits for the five names.`); return;
    }

    if (a === 'black_candle' || hasWord(c.objectText, 'candle')) {
      if (c.targetText) return print('The candle lights with its own striker cap; it is not used on that target. Nothing changes.');
      if (!state.inventory.includes('black_candle')) return print('There is no candle in your inventory to light.');
      if (state.flags.candleLit) return print('The black emergency candle is already burning with a green flame.');
      state.flags.candleLit = true;
      print("You twist the candle's metal striker cap until it clicks. The black candle lights itself. Its flame is green. You now have a working light, not merely the correct equipment."); return;
    }

    if (a && !c.targetText) {
      if (a === 'napkin') {
        observe('napkin'); state.flags.readNapkin = true;
        return print('The napkin drawing says HOME IS A PASSWORD. Keep that in mind when you reach the final door.');
      }
      const replies = {
        agenda: 'The agenda is for reading, not signing. Its five empty lines are the warning.',
        badge: 'The badge might pry open the acrylic stamp box in Legal. It will not open any electronic door.',
        water: 'The water has formed a skin. Drinking it would be a management decision, and you are not management here.',
        mug: 'The mug is empty. The break room has a coffee machine, but Jorge wants the hazelnut creamer.',
        creamer: 'The creamer is marked JORGE ONLY. Bring it to him at the Records gate.',
        memo: 'Read the memo. Its feeding policy is more useful than it deserves to be.',
        napkin: 'The napkin drawing says HOME IS A PASSWORD. Keep that in mind when you reach the final door.',
        jorge: state.flags.jorgeMoved ? 'Jorge has moved aside. The Records gate is clear; go south.' : 'Jorge is blocking the Records gate. He might accept the creamer from the break room.',
        form66b: 'Form 66-B is already completed and belongs in Procurement\'s FORM slot.',
        waiver_form: state.flags.waiverStamped ? 'Waiver Form 4C is stamped and belongs in Procurement\'s WAIVER slot.' : 'Waiver Form 4C still needs Waiver Stamp 4C before Procurement will accept it.',
        waiver_stamp: 'Use Waiver Stamp 4C on the detachable Waiver Form 4C. The rubber stamp itself does not go into Procurement.',
        procurement_receipt: 'The receipt is the employee copy. Read it or keep it; Asset Control does not want it back.',
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

    if (a) {
      const diagnosis = b
        ? 'Both objects are recognized; this is the wrong target or location.'
        : c.targetText
          ? 'The item is recognized, but the target is not.'
          : 'The item is recognized, but this action is not useful here.';
      return print(`You ${c.verbToken || 'use'} ${DORK_DATA.items[a].name}${b ? ` on ${typeof b === 'string' && DORK_DATA.items[b] ? DORK_DATA.items[b].name : c.targetText}` : ''}. The universe declines to recognize this workflow. ${diagnosis}`);
    }
    print("Use what, exactly? Specificity is the thin line between magic and a meeting.");
  }

  function talkThing(c) {
    const t = `${c.objectText} ${c.targetText}${c.topic ? ' about '+c.topic : ''}`.trim().replace(/\s+/g,' ');
    if (state.room === 'break_room' && hasWord(t, 'jorge')) return print('Jorge is at his Records desk to the south. His creamer is here beneath the JORGE ONLY warning.');
    if (state.room === 'subbasement' && /^(?:for )?(?:directions|way out|exit)$/.test(t)) return print('The painted arrow points east to the Continuity Chamber. Black roots block the parking passage.');
    if (state.room === 'continuity_chamber' && /^(?:for )?names$|^(?:the )?room about seals$/.test(t)) return print(state.flags.keyUsed ? 'Start at the uppermost of the five lit seals and follow the engraved arrow clockwise. Match each pose to one of the five cats you met.' : 'The five seals are dark. Use the silver key in the visible slot beneath them, then follow the engraved arrow.');
    const names = ['boo','salem','ash','luna','merlin'];
    const allFiveNames = names.every(n => new RegExp(`\\b${n}\\b`).test(t));
    if (state.room === 'continuity_chamber' && allFiveNames && !state.flags.keyUsed)
      return print('You say the five names, but the seals remain dark. Use the silver continuity key first.');
    if (state.room === 'continuity_chamber' && state.flags.finalOpen && allFiveNames) return print('The household door is already open. Repeating the names does not create a second exit.');
    if (state.room === 'continuity_chamber' && state.flags.keyUsed && allFiveNames) {
      if (!/\bboo\b.*\bsalem\b.*\bash\b.*\bluna\b.*\bmerlin\b/.test(t)) return print('The five seals flicker without opening the door. They remain awake. Match the poses: start at the uppermost seal and follow the engraved arrow clockwise.');
      state.flags.finalOpen = true;
      print("You name them: BOO. SALEM. ASH. LUNA. MERLIN.\n\nOne by one, the brass seals illuminate. The enormous door unlocks with a sound like five hundred filing cabinets opening at once.\n\nBoo stands, stretches, and moves aside.\n\nFor the first time tonight, you have been cleared to leave."); return;
    }
    if (state.room === 'records_lobby' && /jorge/.test(t)) return print(state.flags.jorgeMoved ? "Jorge says, 'Records retention is forever.' He smiles. You suspect this is not metaphorical." : "Jorge looks up. 'Do you have something for me?'\n\nHis eyes move briefly toward the break-room side of the building.");
    if (state.room === 'records_stacks' && (hasWord(t, 'ash') || hasWord(t, 'cat'))) return print('Ash watches from Shelf 20. He recommends, without words, that you leave before the filing starts.');
    if (state.room === 'hr_reliquary' && /merlin|cat/.test(t)) return print("Merlin taps THE TOWER once with a paw, then looks at you. This is humiliatingly clear guidance.");
    if (state.room === 'occult_compliance' && /salem|cat/.test(t)) return print("Salem opens one eye. 'Mrrp.'\n\nYou have received more actionable guidance from this than from several executive briefings.");
    if (state.room === 'archives' && /luna|cat/.test(t)) return print("Luna retreats farther into the open arch beneath the stone reading stand when you mention the stair. Strong no.");
    if (state.room === 'continuity_chamber' && /boo|cat/.test(t)) return print(state.flags.keyUsed ? "Boo looks at the five seals, then at you. Naming things is apparently your department now." : "Boo sits beside the key slot and watches you ignore the silver continuity key. Leadership oversight at its purest.");

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
    if (state.room === 'occult_compliance' && c.verb === 'touch' && hasWord(c.objectText, 'drawings')) return print("The frames are cold beneath your fingers. Angela, Julia, and Audrey each drew the same impossible building; the same marked door dominates all three views, and their signatures remain the three witnesses.");
    if (state.room === 'archives' && ['push','pull'].includes(c.verb) && /(?:stand|reading stand|pedestal)/.test(c.objectText))
      return print('The broad stone reading stand is mortared to the floor. Bureaucracy has prepared it for resistance literally.');
    if (state.room === 'archives' && c.verb === 'search' && hasWord(c.objectText, 'cabinets')) return print('The cabinets are mortared shut. The ledger on its pedestal is the record you can actually read.');
    if (c.verb === 'search') return examine(c.objectText);
    if (state.room === 'subbasement' && c.verb === 'listen' && hasWord(c.objectText, 'breathing')) return print('The breathing comes from beyond the collapsed parking passage. The painted arrow points east, away from it.');
    if (c.verb === 'stamp') return stampThing(c);
    if (state.room === 'procurement' && c.verb === 'buy' && hasWord(c.objectText, 'candle')) return print('The requisition machine does not take money. Insert completed Form 66-B and stamped Waiver Form 4C to receive the black candle.');
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
    const id = findItem(c.objectText);
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
        luna: 'Luna allows a brief touch, then retreats into the open arch beneath the stone reading stand. She has better instincts than you.',
        boo: 'Boo accepts your attention as tribute. The door remains unimpressed.'
      };
      return print(catScene(id,lines[id]));
    }
    if (['smell', 'listen', 'lick'].includes(c.verb) && ['ash','merlin','salem','luna','boo'].includes(id)) {
      const cats = {
        ash: {smell: 'Ash smells faintly of dust from Shelf 20.', listen: 'Ash makes a small warning sound from the shelf. Something here frightens him.', lick: 'Ash retreats higher on Shelf 20. That is a reasonable response to your proposal.'},
        merlin: {smell: 'Merlin smells of old paper and the HR table. His paw stays beside The Tower.', listen: 'Merlin purrs, then taps The Tower with one paw.', lick: 'Merlin moves away from your face and points you back toward The Tower.'},
        salem: {smell: 'Salem smells of warm fur and the paper in the nearby inbox.', listen: 'Salem purrs beside the empty inbox. The freight elevator is quieter.', lick: 'Salem withdraws from this terrible plan. The inbox remains available for normal investigation.'},
        luna: {smell: 'Luna smells of dry paper from beneath the stone reading stand.', listen: 'Luna breathes softly in the open arch beneath the stand. She is hiding from something below.', lick: 'Luna slips farther beneath the stand. Leave the frightened cat alone.'},
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
        ledger: 'The ledger is heavy, dry, and chained to the stone reading stand. Luna stays hidden in the open arch beneath the stand.',
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
        touch: 'The card edges are worn. Merlin presses one paw beside The Tower, keeping his recommendation clear.',
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
    if(state.dead || state.won) return print('This run is complete. LORE and DEATHS remain available.');
    const hint = DorkSupport.hint(state,meta);
    const step = Math.min(3,(state.hintSteps[hint.key] || 0)+1);
    state.hintSteps[hint.key]=step;
    meta.hints++; saveMeta();
    print(`MANAGEMENT ASSISTANCE REQUIRED #${meta.hints} — HINT ${step}/3:\n${hint.steps[step-1]}${step < 3 ? '\nAsk HINT again for a more explicit level.' : ''}`);
  }

  function inventory() {
    if (!state.inventory.length) return print("You are carrying nothing except professional confidence.");
    print("You are carrying:\n" + state.inventory.map(id => `- ${DORK_DATA.items[id].name}`).join('\n'));
  }

  function help() {
    print("DORK understands commands such as VERB OBJECT or VERB OBJECT ON/TO TARGET.\nThe examples below use imaginary objects and people. They are not clues.\n\nLOOK / EXAMINE POSTER / TAKE PENCIL / DROP PENCIL\nN, S, E, W or NORTH, SOUTH, EAST, WEST\nUSE SCREWDRIVER ON PANEL / GIVE PARCEL TO RECEPTIONIST\nTALK TO RECEPTIONIST / ASK RECEPTIONIST ABOUT HOURS\nOPEN SUITCASE / READ POSTCARD / MAKE A JOKE / INVENTORY / LEAVE ROOM\nLICK, SMELL, TOUCH, PUSH, PULL, BREAK, BURN, EAT, DRINK, THROW, HIDE, PRAY, THREATEN, FLATTER, etc.\n\nINVENTORY (or INV / I) lists only what you are carrying.\nHELP explains commands. HINT offers optional, increasingly explicit puzzle assistance.\nOther commands: DEATHS, LORE, MAP, SAVE, RESTART.\nTOOLS contains display settings, command history, save import/export, and transcript export.\n\nTry unreasonable things. The game has opinions.");
  }

  function showDeaths() { print(meta.deaths.length ? "PERSONNEL SEPARATION LOG:\n" + meta.deaths.map((d,i)=>`${i+1}. ${d}`).join('\n') : "PERSONNEL SEPARATION LOG: No deaths recorded. This is temporary."); }
  function showLore() { print(meta.lore.length ? "DISCOVERED ARCHIVE:\n" + meta.lore.map((x,i)=>`${i+1}. ${x}`).join('\n') : "DISCOVERED ARCHIVE: Empty. Ignorance remains your most complete record."); }

  function describeRoom(force=false) {
    const room = roomNow();
    const remembered = meta.knownRooms.includes(state.room);
    if (!remembered) meta.knownRooms.push(state.room);
    for(const id of room.items || []) if(DorkSupport.catFacts[id]) observe(id);
    const description = !force && remembered && ui?.preferences.brief ? briefDescription(room) : roomDescription(room);
    print(`\n[${room.name.toUpperCase()}]\n${description}`);
    const visible = visibleItems();
    if (visible.length) print(`Visible: ${visible.map(id=>DORK_DATA.items[id].name).join(', ')}.`, 'dim');
    const exits = Object.keys(room.exits || {});
    if (exits.length) print(`Exits: ${exits.join(', ')}.`, 'dim');
    refreshObservedExits();
    const extra=expansion.roomExtra(); if(extra) print(extra,'dim');
    if (state.room === 'asset_control') {
      const assets = carriedGovernmentProperty();
      print(assets.length ? `SCANNER FLAGS: ${assetList(assets)}.` : 'SCANNER: NO STATE PROPERTY DETECTED. EAST DOOR GREEN.', 'dim');
    }
    updateStatus();
  }
  function refreshObservedExits() {
    state.knownExits[state.room]=Object.keys(roomNow().exits || {}).filter(d=>!(state.room==='hr_reliquary' && d==='east' && !state.flags.tarotSolved));
  }
  function roomDescription(room) {
    let description=flagDescription(room);
    const here=visibleItems();
    if(state.room==='meeting' && !['agenda','badge'].every(id=>here.includes(id))) {
      const table=['agenda','badge','water'].filter(id=>here.includes(id)).map(id=>DORK_DATA.items[id].name);
      description=description.replace(/On the table:.*$/, 'On the table: '+table.join(', ')+'.');
    }
    if(state.room==='break_room') {
      if(!here.includes('creamer')) description=description.replace(/A jar of hazelnut creamer sits beneath a handwritten warning: 'JORGE ONLY.'/, 'A handwritten JORGE ONLY warning marks the creamer’s now-empty place.');
      if(!here.includes('napkin')) description=description.replace(/Someone has drawn three little stick figures on a napkin and labeled them ANGELA, JULIA, and AUDREY\./, 'The napkin drawing has been removed from the counter.');
    }
    if(state.room==='legal_annex' && !here.includes('waiver_form')) description=description.replace('A detachable Page 64 labeled WAIVER FORM 4C is tucked underneath it.', 'The detachable Waiver Form 4C has been removed from beneath it.');
    return description;
  }
  function briefDescription(room) {
    const changed = Object.entries(room.descByFlag || {}).find(([flag])=>state.flags[flag]);
    return changed ? changed[1] : room.brief || room.desc.split('\n\n')[0];
  }

  function flagDescription(entry) {
    const active = Object.entries(entry.descByFlag || {}).find(([flag]) => state.flags[flag]);
    return active ? active[1] : entry.desc;
  }

  function win() {
    if (state.won) return;
    state.won = true;
    meta.won = true; saveMeta();
    const fileCallback = state.flags.readPersonnelFile
      ? "\n\nThe file you read in Records was dated before your law-school graduation. Outside, that fact feels less like a clue than an accusation the Agency can no longer answer."
      : '';
    const expansionEnding = expansion.ending();
    if(expansionEnding) print(expansionEnding);
    print(`\n*** TRUE ENDING: RELEASED FROM CONTINUITY ***\n\nScott has escaped the Agency. The Agency has not escaped Scott.${fileCallback}\n\nYour run is complete. Type DEATHS, LORE, or RESTART if you have learned nothing.`, 'death');
  }

  function die(code, text) {
    print(`\n${text}\n\n*** EMPLOYMENT STATUS: TERMINATED ***`, 'death');
    const labels = { electrical:'Fitted a fuse into live service infrastructure', consent:'Reinstated consent by occupying the identity chair', darkness:'Entered unlit continuity infrastructure', orientation:'Failed mandatory orientation', jorge:'Initiated unauthorized Jorge interaction', cat:'Committed an unforgivable policy violation', contract:'Executed contract without adequate review', property:'Attempted unauthorized removal of state property' };
    const warningSeen = ({darkness:state.observed.includes('luna') || state.visited.includes('archives'), orientation:state.visited.includes('hr_reliquary'), contract:state.observed.includes('contract'), property:state.visited.includes('asset_control'), electrical:state.visited.includes('relay_chamber') || state.observed.includes('relay_instructions'), consent:state.visited.includes('below'), cat:true, jorge:true})[code] === true;
    meta.reports.push({code,room:state.room,command:currentCommand,lesson:DorkSupport.lessons[code] || 'Review the last action and the available warnings.',warningSeen,run:meta.runs});
    meta.deaths.push(labels[code] || 'Administrative death'); meta.runs++; saveMeta();
    if(!rejectedSave) store.remove(RUN_KEY);
    print("\nType RESTART to begin a new run. The narrator will remember this.");
    state.dead = true;
  }

  function restart() {
    if (!state.dead && !state.won && !restartPending) {
      restartPending = true;
      return print('RESTART will erase this run. Type RESTART again as your next command to confirm.');
    }
    restartPending = false;
    if(!state.dead) {meta.runs++; saveMeta();}
    state = newRun(); pendingClarification=null; saveRun(); print("\n--- NEW RUN ---\nThe building has reset. Your dignity has not.\n");
    const report=meta.reports[meta.reports.length-1]; if(report && DorkSupport.callbacks[report.code]) print(DorkSupport.callbacks[report.code],'dim');
    describeRoom(true);
  }

  function visibleItems() {
    return [...new Set([...(roomNow().items || []), ...Object.keys(state.dropped).filter(id=>state.dropped[id]===state.room)])]
      .filter(id=>DORK_DATA.items[id] && (!state.taken.includes(id) || !DORK_DATA.items[id].portable || state.dropped[id]===state.room));
  }
  function scopedItems(roomOnly=false) {
    return [...new Set([...visibleItems(),...(roomNow().scenery || []),...(roomOnly ? [] : state.inventory)])];
  }
  function findItem(text, roomOnly=false) { return DorkCore.resolve(text,scopedItems(roomOnly),DORK_DATA.items).id; }
  function findInventory(text) { return DorkCore.resolve(text,state.inventory,DORK_DATA.items).id; }
  function hasWord(text, phrase) { return DorkCore.hasWord(text,phrase); }

  function specialTarget(t) { return hasWord(t, 'jorge') ? 'jorge' : null; }

  function discoverLore(id) {
    const loreMap = {
      records_file: "Scott's personnel file was created before his law-school graduation.",
      contract: "The Agency can retain identity and post-mortem administrative capacity through consent.",
      drawings: "Angela, Julia, and Audrey's drawings act as three witnesses to the Continuity door.",
      compliance_manual: "Five household anchors must be named in the correct sequence to release a Continuity seal.",
      ledger: "Scott was invited by authority, retained by consent, and may be released by an anchor."
    };
    if (loreMap[id] && !meta.lore.includes(loreMap[id])) { meta.lore.push(loreMap[id]); saveMeta(); print("[ARCHIVE UPDATED]", 'dim'); }
  }

  function roomNow(){
    const base=DORK_DATA.rooms[state.room];
    return {...base,exits:expansion.exits(state.room,base.exits || {}),exitAliases:expansion.aliases(state.room,base.exitAliases || {})};
  }
  function newRun(){ return DorkCore.newRun(DORK_DATA); }
  function saveRun(){ return state.dead ? true : rejectedSave ? false : store.write(RUN_KEY,state); }
  function saveMeta(){ return rejectedSave ? false : store.write(META_KEY,meta); }
  function hash(s){ let h=0; for(let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0; return h; }
  function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
  function print(content, cls='', trusted=false){
    const follow=out.scrollHeight-out.clientHeight-out.scrollTop < 80;
    const p=document.createElement('p'); if(cls) p.className=cls;
    if(trusted) p.innerHTML=content; else p.textContent=String(content);
    out.appendChild(p);
    ui?.record(trusted ? p.textContent : content, cls==='dim' && String(content).startsWith('> ') ? 'command' : 'response');
    while(out.children.length > 900) out.firstElementChild.remove();
    if(follow) scrollBottom(true); else ui?.hasNewOutput();
  }
  function scrollBottom(force=false){ if(force) requestAnimationFrame(()=>{ out.scrollTop=out.scrollHeight; }); }
  function updateStatus(){ runStatus.textContent=`RUN ${meta.runs} · DEATHS ${meta.deaths.length} · HINTS ${meta.hints}`; roomStatus.textContent=DORK_DATA.rooms[state.room].name.toUpperCase(); }
  function observe(id) {
    if(!DORK_DATA.items[id]) return;
    if(!state.observed.includes(id)) state.observed.push(id);
    if(!meta.observations.includes(id)) meta.observations.push(id);
    expansion.onObserve(id);
    const evidence=DorkSupport.catFacts[id] || expansion.specialDescription(id) || DorkWorld.description(id,state) || flagDescription(DORK_DATA.items[id]);
    state.evidence[id]=evidence; meta.evidence[id]=evidence;
  }
  function reclaimProperty(text) {
    if(state.room!=='asset_control') return print('Asset Control’s recovery hatch is the authorized place to reclaim returned property.');
    const returned=state.flags.returnedAssets || [];
    const result=DorkCore.resolve(text,returned,DORK_DATA.items);
    if(result.matches.length>1) return print('Name the returned asset precisely: '+result.matches.map(id=>DORK_DATA.items[id].name).join(', ')+'.');
    const id=result.id;
    if(!id) return print('That asset is not in the recovery hatch. Only property you returned can be reclaimed.');
    state.flags.returnedAssets=returned.filter(x=>x!==id);
    if(!state.inventory.includes(id)) state.inventory.push(id);
    print(`Reclaimed: ${DORK_DATA.items[id].name}. The scanner flags it again. Return it before leaving the Agency.`);
  }
  function catScene(id,line) {
    observe(id);
    const key=id+'Scene';
    if(state.flags[key] || id==='ash') return line;
    state.flags[key]=true;
    const scenes={
      merlin:'He places his raised paw on your hand, then beside The Tower. Not a trick. A patient animal trying to be understood in a room designed for the opposite.',
      salem:'For a moment the inbox stops trembling. He curls back into the same sleeping shape beneath the three drawings. The building can file a household, but it has not learned how to be one.',
      luna:state.flags.candleLit && state.inventory.includes('black_candle') ? 'The green candlelight reaches beneath the stand. Luna edges forward far enough for you to see her black fur, then retreats. She does not need to accompany you for the warning to matter.' : 'She looks from your empty light to the stair and presses herself deeper beneath the stand. Only her eyes remain visible. She has not been hiding from you.',
      boo:state.flags.finalOpen ? 'He stretches, then sits upright again beside the open doorway. His work appears complete. Yours involves a scanner.' : 'Boo sits upright again, white and immense. The brass outline above the door echoes his posture. He is not blocking a solution; he is part of what the solution describes.'
    };
    return line+'\n\n'+scenes[id];
  }
  function mapEntries(){ return DorkSupport.map(state,meta,DORK_DATA,id=>expansion.exits(id,DORK_DATA.rooms[id].exits || {}),(id,dir)=>{
    const key=DORK_DATA.rooms[id].blocked?.[dir];
    if(!key) return '';
    if(key==='jorge') return !state.flags.jorgeMoved;
    if(key==='tarot') return !state.flags.tarotSolved;
    if(key==='final_seal') return !state.flags.finalOpen;
    return expansion.blocked(key);
  }); }
  function backup(){ return {format:'dork-backup',schemaVersion:DorkCore.SAVE_VERSION,gameVersion:DorkCore.VERSION,exportedAt:new Date().toISOString(),run:JSON.parse(JSON.stringify(state)),meta:JSON.parse(JSON.stringify(meta))}; }
  function importBackup(decoded){
    state=decoded.run; meta=decoded.meta; pendingClarification=null; restartPending=false; rejectedSave=null;
    if(state.dead) store.remove(RUN_KEY); else saveRun(); saveMeta();
    out.replaceChildren(); print('BACKUP IMPORTED. Current run and accumulated knowledge replaced.');
    describeRoom(true); if(state.dead) print('This imported run ended in termination. Type RESTART.');
    scrollBottom(true);
  }
  const expansion = DorkExpansion.create({state:()=>state,meta:()=>meta,print,observe,resolve:findItem,take,die,move});
  ui=DorkUI.create({state:()=>state,meta:()=>meta,data:DORK_DATA,store,map:mapEntries,backup,importBackup,rejectedSave:()=>rejectedSave,rejectedMeta:()=>loadedMeta});
  boot(); saveRun(); saveMeta();
})();
