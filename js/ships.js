/* =====================================================================
   STRIKE WINGS — ship registry
   83 hulls from the game, each with an in-engine turntable (assets/ships3d/<id>.webp,
   a 9x8 sprite sheet of 72 frames) rendered in Blender from the game's own meshes.
   Self-contained module; does not depend on main.js scope.
   ===================================================================== */
(function () {
  "use strict";

  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var TT = { cols: 9, rows: 8, frames: 72, ms: 180 }; // turntable sprite sheet: 72 frames, ~13s per slow revolution

  var GROUPS = [
    { key: "fighter", label: "FIGHTERS" },
    { key: "bomber", label: "BOMBERS" },
    { key: "capital", label: "CAPITAL SHIPS" },
    { key: "carrier", label: "CARRIERS" },
    { key: "station", label: "STATIONS" },
    { key: "civilian", label: "CIVILIAN" }
  ];

  var SHIPS = [
    /* ---- FIGHTERS ---- */
    { id: "reaper", g: "fighter", cls: "MULTIROLE FIGHTER", name: "RP-1A REAPER",
      story: "Drawn in 2113 and flown by the thousand on both sides by 2205. It shredded Talons in its first trial and Lancers in its second, so the Alliance reverse-engineered captured hulls and built its own. The war's definitive fighter.",
      spd: 78, arm: 52, shl: 74, pwr: 70 },
    { id: "talon", g: "fighter", cls: "LINE INTERCEPTOR", name: "SF-16D TALON",
      story: "The ship that turned the Halcyon Convulsion: cheap, rugged, mass-produced, and still the most common silhouette on any battlefield. There is a Talon in the atrium of every Martian naval academy.",
      spd: 78, arm: 50, shl: 58, pwr: 60 },
    { id: "lancer", g: "fighter", cls: "HEAVY ASSAULT FIGHTER", name: "SF-69B LANCER",
      story: "Built in 2149 to fly without a pilot, until human aces learned its algorithms and slaughtered it. The survivors were given cockpits; today it is a heavily armoured brawler and the Ashen Gabriel's squadron trainer.",
      spd: 64, arm: 64, shl: 66, pwr: 74 },
    { id: "manticore", g: "fighter", cls: "VECTOR-THRUSTER GUNSHIP", name: "SF-10C MANTICORE",
      story: "A close-range gunship built around a spinal vector-thruster ring that lets it strafe, reverse, and pivot mid-burst without taking its twin concussion cannons off target. An ace in one is a nightmare. A rookie dies quickly.",
      spd: 96, arm: 46, shl: 70, pwr: 76 },
    { id: "headsman", g: "fighter", cls: "TURRET FIGHTER", name: "LB-32B HEADSMAN",
      story: "The Alliance's answer to the Reaper: a heavy fighter built around a dorsal turret that tracks a full 360°. The airframe banks like a frigate and does not need to turn, because its gun does. Feared by everyone but its pilots.",
      spd: 58, arm: 74, shl: 72, pwr: 82 },
    { id: "vanguard", g: "fighter", cls: "RESERVE INTERCEPTOR", name: "SF-X VANGUARD",
      story: "Kovale's Convulsion-era interceptor, the shape every Terran child draws for a spaceship. Obsolete by 2205 and too old for a modern shield; the refit's Phase Shift emitter grants brief intangibility, and that is the only reason it still flies.",
      spd: 78, arm: 54, shl: 40, pwr: 62 },
    { id: "archfiend", g: "fighter", cls: "ACE SUPERIORITY FIGHTER", name: "AF-2 ARCHFIEND",
      story: "Mars's prestige fighter, nearly twice a Reaper's cost and issued only to aces. Twin gatlings, swarm packs, and a 350mm concussion cannon that guts a frigate in one shot. The pulpits called it a civilization-ender. It is merely the most dangerous fighter Mars has built.",
      spd: 82, arm: 78, shl: 84, pwr: 96 },
    { id: "crusader", g: "fighter", cls: "INNER-GUARD HEAVY FIGHTER", name: "1LSC CRUSADER",
      story: "The Iron Lamb's inner-guard fighter, built from wholly Terran parts with no Martian alloy, at ruinous expense. Its hand-built shield takes seven months per unit and fewer than a hundred exist. It out-accelerates the Reaper, out-shields the Lancer, and out-punches both.",
      spd: 82, arm: 92, shl: 95, pwr: 90 },
    { id: "paladin", g: "fighter", cls: "MINIGUN BRAWLER", name: "PA-1 PALADIN",
      story: "An Alliance trainer-brawler with a dorsal minigun pair that delivers a kinetic driver's damage as a stream, so a tracking error costs a round rather than an engagement. Officially a cadet frame, but the gun never jams and veterans fly it on live ops.",
      spd: 78, arm: 50, shl: 64, pwr: 66 },
    { id: "bereaver", g: "fighter", cls: "TWIN-FIN STRIKE FIGHTER", name: "BV-1 BEREAVER",
      story: "The Consortium's signature strike fighter on a Reaper chassis. Twin dorsal fins carry the armour its thin shields cannot, and the sodium-seeded Ott Stage drive paints its yellow plume and keeps it on contract for weeks without yard time. The loadout is all anti-fighter.",
      spd: 78, arm: 60, shl: 44, pwr: 74 },
    { id: "alphastrike", g: "fighter", cls: "STANDOFF HEAVY FIGHTER", name: "AS-1A ALPHA STRIKE",
      story: "The Consortium's standoff heavy fighter, with the heaviest fighter plating and the highest straight-line speed in service. Trade fire at range with the Gauss cannon and walk Dart Missiles onto anything that closes. Director-Speaker Vren keeps two on rotation.",
      spd: 90, arm: 66, shl: 70, pwr: 84 },
    { id: "raptor", g: "fighter", cls: "THRUST-VECTORED DOGFIGHTER", name: "RF-22 RAPTOR",
      story: "An Alliance thrust-vectored dogfighter that trades loadout for pure arc control: a lean gatling, two heat seekers, and the best turn rate in the fleet. Out-turn, plant the gun on the tail, save the missiles for the kill.",
      spd: 88, arm: 50, shl: 66, pwr: 66 },
    { id: "basilisk", g: "fighter", cls: "EXPERIMENTAL PLASMA FIGHTER", name: "XF-19B BASILISK",
      story: "The XF-19 prototype, built around an experimental green-flux plasma emitter and the oversized reactor to feed it. Each round leaves a three-second burn. The hull is paper-thin; survivability was traded for the gun. Only a handful exist.",
      spd: 82, arm: 32, shl: 52, pwr: 88 },
    { id: "roc", g: "fighter", cls: "ABSORBER TESTBED", name: "X-27B ROC",
      story: "Designed to be shot. Incoming fire is absorbed and converted to weapon charge, so it grows stronger the longer it is fired on, until the absorbers saturate and the next hit kills it. Its pilots are called Black Jacks. Flying one is a gamble.",
      spd: 76, arm: 40, shl: 8, pwr: 78 },
    { id: "aegis", g: "fighter", cls: "DEFENSIVE AREA CONTROLLER", name: "X-13A AEGIS",
      story: "A Martian research platform with a cockpit in it: twin lasers and two oversized pressor generators that shove projectiles aside and crowd fighters off course. The emitters burn power fast and the hull under them is fragile, so the SSA never deploys one alone.",
      spd: 68, arm: 48, shl: 76, pwr: 46 },
    { id: "wraith", g: "fighter", cls: "STEALTH FIGHTER", name: "ST-1A WRAITH",
      story: "A stealth recon frame whose cloak bends light and sensor returns around the hull. Invisible to missiles and tracking until it fires, takes a hit, or runs the reactor dry. The most fun you can have in a ship, right up to the moment you are found.",
      spd: 76, arm: 40, shl: 60, pwr: 74 },
    { id: "gnat", g: "fighter", cls: "SWARM HARRIER", name: "IN-12A GNAT",
      story: "The fastest interceptor in the Alliance catalogue: almost no shields, minimal guns, and a Blink Drive to break an engagement when cornered. Speed is the armament. Expensive to build, and hard to die in when flown carefully.",
      spd: 96, arm: 24, shl: 6, pwr: 50 },
    { id: "tick", g: "fighter", cls: "ULTRALIGHT SCOUT", name: "TK-1 TICK",
      story: "An ultralight, deliberately disposable skirmisher: little more than a powerplant and a cockpit on vector thrusters. Not good at anything, and very hard to hit. The first hull most cadets fly solo.",
      spd: 92, arm: 26, shl: 8, pwr: 48 },
    { id: "vespid", g: "fighter", cls: "ENERGY INTERCEPTOR", name: "VS-5 VESPID",
      story: "The standard Alliance light interceptor: a laser, a reactor sized to sustain it, and swarm-pack racks for the finish. Flown in numbers on the flanks of Reaper sorties, laser to strip the shields, swarm pack for the kill.",
      spd: 78, arm: 38, shl: 58, pwr: 60 },
    { id: "skimmer", g: "fighter", cls: "LIGHT INTERCEPTOR", name: "SK-4 SKIMMER",
      story: "Mars's nimblest interceptor: a tiny airframe around a high-thrust engine and a single autocannon, and the training ship of the Martian academies. In war it doubles as a cheap strike harasser. It is never the ship that wins a duel, and never the ship that needs to.",
      spd: 84, arm: 44, shl: 56, pwr: 54 },
    { id: "hemlock", g: "fighter", cls: "CHEMICAL AREA-DENIAL FIGHTER", name: "CW-9 HEMLOCK",
      story: "A Reaper airframe re-plumbed for chemical war: its canister gun cracks shells open downrange into hanging clouds of caustic vapor that drift, linger, and bite again as they dissolve. Hemlock pilots do not chase kills. They fence off the sky and let the enemy fly into the fence.",
      spd: 78, arm: 52, shl: 74, pwr: 68 },
    { id: "stormcrow", g: "fighter", cls: "STORM-CANNON SUPERIORITY FIGHTER", name: "TF-11 STORMCROW",
      story: "A Reaper airframe built around the Arc Repeater, an electrostatic autocannon that throws each slug as a crackling bolt, eighteen rounds a second of rolling thunder. On paper it matches the gatling's weight of fire; in the canopy, pilots swear targets break earlier under it. A gun run is called a 'weather report'.",
      spd: 78, arm: 52, shl: 74, pwr: 78 },
    { id: "glaive", g: "fighter", cls: "BEAM-LANCE STRIKE INTERCEPTOR", name: "BL-6 GLAIVE",
      story: "The only sustained beam ever fitted to a fighter: a coherence lance fired from between the prow tines and swept by pointing the whole aircraft. One burst drinks a third of the battery and opens capital armour like a cutting torch. Run in fast, hold the mark for one full second, extend. Glaive pilots who stay to dogfight are remembered fondly.",
      spd: 88, arm: 52, shl: 68, pwr: 84 },
    { id: "kingfisher", g: "fighter", cls: "PRISM-GUN LINE FIGHTER", name: "KF-8 KINGFISHER",
      story: "A Talon airframe around the Prism Driver, a refraction-lattice cannon whose every round leaves the muzzle walking the spectrum: red off the rail, violet by impact. In a furball a Kingfisher burst reads as a fan of slow rainbows, and gun-camera reels from the type sell for more than the airframe costs to fly.",
      spd: 78, arm: 50, shl: 58, pwr: 64 },
    { id: "gemini", g: "fighter", cls: "TWIN-BOOM COIL-GUN FIGHTER", name: "GT-2 GEMINI",
      story: "The only twin-boom hull in the line inventory, built to carry the Helix Coil: one winding per boom, fired as a single braided bolt, cyan and magenta filaments corkscrewing all the way to the target. Crews call a clean pass 'ribbon work', and a paired section lays a double spiral no other type in the war can be mistaken for.",
      spd: 78, arm: 50, shl: 58, pwr: 66 },
    { id: "firefly", g: "fighter", cls: "REPAIR-TENDER FIGHTER", name: "RT-4 FIREFLY",
      story: "A Kovale Yards service airframe sold to any flag with escrow: a Talon's hull and shields on a bomber's unhurried drives, because its war is flown alongside other people's hulls, not through them. The nose yoke carries a fusion-welding projector that patches armour, mounts, and reactors at a third of a dock crew's pace, provided the pilot holds close enough to read the serial plates. Line pilots mock the little torch until a capital limps. Then every squadron net in the engagement is calling for it.",
      spd: 50, arm: 50, shl: 58, pwr: 62 },
    { id: "dynamo", g: "fighter", cls: "ENERGY-TENDER FIGHTER", name: "ET-5 DYNAMO",
      story: "Kovale Yards built it after Firefly crews kept reporting the same obscenity: a patched hull drifting dark beside them, welds holding, guns live, and not one watt to push through either. The Firefly's service pods give way to two capacitor drums off an oversized reactor and a needle lance ringed with insulator collars. Five seconds of feed pours a fighter's reservoir back in and revives the burned-out generators no dock crew touches under fire. Tanker pilots fly calm, talk little, and are owed drinks on every deck in the fleet.",
      spd: 50, arm: 50, shl: 58, pwr: 86 },
    { id: "caliper", g: "fighter", cls: "INCURSION LINE FIGHTER", name: "UX-1 CALIPER",
      story: "The commonest hull of the Outer Dark incursion, named for the grasp arms bracketing its sensor beak like the jaws of a measuring caliper. Gun-camera studies find no cockpit, no boarding seam, no registry mark: only dark-red mantle plating and a green running glow. It flies wing-perfect formation to the last and opens fire without challenge. Survivors call its paired tracer streams 'the tally', because the fleet behind it is counting.",
      spd: 78, arm: 52, shl: 74, pwr: 72 },
    { id: "stylus", g: "fighter", cls: "INCURSION INTERCEPTOR", name: "UX-2 STYLUS",
      story: "A needle at full stretch: the incursion's interceptor, all nib and sleeve and two trailing booms. It does not brawl. It draws lines, repeating the same engagement geometry across separate actions to a precision no human autopilot could hold; the name comes from the pen that scribes a survey chart. What the lines are for is not known. The green fire it writes with kills regardless.",
      spd: 78, arm: 52, shl: 74, pwr: 66 },
    { id: "sledge", g: "fighter", cls: "BRICK COILGUN BRAWLER", name: "SL-1 SLEDGE",
      story: "The Mars yards' answer to a question the line squadrons kept asking: what happens when the freighter lineage behind the Ingot and the Caisson goes to the merge. Cydonia rolled it off a cargo-tug line, a slab fuselage slung between two engine blocks big enough to shame a bomber, a minigun for the doorway, and the coilgun that named it. Charged on the rail, its slug does not so much wound a fighter as relocate it. Doctrine is one straight line, flown twice. The drogue rack exists because a Sledge cannot turn with anything it hunts, so it makes sure nothing it hunts can leave.",
      spd: 72, arm: 70, shl: 58, pwr: 70 },
    { id: "umbra", g: "fighter", cls: "EXPERIMENTAL ANTIMATTER FIGHTER", name: "X-31 UMBRA",
      story: "Chief Artificer Nika Oshiro's second reverse-engineering program, flown from the Phobos Underworks after the Redeemer line proved the method. Every antimatter round aboard is salvage, recovered asleep from the Incursion wreck fields and decanted one at a time; the Underworks learned to keep them contained, never to make them. The airframe is a stripped light frame built around two strapped-on containment pods, because the pods are the payload. The two-shot rack carries the ranging round itself, and its blast does not distinguish friends. Pilots sign a waiver. The name is exact: an umbra is the shadow an instrument casts.",
      spd: 74, arm: 40, shl: 52, pwr: 90 },

    /* ---- BOMBERS ---- */
    { id: "bristleback", g: "bomber", cls: "MINELAYER", name: "ML-3 BRISTLEBACK",
      story: "A Martian minelayer carrying up to fifty friendly-safe proximity mines, laid in patterns across approach lanes. It does not chase; it salts the lane and waits. Vector thrusters let it strafe through its own field without triggering it.",
      spd: 56, arm: 66, shl: 66, pwr: 62 },
    { id: "marksman", g: "bomber", cls: "RAIL SNIPER", name: "LR-13B MARKSMAN",
      story: "A gun platform built around a rail cannon the length of the airframe. At three thousand metres it is the deadliest thing in the sky; at three hundred it is scrap. Sable Vigil counts its kills by target class: one super carrier outranks a hundred fighters.",
      spd: 58, arm: 44, shl: 56, pwr: 92 },
    { id: "longbow", g: "bomber", cls: "STANDOFF MISSILE BOAT", name: "BW-7B LONGBOW",
      story: "An interceptor-bomber with a missile-heavy loadout: Viper racks for reach, PDS for defence, and a Gauss cannon for knife range it should never see. It hangs at the rear of a formation and prosecutes targets on sensors, out of visual.",
      spd: 62, arm: 48, shl: 62, pwr: 78 },
    { id: "pyre", g: "bomber", cls: "AREA-DENIAL BOMBER", name: "PY-8 PYRE",
      story: "An area-denial bomber: grenades to open, blight bombs to blind, rocket salvos to close the lane. It was to be named the Caimen, until a prototype destroyed the Arcos Test Range. News footage described 'an immense blossom of fire, flame and fury', and the Pyre name stuck.",
      spd: 50, arm: 66, shl: 58, pwr: 80 },
    { id: "wyrm", g: "bomber", cls: "ESCORT-KILLER BOMBER", name: "HB-14D WYRM",
      story: "A heavy bomber built as an escort killer: twin pulse cannons, a pulse turret, and a twenty-round torpedo magazine. The Alliance uses Wyrm wings to strip the screens off capital formations. Slow, obvious, and dangerous.",
      spd: 42, arm: 84, shl: 74, pwr: 88 },
    { id: "cataclysm", g: "bomber", cls: "SIEGE CANNON BOMBER", name: "HB-3C CATACLYSM",
      story: "Two 350mm concussion cannons, the largest guns ever fitted to a bomber, bolted to a command pod and an engine pack. It cannot fight fighters; it relies on escorts and on the plain fact that anything it hits becomes scrap. Pilots say flying it is like aiming a building.",
      spd: 46, arm: 76, shl: 60, pwr: 95 },
    { id: "tempest", g: "bomber", cls: "HEAVY ASSAULT BOMBER", name: "HB-86R TEMPEST",
      story: "Mars's answer to the Wyrm: heavily armoured, missile-armed, and slow. Chain guns and rocket pods saturate a flank while heavy torpedoes do the structural work. The hull Mars uses to reduce fixed targets, jumpgates included.",
      spd: 40, arm: 86, shl: 78, pwr: 90 },
    { id: "gorgon", g: "bomber", cls: "ANTI-MISSILE ESCORT", name: "HB-20C GORGON",
      story: "A Martian escort bomber ringed by seven autonomous gun drones. Paired lasers and a deep PDS magazine make its real job missile defence: shooting down the torpedoes coming back at the wing. Without its drones it is slow and weakly armed.",
      spd: 44, arm: 76, shl: 70, pwr: 72 },
    { id: "spearhead", g: "bomber", cls: "RACK-LAUNCHING CARRIER", name: "CVR SPEARHEAD",
      story: "The Renegade-class rack carrier: fighters ride externally for instant launch, the hull jumps out and returns to recover. It honours Capt. Nerys Okoye, who in 2092 improvised four tugs into rack carriers and broke a Reaver ambush at the cost of her ship and her life.",
      spd: 22, arm: 94, shl: 60, pwr: 58 },
    { id: "stratofortress", g: "bomber", cls: "HEAVY CARPET BOMBER", name: "B-52SX STRATOFORTRESS",
      story: "A descendant of Earth-era heavy-bomber doctrine: eight engine pods, a ventral bay of cluster ordnance, and armour enough to shrug off two strafing passes. Turret bubbles track anything that chases the run. Formations break where it passes.",
      spd: 36, arm: 90, shl: 66, pwr: 84 },
    { id: "flamethrower", g: "bomber", cls: "INCENDIARY BOMBER", name: "IB-13 FLAMETHROWER",
      story: "A Pyre airframe rebuilt around a projected-incendiary gun: torpedoes on the run-in, a PDS screen through the approach, then burning gel that detonates in a rolling wall of fire. The gold canopy is glare armour against its own gun.",
      spd: 50, arm: 66, shl: 60, pwr: 82 },
    { id: "plummet", g: "bomber", cls: "INCURSION STRIKE BOMBER", name: "UX-3 PLUMMET",
      story: "The incursion's strike hull: a keel-weighted teardrop that falls through a battle line the way a plumb-bob falls down a wall. Straight, patient, indifferent to what it passes. Twin ventral bays cycle contained-antimatter rounds whose detonations run dark before they run bright, then pull inward at the end. Fleet doctrine is blunt: when a Plummet steadies on a hull, the hull is a datum. Kill it before the line is drawn.",
      spd: 50, arm: 66, shl: 58, pwr: 82 },

    /* ---- CAPITAL SHIPS ---- */
    { id: "frigate", g: "capital", cls: "LIGHT CAPITAL ESCORT", name: "FF FRIGATE",
      story: "The smallest capital hull both navies field: Vigilant-class to the Alliance, Needle to Mars. A fighter killer with a cruiser's point defences, one particle streamer for anti-ship work, and the speed to hold a battlegroup's outer shell.",
      spd: 26, arm: 91, shl: 80, pwr: 74 },
    { id: "destroyer", g: "capital", cls: "LINE DESTROYER", name: "DD DESTROYER",
      story: "The Komodo-class line destroyer: four particle streamers and two torpedo tubes on a hull overgunned for its size and fragile for its job. Destroyers fight in pairs, one bracketing while the other kills.",
      spd: 24, arm: 90, shl: 82, pwr: 82 },
    { id: "cruiser", g: "capital", cls: "HEAVY CRUISER", name: "CA CRUISER",
      story: "The Vengeance-class heavy cruiser, backbone of the Terran battlegroup since the Convulsion; its namesake was the first Terran warship to mount shields. Six streamers, four PD batteries, two heavy launchers. A cruiser engagement is always a planned one.",
      spd: 20, arm: 96, shl: 88, pwr: 90 },
    { id: "dreadnaught", g: "capital", cls: "FLAGSHIP DREADNAUGHT", name: "DN DREADNAUGHT",
      story: "The largest warships either side flies. The Alliance Sovereign-class cracks a cruiser in one salvo; Mars's Caelus-class answer is heavier still and carries shielding the Alliance cannot replicate. The SSAV Ascraeus has fought eleven fleet actions and remains undefeated.",
      spd: 15, arm: 99, shl: 95, pwr: 98 },
    { id: "armoredlocomotive", g: "capital", cls: "ARMORED LOCOMOTIVE", name: "AL ARMORED LOCOMOTIVE",
      story: "The lead segment of a Consortium ore train: an armoured spine over a 350mm slug cannon and six bolt turrets. Too slow to outrun a strike wing, too well armed to swat without commitment. When it dies, the string behind it is someone else's problem.",
      spd: 18, arm: 99, shl: 70, pwr: 80 },
    { id: "orecart", g: "capital", cls: "TOWED ORE CART", name: "OC ORE CART",
      story: "A towed freight car with twin point-defence cannons that keep firing on the chain or off it. Carts shed at half armour by design; the convoy would rather lose one than catch its detonation. A raider just shoots them all and lets the crates drift.",
      spd: 18, arm: 92, shl: 55, pwr: 40 },
    { id: "sableexchange", g: "capital", cls: "CONSORTIUM FLAGSHIP-STATION", name: "SX-1 SABLE EXCHANGE",
      story: "The Flying Consortium's flagship-station: a converted super-carrier whose hangar is now the contract trading floor, parked thirty-six years off Vesta. Eight heavy particle stream cannons, twelve PD batteries, and the bridge-tower lance, wrapped around the bid floor itself. Where it parks, the book opens.",
      spd: 6, arm: 100, shl: 92, pwr: 90 },
    { id: "monsoon", g: "capital", cls: "ARSENAL MISSILE CAPITAL", name: "BM MONSOON",
      story: "Two escort hulls bridged by a launch deck, the weight saved spent on ninety-six missile cells. A Monsoon ripples sixteen rounds off the deck every nine seconds and darkens the sky between its hulls doing it; six ripples later it is a barge with a point-defence screen, praying its escorts stayed close.",
      spd: 19, arm: 97, shl: 84, pwr: 88 },
    { id: "cyclone", g: "capital", cls: "FLAK-SCREEN ESCORT DESTROYER", name: "DE-7 CYCLONE",
      story: "The answer to the strike wing: four flak houses recessed into the flanks and a fire director that cuts every shell's fuze to the target's range on the way out of the barrel. A Cyclone on station turns the sky over its ward into a box of smoke and shrapnel. Keep it next to something worth protecting; alone it is a very loud target.",
      spd: 22, arm: 92, shl: 80, pwr: 84 },
    { id: "sirocco", g: "capital", cls: "ELECTRONIC-WARFARE CRUISER", name: "CJ-3 SIROCCO",
      story: "The wedge on the plot that changes everything while barely firing: a jamming suite that drinks a cruiser's reactor, inside whose veil seeker heads wander off their marks and whole missile ripples unravel. Doctrine writes it into the second rank; every fleet that has fought one puts it first on the target list anyway.",
      spd: 21, arm: 94, shl: 86, pwr: 92 },
    { id: "riptide", g: "capital", cls: "GRAPPLE CRUISER", name: "CG-4 RIPTIDE",
      story: "Laid down at the Charterhouse slips for the Consortium's prize courts: a Sovereign drivetrain under a hull fifteen percent lighter, built around six ember-stream cannon and the twin boom-mounted graviton projectors that gave the class its name. A gripped fighter flies like it is dragging an anchor; a gripped dreadnought barely notices, which the sales brochure calls honesty. Crews call the beams the tide, and what the tide catches, the boarding parties keep.",
      spd: 15, arm: 98, shl: 90, pwr: 86 },
    { id: "ingot", g: "capital", cls: "BROADSIDE LINE CAPITAL", name: "CL-1 INGOT",
      story: "The Mars yards never learned to build a warship that wasn't a freighter first, and the Ingot is the argument they never needed to: a cargo slab with its container frames recast as armor and six heavy cannon worked into the flanks, three a side. The battery only bears abeam. An Ingot fights turned side-on, the way the old wet navies did, and a captain who shows the bow shows almost nothing.",
      spd: 22, arm: 94, shl: 78, pwr: 84 },
    { id: "caisson", g: "capital", cls: "FLEET AMMUNITION SHIP", name: "AE-1 CAISSON",
      story: "A magazine with engines, the Stepper convoy hauler militarized: two container stacks, a truss waist, and a stern hatch that pays out ammunition crates to whichever squadron is running dry alongside. Escorts learn to love the ugly thing. Enemies learn the other lesson: killing one scatters its magazine across a klick of open space, live and lootable, and the fight over the wreck is often worse than the fight that made it.",
      spd: 24, arm: 92, shl: 74, pwr: 62 },
    { id: "gnomon", g: "capital", cls: "INCURSION ANCHOR CAPITAL", name: "UX-5 GNOMON",
      story: "The anchors of the incursion flew this hull: a blade like a sundial's gnomon leading a mantle of dark-red terraces, five boom drives trailing green. The name is exact. A gnomon is the part of the instrument that casts the shadow, and the joint human line off the Uncharted Cluster fought the whole action inside this ship's. Both anchors died at the Outer Dark. The signal traffic recorded the loss as an arithmetic error, and began recalculating.",
      spd: 15, arm: 99, shl: 95, pwr: 96 },

    /* ---- CARRIERS ---- */
    { id: "strikecarrier", g: "carrier", cls: "STRIKE CARRIER", name: "CVS STRIKE CARRIER",
      story: "A long-range, gunned-up carrier built for independent operations. Six particle streamers make it considerably more than a hangar with engines: a single-ship fleet, meant to launch strike wings into contested space and recover them under fire.",
      spd: 22, arm: 96, shl: 84, pwr: 82 },
    { id: "shepherd", g: "carrier", cls: "ESCORT CARRIER", name: "CVE SHEPHERD",
      story: "An escort carrier fielded by both navies, carrying a single squadron. Shepherds cover convoys and reserve fleets where a fleet carrier would be wasted; they are cheap, and numerous enough that losing one does not cripple a campaign.",
      spd: 24, arm: 94, shl: 76, pwr: 46 },
    { id: "outrider", g: "carrier", cls: "LIGHT FLEET CARRIER", name: "CVL OUTRIDER",
      story: "The Viking-class light fleet carrier: more point defence than a Shepherd and no internal hangar. The wing flies off external fittings, which keeps the hull fast and cheap. The standard deck of a mid-sized task force.",
      spd: 22, arm: 95, shl: 78, pwr: 50 },
    { id: "supercarrier", g: "carrier", cls: "FLEET CARRIER", name: "CV SUPER CARRIER",
      story: "The Asimov-class fleet carrier: internal hangars, full repair and replenishment, and point defence enough to see off a stray raid. It is the standard carrier of both navies, and most of this war has been fought from its decks.",
      spd: 18, arm: 98, shl: 88, pwr: 72 },
    { id: "tender", g: "carrier", cls: "AUXILIARY CARRIER", name: "CVA TENDER",
      story: "The Iroquois-class auxiliary carrier: large, slow, carrying many fighters and launching them slowly. Tenders do the logistics, casualty evacuation, and recovery that keep a fleet in the field.",
      spd: 24, arm: 90, shl: 72, pwr: 40 },
    { id: "orrery", g: "carrier", cls: "INCURSION CARRIER", name: "UX-4 ORRERY",
      story: "The incursion's carrier: two ring arcs ride its flanks like gimbal tracks, and the Calipers it fields launch from mouths in the rings. The analysts insist they are held the way a clockwork holds planets: not stored, arranged. It keeps station behind the incursion line and never manoeuvres under fire, as if the possibility of being hit had been measured and dismissed.",
      spd: 22, arm: 96, shl: 84, pwr: 86 },

    /* ---- STATIONS ---- */
    { id: "outpost", g: "station", cls: "DEFENSE STATION", name: "SS OUTPOST",
      story: "The standard small installation, built at populated worlds and jump points: particle stream cannons, point-defence batteries, and defence lasers. Stations do not manoeuvre; they are bought on firepower and endurance, and a defended Outpost has broken more capital strikes than most fleets.",
      spd: 4, arm: 99, shl: 88, pwr: 78 },
    { id: "anchorage", g: "station", cls: "COMMERCIAL HARBOR STATION", name: "HS ANCHORAGE",
      story: "The ring port: a neutral commercial harbor built by the carrier combines and licensed to any flag that pays its mooring fees. It mounts no heavy battery at all. Its projectors weld hulls and feed power, a flak umbrella keeps strike craft off the landing pattern, and eight bays ring the band, more than any hull in service. Doctrine on every side of every war has been identical: you do not reduce an Anchorage, you take it.",
      spd: 4, arm: 99, shl: 90, pwr: 82 },
    { id: "battlestation", g: "station", cls: "FORTRESS PLATFORM", name: "BS BATTLE STATION",
      story: "The standard orbital fortress: double an Outpost's battery on commensurate armour. Battle Stations anchor regional defence grids over populated worlds and gate mouths. Reducing one is a fleet operation, not a strike.",
      spd: 4, arm: 99, shl: 92, pwr: 88 },
    { id: "starbase", g: "station", cls: "COMMAND STARBASE", name: "SB STARBASE",
      story: "The largest installations humanity has built: eight heavy particle stream cannons, sixteen defence lasers, fighter racks, and a regional command centre. The Alliance keeps twelve in Sol; Mars keeps four. Fleets plan around them, not through them.",
      spd: 3, arm: 100, shl: 96, pwr: 100 },
    { id: "turret", g: "station", cls: "DEFENSE TURRET", name: "TT TURRET",
      story: "An unmanned defence emplacement: one automated gun and a shield generator, bolted into approach lanes and blockade corridors. Cheap and replaceable. A lone fighter can kill one, but a squadron on a timer usually cannot afford to.",
      spd: 3, arm: 92, shl: 70, pwr: 58 },
    { id: "gatlinggun", g: "station", cls: "GATLING EMPLACEMENT", name: "GG GATLING GUN",
      story: "A lighter unmanned emplacement built around paired point-defence rotaries, with less armour and half the shield of a turret. Its job is to make a close approach expensive; crews mount them in clusters around slips and in the blind spots under the heavy guns.",
      spd: 3, arm: 86, shl: 62, pwr: 52 },
    { id: "spacebunker", g: "station", cls: "BUNKER EMPLACEMENT", name: "BNK SPACE BUNKER",
      story: "A fixed armoured bunker built around three firing slits, paired kinetic drivers behind each, boresighted down narrow corridors and blind everywhere else. Crossing a lit slit is a mistake; skimming the armour between them is how you live.",
      spd: 3, arm: 92, shl: 66, pwr: 74 },
    { id: "flamethrowerturret", g: "station", cls: "FLAME TURRET", name: "FT FLAME TURRET",
      story: "The Turret family's close-denial variant: an automated incendiary gun fed from a gel magazine rated for weeks of fire. It cannot reach past its own throw, so crews bolt it where geometry forces the approach, at dock throats and gate mouths.",
      spd: 3, arm: 90, shl: 64, pwr: 68 },
    { id: "citadel", g: "station", cls: "FORTRESS COMMAND BASTION", name: "CIT CITADEL",
      story: "A stepped bastion poured in place around a reactor shaft, ringed with particle batteries and crowned by a siege mortar bored straight into the magazine. The shell takes ten seconds to arrive and announces itself the whole way. Every fortress moon is commanded from one, which is why every assault ends at one.",
      spd: 3, arm: 100, shl: 94, pwr: 96 },
    { id: "shieldspire", g: "station", cls: "DEFLECTION FIELD PROJECTOR", name: "SPR SHIELD SPIRE",
      story: "A dome projector on a mast, developed from carrier dock-shield hardware. The blue field it raises stops at the rock and hardens every structure beneath it; ordnance crossing the boundary arrives late and glowing. The pylon itself is thin-skinned, and assault doctrine on both sides reads the same way: spires first.",
      spd: 3, arm: 88, shl: 98, pwr: 82 },
    { id: "siegebattery", g: "station", cls: "STANDOFF SURFACE ARTILLERY", name: "SGB SIEGE BATTERY",
      story: "Three bombard tubes on a fixed revetment, ranged farther than anything a fleet carries and blind inside their own minimum arc. It sits behind pickets, and it is always worth the strafing run it takes to silence one barrel at a time. Capital captains who ignore the range tables anchor once.",
      spd: 3, arm: 96, shl: 76, pwr: 86 },
    { id: "missilesilo", g: "station", cls: "BURIED MISSILE BATTERY", name: "MSL MISSILE SILO",
      story: "Launch cells sunk flush with the surface, fed from a buried magazine and slaved to whatever sensor mast still stands. With a mast on the net a silo reaches across the whole approach; blinded, it can only spit at what stumbles over it. Crews call the mast-dead state 'shooting through a straw' and dig their masts in pairs when the engineers allow.",
      spd: 3, arm: 95, shl: 72, pwr: 74 },
    { id: "sensormast", g: "station", cls: "FIRE-CONTROL SENSOR TOWER", name: "SEN SENSOR MAST",
      story: "A lattice tower of dishes and threat receivers, the eyes of a fortress moon's missile net, with no weapon and no armor worth the name. Attack briefings mark masts in the same color as capital targets, a habit that says everything about how these assaults are actually won.",
      spd: 3, arm: 70, shl: 58, pwr: 66 },
    { id: "surfacehangar", g: "station", cls: "DUG-IN FIGHTER DECK", name: "HGR SURFACE HANGAR",
      story: "A flight deck cut into the rock, barracks and fuel bunkers buried behind it. A hangar keeps a fortress moon's patrol screen alive indefinitely, launching, patching, and rearming faster than a besieger can thin it, right up until the deck itself burns. Assault planners price one somewhere between a carrier and a headache.",
      spd: 3, arm: 98, shl: 84, pwr: 80 },

    /* ---- CIVILIAN ---- */
    { id: "skiff", g: "civilian", cls: "LIGHT RUNABOUT", name: "SK SKIFF",
      story: "A civilian light runabout flown by couriers and system-hoppers, with no armament worth naming. On a battlefield it is usually an escape craft or a courier under way; both navies class it a non-combatant.",
      spd: 50, arm: 12, shl: 20, pwr: 8 },
    { id: "ferry", g: "civilian", cls: "CREW SHUTTLE", name: "SH FERRY",
      story: "A short-range crew shuttle, standard aboard every carrier and station. Unarmed and thin-skinned, it moves personnel between hulls, which periodically includes the admiral. Escort doctrine is strict for a reason.",
      spd: 56, arm: 18, shl: 24, pwr: 6 },
    { id: "hauler", g: "civilian", cls: "PERSONNEL TRANSPORT", name: "TR HAULER",
      story: "A military personnel transport for troop movement, casualty evacuation, and the occasional covert insertion. It travels in escorted groups when possible and under false transponders when not. Crews draw hazard pay either way.",
      spd: 36, arm: 60, shl: 40, pwr: 12 },
    { id: "voyager", g: "civilian", cls: "PASSENGER LINER", name: "PL VOYAGER",
      story: "A civilian passenger liner: unarmed, slow to manoeuvre, carrying hundreds. In war zones Voyagers appear almost only during evacuations and blockade crossings. Treaty law protects them; escorts are what make the law stick.",
      spd: 40, arm: 52, shl: 44, pwr: 4 },
    { id: "drayman", g: "civilian", cls: "CARGO HAULER", name: "MV DRAYMAN",
      story: "An independent cargo hauler, the staple of the commercial jump lanes. Draymen run in company to deter pirates and pay transit fees to both navies: one to cross the line, one to cross back.",
      spd: 32, arm: 34, shl: 34, pwr: 10 },
    { id: "galleon", g: "civilian", cls: "BULK FREIGHTER", name: "MV GALLEON",
      story: "A long-haul bulk freighter, the ship that keeps supply lines alive. Slow, nearly unarmed, and always escorted, because losing one costs a sector a week of food, fuel, or ammunition.",
      spd: 24, arm: 66, shl: 46, pwr: 14 }
  ];

  /* ---------- DOM ---------- */
  var registry = document.querySelector(".registry");
  if (!registry) return;
  var viewport = document.getElementById("registry-viewport");
  var canvas = document.getElementById("registry-canvas");
  var wireImg = document.getElementById("registry-wire");
  var groupsEl = document.getElementById("registry-groups");
  var picker = document.getElementById("registry-picker");
  var regClass = document.getElementById("registry-class");
  var regName = document.getElementById("registry-name");
  var regStory = document.getElementById("registry-story");
  var bars = {
    spd: document.getElementById("stat-spd"),
    arm: document.getElementById("stat-arm"),
    shl: document.getElementById("stat-shl"),
    pwr: document.getElementById("stat-pwr")
  };
  var ctx = canvas.getContext("2d");

  var activeGroup = "fighter";
  var current = 0;            // index into SHIPS
  var cycleTimer = null;
  var userTouched = false;

  /* ---------- turntable player ---------- */
  var sheetCache = {};        // id -> {img, ok}
  var currentSheet = null;
  var frame = 0;
  var lastTick = 0;
  var rafId = null;
  var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  function sizeCanvas() {
    var w = viewport.clientWidth, h = viewport.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    drawFrame();
  }

  function drawFrame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var s = currentSheet;
    if (!s || !s.ok) return;
    var img = s.img;
    var fw = img.naturalWidth / TT.cols;
    var fh = img.naturalHeight / TT.rows;
    var f = frame % TT.frames;
    var sx = (f % TT.cols) * fw;
    var sy = Math.floor(f / TT.cols) * fh;
    // small live-model accent, anchored bottom-right of the schematic
    var scale = Math.min(canvas.width / fw, canvas.height / fh) * 0.165;
    var dw = fw * scale, dh = fh * scale;
    var pad = Math.min(canvas.width, canvas.height) * 0.04;
    var dx = canvas.width - dw - pad;
    var dy = canvas.height - dh - pad;
    ctx.drawImage(img, sx, sy, fw, fh, dx, dy, dw, dh);
  }

  function loadSheet(id, onready) {
    if (sheetCache[id]) { onready(sheetCache[id]); return; }
    var rec = { img: new Image(), ok: false };
    rec.img.decoding = "async";
    rec.img.onload = function () { rec.ok = true; onready(rec); };
    rec.img.onerror = function () { rec.ok = false; onready(rec); };
    rec.img.src = "assets/ships3d/" + id + ".webp?v=4";
    sheetCache[id] = rec;
  }

  function tick(t) {
    if (!lastTick) lastTick = t;
    if (t - lastTick >= TT.ms) {
      frame = (frame + 1) % TT.frames;
      lastTick = t;
      drawFrame();
    }
    rafId = requestAnimationFrame(tick);
  }
  function startSpin() {
    if (prefersReduced || rafId != null) return;
    lastTick = 0;
    rafId = requestAnimationFrame(tick);
  }
  function stopSpin() {
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function showShipSheet(ship) {
    loadSheet(ship.id, function (rec) {
      currentSheet = rec;
      if (prefersReduced) {
        frame = Math.round(TT.frames * 0.125); // a static 3/4 pose
      }
      drawFrame();
    });
  }

  /* ---------- text + stats ---------- */
  function setBars(s) {
    bars.spd.style.width = s.spd + "%";
    bars.arm.style.width = s.arm + "%";
    bars.shl.style.width = s.shl + "%";
    bars.pwr.style.width = s.pwr + "%";
  }
  function scanline() {
    if (prefersReduced) return;
    viewport.classList.remove("is-scanning");
    void viewport.offsetWidth;
    viewport.classList.add("is-scanning");
  }
  viewport.addEventListener("animationend", function () {
    viewport.classList.remove("is-scanning");
  });

  function selectShip(i) {
    current = i;
    var s = SHIPS[i];
    var btns = picker.querySelectorAll("button");
    btns.forEach(function (b) {
      var on = parseInt(b.getAttribute("data-i"), 10) === i;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    canvas.classList.add("is-swapping");
    wireImg.classList.add("is-swapping");
    scanline();
    setTimeout(function () {
      regClass.textContent = s.cls;
      regName.textContent = s.name;
      regStory.textContent = s.story;
      canvas.setAttribute("aria-label", "Rotating view of the " + s.name);
      wireImg.src = "assets/ships/" + s.id + ".webp?v=4";
      wireImg.alt = "Wireframe schematic of the " + s.name;
      setBars(s);
      showShipSheet(s);
      canvas.classList.remove("is-swapping");
      wireImg.classList.remove("is-swapping");
    }, 200);
    // keep the next ship in this group warm so the auto-cycle never pops in cold
    var list = shipsInGroup(s.g);
    var nxt = list[(list.indexOf(i) + 1) % list.length];
    loadSheet(SHIPS[nxt].id, function () {});
  }

  /* ---------- pickers ---------- */
  function shipsInGroup(key) {
    var out = [];
    SHIPS.forEach(function (s, i) { if (s.g === key) out.push(i); });
    return out;
  }

  function buildPicker(key) {
    picker.innerHTML = "";
    shipsInGroup(key).forEach(function (idx) {
      var s = SHIPS[idx];
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("data-i", idx);
      b.textContent = s.name.split(" ").slice(1).join(" ") || s.name;
      b.addEventListener("click", function () {
        userTouched = true; stopCycle();
        selectShip(idx);
      });
      picker.appendChild(b);
    });
  }

  function selectGroup(key, pickFirst) {
    activeGroup = key;
    var gbtns = groupsEl.querySelectorAll("button");
    gbtns.forEach(function (b) {
      var on = b.getAttribute("data-g") === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    buildPicker(key);
    if (pickFirst !== false) selectShip(shipsInGroup(key)[0]);
  }

  GROUPS.forEach(function (grp) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("data-g", grp.key);
    b.textContent = grp.label;
    b.addEventListener("click", function () {
      userTouched = true; stopCycle();
      selectGroup(grp.key);
    });
    groupsEl.appendChild(b);
  });

  /* ---------- auto-cycle within active group ---------- */
  function stopCycle() {
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
  }
  function startCycle() {
    if (prefersReduced || userTouched) return;
    cycleTimer = setInterval(function () {
      var list = shipsInGroup(activeGroup);
      var pos = list.indexOf(current);
      selectShip(list[(pos + 1) % list.length]);
    }, 7000);
  }

  /* ---------- init ---------- */
  selectGroup("fighter");
  setBars(SHIPS[0]);

  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      sizeCanvas();
      startSpin();
      // warm the first few fighters; the cycle prefetches one ahead from there
      shipsInGroup("fighter").slice(0, 3).forEach(function (idx) { loadSheet(SHIPS[idx].id, function () {}); });
      startCycle();
      obs.disconnect();
    }
  }, { threshold: 0.3 }).observe(registry);

  registry.addEventListener("pointerdown", function () {
    userTouched = true; stopCycle();
  });

  if (window.ResizeObserver) {
    new ResizeObserver(sizeCanvas).observe(viewport);
  } else {
    window.addEventListener("resize", sizeCanvas);
  }

  // pause the turntable when the registry is off-screen (battery/perf)
  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) startSpin(); else stopSpin();
  }, { threshold: 0.01 }).observe(registry);
})();
