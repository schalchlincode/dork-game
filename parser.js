/* Canonical grammar shared by every action. Parsing never mutates the world. */
'use strict';
const DorkParser = (() => {
  function DorkCoreBuild(groups) { const map={}; for (const [verb, aliases] of Object.entries(groups)) for (const alias of aliases) { if(map[alias]) throw new Error('Duplicate action alias: '+alias); map[alias]=verb; } return map; }
  const verbMap = DorkCoreBuild({
    look: ['look','l','observe','view','see','survey','glance','peer','stare'],
    examine: ['examine','x','inspect','study','check','investigate','analyze','analyse','read','review','scrutinize','scrutinise','peruse','scan'],
    take: ['take','get','grab','pick','pickup','collect','yoink','acquire','obtain','snag','steal','retrieve','fetch','lift'],
    drop: ['drop','discard','ditch','release','deposit'],
    leave: ['leave','exit','depart'],
    inventory: ['inventory','inv','i','items','stuff','possessions','belongings'],
    open: ['open','unseal','unlock','pry'],
    close: ['close','shut','seal'],
    use: ['use','apply','operate','activate','insert','put','place','select','choose','present','show'],
    give: ['give','offer','hand','feed','deliver'],
    talk: ['talk','speak','chat','address','greet','say','ask','tell','converse','name'],
    attack: ['attack','hit','punch','kick','fight','stab','kill','murder','smack','strike','bash'],
    touch: ['touch','feel','poke','prod','pet','stroke','hug','pat'],
    lick: ['lick','taste','tongue'],
    smell: ['smell','sniff'],
    listen: ['listen','hear'],
    push: ['push','shove','press','move'],
    pull: ['pull','yank','tug'],
    break: ['break','smash','destroy','crush','wreck'],
    burn: ['burn','ignite','light','torch','incinerate','twist'],
    eat: ['eat','chew','bite','consume'],
    drink: ['drink','sip','gulp','swig','slurp'],
    wear: ['wear','puton','don'],
    throw: ['throw','toss','hurl','chuck','fling','lob'],
    climb: ['climb','scale','ascend'],
    hide: ['hide','conceal','duck'],
    sit: ['sit','rest'],
    pray: ['pray','worship','invoke','beg'],
    threaten: ['threaten','intimidate','menace'],
    flatter: ['flatter','compliment','praise','commend'],
    dance: ['dance','boogie'],
    sing: ['sing','hum'],
    jump: ['jump','leap','hop'],
    wait: ['wait','z'],
    joke: ['joke'],
    stamp: ['stamp'],
    help: ['help','commands','verbs','?','instructions'],
    hint: ['hint','clue','assist'],
    restart: ['restart'],
    sign: ['sign','autograph','initial'],
    refuse: ['refuse','reject','decline'],
    deaths: ['deaths','deathlog','obituary'],
    lore: ['lore','journal','archive'],
    map: ['map'],
    reclaim: ['reclaim','recover'],
    save: ['save'],
    north: ['north','n'], south: ['south','s'], east: ['east','e'], west: ['west','w']
  });
  function parse(raw, state) {
    const cleaned = raw.trim() === '?' ? 'help' : raw.toLowerCase().replace(/[!?.,]/g,' ').replace(/\s+/g,' ').trim().replace(/^(?:please\s+|could you\s+|can you\s+)+/,'').replace(/\s+please$/,'');
    if (!cleaned || cleaned.length > 1000 || /[;\n]/.test(raw)) return null;
    if (/\b(?:not|never|dont|don't)\b/.test(cleaned)) return null;
    if (/^(?:what time is it|what is the time|tell me the time|check the time)$/.test(cleaned))
      return {verb:'examine', objectText:'clock', targetText:'', raw, verbToken:'check'};
    if (/^(?:strike|ignite|light|twist) (?:the )?(?:(?:black|emergency) )?candle$/.test(cleaned))
      return {verb:'burn',objectText:'candle',targetText:'',raw,verbToken:'light'};
    const topic = cleaned.match(/^(?:ask|tell|talk|speak|chat|converse)(?: (?:to|with))? (.+?) about (.+)$/);
    if (topic) return {verb:'talk',objectText:topic[1],targetText:'',topic:topic[2],raw,verbToken:'ask'};
    const recall = cleaned.match(/^(?:reclaim|recover) (?:the )?(.+)$/);
    if (recall) return {verb:'reclaim',objectText:recall[1],targetText:'',raw,verbToken:'reclaim'};
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
    let sensory = cleaned.match(/^take\s+a\s+(?:sip|swig|slurp)\s+of\s+(.+)$/);
    if (sensory) return {verb:'drink', objectText:sensory[1].replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'drink'};
    sensory = cleaned.match(/^take\s+a\s+(?:sniff|whiff)\s+of\s+(.+)$/);
    if (sensory) return {verb:'smell', objectText:sensory[1].replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'smell'};
    sensory = cleaned.match(/^(?:gulp|slurp)\s+down\s+(.+)$/);
    if (sensory) return {verb:'drink', objectText:sensory[1].replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'drink'};
    sensory = cleaned.match(/^(?:gulp|slurp)\s+(.+?)\s+down$/);
    if (sensory) return {verb:'drink', objectText:sensory[1].replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'drink'};
    let phrase = cleaned.match(/^(?:open\s+up\s+(.+)|open\s+(.+?)\s+up)$/);
    if (phrase) return {verb:'open', objectText:(phrase[1] || phrase[2]).replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'open up'};
    phrase = cleaned.match(/^check\s+out\s+(.+)$/);
    if (phrase) return {verb:'examine', objectText:phrase[1].replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'check out'};
    phrase = cleaned.match(/^pick\s+(.+?)\s+up$/);
    if (phrase) return {verb:'take', objectText:phrase[1].replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'pick up'};
    phrase = cleaned.match(/^(?:put\s+down\s+(.+)|put\s+(.+?)\s+down)$/);
    if (phrase) return {verb:'drop', objectText:(phrase[1] || phrase[2]).replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:'put down'};
    phrase = cleaned.match(/^(?:(set|lay)\s+down\s+(.+)|(set|lay)\s+(.+?)\s+down)$/);
    if (phrase) return {verb:'drop', objectText:(phrase[2] || phrase[4]).replace(/^(?:the|a|an)\s+/,'').trim(), targetText:'', raw, verbToken:`${phrase[1] || phrase[3]} down`};
    phrase = cleaned.match(/^(?:hand\s+over\s+(.+?)|hand\s+(.+?)\s+over)\s+to\s+(.+)$/);
    if (phrase) return {verb:'give', objectText:(phrase[1] || phrase[2]).replace(/^(?:the|a|an)\s+/,'').trim(), targetText:phrase[3].replace(/^(?:the|a|an)\s+/,'').trim(), raw, verbToken:'hand over'};
    phrase = cleaned.match(/^(?:hand\s+off\s+(.+?)|hand\s+(.+?)\s+off)\s+to\s+(.+)$/);
    if (phrase) return {verb:'give', objectText:(phrase[1] || phrase[2]).replace(/^(?:the|a|an)\s+/,'').trim(), targetText:phrase[3].replace(/^(?:the|a|an)\s+/,'').trim(), raw, verbToken:'hand off'};
    if (/^(?:look around|look room|look here|look at room|examine room|survey)$/.test(cleaned)) return {verb:'look', objectText:'', targetText:'', raw};
    if (/^(?:check inventory|look in bag|check my stuff|show (?:my )?(?:inventory|belongings)|what am i carrying)$/.test(cleaned)) return {verb:'inventory', objectText:'', targetText:'', raw};
    if (/^show (?:me )?(?:the )?(?:commands|instructions)$/.test(cleaned)) return {verb:'help', objectText:'', targetText:'', raw};
    if (/^give me (?:a )?(?:hint|clue)$/.test(cleaned)) return {verb:'hint', objectText:'', targetText:'', raw};
    if (/^(?:ask for help|ask for a hint)$/.test(cleaned)) return {verb:cleaned.endsWith('hint') ? 'hint' : 'help', objectText:'', targetText:'', raw};
    if (/^(?:take all items|grab all of it)$/.test(cleaned)) return {verb:'take', objectText:'all', targetText:'', raw};
    if (/^(?:get out(?: of here)?|go out(?:side)?|go out (?:the )?door|walk out(?: (?:the )?door)?|exit)$/.test(cleaned)) return {verb:'leave', objectText:'', targetText:'', raw};
    if (/^(?:enter|step through) (?:the )?gate$/.test(cleaned)) return {verb:'exitAlias', objectText:'gate', targetText:'', raw};
    if (/^(?:call|summon) (?:the )?elevator$/.test(cleaned)) return {verb:'push', objectText:'elevator button', targetText:'', raw};
    if (/^(?:shuffle|mix) (?:the )?(?:cards|tarot|tarot spread)$/.test(cleaned)) return {verb:'shuffle', objectText:'tarot spread', targetText:'', raw};
    const enterRoute=cleaned.match(/^(?:enter|ride) (?:the )?(.+)$/);
    if(enterRoute) return {verb:'exitAlias',objectText:enterRoute[1],targetText:'',raw};
    const through = cleaned.match(/^(?:go|walk|move|head|step|travel|proceed)\s+(?:through|into|to)\s+(?:the\s+)?(.+)$/);
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
    if (/^(?:go|walk|move|head|step|climb)\s+(?:down|up)\s+(?:the\s+)?stairs?$/.test(cleaned))
      return {verb:'exitAlias', objectText:/\bup\b/.test(cleaned) ? 'up' : 'down', targetText:'', raw};
    const words = cleaned.split(' ');
    let verbToken = words.shift();
    if (verbToken === 'pick' && words[0] === 'up') { words.shift(); verbToken = 'pickup'; }
    if (verbToken === 'put' && words[0] === 'on') { words.shift(); verbToken = 'puton'; }
    if (['go','walk','move','travel','head','proceed','step'].includes(verbToken) && words.length) {
      const d = verbMap[words[0]] || words[0];
      if (['north','south','east','west'].includes(d)) return { verb:d, objectText:'', targetText:'', raw, verbToken };
    }
    const verb = verbMap[verbToken] || verbToken;
    let rest = words.join(' ').replace(/^(the|a|an)\s+/,'').replace(/^at\s+/,'');
    if (['listen', 'pray'].includes(verb)) rest = rest.replace(/^to\s+/,'');
    if (verb === 'talk') rest = rest.replace(/^(?:to|with)\s+/, '');
    const prep = rest.match(/\s+(on|with|to|into|in|at|using)\s+/);
    const split = prep ? [rest.slice(0, prep.index), rest.slice(prep.index + prep[0].length)] : [rest];
    return { verb, objectText: split[0] || '', targetText: split[1] || '', preposition: prep?.[1] || '', raw, verbToken };
  }
  return {parse, verbMap};
})();
