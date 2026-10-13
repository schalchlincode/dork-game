/* Shared map, opt-in hints, and death callbacks. No Casebook or objectives interface. */
'use strict';
const DorkSupport = (() => {
  const catFacts = {
    ash:'Ash — a small grey cat crouched high on Shelf 20.',
    merlin:'Merlin — a sweet grey cat beside the orientation cards, one paw raised.',
    salem:'Salem — a black cat curled asleep in an inbox tray.',
    luna:'Luna — a black cat hiding beneath the stone reading stand, only her eyes showing.',
    boo:'Boo — an enormous white cat sitting upright beside the household door.'
  };
  function map(state, meta, data, getExits, blocked) {
    return state.visited.map(id => ({
      id, name:data.rooms[id].name, current:id === state.room,
      routes:(state.knownExits[id] || []).map(dir => {
        const target = getExits(id)[dir];
        if (!target) return null;
        const block = blocked(id, dir);
        return {direction:dir, target:state.visited.includes(target) ? data.rooms[target].name : 'Unexplored', blocked:!!block, note:block ? 'blocked' : ''};
      }).filter(Boolean)
    }));
  }
  function hint(state, meta) {
    const f = state.flags, has = id => state.inventory.includes(id);
    const known = id => state.observed.includes(id) || meta.observations.includes(id);
    const h = (key, ...steps) => ({key,steps});
    switch (state.room) {
      case 'meeting': return has('badge') ? h('meeting-exit','The room’s one surviving door has an EXIT sign.','You have the badge. Nothing requires signing before you leave.','Go EAST.') : h('meeting-badge','The table holds several objects with very different prospects.','The visitor badge is portable. The water is not an opportunity.','TAKE BADGE, then go EAST.');
      case 'executive_corridor': return h('corridor','The directory is not an itinerary. The nearby rooms are open to inspection.','Records is south; the break room is north. Visit both.','Go NORTH and read the break-room memo; bring the creamer to Records.');
      case 'break_room': return h('breakroom','The warnings disagree with normal office etiquette.','Compare JORGE ONLY with the feeding policy on the bolted memo.','TAKE CREAMER, then SOUTH twice to Records. GIVE CREAMER TO JORGE.');
      case 'records_lobby': return f.jorgeMoved ? h('records-clear','The obstruction has moved.','The gate south is clear.','Go SOUTH into the stacks.') : h('jorge','Jorge appears to expect a delivery, not an argument.','The break-room memo names an exception to the after-hours feeding rule.','Bring the hazelnut creamer from the break room and GIVE CREAMER TO JORGE.');
      case 'records_stacks': return h('stacks','Some records are useful; one of the witnesses has fur.','Read the personnel file and shelf note. The completed form is portable. Legal is east; service departments are south.','TAKE FORM, READ FILE, and READ NOTE. Go EAST for Legal, or SOUTH for the optional service-department investigation.');
      case 'legal_annex':
        if (f.waiverStamped) return h('legal-certified','Your refusal is already certified.','Procurement is south. It wants the completed form and certified waiver, not the rubber stamp.','Carry Form 66-B and Waiver Form 4C SOUTH to Procurement.');
        if (f.stampTaken) return h('legal-stamp','Possessing a stamp is not the same as certifying paper.','Page 64 is the detachable waiver. Take it before stamping it.','TAKE WAIVER FORM, then USE WAIVER STAMP ON WAIVER FORM.');
        return h('legal-box','Read the contract before agreeing to anything.','The detachable waiver needs the boxed stamp. A thin plastic card could pry the box.','Take the visitor badge from the meeting room. Here, TAKE WAIVER FORM, OPEN BOX, then STAMP WAIVER.');
      case 'procurement':
        if (f.procured) return h('procurement-done','The machine has already supplied you.','The next department is HR, east.','Go EAST. Keep the issued candle and key.');
        if (!f.waiverStamped) return h('procurement-unstamped','The machine wants two different kinds of paper.','A blank waiver is not certified. The rubber stamp itself is not a submission.','In Legal, take Waiver Form 4C and the stamp. USE WAIVER STAMP ON WAIVER FORM. Submit Form 66-B into FORM and the waiver into WAIVER.');
        return h(`procurement-${!!f.formInserted}-${!!f.waiverInserted}`,'Read the labels on the paper slots.','FORM receives Form 66-B; WAIVER receives the stamped Waiver Form 4C.',`${f.formInserted ? '' : 'INSERT FORM INTO FORM SLOT. '}${f.waiverInserted ? '' : 'INSERT WAIVER INTO WAIVER SLOT.'}`.trim());
      case 'hr_reliquary': return f.tarotSolved ? h('hr-done','The wall has changed.','The passage east is open.','Go EAST into Occult Compliance.') : h('hr','Inspection is safe. Selection is binding.','Merlin’s attention is more reliable than HR’s assessment design.','CHOOSE THE TOWER. Taking or grabbing cards will not select them.');
      case 'occult_compliance': return h('compliance','This room distinguishes witnesses from anchors.','Read the drawings and manual; observe Salem. The freight elevator is south.','READ DRAWINGS, READ MANUAL, then go SOUTH. LORE retains selected discoveries, not a prearranged final answer.');
      case 'archives': return h(`archives-${!!f.candleLit}-${has('black_candle')}`,'Luna has an opinion about the stair.','Inspect the stair. A carried candle must actually be lit before entering the tunnel.',has('black_candle') ? 'LIGHT CANDLE, then go EAST.' : 'Recover the black candle from wherever you left it, or obtain it from Procurement. Carry it, LIGHT CANDLE, then go EAST.');
      case 'subbasement': return h('tunnel','The painted arrow is still legible.','The parking passage is blocked; the chamber is east.','Go EAST to the Continuity Chamber. Keep your lit candle for backtracking.');
      case 'continuity_chamber': return f.finalOpen ? h('final-open','The door has opened.','There is one more administrative checkpoint east.','Go EAST and inspect the scanner. Return registered property before leaving.') : f.keyUsed ? h('final-names','The arrow tells you where to begin and which way to read.','Match the clockwise poses to the cats you observed. Recall their appearances or revisit them to compare.','Say the five names in the order shown by the seals: BOO, SALEM, ASH, LUNA, MERLIN.') : h('final-key','There is a slot beneath the seals.','The silver continuity key belongs to the mechanism, not to Boo.','USE SILVER KEY ON KEY SLOT. Then examine the seals.');
      case 'asset_control': return h('assets','Read the scanner before testing the exit.','Registered state property must be returned. The scanner names each carried asset.','RETURN ALL, then go EAST. To backtrack, RECLAIM CANDLE here first and return it again before exiting.');
      case 'elevator': return f.liftRestored ? h('elevator-fixed','The passenger controls remain dead; a different route was repaired.','The service gate east is open.','Go EAST into the service lift.') : h('elevator','OUT OF SERVICE is not a puzzle password.','The service intercom points to Facilities. Reach the service departments south of the Records stacks.','Go WEST, SOUTH, through Jorge’s gate SOUTH, then SOUTH to IT. Facilities is east of IT. The main route still works without the lift.');
      case 'it_helpdesk': return f.ticketResolved ? h('it-done','The ticket is closed, not its requester.','The server room is south; Facilities east and Investigations west.','Go SOUTH and examine the identity console and maintenance order.') : known('records_file') ? h('it-duplicate','A record can be closed without closing the person it describes.','The ticket duplicates an older originating personnel record.','CLOSE TICKET AS DUPLICATE.') : h('it-file','The ticket asks for the wrong kind of closure.','Its footer identifies an originating record in Records.','Go NORTH, READ FILE in the stacks, return SOUTH, then CLOSE TICKET AS DUPLICATE.');
      case 'server_room': return f.identityDisputed ? h('lease-disputed','IT recorded the dispute. Another department holds the source.','The validated revocation goes to the Return Engine below via the repaired service lift.','Return to the service lift, go EAST to Below, and INSERT REVOCATION INTO SLOT.') : h('lease','Read both the identity console and the maintenance order.','Investigations must establish a contradiction; its evidence room contains a revocation notice.','Complete COMPARE EVIDENCE in Investigations, take its revocation notice, return here, and DISPUTE LEASE.');
      case 'facilities_office': return f.liftRestored ? h('facilities-done','The service circuit is repaired.','The working lift is southeast through the relay chamber.','Go SOUTH, then EAST into the service lift.') : h(`facilities-${!!f.relayIsolated}`,'The safety instructions provide an order of operations.','Do not insert anything into a live socket. The IT maintenance order identifies the service route.','PULL LEVER and TAKE FUSE here. Go SOUTH; INSERT FUSE INTO SOCKET, SET DIAL TO RETURN, then RESET RELAY.');
      case 'relay_chamber': return f.liftRestored ? h('relay-done','The lift is now operating.','Executive and Archives have unlocked service stops.','Go EAST into the service lift.') : h(`relay-${!!f.relayIsolated}-${!!f.relayRepaired}-${!!f.serviceReturn}`,'Read the warnings, then distinguish the fuse, route, and reset operations.','Facilities isolates the circuit. IT’s maintenance order says which dial setting serves the lift.','PULL LEVER in Facilities; carry the fuse here and INSERT FUSE INTO SOCKET. SET DIAL TO RETURN, then RESET RELAY.');
      case 'service_lift': return h('service-lift','This is a shortcut, not an exit from the Agency.','North serves Executive, south Archives, west Facilities. Below requires a disputed lease.','Use NORTH or SOUTH to return to the core route. After disputing the lease in IT, go EAST to Below.');
      case 'investigations': return f.evidenceCompared ? h('evidence-done','The board has accepted the contradiction.','The evidence room is south.','Go SOUTH, TAKE REVOCATION NOTICE, then bring it to IT’s identity console and DISPUTE LEASE.') : h('evidence','The dossier makes a claim that can be checked.','Compare the agenda, the older personnel file, and the independent drawings, after examining each.','READ DOSSIER; read the agenda in the meeting room, the file in Records, and the drawings in Occult Compliance. Return here and COMPARE EVIDENCE.');
      case 'evidence_room': return h('notice','The notice has no signature line. This is an improvement.','The identity console in IT must validate the dispute.','TAKE REVOCATION NOTICE. Return NORTH, EAST, SOUTH to IT’s server room; DISPUTE LEASE.');
      case 'below': return f.identityReleased ? h('below-done','The identity claim has been removed. You still need to leave.','The household door in the Continuity Chamber remains the way home.','Go WEST to the service lift, SOUTH to Archives; carry and light the candle, then EAST twice to the chamber. Complete the original door and Asset Control sequence.') : h('below','The chair offers consent, not rest.','The engine’s REVOCATION slot accepts your validated notice.','INSERT REVOCATION NOTICE INTO REVOCATION SLOT. Do not sit. Return west to the lift when the claim is revoked.');
      default: return h('complete','Your run is complete.','LORE and DEATHS remain available.','RESTART begins a fresh run without inventory or puzzle progress.');
    }
  }
  const lessons = {
    darkness:'Carry a lit black emergency candle into the Sub-Basement. Owning an unlit candle is not enough.',
    orientation:'Inspect the cards and observe Merlin before selecting. Taking a card is not selection.',
    contract:'Document refusal on the waiver rather than signing the continuity contract.',
    jorge:'Jorge is a delivery and conversation problem, not a combat encounter.',
    cat:'Violence against the household anchors is not a viable solution.',
    property:'Read the scanner and return registered state property before going east.',
    electrical:'Isolate the circuit at the Facilities lever before inserting the replacement fuse.',
    consent:'Do not occupy the consent chair while its claim is active. Submit a validated revocation instead.'
  };
  const callbacks = {
    darkness:'Facilities has added OWNING A CANDLE IS NOT A LIGHTING STRATEGY to your training record.',
    orientation:'HR has updated your assessment history. Your previous answer is now classified as an incident.',
    contract:'Legal has sent a reminder about reading before signing. It has billed your estate for the reminder.',
    jorge:'Records has reclassified you as a repeat delivery. Jorge has requested clarification.',
    cat:'A paw print covers the approval box on your return paperwork. You have not been forgiven.',
    property:'Asset Control has flagged your new badge for additional review. A remarkable amount of review can fit inside a scanner.',
    electrical:'Facilities has replaced the fuse and added your name to the list of unsuitable conductors.',
    consent:'The chair has marked you as a recurring attendee. Declining the invitation remains your responsibility.'
  };
  return {map, hint, lessons, callbacks, catFacts};
})();
