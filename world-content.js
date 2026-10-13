/* Room-scoped scenery uses the same resolver as carried and portable objects. */
'use strict';
const DorkWorld = (() => {
  function text(state) {
    return {
      executive_corridor: { directory: 'The directory lists ordinary floors, two basements, and BELOW. A marker says YOU ARE HERE — FLOOR 6: EXECUTIVE OFFICES. The elevator is out of service; Records lies south.', 'elevator button': 'The elevator call button is dark. The brass doors open east onto a car that goes nowhere.', lights: 'The fluorescent lights buzz overhead. They illuminate the corridor but offer no route out; Records lies south.' },
      records_lobby: { placard: 'JORGE — RECORDS MANAGEMENT SPECIALIST III. His desk blocks the southern gate to the stacks.' },
      records_stacks: { shelves: 'The shelves hold files dated years into the future. Shelf 20 bears a scratched warning beside Ash.', 'shelf 20': DORK_DATA.items.ash_note.desc },
      legal_annex: { sign: 'SIGNATURE REQUIRED, says the sign. The contract itself explains that refusal needs Waiver Stamp 4C.' },
      procurement: { slots: 'The brass machine has a FORM slot for completed paper and a WAIVER slot for stamped paper. Its SOUL slot is taped over.', sign: 'The sign requires documented business necessity for every purchase, including exorcisms. The brass machine wants completed Form 66-B and a stamped Waiver Form 4C.' },
      hr_reliquary: { 'east wall': state.flags.tarotSolved ? 'The east wall has split open. A passage leads into Occult Compliance.' : 'The east wall is solid, though cold air slips through. Merlin keeps pointing at The Tower.', table: 'HR has arranged three face-up cards as an orientation assessment: THE FOOL, THE TOWER, and THE SUN. Merlin keeps one paw near The Tower.' },
      occult_compliance: { inbox: 'Salem sleeps in the inbox tray marked ITEMS REQUIRING IMMEDIATE ACTION. The tray contains no useful paperwork.', desk: 'The desk holds Salem in the empty inbox. The compliance manual and three witness drawings carry the useful clues.', elevator: 'The freight elevator waits to the south. Its doors are open; the Archives are below.' },
      archives: { stair: 'The narrow stair descends east into darkness. Luna hides from it; take a lit candle with you.', cabinets: 'Filing cabinets are mortared into the limestone walls. The ledger on the stone reading stand is the record you can actually read.', 'reading stand': 'The broad stone reading stand is mortared to the floor. An open arch beneath it shelters Luna.', pedestal: 'The broad stone reading stand is mortared to the floor. An open arch beneath it shelters Luna.' },
      subbasement: { roots: 'Black roots have collapsed the parking passage. The marked way forward is east to the Continuity Chamber.', lights: 'The emergency lights are dead. Your black candle is the only useful light here.', arrow: 'The painted arrow points east to the Continuity Chamber. The parking passage is still blocked by black roots.', sign: 'There is no sign here. A painted arrow points east to the Continuity Chamber; black roots block the parking passage.' },
      continuity_chamber: { door: state.flags.finalOpen ? 'The eastern door stands open. You can leave.' : state.flags.keyUsed ? 'The silver key rests in its slot. Five awakened seals still wait for names in clockwise order.' : 'Five seals ring the eastern door. An engraved arrow points clockwise, and a silver key slot waits beneath them.' },
      asset_control: { scanner: 'The scanner compares your inventory against the state asset register.', bin: 'The return bin accepts registered government property.' }
    };
  }
  const lookup = {};
  const extra = {
    meeting: {
      'conference table': {aliases:['table','under table','beneath table'],desc:'The table holds the agenda, visitor badge, and water. Nothing is hidden beneath it.'},
      'calendar invitation': {aliases:['invitation','calendar invitation'],desc:'The invitation bears the Governor’s name and schedules an Executive Continuity Review from 4:30 to 5:00 PM.'},
      'exit sign': {aliases:['exit sign','east door'],desc:'The red EXIT sign points east. The west door is gone.'}
    },
    break_room: {
      refrigerator:{aliases:['fridge','refrigerator','notes','warning'],desc:'The refrigerator is covered in warnings about Jorge’s hazelnut creamer.'},
      'vending machine':{aliases:['vending machine','vending button'],desc:'BLACK CANDLE — OUT OF STOCK. Procurement handles emergency supplies.'},
      'coffee machine':{aliases:['coffee machine','coffee maker'],desc:'The coffee machine wheezes beside the refrigerator. The useful creamer is for Jorge.'}
    },
    records_lobby: {
      gate:{aliases:['gate','southern gate','steel gate'],desc:'The southern gate into the Records stacks is controlled by Jorge.'},
      clipboard:{aliases:['clipboard'],desc:'Jorge’s clipboard lists a break-room delivery.'}
    },
    procurement: {
      'form slot':{aliases:['form slot'],desc:'The FORM slot accepts completed Form 66-B.'},
      'waiver slot':{aliases:['waiver slot'],desc:'The WAIVER slot accepts stamped Waiver Form 4C, not the rubber stamp.'}
    },
    elevator: {
      'elevator buttons':{aliases:['buttons','button','elevator buttons'],desc:'The passenger buttons remain out of service.'},
      'service intercom':{aliases:['service intercom','intercom','service gate'],desc:'A Facilities intercom identifies a separate maintenance route.'}
    },
    archives: {
      stairway:{aliases:['stairs','stairway','tunnel'],desc:'The stair descends into an unlit tunnel. A carried, lit candle is required.'},
      'open arch':{aliases:['arch','open arch','under stand','under reading stand'],desc:'Luna is hiding beneath the reading stand, not beneath the ledger.'}
    },
    continuity_chamber: {
      'silver key slot':{aliases:['slot','key slot','silver key slot'],desc:'A silver key slot sits beneath the five brass seals.'}
    }
  };
  function register(data) {
    const initial = text({flags:{}});
    for(const room of Object.keys(data.rooms)) {
      const entries = {};
      for(const [phrase,desc] of Object.entries(initial[room] || {})) entries[phrase]={aliases:[phrase],desc};
      Object.assign(entries,extra[room] || {});
      data.rooms[room].scenery=[];
      for(const [phrase,entry] of Object.entries(entries)) {
        if((data.rooms[room].items || []).some(id => data.items[id].aliases.includes(phrase))) continue;
        const id='scenery_'+room+'_'+phrase.replace(/[^a-z0-9]+/g,'_');
        data.items[id]={name:phrase,aliases:entry.aliases,portable:false,scenery:true,desc:entry.desc};
        data.rooms[room].scenery.push(id);
        lookup[id]={room,phrase};
      }
    }
  }
  function description(id,state) {
    const info=lookup[id];
    return info ? text(state)[info.room]?.[info.phrase] || DORK_DATA.items[id].desc : null;
  }
  return {register,description};
})();
DorkWorld.register(DORK_DATA);
