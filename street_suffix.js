
module.exports.terms =  [
  "alley", "annex", "avenue",
  "bay", "bayou", "beach", "beltway", "bend", "bluff", "bluffs", "boulevard", "bottom", "branch", "bridge", "brook", "bypass",
  "canyon", "cape", "causeway", "center", "channel", "circle", "cliff", "club", "common", "commons", "connector", "corridor",
  "course", "cove", "creek", "crescent", "crest", "crossing", "crossroad", "crossroads", "curve",
  "dale", "dam", "drive",
  "esplanade", "expressway", "extended",
  "falls", "ferry", "field", "fields", "flat", "flats", "ford", "forest", "forge", "fork", "forks", "freeway",
  "garden", "gardens", "gateway", "glen", "glenn", "green", "grove",
  "harbor", "haven", "heights", "highway", "hill", "hills", "hollow",
  "isle",
  "junction",
  "key", "keys", "knoll", "knolls",
  "landing", "lane", "light", "lights", "lock", "locks",
  "manor", "meadow", "meadows", "mews", "mill", "mills", "mountain", "motorway",
  "neck",
  "orchard",
  "parade", "parkway", "passage", "pier", "pike", "pine", "pines", "place", "plaza", "promenade",
  "ranch", "ridge", "ridges", "river", "road", "route", "row",
  "shore", "shores", "skyway", "spring", "springs", "square", "street",
  "terrace", "trail", "trafficway", "tunnel", "turnpike",
  "valley", "vista", "village", "viaduct",
  "way"
];

// invert a synonym array
// eg. "foo => f" becomes "f => foo"
function invert( list ){
  return list.map( function( item ){
    return item.split(' ').reverse().join(' ');
  });
}

module.exports.synonyms = [
  "alley => aly",
  "annex => anx",
  "avenue => ave",
  "bayou => byu",
  "beach => bch",
  "bend => bnd",
  "bluff => blf",
  "bluffs => blfs",
  "bottom => btm",
  "boulevard => blvd",
  "branch => br",
  "bridge => brg",
  "brook => brk",
  "bypass => byp",
  "canyon => cyn",
  "cape => cp",
  "causeway => cswy",
  "center => ctr",
  "channel => chnnl",
  "circle => cir",
  "cliff => clf",
  "close => cl",
  "club => clb",
  "common => cmn",
  "commons => cmns",
  "connector => con",
  "corridor => cor",
  "course => crse",
  "court => ct",
  "cove => cv",
  "creek => crk",
  "crescent => cres",
  "crest => crst",
  "crossing => xing",
  "crossroad => xrd",
  "crossroads => xrds",
  "curve => curv",
  "dale => dl",
  "dam => dm",
  "drive => dr",
  "esplanade => esp",
  "expressway => expy",
  "extended => ext",
  "falls => fls",
  "ferry => fry",
  "field => fld",
  "fields => flds",
  "flat => flt",
  "flats => flts",
  "ford => frd",
  "forest => frst",
  "forge => frg",
  "fork => frk",
  "forks => frks",
  "freeway => fwy",
  "garden => gdn",
  "gardens => gdns",
  "gateway => gtwy",
  "glen => gln",
  "glenn => gln",
  "green => grn",
  "grove => grv",
  "harbor => hbr",
  "haven => hvn",
  "heights => hts",
  "highway => hwy",
  "hill => hl",
  "hills => hls",
  "hollow => holw",
  "isle => is",
  "junction => jct",
  "key => ky",
  "keys => kys",
  "knoll => knl",
  "knolls => knls",
  "landing => lndg",
  "lane => ln",
  "light => lgt",
  "lights => lgts",
  "lock => lck",
  "locks => lcks",
  "manor => mnr",
  "meadow => mdw",
  "meadows => mdws",
  "mill => ml",
  "mills => mls",
  "mountain => mnt",
  "motorway => mtwy",
  "neck => nck",
  "orchard => orch",
  "parkway => pkwy",
  "pasage => psge",
  "pier => pr",
  "pine => pne",
  "pines => pnes",
  "place => pl",
  "plaza => plz",
  "ranch => rnch",
  "ridge => rdg",
  "ridges => rdgs",
  "river => riv",
  "road => rd",
  "route => rte",
  "shore => shr",
  "shores => shrs",
  "skyway => skwy",
  "spring => spg",
  "springs => spgs",
  "square => sq",
  "street => st",
  "suite => ste",
  "terrace => terr",
  "trail => tr",
  "trafficway => trfy",
  "tunnel => tunl",
  "turnpike => tpke",
  "valley => vly",
  "vista => vis",
  "village => vlg",
  "way => wy"
];

