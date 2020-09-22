const _ = require('lodash');

const americanToBritishMapping = require('american-british-english-translator/data/american_spellings.json');

function load() {
    return _.map(americanToBritishMapping, (american, british) => {
        return `${american},${british}`;
    })
}

module.exports.load = load;