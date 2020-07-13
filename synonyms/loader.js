const path = require('path');
const glob = require('glob');
const parse = require('./parser');
const lint = require('./linter');

function load() {

  // map containing all synonyms
  const synonyms = {};

  // recursively find all files ending with .txt in this directory
  const basepath = __dirname;
  const pattern = path.join(basepath, '**', '*.txt');
  const files = glob.sync(pattern, { realpath: true });

  // load synonyms files and parse each
  files.forEach(filepath => {
    // for directories of synonyms we use the directory name as the key.
    // nested directories will have their path separators normalized to '/'.
    let key = path.dirname(path.relative(basepath, filepath)).split(path.sep).join('/');

    // for synonym files at the root of the synonyms dir we use the basename as the key.
    if (key === '.') {
      key = path.basename(filepath).replace('.txt', '');
    }

    if (!synonyms.hasOwnProperty(key)) { synonyms[key] = []; }
    synonyms[key] = synonyms[key].concat(parse(filepath));
  });

  // emit synonym warnings
  lint(synonyms);

  // return all synonyms
  return synonyms;
}

module.exports.load = load;
