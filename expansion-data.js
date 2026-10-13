/* The optional, interconnected middle act. Original core route remains intact. */
'use strict';
(() => {
  const room = (name, desc, exits, items, exitAliases = {}) => ({name, desc, exits, items, exitAliases});
  Object.assign(DORK_DATA.rooms, {
    it_helpdesk: room('IT — Service Continuity Desk',
      'An unattended help desk occupies a junction that the floor plan calls a rounding error. A terminal displays one open ticket under SCOTT. The queue counter reads ONE, FOREVER. A smaller notice promises that all calls are important and none are expected.\n\nA service ticket lies beside the terminal. North returns to Records, east leads to Facilities, and west leads to Investigations. A locked server-room door stands south. Its access light is waiting for the ticket to be resolved.',
      {north:'records_stacks',east:'facilities_office',west:'investigations',south:'server_room'}, ['service_ticket','ticket_terminal'],
      {records:'north',facilities:'east',investigations:'west',servers:'south','server room':'south'}),
    server_room: room('IT — Identity Services',
      'Server racks rise like apartment blocks for very small, very unhappy tenants. Every status light blinks in time with a heartbeat that does not appear to be yours. A wall console displays IDENTITY LEASE: SCOTT.\n\nA laminated maintenance order is clipped beneath the screen. A glass network diagram marks a route from Facilities to the Executive Elevator and, beyond its deepest stop, BELOW. North returns to the help desk.',
      {north:'it_helpdesk'}, ['identity_console','maintenance_order','network_diagram'], {desk:'north','help desk':'north'}),
    facilities_office: room('Facilities — Emergency Generation',
      'The office motto is WE MAKE IT HAPPEN. Someone has crossed out IT and written EMERGENCIES. A safety instruction plate hangs above a desk holding a porcelain replacement fuse. The fuse is the only object here not covered in a thin coat of administrative soot.\n\nA red lever protrudes from a steel isolation cabinet. Beside it, an indicator reads LIVE. West leads to IT; south enters the relay chamber.',
      {west:'it_helpdesk',south:'relay_chamber'}, ['relay_instructions','replacement_fuse','isolation_lever'],
      {it:'west','help desk':'west',relay:'south','relay chamber':'south'}),
    relay_chamber: room('Facilities — Service Lift Relay',
      'Copper conduits descend into the floor like exposed roots. A relay cabinet controls the old service lift. Through a scorched window you can see an empty fuse socket. A brass SERVICE dial has two marked positions: RETURN and RETAIN. A reset switch waits beneath a red warning: ISOLATE BEFORE FITTING.\n\nNorth returns to Facilities. A caged lift stands east with no power. Its two destinations are EXECUTIVE and ARCHIVES; a third stop is written underneath in chalk: BELOW.',
      {north:'facilities_office',east:'service_lift'}, ['relay_cabinet','fuse_socket','service_dial','reset_switch'],
      {facilities:'north',lift:'east','service lift':'east'}),
    service_lift: room('Facilities — Service Lift',
      'The cage is now lit. A paper sign says MAXIMUM OCCUPANCY: ONE PERSON AND THEIR CONSEQUENCES. The mechanism can return you to the Executive Elevator or carry you down to the Restricted Archives. Below the ordinary controls is a dark button made from a human tooth.\n\nWest returns to the relay chamber. North serves Executive; south serves Archives. A narrow lower gate remains locked behind the BELOW control.',
      {west:'relay_chamber',north:'elevator',south:'archives',east:'below'}, ['below_control'],
      {executive:'north',archives:'south',below:'east',relay:'west'}),
    investigations: room('Investigations — Office of Internal Contradiction',
      'Three chairs face a desk. One is labeled COMPLAINANT, one RESPONDENT, and the third MEETING ORGANIZER. All three have Scott\'s visitor number.\n\nAn audit dossier and a testimony index lie beneath a desk lamp. A sealed evidence board hangs on the south wall, beside a door marked DUPLICATE ORIGINALS. East returns to IT; the southern door waits for a contradiction worth investigating.',
      {east:'it_helpdesk',south:'evidence_room'}, ['audit_dossier','testimony_index','evidence_board'],
      {it:'east','help desk':'east',evidence:'south','evidence room':'south'}),
    evidence_room: room('Investigations — Duplicate Originals',
      'The room contains one drawer, one typewriter, and a wastebasket labeled RESOLVED INCONVENIENCES. The drawer holds an unsigned revocation notice. The typewriter has no keyboard. It accepts evidence rather than opinions, which explains the lack of use.\n\nA posted procedure explains that an unsupported identity claim can be DISPUTED once the original invitation, prior candidate record, and independent witnesses have been compared. North returns to Investigations.',
      {north:'investigations'}, ['revocation_notice','evidence_typewriter'], {investigations:'north'}),
    below: room('Below — The Return Engine',
      'The lift opens beneath the foundations. There is no further floor number. A brass engine turns around an empty chair labeled SCOTT. Wires run from the chair into columns of names. The machine has mistaken a return address for permission to retain its owner.\n\nA disputed lease glows on an input console. Beside it is a slot marked REVOCATION. The warning above the chair is unusually direct: DO NOT SIT. OCCUPANCY REINSTATES CONSENT.\n\nWest returns to the service lift. This is not the way outside. The household door remains the only way to go home.',
      {west:'service_lift'}, ['return_engine','consent_chair','revocation_slot'], {lift:'west','service lift':'west'})
  });
  const item = (name, aliases, desc, portable=false, extra={}) => ({name, aliases, desc, portable, expansion:true, ...extra});
  Object.assign(DORK_DATA.items, {
    service_ticket: item('service ticket', ['service ticket','ticket','support ticket'],
      'TICKET SCOTT-0001. Opened before tonight\'s calendar invitation. REQUEST: remove departed requester. STATUS: requester alive; closure prohibited.\n\nThe workflow has confused closing a human life with closing a support ticket. A footer lists nonfatal dispositions: DUPLICATE, MISFILED, and NO LONGER REQUIRED. The Records personnel file is the originating record; this ticket is its duplicate.'),
    ticket_terminal: item('ticket terminal', ['ticket terminal','terminal','helpdesk terminal','screen'],
      'The terminal accepts CLOSE TICKET AS followed by a disposition. DUPLICATE requires you to have examined the originating personnel file in Records. No password is required; the Agency assumes nobody will read this far.'),
    identity_console: item('identity console', ['identity console','console','lease','identity lease'],
      'IDENTITY LEASE: SCOTT. CREATED: before the invitation. BASIS: anticipated consent. The lease was created from a candidate record; the calendar invitation did not create it. A command prompt offers DISPUTE LEASE with independently corroborated evidence. An empty warning box is labeled APPEAL RESPONSE.'),
    maintenance_order: item('maintenance order', ['maintenance order','order','work order'],
      'SERVICE LIFT ORDER: After isolating the relay and fitting its replacement fuse, set SERVICE to RETURN, then reset. RETAIN powers the emergency generator instead of the lift. The labels describe functions, not destinations.'),
    network_diagram: item('network diagram', ['network diagram','diagram','network'],
      'A glass route diagram links IT to Facilities. The repaired service lift connects the Executive Elevator, Restricted Archives, and the Return Engine BELOW. The lowest stop requires both restored power and a disputed identity lease. The public passenger buttons remain out of service.'),
    relay_instructions: item('relay safety instructions', ['relay instructions','instructions','safety plate','safety instructions'],
      'ISOLATE → REPLACE → ROUTE → RESET. Pull the red isolation lever before inserting any fuse. The maintenance order in IT Identity Services specifies the safe SERVICE position. A live socket can kill; looking at controls never can.'),
    replacement_fuse: item('porcelain replacement fuse', ['replacement fuse','porcelain fuse','fuse'],
      'A ceramic service fuse, stamped STATE PROPERTY. It fits the relay socket. The wrapper repeats ISOLATE FIRST in the largest type the budget allowed.', true, {government:true}),
    isolation_lever: item('red isolation lever', ['isolation lever','red lever','lever','isolation cabinet'],
      'The lever disconnects power to the relay socket. PULL LEVER is printed under the handle. Push it back only after the replacement is secured.'),
    relay_cabinet: item('relay cabinet', ['relay cabinet','relay','cabinet'],
      'The cabinet has a burnt-out fuse socket, a SERVICE dial, and a reset switch. Isolate the circuit in Facilities before fitting a fuse. The service dial must be routed according to the IT maintenance order.'),
    fuse_socket: item('fuse socket', ['fuse socket','socket'],
      'An empty fuse socket behind a hinged insulating cover. The live contact is visibly scorched. Inserting metal or a fuse before isolation would complete a short and regrettable circuit.'),
    service_dial: item('service dial', ['service dial','dial','route selector','selector'],
      'The dial has RETURN and RETAIN positions. Set it with SET DIAL TO RETURN or SET DIAL TO RETAIN. The IT maintenance order explains which function belongs to the service lift.'),
    reset_switch: item('relay reset switch', ['reset switch','reset button','switch','reset'],
      'A brass reset switch. RESET RELAY or PUSH RESET SWITCH starts the selected service after a fuse is fitted. An interlock prevents resetting an empty socket.'),
    below_control: item('Below control', ['below control','below button','tooth','button'],
      'The tooth-shaped control serves the Return Engine. Its two indicators are POWER and LEASE DISPUTED. Both must be lit before the lower gate will open.'),
    audit_dossier: item('audit dossier', ['audit dossier','dossier','audit'],
      'The official account says Scott requested continued employment by accepting tonight\'s invitation. The candidate file predates that invitation. An invitation can compel attendance; it cannot retroactively establish a request. Compare this account with the personnel file, the agenda, and the independent drawings. The board accepts COMPARE EVIDENCE.'),
    testimony_index: item('testimony index', ['testimony index','index','testimony','witness index'],
      'Independent witnesses: ANGELA, JULIA, AUDREY. Three views of the same impossible building. Their drawings certify that a door exists; they do not consent on Scott\'s behalf. Household anchors answer a different question: where can he return? The originals remain in Occult Compliance.'),
    evidence_board: item('evidence board', ['evidence board','board','evidence'],
      'Three empty columns read AUTHORITY, CHRONOLOGY, and WITNESSES. Compare the agenda, Scott\'s personnel file, and the drawings after examining them. Memory is admissible. Physically stealing the originals is not required.'),
    revocation_notice: item('revocation notice', ['revocation notice','revocation','notice','appeal'],
      'A notice withdrawing any inferred consent to the Agency\'s continuing identity lease. No signature line exists. A blank DISPUTE RECEIPT field must be validated at the identity console before the Return Engine accepts it.', true),
    evidence_typewriter: item('evidence typewriter', ['evidence typewriter','typewriter'],
      'The typewriter has already recorded your comparison. Its final line reads: The file made a candidate; the invitation brought him inside; neither supplied consent. The revocation notice belongs to the subject, not the state.'),
    return_engine: item('return engine', ['return engine','engine','machine'],
      'The engine is the source of the identity lease, not the household seals. Submit a validated revocation notice to remove the unsupported claim. You will still need to leave by the Continuity Chamber. Destroying it would strand other names in the system.'),
    consent_chair: item('consent chair', ['consent chair','chair','seat'],
      'The nameplate says SCOTT. Beneath it: SITTING REINSTATES CONSENT AND IS FATAL TO THE CURRENT OCCUPANT. A chair has finally provided a clearer agenda than the meeting organizer.'),
    revocation_slot: item('revocation slot', ['revocation slot','slot','input console'],
      'A narrow slot accepts a revocation notice after IT has marked the lease disputed. The slot cannot infer consent. Someone has underlined CANNOT twice.')
  });
  const rooms = DORK_DATA.rooms;
  rooms.records_stacks.exits.south = 'it_helpdesk';
  rooms.records_stacks.exitAliases = {it:'south','help desk':'south','it helpdesk':'south',legal:'east',records:'north'};
  rooms.records_stacks.desc += '\n\nA service passage marked IT / FACILITIES / INVESTIGATIONS runs south. Legal is east; the public Records gate is north.';
  rooms.it_helpdesk.blocked = {south:'ticket'};
  rooms.relay_chamber.blocked = {east:'lift'};
  rooms.investigations.blocked = {south:'evidence'};
  rooms.service_lift.blocked = {east:'below'};
  rooms.hr_reliquary.desc += '\n\nAn assessment notice reads: SELECTING A CARD IS BINDING. FAILED ORIENTATION IS FATAL. Inspection is permitted.';
  rooms.asset_control.desc += '\n\nA recovery hatch lets you RECLAIM returned property before leaving. Reclaimed property must be surrendered again to exit.';
  rooms.elevator.desc += '\n\nA separate service intercom carries a faded Facilities label. A repair could restore the maintenance route, not the passenger buttons.';
  rooms.it_helpdesk.descByFlag = {ticketResolved:'The help-desk terminal reads TICKET CLOSED: DUPLICATE. A receipt line says THE PERSON REMAINS OPEN. The southern server-room door is unlocked. Records is north, Facilities east, Investigations west.'};
  rooms.relay_chamber.descByFlag = {liftRestored:'The service relay hums steadily. Its cabinet holds the replacement fuse, and the SERVICE dial is secured at RETURN. The caged lift to the east is operating. North returns to Facilities.'};
  rooms.investigations.descByFlag = {evidenceCompared:'The evidence board now holds a documented contradiction. The official account has failed to survive contact with its own dates. The southern evidence-room door is open; IT lies east.'};
  rooms.below.descByFlag = {identityReleased:'The engine turns around an empty chair whose nameplate is now blank. Scott\'s identity is no longer retained. Other names continue through the mechanism, but yours has stopped. West returns to the lift; the household door remains your way home.'};
  DORK_DATA.items.revocation_notice.descByFlag = {identityDisputed:'A validated revocation notice with IT DISPUTE RECEIPT attached. Submit it in the Return Engine\'s REVOCATION slot below. No signature is requested.'};
  DORK_DATA.items.fuse_socket.descByFlag = {relayRepaired:'The replacement fuse is secured inside the socket. The insulating cover is shut.'};
  DORK_DATA.items.identity_console.descByFlag = {identityReleased:'IDENTITY LEASE: REVOKED. SCOTT IS NO LONGER AN AGENCY ASSET.',identityDisputed:'IDENTITY LEASE: DISPUTED. The revocation notice is validated. Submit it to the Return Engine below.',ticketResolved:DORK_DATA.items.identity_console.desc};
  const short = {
    meeting:'The clock still says 5:17. The only door is east.',executive_corridor:'Floor 6. Meeting west, break room north, Records south, passenger elevator east.',break_room:'The refrigerator still has opinions. The corridor is south.',records_lobby:'Jorge retains his desk, his femur, and most of the lobby. North: corridor. South: Records gate.',records_stacks:'Ash watches from Shelf 20. North: lobby. East: Legal. South: IT.',legal_annex:'Legal has not become less interested in your signature. West: Records. South: Procurement.',procurement:'The purchasing counter waits for paperwork. North: Legal. East: HR.',hr_reliquary:'Merlin supervises the assessment. Procurement is west; the eastern passage depends on orientation.',occult_compliance:'Salem, three drawings, and an unreasonable amount of continuity. West: HR. South: Archives.',archives:'Luna hides beneath the reading stand. North: Compliance. East: the unlit stair.',subbasement:'A concrete tunnel. West: Archives stair. East: Continuity Chamber.',continuity_chamber:'Boo supervises five seals and the eastern door. The tunnel is west.',asset_control:'The final scanner checks carried state property. West: chamber. East: parking.',elevator:'The passenger buttons remain out of service. West returns to the corridor.'
  };
  for (const [id, text] of Object.entries(short)) rooms[id].brief = text;
})();
