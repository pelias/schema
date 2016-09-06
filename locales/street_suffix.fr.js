
module.exports.terms =  [
  "allée", "annexe", "avenue", "autoroute",
  "baie", "boulevard", "barrage",
  "centre",
  "crique",
  "forêt", "falaise",
  "ile",
  "jardin", "jardins",
  "plage", "pont",
  "rivière", "rond-point", "rivage", "rivages", "rue",
  "terrasse",
  "vallée", "viaduc"
];

module.exports.synonyms = [
  "avenue => av",
  "boulevard => bd"
];

// note: more descriptive tokens must come before less descriptive ones
// eg: 'southwest' must come before 'west' else 'southwest foo' -> 'southw foo'
module.exports.direction_synonyms = [
  "sudouest => sw",
  "sudest => se",
  "nordouest => nw",
  "nordest => ne",
  "nord => n",
  "sud => s",
  "est => e",
  "ouest => w"
];

// note: this is a bit of a hack, it can be placed AFTER an 2+ ngram filter in
// order to allow single grams in the index.
module.exports.direction_synonyms_keep_original = [
  "nord => nord,n",
  "sud => sud,s",
  "est => est,e",
  "ouest => ouest,w"
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
  "bd => boulevard"
];

module.exports.full_token_safe_expansions = [];

// copy the unsafe expansions
module.exports.partial_token_safe_expansions.forEach( function( expansion ){
  module.exports.full_token_safe_expansions.push( expansion );
});

// add the expansions which are only safe on complete tokens (not partial tokens)
module.exports.full_token_safe_expansions.push( "n => nord", "s => sud", "e => est", "w => ouest" );
