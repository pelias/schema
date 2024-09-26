// These characters will be removed from ngrams/shingles
// @see: org/apache/lucene/analysis/cn/smart/stopwords.txt

const all = [
  ".","`","‘","’","‛","-","_","=","?","'","|","\"","(",")","{","}","[","]","<",">","*",
  "#","&","^","$","@","!","~",":",";","+","《","》","—","－","，","。","‹","›","⹂","〝","〞",
  "、", "：","；","！","·","？","„","“","”","‟","）","（","【","】","［","］","●","«","»"
];

const allowed = [
  "-", // allow hypens
  "&"  // allow ampersands
];

// remove alowed chars from blacklist
const blacklist = all.filter(s => !allowed.includes(s));

module.exports = { all, allowed, blacklist };