// note: more descriptive tokens must come before less descriptive ones
// eg: 'southwest' must come before 'west' else 'southwest foo' -> 'southw foo'
module.exports.direction_synonyms = [
  "southwest => sw",
  "southeast => se",
  "northwest => nw",
  "northeast => ne",
  "north => n",
  "south => s",
  "east => e",
  "west => w"
];

// note: this is a bit of a hack, it can be placed AFTER an 2+ ngram filter in
// order to allow single grams in the index.
module.exports.direction_synonyms_keep_original = [
  "north => north,n",
  "south => south,s",
  "east => east,e",
  "west => west,w"
];

/**
  a list of 'safe' street suffix expansions.

 this list should NOT include any values where the abbreviation is a prefix of
 the expanded form.

 EG. 'st' is a prefix of 'street' so it is not included here.
 EG. 'rd' is NOT a prefix of 'road' so it IS included here.

 the term 'safe' refers to whether the token may be expanded without causing
 other issues; in general ask yourself "if i expand `byu => bayou` will this cause
 issues with other tokens which *begin with byu?"

 EG. 'pr' is disabled as it would cause jitter when autocompleting any place
 name beginning with 'pr' such as 'princeton', on the second keypress the
 results would likely all contain names which are/begin with "pier".

 EG. 'ct' is disabled as expanding it to 'court' would possibly conflict with
 the state abbreviation for 'Connecticut'.

 please use judgement when adding new expansions as it may cause the 'jitter'
 behaviour as outlined in https://github.com/pelias/schema/pull/83
**/
module.exports.partial_token_safe_expansions = [
  "aly => alley",
  "anx => annex",
  "byu => bayou",
  "bch => beach",
  "bnd => bend",
  "blf => bluff",
  "blfs => bluffs",
  "btm => bottom",
  "blvd => boulevard",
  "brg => bridge",
  "brk => brook",
  "cyn => canyon",
  "cp => cape",
  "cswy => causeway",
  "ctr => center",
  "chnnl => channel",
  "clf => cliff",
  "clb => club",
  "cmn => common",
  "cmns => commons",
  "crse => course",
  // "ct => court",
  "cv => cove",
  "crk => creek",
  "crst => crest",
  "xing => crossing",
  "xrd => crossroad",
  "xrds => crossroads",
  "dl => dale",
  "dm => dam",
  "expy => expressway",
  "fls => falls",
  "fry => ferry",
  "fld => field",
  "flds => fields",
  "flt => flat",
  "flts => flats",
  "frd => ford",
  "frst => forest",
  "frg => forge",
  "frk => fork",
  "frks => forks",
  "fwy => freeway",
  "gdn => garden",
  "gdns => gardens",
  "gtwy => gateway",
  "gln => glenn",
  "grn => green",
  "grv => grove",
  "hbr => harbor",
  "hvn => haven",
  "hts => heights",
  "hwy => highway",
  "hl => hill",
  "hls => hills",
  "holw => hollow",
  "jct => junction",
  "ky => key",
  "kys => keys",
  "knl => knoll",
  "knls => knolls",
  "lndg => landing",
  "ln => lane",
  "lgt => light",
  "lgts => lights",
  "lck => lock",
  "lcks => locks",
  "mnr => manor",
  "mdw => meadow",
  "mdws => meadows",
  "ml => mill",
  "mls => mills",
  "mnt => mountain",
  "mtwy => motorway",
  "nck => neck",
  "pkwy => parkway",
  "psge => pasage",
  // "pr => pier",
  "pne => pine",
  "pnes => pines",
  "plz => plaza",
  "rnch => ranch",
  "rdg => ridge",
  "rdgs => ridges",
  "rd => road",
  "rte => route",
  "shr => shore",
  "shrs => shores",
  "skwy => skyway",
  "spg => spring",
  "spgs => springs",
  "ste => suite",
  "trfy => trafficway",
  "tunl => tunnel",
  "tpke => turnpike",
  "vly => valley",
  "vlg => village",
  "wy => way"
];

// mapping of single-letter appreviations for compass directionals
module.exports.direction_synonyms_single_letter_expansions = [
  "n => north",
  "s => south",
  "e => east",
  "w => west"
];

module.exports.full_token_safe_expansions = [];

// copy the synonyms list (inverting the substitution order)
// add full token directional expansions
module.exports.full_token_safe_expansions = invert( module.exports.synonyms )
    .concat( invert( module.exports.direction_synonyms ) );
