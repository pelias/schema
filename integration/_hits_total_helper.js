const _ = require('lodash');

/**
 * The way hits are defined in ES7 changed
 * This helper can be used to avoid interoperability issues:
 *
 * expected: 1
 * actual:
 * { value: 1, relation: 'eq' }
 */

 function helper(hits){
   let totalHits = 0;
   if (_.has(hits, 'total')) {
     totalHits = _.isPlainObject(hits.total) ? hits.total.value : hits.total;
   }
   return totalHits;
 }

 module.exports = helper;
