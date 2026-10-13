/* DORK engine primitives. No DOM, network, framework, or persistent puzzle buffs. */
'use strict';
const DorkCore = (() => {
  const VERSION = '2.0.0';
  const SAVE_VERSION = 2;
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const record = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const unique = a => [...new Set(a)];
  const strings = (v, limit = 1000) => Array.isArray(v) ? unique(v.filter(x => typeof x === 'string').map(x => x.slice(0, 4000))).slice(-limit) : [];
  const normalize = value => String(value || '').toLowerCase().trim().replace(/^(?:the|a|an)\s+/, '').replace(/\s+/g, ' ');
  const hasWord = (text, phrase) => {
    const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    return !!escaped && new RegExp(`(?:^|\\b)${escaped}(?:$|\\b)`, 'i').test(String(text || ''));
  };

  /** Resolve once, independent of inventory order. Exact names beat substrings.
   * A genuine tie is returned to the controller for clarification, never guessed.
   */
  function resolve(text, candidates, items) {
    const t = normalize(text);
    if (!t) return {id: null, matches: []};
    const ranked = unique(candidates).filter(id => own(items, id)).map(id => {
      const item = items[id];
      const aliases = unique([id, item.name, ...(item.aliases || [])].map(normalize));
      const exact = aliases.includes(t);
      const length = Math.max(0, ...aliases.filter(a => hasWord(t, a)).map(a => a.length));
      return {id, score: exact ? 100000 + t.length : length};
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    const matches = ranked.filter(x => x.score === ranked[0]?.score).map(x => x.id);
    return {id: matches.length === 1 ? matches[0] : null, matches};
  }

  function newRun(data) {
    return {schemaVersion: SAVE_VERSION, gameVersion: VERSION, room: data.startRoom, previousRoom: null,
      inventory: [], taken: [], dropped: {}, flags: {}, visited: [data.startRoom], observed: [],
      knownExits: {}, evidence: {}, hintSteps: {}, turns: 0, dead: false, won: false};
  }
  function validateRun(value, data) {
    const base = newRun(data);
    if (!record(value)) return base;
    if (Number(value.schemaVersion) > SAVE_VERSION) throw new Error('This save was created by a newer DORK version.');
    if (!own(data.rooms, value.room)) return base;
    const validItem = id => own(data.items, id);
    const validRoom = id => own(data.rooms, id);
    base.room = value.room;
    base.previousRoom = validRoom(value.previousRoom) ? value.previousRoom : null;
    base.inventory = strings(value.inventory).filter(id => validItem(id) && data.items[id].portable);
    base.taken = unique([...strings(value.taken).filter(validItem), ...base.inventory]);
    base.visited = unique([...strings(value.visited).filter(validRoom), base.room]);
    base.observed = strings(value.observed).filter(validItem);
    if(record(value.evidence)) for(const [id,text] of Object.entries(value.evidence)) if(validItem(id) && typeof text==='string') base.evidence[id]=text.slice(0,6000);
    base.turns = Number.isSafeInteger(value.turns) && value.turns >= 0 ? value.turns : 0;
    base.dead = value.dead === true;
    base.won = value.won === true && data.rooms[base.room].ending === true;
    const allowedFlags = new Set(['jorgeMoved','stampTaken','formInserted','waiverInserted','stampInserted','waiverStamped','procured','objectionFiled','keyUsed','candleLit','tarotSolved','finalOpen','readPersonnelFile','readNapkin','joked','ticketResolved','relayIsolated','relayRepaired','serviceReturn','liftRestored','evidenceCompared','identityDisputed','identityReleased','ashWarned','ashScene','merlinScene','salemScene','lunaScene','booScene','readServiceTicket','readRelayInstructions','readAuditDossier','readIdentityConsole','readMaintenanceOrder']);
    if (record(value.flags)) {
      for (const [key, val] of Object.entries(value.flags)) {
        if (allowedFlags.has(key) && typeof val === 'boolean') base.flags[key] = val;
      }
      if (Array.isArray(value.flags.returnedAssets)) base.flags.returnedAssets = strings(value.flags.returnedAssets).filter(validItem);
    }
    if (record(value.dropped)) {
      for (const [id, room] of Object.entries(value.dropped)) {
        if (validItem(id) && data.items[id].portable && validRoom(room) && !base.inventory.includes(id)) {
          base.dropped[id] = room;
          if (!base.taken.includes(id)) base.taken.push(id);
        }
      }
    }
    if (record(value.hintSteps)) for (const [key, n] of Object.entries(value.hintSteps)) {
      if (/^[a-zA-Z0-9_-]{1,80}$/.test(key) && Number.isInteger(n)) base.hintSteps[key] = Math.min(3, Math.max(0, n));
    }
    if (record(value.knownExits)) for (const [room, exits] of Object.entries(value.knownExits)) {
      if (validRoom(room)) base.knownExits[room] = strings(exits, 6).filter(dir => ['north','south','east','west','up','down'].includes(dir));
    }
    // Version-one migrations preserve existing progress; new departments stay optional.
    if (base.flags.procured) base.flags.objectionFiled = true;
    if (base.flags.stampInserted) {
      base.flags.waiverInserted = true; base.flags.waiverStamped = true; delete base.flags.stampInserted;
    }
    if (base.flags.readPersonnelFile) base.observed.push('records_file');
    if (base.flags.readNapkin) base.observed.push('napkin');
    const consumed = [];
    if (base.flags.jorgeMoved) consumed.push('creamer');
    if (base.flags.formInserted) consumed.push('form66b');
    if (base.flags.waiverInserted) consumed.push('waiver_form');
    if (base.flags.keyUsed) consumed.push('silver_key');
    if (base.flags.relayRepaired) consumed.push('replacement_fuse');
    if (base.flags.identityReleased) consumed.push('revocation_notice');
    consumed.push(...(base.flags.returnedAssets || []));
    base.inventory = base.inventory.filter(id => !consumed.includes(id));
    for (const id of consumed) { delete base.dropped[id]; if (!base.taken.includes(id)) base.taken.push(id); }
    if (base.flags.procured && !base.taken.includes('procurement_receipt')) {
      base.inventory.push('procurement_receipt'); base.taken.push('procurement_receipt');
    }
    base.observed = unique(base.observed);
    return base;
  }
  function validateMeta(value) {
    const v = record(value) ? value : {};
    const n = (x, fallback) => Number.isSafeInteger(x) && x >= 0 ? x : fallback;
    const deaths = Array.isArray(v.deaths) ? v.deaths.filter(x => typeof x === 'string').map(x => x.slice(0, 300)).slice(-2000) : [];
    const legacy = {
      "Scott's personnel file predates his involvement with the Agency.": "Scott's personnel file was created before his law-school graduation.",
      'Five household anchors must be named to release a Continuity seal.': 'Five household anchors must be named in the correct sequence to release a Continuity seal.'
    };
    return {schemaVersion: SAVE_VERSION, runs: Math.max(1, n(v.runs, deaths.length + 1)), deaths,
      lore: strings(v.lore).map(s => legacy[s] || s), hints: n(v.hints, 0), won: v.won === true,
      observations: strings(v.observations), knownRooms: strings(v.knownRooms),
      evidence: record(v.evidence) ? Object.fromEntries(Object.entries(v.evidence).filter(([id,text])=>/^[a-z][a-z0-9_]{0,100}$/.test(id) && !['constructor','prototype'].includes(id) && typeof text==='string').slice(0,300).map(([id,text])=>[id,text.slice(0,6000)])) : {},
      reports: Array.isArray(v.reports) ? v.reports.filter(record).slice(-100).map(r => ({
        code: String(r.code || '').slice(0, 50), room: String(r.room || '').slice(0, 100),
        command: String(r.command || '').slice(0, 300), lesson: String(r.lesson || '').slice(0, 1500),
        warningSeen: r.warningSeen === true, run: n(r.run, 1)
      })) : []};
  }

  /** Memory-backed storage continues to work after a denied/quota-limited write.
   * Once a key fails, its memory copy takes precedence over any stale disk copy.
   */
  function storage(onFailure = () => {}) {
    const memory = new Map();
    let failed = false;
    const fail = error => { failed = true; onFailure(error); };
    return {
      get failed() { return failed; },
      read(key, fallback) {
        try {
          const raw = memory.has(key) ? memory.get(key) : globalThis.localStorage.getItem(key);
          if (raw == null) return fallback;
          return JSON.parse(raw);
        } catch (error) { fail(error); return fallback; }
      },
      write(key, value) {
        const raw = JSON.stringify(value);
        memory.set(key, raw);
        try { globalThis.localStorage.setItem(key, raw); return true; }
        catch (error) { fail(error); return false; }
      },
      remove(key) {
        memory.set(key, null);
        try { globalThis.localStorage.removeItem(key); return true; }
        catch (error) { fail(error); return false; }
      }
    };
  }
  function decodeBackup(text, data) {
    if (typeof text !== 'string' || text.length > 2_000_000) throw new Error('Save file is too large.');
    let v;
    try { v = JSON.parse(text); } catch { throw new Error('This file is not valid JSON.'); }
    if (!record(v) || v.format !== 'dork-backup' || !record(v.run) || !record(v.meta)) throw new Error('This is not a DORK backup.');
    if (!Number.isInteger(v.schemaVersion) || v.schemaVersion > SAVE_VERSION || v.schemaVersion < 1 || Number(v.run.schemaVersion) > SAVE_VERSION || Number(v.meta.schemaVersion) > SAVE_VERSION) throw new Error('Unsupported save version.');
    if (!own(data.rooms, v.run.room) || !Array.isArray(v.run.inventory) || !Array.isArray(v.run.visited) || !record(v.run.flags)) throw new Error('The saved run is malformed; your current run has not changed.');
    return {run: validateRun(v.run, data), meta: validateMeta(v.meta)};
  }
  return {VERSION, SAVE_VERSION, normalize, hasWord, resolve, newRun, validateRun, validateMeta, storage, decodeBackup};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DorkCore;
