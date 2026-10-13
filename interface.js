/* Accessible terminal tools. Buttons insert text; they never silently solve puzzles. */
'use strict';
const DorkUI = (() => {
  function create(api) {
    const input = document.querySelector('#commandInput');
    const output = document.querySelector('#output');
    const dialog = document.querySelector('#toolDialog');
    const body = dialog.querySelector('.tool-body');
    const title = dialog.querySelector('#toolTitle');
    const status = document.querySelector('#storageNotice');
    const history = [];
    const transcript = [];
    let historyIndex = 0, draft = '', trigger = null, activePanel = '', inserting = false;
    const stored = api.store.read('dork_preferences_v2', {});
    const preferences = {
      readable: stored?.readable === true,
      largeText: stored?.largeText === true,
      brief: stored?.brief === true,
      reducedMotion: stored?.reducedMotion === true || globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    function element(tag, text='', className='') {
      const node = document.createElement(tag);
      node.textContent = text;
      if (className) node.className = className;
      return node;
    }
    function button(text, action, className='') {
      const b = element('button', text, className); b.type = 'button';
      b.addEventListener('click', action); return b;
    }
    function applyPreferences() {
      document.body.classList.toggle('readable', preferences.readable);
      document.body.classList.toggle('large-text', preferences.largeText);
      document.body.classList.toggle('reduce-motion', preferences.reducedMotion);
    }
    applyPreferences();
    function notifyStorage() {
      status.hidden = false;
      status.textContent = 'Saving unavailable. This tab still works. Export a backup in TOOLS before closing it.';
    }
    if (api.store.failed) notifyStorage();
    function download(name, text, mime='text/plain') {
      const blob = new Blob([text], {type:mime});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
    function record(text, kind='response') {
      transcript.push({kind, text:String(text), run:api.meta().runs, room:api.state().room});
      if (transcript.length > 3000) transcript.shift();
    }
    function command(raw) {
      if (history[history.length - 1] !== raw) history.push(raw);
      if (history.length > 150) history.shift();
      historyIndex = history.length; draft = '';
    }
    function insert(text, replace=false) {
      if (dialog.open) { inserting=true; dialog.close(); }
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      if (replace) input.value = text;
      else {
        const before = input.value.slice(0,start), after = input.value.slice(end);
        input.value = before + (before && !/\s$/.test(before) ? ' ' : '') + text + after;
      }
      input.focus(); input.setSelectionRange(input.value.length,input.value.length);
    }
    function inventoryPanel() {
      const groups = [['CARRYING',api.state().inventory],['VISIBLE HERE',api.visible().filter(id => !api.state().inventory.includes(id))]];
      body.append(element('p','Names insert into the command field; EXAMINE prepares a command. Nothing executes until you submit it.','tool-intro'));
      for (const [heading, ids] of groups) {
        body.append(element('h3',heading));
        if (!ids.length) body.append(element('p','Nothing recorded.'));
        for (const id of ids) {
          const item = api.data.items[id];
          if (!item) continue;
          const row = element('div','','inventory-item');
          row.append(button(item.name,() => insert(item.name),'item-name'));
          row.append(button('EXAMINE',() => insert(`examine ${item.name}`,true)));
          body.append(row);
        }
      }
    }
    function casePanel() {
      body.append(element('p','Memory survives death. Carried items, opened doors, and completed procedures do not. Only observed material is recorded.','tool-intro'));
      for (const section of api.casebook()) {
        const details = document.createElement('details');
        details.open = ['CURRENT RUN','OPEN QUESTIONS','COMPLETED THIS RUN'].includes(section.title);
        details.append(element('summary',section.title));
        for (const entry of section.entries) details.append(element('p',entry));
        body.append(details);
      }
    }
    function mapPanel() {
      body.append(element('p','Only rooms visited during this run are mapped. An unexplored connection does not reveal its destination. Blocked routes remain marked.','tool-intro'));
      for (const room of api.map()) {
        const section = element('section','',room.current ? 'map-room current' : 'map-room');
        section.append(element('h3',`${room.current ? 'YOU ARE HERE — ' : ''}${room.name}`));
        for (const route of room.routes) section.append(element('p',`${route.direction.toUpperCase()} → ${route.target}${route.blocked ? ' [BLOCKED]' : ''}`));
        if (!room.routes.length) section.append(element('p','No observed exits recorded. LOOK updates this room.'));
        body.append(section);
      }
      const remembered = api.meta().knownRooms.filter(id => !api.state().visited.includes(id) && api.data.rooms[id]);
      if (remembered.length) {
        const d = document.createElement('details'); d.append(element('summary','PRIOR-RUN LOCATIONS (NOT REVISITED)'));
        d.append(element('p',remembered.map(id => api.data.rooms[id].name).join(' · '))); body.append(d);
      }
    }
    function settingsPanel() {
      body.append(element('p',`DORK ${DorkCore.VERSION} — Expanded Edition. Static, offline-capable files; no accounts or AI service required.`,'tool-intro'));
      const toggles = [['readable','Readable display — remove CRT glow, scanlines, and distortion'],['largeText','Larger text'],['reducedMotion','Reduce animation'],['brief','Brief descriptions for previously visited rooms (LOOK always expands)']];
      for (const [key,label] of toggles) {
        const row = element('label','','setting'); const box = document.createElement('input');
        box.type='checkbox'; box.checked=preferences[key]; box.id=`setting-${key}`;
        box.addEventListener('change',() => { preferences[key]=box.checked; applyPreferences(); api.store.write('dork_preferences_v2',preferences); });
        row.append(box,element('span',label)); body.append(row);
      }
      body.append(element('h3','SAVE & PLAYTEST FILES'));
      body.append(element('p','Backups contain your current run and accumulated knowledge. Import requires confirmation and replaces both. No backup is uploaded anywhere.'));
      const actions=element('div','','file-actions');
      actions.append(button('EXPORT SAVE',() => download(`dork-save-${DorkCore.VERSION}.json`,JSON.stringify(api.backup(),null,2),'application/json')));
      actions.append(button('EXPORT TRANSCRIPT',() => {
        const header=`DORK ${DorkCore.VERSION} — Expanded Edition\nExported: ${new Date().toISOString()}\nLocation: ${api.state().room}\nRun: ${api.meta().runs}\nSession transcript (last ${transcript.length} entries; maximum 3000)\n\n`;
        download(`dork-transcript-${DorkCore.VERSION}.txt`,header+transcript.map(e=>`[run ${e.run} | ${e.room}] ${e.text}`).join('\n\n'));
      }));
      if(api.rejectedSave?.()) actions.append(button('EXPORT PRESERVED ORIGINAL',()=>download('dork-preserved-original.json',JSON.stringify({format:'dork-backup',schemaVersion:Math.max(Number(api.rejectedSave().schemaVersion)||1,Number(api.rejectedMeta()?.schemaVersion)||1),gameVersion:api.rejectedSave().gameVersion,run:api.rejectedSave(),meta:api.rejectedMeta()},null,2),'application/json')));
      body.append(actions);
      const label=element('label','IMPORT SAVE FILE','file-label');
      const file=document.createElement('input'); file.type='file'; file.accept='.json,application/json'; file.id='importSave';
      const feedback=element('div','','import-feedback'); feedback.setAttribute('role','status');
      let importRevision=0;
      file.addEventListener('change',async () => {
        const revision=++importRevision;
        feedback.replaceChildren();
        const chosen=file.files[0]; if(!chosen) return;
        try {
          if(chosen.size>2_000_000) throw new Error('Save file is too large.');
          const text=await chosen.text();
          if(revision!==importRevision) return;
          const decoded=DorkCore.decodeBackup(text,api.data);
          feedback.append(element('p',`Replace this run with ${api.data.rooms[decoded.run.room].name}, run ${decoded.meta.runs}? Current progress will be overwritten.`));
          feedback.append(button('CONFIRM REPLACE',() => { api.importBackup(decoded); dialog.close(); }));
          feedback.append(button('CANCEL',() => { feedback.replaceChildren(element('p','Import canceled. Your current run is unchanged.')); file.value=''; }));
        } catch(error) { if(revision===importRevision) feedback.append(element('p',`Import rejected: ${error.message} Your current run is unchanged.`)); }
      });
      label.append(file); body.append(label,feedback);
      body.append(element('h3','COMMAND HISTORY'));
      body.append(element('p','Up/Down recalls recent commands. Tab completes a visible or carried object name. Choosing a history entry only fills the field.'));
      for (const text of history.slice(-12).reverse()) body.append(button(text,() => insert(text,true),'history-command'));
    }
    function open(name, source=null) {
      activePanel=name; trigger=source || document.activeElement;
      body.replaceChildren();
      title.textContent={inventory:'INVENTORY & SURROUNDINGS',casebook:'INVESTIGATIVE CASEBOOK',map:'DISCOVERED BUILDING',settings:'TERMINAL TOOLS'}[name] || 'TOOLS';
      ({inventory:inventoryPanel,casebook:casePanel,map:mapPanel,settings:settingsPanel}[name] || settingsPanel)();
      if(!dialog.open) dialog.showModal();
      body.scrollTop=0;
      dialog.querySelector('[data-close]').focus();
    }
    document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.panel,b)));
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{ if(inserting) {inserting=false; input.focus({preventScroll:true});} else if(trigger?.isConnected && !dialog.open) trigger.focus({preventScroll:true}); });
    dialog.addEventListener('click',e=>{ if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();} });
    input.addEventListener('keydown',e=>{
      if(e.key==='ArrowUp' && history.length){e.preventDefault();if(historyIndex===history.length)draft=input.value;historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex];}
      if(e.key==='ArrowDown' && history.length){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=historyIndex===history.length?draft:history[historyIndex];}
      if(e.key==='Tab' && !e.shiftKey && input.value.trim()){
        const text=input.value.toLowerCase(); const boundary=text.lastIndexOf(' '); const prefix=text.slice(boundary+1);
        if(!prefix) return;
        const matches=[...new Set([...api.visible(),...api.state().inventory])].filter(id=>api.data.items[id]).map(id=>api.data.items[id].name).filter(name=>name.toLowerCase().startsWith(prefix));
        if(matches.length===1){e.preventDefault();input.value=text.slice(0,boundary+1)+matches[0];}
      }
    });
    const newer=document.querySelector('#newOutput');
    newer.addEventListener('click',()=>{output.scrollTop=output.scrollHeight;newer.hidden=true;});
    output.addEventListener('scroll',()=>{if(output.scrollHeight-output.clientHeight-output.scrollTop<60)newer.hidden=true;});
    function viewport(){
      const vv=globalThis.visualViewport;
      const height=vv ? vv.height : globalThis.innerHeight;
      document.documentElement.style.setProperty('--usable-height',`${Math.round(height)}px`);
    }
    globalThis.visualViewport?.addEventListener('resize',viewport);
    globalThis.addEventListener('resize',viewport); viewport();
    return {open,record,command,preferences,notifyStorage,download,
      refresh(){if(dialog.open && activePanel!=='settings'){const scroll=body.scrollTop;const focus=document.activeElement;open(activePanel,trigger);body.scrollTop=scroll;if(focus?.isConnected)focus.focus();}},
      hasNewOutput(){newer.hidden=false;}
    };
  }
  return {create};
})();
