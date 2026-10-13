/* Authored optional puzzles and narrative consequences. All effects use the core controller. */
'use strict';
const DorkExpansion = (() => {
  function create(api) {
    const {print, observe, resolve, take, die} = api;
    const state = () => api.state();
    const known = id => state().observed.includes(id) || api.meta().observations.includes(id);
    const has = id => state().inventory.includes(id);
    const flag = name => state().flags[name] === true;
    const set = name => { state().flags[name] = true; };
    const consume = id => {
      state().inventory = state().inventory.filter(x => x !== id);
      if (!state().taken.includes(id)) state().taken.push(id);
      delete state().dropped[id];
    };
    const say = text => { print(text); return true; };
    const at = (...rooms) => rooms.includes(state().room);
    function blocked(key) {
      const guards = {
        ticket:['ticketResolved','The server-room door is waiting for a nonfatal resolution to Scott\'s support ticket. The help-desk terminal lists the available dispositions.'],
        lift:['liftRestored','The caged lift has no power. Facilities\' relay cabinet needs a safe repair and the correct service route.'],
        evidence:['evidenceCompared','The southern evidence-room door requires an actual contradiction. Read the dossier and compare the evidence on the board.'],
        below:['identityDisputed','The BELOW gate requires a disputed identity lease. Investigations can establish the grounds; IT must record the dispute.']
      };
      if (guards[key] && !flag(guards[key][0])) return guards[key][1];
      return '';
    }
    function exits(roomId, exits) {
      const result = {...exits};
      if (flag('liftRestored') && roomId === 'elevator') result.east = 'service_lift';
      if (flag('liftRestored') && roomId === 'archives') result.west = 'service_lift';
      return result;
    }
    function aliases(roomId, aliases) {
      const result = {...aliases};
      if (flag('liftRestored') && ['elevator','archives'].includes(roomId)) {
        result.lift = roomId === 'elevator' ? 'east' : 'west';
        result['service lift'] = result.lift;
      }
      return result;
    }
    function roomExtra() {
      if (flag('liftRestored') && at('elevator')) return 'A repaired service gate is open to the east. The ordinary passenger buttons are still out of service.';
      if (flag('liftRestored') && at('archives')) return 'The repaired service lift is now accessible west. It provides a shortcut back to Executive and Facilities.';
      if (at('facilities_office')) return flag('liftRestored') ? 'The isolation cabinet is closed. The lift circuit is running normally.' : flag('relayIsolated') ? 'ISOLATED glows green. The relay socket is safe to work on.' : 'LIVE glows red. The relay socket is not safe to work on.';
      if (at('relay_chamber') && !flag('liftRestored')) return `SERVICE: ${flag('serviceReturn') ? 'RETURN' : 'RETAIN'}. SOCKET: ${flag('relayRepaired') ? 'FUSE FITTED' : 'EMPTY'}. CIRCUIT: ${flag('relayIsolated') ? 'ISOLATED' : 'LIVE'}.`;
      return '';
    }
    function onObserve(id) {
      const flags = {service_ticket:'readServiceTicket',maintenance_order:'readMaintenanceOrder',relay_instructions:'readRelayInstructions',audit_dossier:'readAuditDossier',identity_console:'readIdentityConsole'};
      if (flags[id]) set(flags[id]);
      if (id === 'ash_note' && !flag('ashWarned')) {
        set('ashWarned');
        // Warning is part of the observed clue, not a timed command tax.
      }
    }
    function specialDescription(id) {
      if (id === 'ticket_terminal' && flag('ticketResolved')) return 'TICKET CLOSED: DUPLICATE. The originating candidate file remains in Records. The requester is still alive. The southern server-room door is open.';
      if (id === 'service_ticket' && flag('ticketResolved')) return 'TICKET SCOTT-0001: CLOSED AS DUPLICATE. IT has acknowledged that a support record and a person are not interchangeable. The original file still predates tonight\'s invitation.';
      if (id === 'isolation_lever') return flag('liftRestored') ? 'The circuit is running behind a closed insulating cover. The isolation lever is interlocked while the service lift is occupied.' : flag('relayIsolated') ? 'The isolation lever is pulled. ISOLATED glows green; fitting the fuse is now safe.' : 'The red isolation lever is up. The relay socket is LIVE. Pull the lever before inserting the fuse.';
      if (id === 'service_dial') return flag('liftRestored') ? 'The SERVICE dial is locked at RETURN while the lift runs.' : `The SERVICE dial currently reads ${flag('serviceReturn') ? 'RETURN' : 'RETAIN'}. The IT maintenance order specifies the safe route. SET DIAL TO RETURN or SET DIAL TO RETAIN changes it.`;
      if (id === 'evidence_board' && flag('evidenceCompared')) return 'AUTHORITY: the invitation brought Scott here. CHRONOLOGY: his candidate file already existed. WITNESSES: three independent drawings establish the door, not consent. The official claim is contradicted. The evidence-room door is open.';
      if (id === 'below_control') return `The BELOW control shows POWER: ${flag('liftRestored') ? 'ON' : 'OFF'}, LEASE DISPUTED: ${flag('identityDisputed') ? 'YES' : 'NO'}. East enters the lower stop once both are lit.`;
      if (id === 'return_engine' && flag('identityReleased')) return 'The unsupported identity lease has been revoked. Scott\'s name no longer passes through the engine. The machine continues for the other names; the western lift returns you to the building.';
      if (id === 'consent_chair' && flag('identityReleased')) return 'The nameplate is blank. The chair has no claim on Scott. It remains a bad place to wait for an email.';
      return null;
    }
    function handle(c) {
      const r = DorkCore.normalize(c.raw).replace(/[.!?,]/g, '');
      const a = resolve(c.objectText);
      const b = resolve(c.targetText);
      const v = c.verb;
      if (at('it_helpdesk') && /^(?:(?:close|resolve|mark) (?:the )?(?:service |support )?ticket|use (?:the )?(?:ticket )?terminal)/.test(r)) {
        if (flag('ticketResolved')) return say('The ticket is already closed as DUPLICATE. You remain alive. IT has achieved two things at once and will require a recovery period.');
        if (!/\bduplicate\b/.test(r)) return say('The terminal lists DUPLICATE, MISFILED, and NO LONGER REQUIRED. It needs a supported disposition. CLOSE TICKET AS [disposition] records it; unsupported guesses do not affect the requester.');
        if (!known('records_file')) return say('DUPLICATE needs an originating record. The service ticket identifies Scott\'s personnel file in Records. Examine that file first; the terminal cannot audit a hunch.');
        set('ticketResolved');
        return say('You close the ticket as DUPLICATE, citing the older personnel file.\n\nThe terminal pauses for a length of time usually reserved for dismissing a good suggestion. Then:\n\nTICKET CLOSED. REQUESTER NOT CLOSED.\n\nThe southern server-room door unlocks. The ticket was a copy of Scott\'s record, not an instruction to end Scott. Someone has designed a system that needs this explained.');
      }
      if (at('facilities_office') && a === 'isolation_lever' && ['pull','use','push'].includes(v)) {
        if (flag('liftRestored')) return say('The safety interlock holds the isolation lever while the repaired lift operates. Facilities has accidentally retained one useful safeguard.');
        if (v === 'push') {
          if (!flag('relayIsolated')) return say('The lever is already up. The relay socket remains live.');
          if (!flag('relayRepaired')) return say('The open socket keeps the reconnect interlock engaged. Fit the replacement fuse before restoring power.');
          return say('Use the reset switch in the relay chamber to restore power through its safety interlock.');
        }
        if (flag('relayIsolated')) return say('The circuit is already isolated. The indicator is green. Repeating the safe part will not repair the fuse.');
        set('relayIsolated');
        return say('You pull the red lever. The relay contacts separate with a hard click. LIVE goes dark; ISOLATED glows green.\n\nThe fuse socket in the southern relay chamber is now safe. The ceiling does not fall in. Facilities will claim this as a deliverable.');
      }
      if (at('relay_chamber') && a === 'replacement_fuse' && ['use','give'].includes(v)) {
        if (c.targetText && !['fuse_socket','relay_cabinet'].includes(b)) return say('The fuse belongs in the relay socket, not that target. You keep it.');
        if (flag('relayRepaired')) return say('The replacement fuse is already secured inside the relay.');
        if (!has('replacement_fuse')) return say('You need the replacement fuse from the Facilities desk in your possession.');
        if (!flag('relayIsolated')) {
          die('electrical','You insert the fuse into the live socket beneath ISOLATE BEFORE FITTING.\n\nThe circuit accepts you as a temporary component.\n\nFacilities records the replacement as successful.'); return true;
        }
        consume('replacement_fuse'); set('relayRepaired');
        return say('The porcelain fuse seats with a neat click. You close the insulating cover. The circuit remains isolated.\n\nThe SERVICE dial and reset switch are ready. The maintenance order in IT specifies the route.');
      }
      if (at('relay_chamber') && /^(?:set|turn|rotate|route|switch) (?:the )?(?:service )?(?:dial|selector|route)(?: to)? (?:the )?(return|retain)$/.test(r)) {
        if (flag('liftRestored')) return say('The dial is interlocked at RETURN while the lift operates.');
        state().flags.serviceReturn = /\breturn$/.test(r);
        return say(`You set SERVICE to ${flag('serviceReturn') ? 'RETURN' : 'RETAIN'}. Nothing starts until the reset switch is pressed.`);
      }
      if (at('relay_chamber') && (/^(?:reset|restart) (?:the )?relay$/.test(r) || (a === 'reset_switch' && ['use','push','pull'].includes(v)))) {
        if (flag('liftRestored')) return say('The service lift is already running. The reset switch has nothing left to prove.');
        if (!flag('relayRepaired')) return say('The interlock refuses an empty fuse socket. Isolate the circuit and fit the replacement before resetting.');
        if (!flag('serviceReturn')) return say('The relay clacks once. RETAIN requests the emergency generator; its interlock rejects this circuit. No damage occurs. The IT maintenance order specifies the service lift\'s route.');
        set('liftRestored'); state().flags.relayIsolated = false;
        return say('You reset the relay at RETURN. Power flows through the insulated circuit.\n\nThe caged lift shudders, rises six inches, and decides to become useful. Service gates unlock at the Executive Elevator and Restricted Archives.\n\nA real shortcut now connects the building. Facilities has created an emergency exit from its own workflow.');
      }
      if (at('investigations') && (/^(?:compare|connect|assemble|review) (?:the )?(?:evidence|board|evidence board|clues)$/.test(r) || (a === 'evidence_board' && ['use','push'].includes(v)))) {
        if (flag('evidenceCompared')) return say('The contradiction is already recorded. The southern evidence-room door is open.');
        const need = [['audit_dossier','the audit dossier here'],['agenda','the agenda in the original meeting room'],['records_file','Scott\'s personnel file in Records'],['drawings','the three drawings in Occult Compliance']].filter(([id]) => !known(id));
        if (need.length) return say('The board cannot compare evidence you have not examined. Missing: ' + need.map(x => x[1]).join('; ') + '. Copies are unnecessary; observed evidence or your prior-run recollections are admissible.');
        set('evidenceCompared');
        return say('You compare authority, chronology, and witnesses.\n\nThe invitation brought Scott into the building. The file already existed. The children witnessed a door, not a consent agreement.\n\nThe official account cannot make those dates occur in its preferred order. The board stamps its own cover sheet: MATERIAL CONTRADICTION.\n\nThe southern evidence-room door opens. For once, a government office has been moved by evidence.');
      }
      if (at('server_room') && /^(?:dispute|challenge|appeal|contest) (?:the )?(?:identity )?lease$/.test(r)) {
        if (flag('identityReleased')) return say('The lease is revoked. There is no remaining claim to dispute.');
        if (flag('identityDisputed')) return say('The lease is already disputed. The validated revocation notice belongs in the Return Engine below.');
        if (!flag('evidenceCompared')) return say('IT requires an independently established contradiction. Investigations can compare the official account with the evidence you have observed.');
        if (!has('revocation_notice')) return say('Bring the revocation notice from Investigations\' evidence room. The console needs a document on which to record the dispute.');
        set('identityDisputed');
        return say('You dispute the lease with the corroborated record.\n\nThe console attempts to route your appeal to the person responsible for your appeal. The two names are identical. After a short and private crisis, it stamps the notice VALIDATED.\n\nLEASE DISPUTED. BELOW ACCESS AUTHORIZED.\n\nThe engine below must receive the revocation. IT has acknowledged the error; correcting it remains another department\'s problem.');
      }
      if (at('below') && a === 'revocation_notice' && ['use','give'].includes(v)) {
        if (c.targetText && !['revocation_slot','return_engine'].includes(b)) return say('The notice belongs in the REVOCATION slot. That target cannot receive it.');
        if (flag('identityReleased')) return say('The lease is already revoked. The engine has retained the notice, not the person.');
        if (!has('revocation_notice')) return say('You need the validated revocation notice in your hand.');
        if (!flag('identityDisputed')) return say('The engine rejects an unvalidated notice. IT Identity Services must record the dispute first.');
        consume('revocation_notice'); set('identityReleased');
        return say('The engine accepts the revocation notice.\n\nSCOTT detaches from the columns of names. The chair\'s nameplate goes blank. Somewhere far above, a calendar invitation quietly loses the authority it never possessed.\n\nThe cats were never Agency equipment. The drawings were never consent. Home was an address the building could imitate, but not own.\n\nYou have removed the claim on your identity. You have not yet left. West returns to the lift; the household door in the Continuity Chamber remains the way home.');
      }
      if (at('below') && v === 'sit' && (!c.objectText || a === 'consent_chair')) {
        if (flag('identityReleased')) return say('The chair has no claim on you anymore. You leave it empty. Some meetings improve when nobody attends.');
        die('consent','You sit beneath DO NOT SIT. The chair accepts your attendance as renewed consent.\n\nThe engine has finally found a way to make this your idea.'); return true;
      }
      if (at('service_lift') && a === 'below_control' && ['push','use'].includes(v)) { api.move('east'); return true; }
      if (at('elevator') && /\b(?:lift|service gate|service intercom)\b/.test(r)) {
        if (['examine','look','open','push','use','talk'].includes(v)) return say(flag('liftRestored') ? 'The repaired service gate is east. Enter it to reach Facilities, the Archives, or Below.' : 'Facilities must restore the service relay. A service passage south of Records leads to IT and Facilities. The passenger elevator is still out of service.');
      }
      if (at('records_stacks') && flag('ashWarned') && !flag('ashScene') && ['wait','hide'].includes(v)) {
        if (v === 'wait') return say('Ash flattens himself against Shelf 20. A drawer opens by itself at the far end of the aisle. You hear filing without footsteps.\n\nThere is room behind the near shelf to HIDE. The north, east, and south exits remain clear. Nothing advances while you read or inspect; this is a warning, not a typing test.');
        set('ashScene');
        return say('You shelter behind the near shelf. Ash vanishes into the space above it.\n\nA shape made of hanging folders passes through the aisle. Each folder contains a different version of the same employee. None is looking where it is going.\n\nWhen the filing stops, Ash reappears high on Shelf 20, grey fur pressed low. His warning was practical advice. You have rarely received that at work.');
      }
      if (v === 'talk' && c.topic && at('records_lobby') && a === 'jorge') {
        const topic = c.topic;
        if (/exit|leave|home|escape/.test(topic)) return say(flag('evidenceCompared') ? "Jorge considers your comparison. 'Doors are not clearances,' he says. 'Find what is waiting on the other side.' For a moment, the femur stops looking like a threat and looks like a warning." : "'Legal documents refusal. Procurement issues supplies. HR invents reasons,' Jorge says. 'The way out is farther in.' He does not appear pleased to have said anything useful.");
        if (/file|scott|record|candidate/.test(topic)) return say(known('records_file') ? "'A candidate is not an employee,' Jorge says. 'Someone keeps trying to make the dates interchangeable.' His thumb covers the barcode on the femur." : "Jorge taps the southern gate. 'Your file is in the stacks. Read the date before you read the recommendations.'");
        if (/agency|consent|lease|invitation/.test(topic)) return say(flag('identityReleased') ? "Jorge looks at his clipboard. A line is missing. 'Good,' he says, so quietly that Records cannot reasonably be expected to retain it." : "'Attendance is easy to record,' Jorge says. 'Permission requires reading.' He scratches a line out of his clipboard. You cannot see whose.");
        if (/it|facilities|investigation|below/.test(topic)) return say("'Service passage, south of the stacks. IT has copies, Facilities has switches, Investigations has questions.' Jorge pauses. 'Below has an answer. I would not confuse that with a welcome.'");
        if (/creamer|food|hungry/.test(topic)) return say(flag('jorgeMoved') ? "'Approved,' Jorge says. This is apparently also a review of the creamer." : "'Hazelnut,' Jorge says. His teeth make this sound less like a preference than a procurement specification.");
        return say("Jorge checks his clipboard. 'That topic is not in my retention schedule.' Try asking about Records, the exit, the Agency, or the service departments.");
      }
      if (v === 'talk' && c.topic && ['ash','merlin','salem','luna','boo'].includes(a)) {
        return say({ash:'Ash crouches high on Shelf 20 and looks toward the aisle. He will not discuss your proposed strategy, but his current one appears sound.',merlin:'Merlin raises one grey paw and taps The Tower. He has offered a concrete recommendation; the minutes should reflect that.',salem:'Salem curls tighter in the inbox. The three drawings above him remain independent witnesses, not signatures on a contract.',luna:'Luna shows only her eyes from beneath the reading stand. She watches your candle, then the stair. A lit flame changes the risk, not her opinion of it.',boo:flag('finalOpen') ? 'Boo has moved aside. His white tail curls around his feet. The meeting is over.' : 'Boo sits upright, white and immense, beside the seals. He has no interest in being transported. This is about naming what you return to.'}[a]);
      }
      if (['use','open'].includes(v) && a && DORK_DATA.items[a]?.expansion && !c.targetText) {
        return say(specialDescription(a) || DORK_DATA.items[a].desc);
      }
      return false;
    }
    function ending() {
      const paragraphs = [];
      if (flag('identityReleased')) paragraphs.push('Below the building, an empty chair has no name. You did not merely escape its claimant; you made the claim fail. The Agency may remember Scott. It can no longer confuse remembering him with owning him.');
      else if (flag('identityDisputed')) paragraphs.push('Your dispute remains on file. Somewhere inside, the Agency will have to explain itself in writing. That is not justice, but it is a remarkably unpleasant start.');
      else if (flag('evidenceCompared')) paragraphs.push('The contradiction you established in Investigations remains on the board. The invitation could bring you inside. It could not make your life belong to the building.');
      if (flag('liftRestored')) paragraphs.push('Behind you, the service lift is still working. For whoever next receives the invitation, one route through the building will be shorter. Facilities will take the credit. You let it.');
      if (flag('ashScene')) paragraphs.push('You remember the grey cat on the high shelf, and the precise difference between being afraid and being wrong.');
      return paragraphs.join('\n\n');
    }
    return {handle, blocked, exits, aliases, roomExtra, onObserve, specialDescription, ending};
  }
  return {create};
})();
