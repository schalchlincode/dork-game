const DORK_DATA = {
  title: "DORK",
  subtitle: "A Scott Adventure",
  startRoom: "meeting",
  rooms: {
    meeting: {
      name: "Executive Continuity Review",
      desc: "You are in Conference Room ECR-4, where you arrived for a 4:30 PM Executive Continuity Review after receiving a calendar invitation bearing the Governor's name. The meeting was scheduled to end at 5:00. A wall clock now says 5:17 and has not moved since you noticed it. The table is too long for one person and too clean for government property. A red EXIT sign glows above the east door. There is no west door. You are fairly certain there was one when you entered.\n\nOn the table: a leather agenda folder, a visitor badge, and a glass of water that has developed a skin.",
      exits: { east: "executive_corridor" },
      items: ["agenda", "badge", "water", "clock"]
    },
    executive_corridor: {
      name: "Executive Corridor",
      desc: "A government corridor extends north and south beneath fluorescent lights that buzz with the confidence of people who cannot be fired. West returns to the meeting room. East is an elevator with brass doors. A BREAK ROOM sign points north. RECORDS lies south.\n\nThe directory lists Floor 6, Floor 5, Floor 4, Floor 3, Floor 2, Floor 1, Basement, Sub-Basement, and 'Below.' A small marker says: YOU ARE HERE — FLOOR 6: EXECUTIVE OFFICES.",
      exits: { west: "meeting", north: "break_room", south: "records_lobby", east: "elevator" },
      exitAliases: { elevator: "east", records: "south", "break room": "north", "meeting room": "west" }
    },
    break_room: {
      name: "Employee Break Room",
      desc: "A coffee machine wheezes beside a refrigerator covered in passive-aggressive notes. A jar of hazelnut creamer sits beneath a handwritten warning: 'JORGE ONLY.' A laminated break-room memo is bolted to the wall beside the refrigerator. Someone has drawn three little stick figures on a napkin and labeled them ANGELA, JULIA, and AUDREY.\n\nThe vending machine displays exactly one item: BLACK CANDLE — OUT OF STOCK.",
      exits: { south: "executive_corridor" },
      items: ["mug", "creamer", "napkin", "memo"]
    },
    records_lobby: {
      name: "Records — Public Facing Area",
      desc: "The Records lobby smells of dust, toner, and something recently exhumed. A service window is closed. North returns to the corridor. South, a steel gate leads into the stacks.\n\nJORGE sits behind a desk. He is enormous. His suit is immaculate. His proportions are not. One hand rests on a clipboard. The other is holding a femur with a barcode sticker on it.\n\nA small placard says: JORGE — RECORDS MANAGEMENT SPECIALIST III.",
      descByFlag: { jorgeMoved: "The Records lobby smells of dust and toner. Jorge has rolled his chair aside, leaving the southern gate clear. He still holds the barcoded femur. North returns to the corridor; south enters the stacks." },
      exits: { north: "executive_corridor", south: "records_stacks" },
      blocked: { south: "jorge" },
      exitAliases: { gate: "south", stacks: "south" },
      items: ["jorge"]
    },
    records_stacks: {
      name: "Records Stacks",
      desc: "Shelves vanish into darkness. Box labels progress from ordinary fiscal years into dates that have not happened yet. Somewhere in the stacks, something is filing. Slowly.\n\nA grey cat watches you from atop Shelf 20. It looks terrified. This seems sensible.",
      exits: { north: "records_lobby", east: "legal_annex" },
      items: ["form66b", "ash_note", "records_file", "ash"]
    },
    legal_annex: {
      name: "Legal Annex",
      desc: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. A contract waits on a lectern beneath a sign reading SIGNATURE REQUIRED. The document is sixty-three pages long. A detachable Page 64 labeled WAIVER FORM 4C is tucked underneath it.\n\nA rubber Waiver Stamp 4C sits inside a locked acrylic box.",
      descByFlag: {
        objectionFiled: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract remains unsigned beneath SIGNATURE REQUIRED. The acrylic box is open and empty. Procurement has filed your refusal, and Legal is pretending this was its idea.",
        stampTaken: "The Legal Annex is paneled in dark wood and lit by a green-shaded lamp. The contract still waits on its lectern beneath SIGNATURE REQUIRED. The acrylic box is open and empty. Legal has not yet filed an objection."
      },
      exits: { west: "records_stacks", south: "procurement" },
      items: ["contract", "waiver_form", "stamp_box"]
    },
    procurement: {
      name: "Procurement Chapel",
      desc: "Rows of office chairs face a purchasing counter set where an altar would normally be. Behind it stands a brass requisition machine with two paper slots: FORM and WAIVER.\n\nA sign reads: 'NO GOODS OR SERVICES MAY BE ACQUIRED WITHOUT DOCUMENTED BUSINESS NECESSITY, INCLUDING EXORCISMS.'",
      exits: { north: "legal_annex", east: "hr_reliquary" },
      items: ["requisition_machine"]
    },
    hr_reliquary: {
      name: "Human Resources Reliquary",
      desc: "The carpet is mauve. The walls are bone. HR has arranged three face-up tarot cards as a mandatory orientation assessment: THE FOOL, THE TOWER, and THE SUN. This is not how tarot works, which is how you know HR designed it. A sweet grey cat sits beside the cards with one paw raised, as though waiting for you to embarrass yourself. His tag says MERLIN.\n\nThe east wall has no door, although cold air is coming through it.",
      descByFlag: { tarotSolved: "The carpet is mauve. The walls are bone. HR's face-up tarot assessment remains on the table, and Merlin watches from beside it with one paw raised. The east wall has split open into a passage." },
      exits: { west: "procurement", east: "occult_compliance" },
      exitAliases: { passage: "east" },
      blocked: { east: "tarot" },
      items: ["fool", "tower", "sun", "merlin", "tarot_spread"]
    },
    occult_compliance: {
      name: "Occult Compliance",
      desc: "Cubicles form a circle around a black stone conference table. A sweet black cat is curled asleep in an inbox tray. SALEM, according to the tag.\n\nThree framed children's drawings hang on the wall. Each child drew the same impossible building from a different angle. In every drawing, the same enormous door dominates the structure, surrounded by five cat-shaped marks. The signatures read ANGELA, JULIA, and AUDREY. Beneath them, someone has written: 'THREE WITNESSES ESTABLISH CONTINUITY.'\n\nA freight elevator waits to the south.",
      exits: { west: "hr_reliquary", south: "archives" },
      exitAliases: { elevator: "south" },
      items: ["salem", "drawings", "compliance_manual"]
    },
    elevator: {
      name: "Executive Elevator",
      desc: "The elevator has buttons for 1 through 6, B, SB, and a button labeled BELOW that appears to be made from a human tooth. None of the buttons respond.\n\nA notice reads: OUT OF SERVICE.",
      exits: { west: "executive_corridor" }
    },
    archives: {
      name: "Restricted Archives",
      desc: "The elevator opens into an archive built from limestone blocks older than the state above it. Filing cabinets have been mortared into the walls like tombs.\n\nA huge ledger rests on a broad stone reading stand. The stand has an open arch beneath it, where a black cat is hiding so completely that only two eyes are visible. LUNA appears on her collar. There is a narrow stair descending east.",
      exits: { north: "occult_compliance", east: "subbasement" },
      exitAliases: { down: "east", stairs: "east", elevator: "north" },
      items: ["ledger", "luna"]
    },
    subbasement: {
      name: "Sub-Basement — Continuity Infrastructure",
      desc: "The stair ends in a concrete tunnel. Emergency lights have failed. Something wet is breathing in the darkness ahead.\n\nA painted arrow points east: CONTINUITY CHAMBER. West, the stair leads back up to the Archives. A parking passage beyond the tunnel has collapsed behind a wall of black roots. The directory called this the Sub-Basement. Whatever it meant by BELOW is still somewhere else.",
      exits: { west: "archives", east: "continuity_chamber" },
      exitAliases: { up: "west", stairs: "west" },
      dark: true
    },
    continuity_chamber: {
      name: "Continuity Chamber",
      desc: "The chamber is circular and much larger than the building should permit. Five brass seals ring a central door. Each bears the silhouette of a cat. A tiny engraved arrow beside the uppermost seal points clockwise. Beneath the seals is a silver key slot.\n\nA huge white cat sits in front of the door. BOO looks up at you with the expression of an animal who has never once doubted his own authority.\n\nAbove the door: CONTINUITY IS NOT THE PRESERVATION OF GOVERNMENT. IT IS THE PRESERVATION OF RETURN.",
      descByFlag: { finalOpen: "The chamber is circular and the five brass seals are lit. The eastern door stands open. Boo has moved aside with the generosity of a monarch granting a narrow pardon.", keyUsed: "The chamber is circular. The silver key rests in its slot beneath five waking seals. The eastern door remains shut, waiting for five names. Boo sits beside it, apparently supervising." },
      exits: { west: "subbasement", east: "asset_control" },
      exitAliases: { door: "east" },
      blocked: { east: "final_seal" },
      items: ["boo", "seals", "final_plaque"]
    },
    asset_control: {
      name: "Asset Control Vestibule",
      desc: "A waist-high return bin blocks the final exit. A scanner above the east door reads:\n\nALL STATE PROPERTY MUST BE SURRENDERED BEFORE SEPARATION. FAILURE TO COMPLY CONSTITUTES VOLUNTARY TERMINATION.\n\nThe scanner is already reviewing your inventory with professional disappointment.",
      exits: { west: "continuity_chamber", east: "parking_exit" },
      items: ["return_bin", "asset_scanner"]
    },
    parking_exit: {
      name: "Employee Parking Garage",
      desc: "Cold evening air hits your face. Concrete. Cars. A normal EXIT sign. No chanting. No bones in business casual.\n\nYour phone immediately receives fourteen delayed emails, two calendar updates, and a reminder to complete mandatory cybersecurity training.\n\nFor the first time all night, the horror feels familiar.",
      exits: {},
      ending: true
    }
  },
  items: {
    agenda: { name: "agenda folder", aliases: ["agenda", "folder", "leather folder"], portable: true, desc: "The agenda contains one item: '1. Establish continuity.' Five blank signature lines follow. The footer says: 'Attendance constitutes consent unless otherwise documented.'" },
    badge: { name: "visitor badge", aliases: ["badge", "visitor badge", "id", "id badge", "name badge"], portable: true, desc: "VISITOR: SCOTT. ACCESS LEVEL: TEMPORARILY ADEQUATE. The photo is surprisingly flattering. Scott would probably agree." },
    water: { name: "glass of water", article: "the glass of water", aliases: ["water", "glass", "glass of water", "water glass"], portable: false, desc: "The water is room temperature and somehow looks judgmental." },
    clock: { name: "wall clock", aliases: ["clock", "wall clock", "time"], portable: false, desc: "The clock reads 5:17 PM. The meeting invitation was for 4:30 to 5:00. The second hand is not moving." },
    mug: { name: "government mug", aliases: ["mug", "cup", "coffee mug"], portable: true, desc: "A chipped mug reading WORLD'S MOST ESSENTIAL DEPUTY SOMETHING. The last word has worn off." },
    creamer: { name: "hazelnut creamer", aliases: ["creamer", "hazelnut", "hazelnut creamer"], portable: true, desc: "JORGE ONLY. Apparently policy." },
    napkin: { name: "napkin drawing", aliases: ["napkin", "drawing", "stick figures"], portable: true, desc: "Three stick figures labeled Angela, Julia, and Audrey hold hands around a badly drawn door. One has written HOME IS A PASSWORD in purple marker." },
    memo: { name: "break-room memo", aliases: ["memo", "note", "break room memo", "break-room note"], portable: false, desc: "A laminated memo bolted to the wall reads: Records staff are not to be fed after 5:00 PM except approved flavored creamers. This policy supersedes the 2019 incident." },
    form66b: { name: "Form 66-B", aliases: ["form", "form 66-b", "66b", "66-b"], portable: true, desc: "FORM 66-B: Emergency Acquisition of Ritual, Infernal, or Otherwise Noncompetitive Goods. Every field is already completed in Scott's handwriting, including a business justification he does not remember writing." },
    waiver_form: { name: "Waiver Form 4C", aliases: ["waiver", "waiver form", "waiver form 4c", "page 64", "refusal form", "refusal page"], portable: true, desc: "A detachable refusal form labeled WAIVER FORM 4C. Its certification box is blank and requires Waiver Stamp 4C.", descByFlag: { waiverStamped: "Waiver Form 4C bears a fresh red imprint: DECLINED WITH PREJUDICE. It is ready for Procurement's WAIVER slot." } },
    ash_note: { name: "scratched shelf note", aliases: ["note", "ash note", "scratched note"], portable: false, desc: "Scratched into Shelf 20: ASH HIDES BEFORE IT ARRIVES. IF THE CAT LEAVES, YOU SHOULD HAVE ALREADY LEFT." },
    records_file: { name: "continuity personnel file", aliases: ["file", "records file", "personnel file"], portable: true, desc: "The file is stamped SCOTT — CANDIDATE, though the creation date predates Scott's law-school graduation. A handwritten note says: 'Humor response remains intact. Useful.'" },
    ash: { name: "Ash", aliases: ["ash", "grey cat", "gray cat", "cat", "scared cat"], portable: false, desc: "Ash crouches high on Shelf 20, grey fur pressed low. He has correctly assessed the workplace." },
    jorge: { name: "Jorge", aliases: ["jorge", "man", "specialist", "records specialist"], portable: false, desc: "Jorge is at least seven feet tall while seated. His suit is immaculate, his proportions are not, and his clipboard appears to require its own clearance." },
    contract: { name: "continuity contract", aliases: ["contract", "document", "papers"], portable: false, desc: "The signature page grants the Agency 'continued use of identity, likeness, memory, and post-mortem administrative capacity.' The fine print says: 'Refusal must be documented on detachable Waiver Form 4C using Waiver Stamp 4C.'" },
    stamp_box: { name: "waiver stamp box", aliases: ["box", "acrylic box", "stamp box"], portable: false, desc: "A locked acrylic box contains WAIVER STAMP 4C. The lock is cheap. Law school has prepared you for almost none of this.", descByFlag: { stampTaken: "The acrylic box is open and empty. Legal has already lost custody of its waiver stamp." } },
    waiver_stamp: { name: "Waiver Stamp 4C", aliases: ["stamp", "waiver stamp", "4c", "stamp 4c"], portable: true, desc: "A rubber stamp reading DECLINED WITH PREJUDICE." },
    requisition_machine: { name: "requisition machine", aliases: ["machine", "requisition machine", "brass machine"], portable: false, desc: "Two paper slots are labeled FORM and WAIVER. A third slot labeled SOUL has been taped over." },
    procurement_receipt: { name: "Procurement receipt", aliases: ["receipt", "procurement receipt", "employee copy"], portable: true, desc: "PROCUREMENT RECEIPT: FORM RECEIVED. WAIVER FILED. ASSETS ISSUED. COST CENTER: POSTERITY. EMPLOYEE COPY." },
    black_candle: { name: "black emergency candle", aliases: ["candle", "black candle", "emergency candle"], portable: true, desc: "PROCUREMENT ITEM 771-C. A black emergency candle with a metal striker cap. Twist until it clicks. Matches are considered an unauthorized dependency." },
    silver_key: { name: "silver continuity key", aliases: ["key", "silver key", "continuity key"], portable: true, desc: "A heavy silver key engraved with five tiny cats." },
    fool: { name: "The Fool", aliases: ["fool", "the fool", "fool card"], portable: false, desc: "A traveler steps cheerfully toward a cliff. Management potential." },
    tower: { name: "The Tower", aliases: ["tower", "the tower", "tower card"], portable: false, desc: "A tower is struck by lightning while people fall from it. HR has marked this card 'CHANGE MANAGEMENT.'" },
    sun: { name: "The Sun", aliases: ["sun", "the sun", "sun card"], portable: false, desc: "Radiance, joy, success. Obviously suspicious." },
    tarot_spread: { name: "tarot assessment", aliases: ["cards", "tarot", "spread", "tarot spread", "tarot assessment", "orientation assessment"], portable: false, desc: "HR has arranged three face-up cards as a mandatory orientation assessment: THE FOOL, THE TOWER, and THE SUN. This is not a proper tarot reading. Merlin's paw favors THE TOWER." },
    merlin: { name: "Merlin", aliases: ["merlin", "grey cat", "gray cat", "cat"], portable: false, desc: "Merlin is sweet, grey, and looking at The Tower card with aggressive patience." },
    salem: { name: "Salem", aliases: ["salem", "black cat", "cat"], portable: false, desc: "Salem is asleep in an inbox labeled ITEMS REQUIRING IMMEDIATE ACTION." },
    drawings: { name: "children's drawings", aliases: ["drawings", "drawing", "pictures", "children's drawings", "kids drawings"], portable: false, desc: "Three drawings, three signatures: Angela, Julia, Audrey. Each child drew the same impossible building from a different angle. In every drawing, the same enormous door dominates the structure, surrounded by five cat-shaped marks." },
    compliance_manual: { name: "Occult Compliance Manual", aliases: ["manual", "compliance manual", "book"], portable: true, desc: "Section 8.4: 'Continuity seals respond to household anchors. Where five anchors exist, all five must be named in sequence.'" },
    ledger: { name: "continuity ledger", aliases: ["ledger", "book", "huge ledger"], portable: false, desc: "The ledger is chained to a broad stone reading stand. It lists thousands of state employees. Most names are crossed out. Scott's is not. In the margin: 'Invited by authority; retained by consent; released by anchor.'" },
    luna: { name: "Luna", aliases: ["luna", "black cat", "scared cat", "cat"], portable: false, desc: "Luna hides in the open arch beneath the stone reading stand. She is very, very afraid of the stairway. This is the strongest evidence you have received all evening." },
    boo: { name: "Boo", aliases: ["boo", "white cat", "huge cat", "cat"], portable: false, desc: "Boo is an enormous white cat. He appears to have been appointed to something." },
    seals: { name: "five brass seals", aliases: ["seals", "brass seals", "five seals"], portable: false, desc: "Starting at the uppermost seal and following the engraved arrow clockwise: a huge white cat sitting upright as if it outranks the door; a black cat curled asleep; a small grey cat crouched high, as if on a shelf; a black cat with only its eyes showing; a grey cat with one paw raised." },
    final_plaque: { name: "continuity plaque", aliases: ["plaque", "final plaque", "sign"], portable: false, desc: "'WHAT YOU RETURN TO IS WHAT RETURNS YOU.' Below that, in smaller type: 'Do not submit a ticket for this door.'" },
    return_bin: { name: "state-property return bin", aliases: ["bin", "return bin", "property bin", "state property bin"], portable: false, desc: "A waist-high return bin marked STATE PROPERTY. It accepts objects more readily than the Agency accepts resignations." },
    asset_scanner: { name: "asset-control scanner", aliases: ["scanner", "asset scanner", "asset-control scanner", "property scanner"], portable: false, desc: "The scanner compares your inventory against an asset register. Its east-door indicator is red whenever state property remains in your possession." }
  }
};
