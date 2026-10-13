/* Pure engine invariants, independent of browser rendering. Run: node tests/core_test.js */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({console});
for (const file of ['engine-core.js','game-data.js','expansion-data.js','world-content.js','parser.js','casebook.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const execute = source => vm.runInContext(source,context);
const snapshot = source => JSON.parse(JSON.stringify(execute(source)));
let checks=0;
function check(name, body){body();checks++;console.log('PASS',name);}
check('Exact waiver references are independent of all inventory permutations',()=>{
  execute(`globalThis.permutations = a => a.length ? a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(rest=>[v,...rest])) : [[]];`);
  const results=snapshot(`permutations(['form66b','waiver_form','waiver_stamp']).map(scope=>['waiver form','waiver stamp','form 66-b'].map(text=>DorkCore.resolve(text,scope,DORK_DATA.items).id))`);
  for(const r of results)assert.deepEqual(r,['waiver_form','waiver_stamp','form66b']);
});
check('Genuine ambiguous book references are not silently guessed',()=>{
  assert.equal(execute(`DorkCore.resolve('book',['ledger','compliance_manual'],DORK_DATA.items).id`),null);
  assert.deepEqual(snapshot(`DorkCore.resolve('book',['ledger','compliance_manual'],DORK_DATA.items).matches`),['compliance_manual','ledger']);
});
check('Exact visible names resolve to their own objects',()=>{
  const failures=snapshot(`Object.entries(DORK_DATA.items).filter(([id,item])=>DorkCore.resolve(item.name,[id],DORK_DATA.items).id!==id).map(([id])=>id)`);
  assert.deepEqual(failures,[]);
});
check('All take aliases normalize to the same action',()=>{
  const aliases=snapshot(`Object.entries(DorkParser.verbMap).filter(([token,verb])=>verb==='take').map(([token])=>token)`);
  for(const token of aliases)assert.equal(execute(`DorkParser.parse(${JSON.stringify(token+' the sun')},{room:'hr_reliquary'}).verb`),'take');
});
check('Negated and compound commands are never dispatched',()=>{
  for(const text of ['do not attack cat',"don't choose sun",'never sign contract','take badge; attack cat'])assert.equal(execute(`DorkParser.parse(${JSON.stringify(text)},{room:'meeting'})`),null);
});
check('Conversation topics survive parsing',()=>{
  const c=snapshot(`DorkParser.parse('ask Jorge about the invitation',{room:'records_lobby'})`);
  assert.equal(c.verb,'talk');assert.equal(c.objectText,'jorge');assert.equal(c.topic,'the invitation');
});
check('Malformed saved collections recover without executable properties',()=>{
  const s=snapshot(`DorkCore.validateRun({room:'meeting',inventory:['bogus','badge','badge','jorge'],taken:null,visited:{},flags:{keyUsed:'yes',evil:true},dropped:{badge:'badroom'},observed:'bad'},DORK_DATA)`);
  assert.deepEqual(s.inventory,['badge']);assert.deepEqual(s.visited,['meeting']);assert.deepEqual(s.flags,{});
});
check('Version-one paperwork and key migrations preserve progress',()=>{
  const s=snapshot(`DorkCore.validateRun({room:'continuity_chamber',inventory:['silver_key'],taken:[],flags:{stampInserted:true,keyUsed:true,procured:true},visited:[]},DORK_DATA)`);
  assert.equal(s.schemaVersion,2);assert.equal(s.flags.waiverInserted,true);assert.equal(s.flags.objectionFiled,true);assert(!s.inventory.includes('silver_key'));assert(s.inventory.includes('procurement_receipt'));
});
check('Returned assets cannot be duplicated by malformed inventory or drops',()=>{
  const s=snapshot(`DorkCore.validateRun({room:'asset_control',inventory:['black_candle'],dropped:{black_candle:'archives'},flags:{returnedAssets:['black_candle']},visited:[]},DORK_DATA)`);
  assert(!s.inventory.includes('black_candle'));assert.equal(s.dropped.black_candle,undefined);
});
check('A fresh run contains no previous puzzle progress or inventory',()=>{
  const s=snapshot('DorkCore.newRun(DORK_DATA)');assert.deepEqual(s.inventory,[]);assert.deepEqual(s.flags,{});assert.deepEqual(s.hintSteps,{});assert.deepEqual(s.observed,[]);
});
check('Invalid and future backup imports are rejected',()=>{
  for(const text of ['not json','{}',JSON.stringify({format:'dork-backup',schemaVersion:99,run:{},meta:{}}),JSON.stringify({format:'dork-backup',schemaVersion:2,run:{schemaVersion:99},meta:{}}),JSON.stringify({format:'dork-backup',schemaVersion:2,run:{},meta:{schemaVersion:99}})])assert.throws(()=>execute(`DorkCore.decodeBackup(${JSON.stringify(text)},DORK_DATA)`));
});
check('Every playable room has three defined hint levels',()=>{
  const result=snapshot(`Object.keys(DORK_DATA.rooms).map(room=>{const s=DorkCore.newRun(DORK_DATA);s.room=room;const h=DorkJournal.hint(s,DorkCore.validateMeta({}));return [room,h.steps.length,h.steps.every(x=>typeof x==='string' && x.length>0)];})`);
  for(const [room,count,valid] of result){assert.equal(count,3,room);assert(valid,room);}
});
check('Fresh casebook and map do not disclose unobserved evidence or final answer',()=>{
  const text=execute(`JSON.stringify(DorkJournal.sections(DorkCore.newRun(DORK_DATA),DorkCore.validateMeta({}),DORK_DATA))`);
  for(const forbidden of ['BOO, SALEM','candidate record','identity lease','Merlin —','TICKET SCOTT'])assert(!text.includes(forbidden),forbidden);
});
check('Save failure retains the newest memory copy rather than stale disk data',()=>{
  execute(`globalThis.localStorage={getItem:()=>'{"old":true}',setItem:()=>{throw new Error('quota')},removeItem:()=>{throw new Error('denied')}};globalThis.testStore=DorkCore.storage();testStore.write('run',{new:true});`);
  assert.deepEqual(snapshot(`testStore.read('run',{})`),{new:true});
  execute(`testStore.remove('run')`);assert.deepEqual(snapshot(`testStore.read('run',{})`),{});
});
check('All authored exits point to real rooms and all items exist',()=>{
  const invalid=snapshot(`Object.entries(DORK_DATA.rooms).flatMap(([id,room])=>[...Object.values(room.exits || {}).filter(dest=>!DORK_DATA.rooms[dest]).map(x=>id+':'+x),...(room.items || []).filter(item=>!DORK_DATA.items[item]).map(x=>id+':'+x)])`);
  assert.deepEqual(invalid,[]);
});
console.log(`${checks} core invariant groups passed.`);
