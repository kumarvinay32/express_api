'use strict';

const _plural = {
    'rules': {
        '(s)tatus$': '$1tatuses', '(quiz)$': '$1zes', '^(ox)$': '$1$2en', '([m|l])ouse$': '$1ice', '(matr|vert|ind)(ix|ex)$': '$1ices', '(x|ch|ss|sh)$': '$1es', '([^aeiouy]|qu)y$': '$1ies', '(hive)$': '$1s', '(?:([^f])fe|([lre])f)$': '$1$2ves', 'sis$': 'ses', '([ti])um$': '$1a', '(p)erson$': '$1eople', '(?<!u)(m)an$': '$1en', '(c)hild$': '$1hildren', '(buffal|tomat)o$': '$1$2oes', '(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin)us$': '$1i', 'us$': 'uses', '(alias)$': '$1es', '(ax|cris|test)is$': '$1es', 's$': 's', '^$': '', '$': 's',
    },
    'uninflected': [
        '.*[nrlm]ese', '.*data', '.*deer', '.*fish', '.*measles', '.*ois', '.*pox', '.*sheep', 'people', 'feedback', 'stadia'
    ],
    'irregular': {
        'atlas': 'atlases', 'beef': 'beefs', 'brief': 'briefs', 'brother': 'brothers', 'cafe': 'cafes', 'child': 'children', 'cookie': 'cookies', 'corpus': 'corpuses', 'cow': 'cows', 'criterion': 'criteria', 'ganglion': 'ganglions', 'genie': 'genies', 'genus': 'genera', 'graffito': 'graffiti', 'hoof': 'hoofs', 'loaf': 'loaves', 'man': 'men', 'money': 'monies', 'mongoose': 'mongooses', 'move': 'moves', 'mythos': 'mythoi', 'niche': 'niches', 'numen': 'numina', 'occiput': 'occiputs', 'octopus': 'octopuses', 'opus': 'opuses', 'ox': 'oxen', 'penis': 'penises', 'person': 'people', 'sex': 'sexes', 'soliloquy': 'soliloquies', 'testis': 'testes', 'trilby': 'trilbys', 'turf': 'turfs', 'potato': 'potatoes', 'hero': 'heroes', 'tooth': 'teeth', 'goose': 'geese', 'foot': 'feet', 'sieve': 'sieves'
    }
};

const _singular = {
    'rules': {
        '(s)tatuses$': '$1$2tatus', '^(.*)(menu)s$': '$1$2', '(quiz)zes$': '$1', '(matr)ices$': '$1ix', '(vert|ind)ices$': '$1ex', '^(ox)en': '$1', '(alias)(es)*$': '$1', '(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin|viri?)i$': '$1us', '([ftw]ax)es': '$1', '(cris|ax|test)es$': '$1is', '(shoe)s$': '$1', '(o)es$': '$1', 'ouses$': 'ouse', '([^a])uses$': '$1us', '([m|l])ice$': '$1ouse', '(x|ch|ss|sh)es$': '$1', '(m)ovies$': '$1$2ovie', '(s)eries$': '$1$2eries', '([^aeiouy]|qu)ies$': '$1y', '(tive)s$': '$1', '(hive)s$': '$1', '(drive)s$': '$1', '([le])ves$': '$1f', '([^rfoa])ves$': '$1fe', '(^analy)ses$': '$1sis', '(analy|diagno|^ba|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': '$1$2sis', '([ti])a$': '$1um', '(p)eople$': '$1$2erson', '(m)en$': '$1an', '(c)hildren$': '$1$2hild', '(n)ews$': '$1$2ews', 'eaus$': 'eau', '^(.*us)$': '$1', 's$': ''
    },
    'uninflected': [
        '.*data', '.*[nrlm]ese', '.*deer', '.*fish', '.*measles', '.*ois', '.*pox', '.*sheep', '.*ss', 'feedback'
    ],
    'irregular': { 'atlases': 'atlas', 'beefs': 'beef', 'briefs': 'brief', 'brothers': 'brother', 'cafes': 'cafe', 'children': 'child', 'cookies': 'cookie', 'corpuses': 'corpus', 'cows': 'cow', 'criteria': 'criterion', 'ganglions': 'ganglion', 'genies': 'genie', 'genera': 'genus', 'graffiti': 'graffito', 'hoofs': 'hoof', 'loaves': 'loaf', 'men': 'man', 'monies': 'money', 'mongooses': 'mongoose', 'moves': 'move', 'mythoi': 'mythos', 'niches': 'niche', 'numina': 'numen', 'occiputs': 'occiput', 'octopuses': 'octopus', 'opuses': 'opus', 'oxen': 'ox', 'penises': 'penis', 'people': 'person', 'sexes': 'sex', 'soliloquies': 'soliloquy', 'testes': 'testis', 'trilbys': 'trilby', 'turfs': 'turf', 'potatoes': 'potato', 'heroes': 'hero', 'teeth': 'tooth', 'geese': 'goose', 'feet': 'foot', 'sieves': 'sieve', 'foes': 'foe' }

};

const _uninflected = ['Amoyese', 'bison', 'Borghese', 'bream', 'breeches', 'britches', 'buffalo', 'cantus', 'carp', 'chassis', 'clippers', 'cod', 'coitus', 'Congoese', 'contretemps', 'corps', 'debris', 'diabetes', 'djinn', 'eland', 'elk', 'equipment', 'Faroese', 'flounder', 'Foochowese', 'gallows', 'Genevese', 'Genoese', 'Gilbertese', 'graffiti', 'headquarters', 'herpes', 'hijinks', 'Hottentotese', 'information', 'innings', 'jackanapes', 'Kiplingese', 'Kongoese', 'Lucchese', 'mackerel', 'Maltese', '.*?media', 'mews', 'moose', 'mumps', 'Nankingese', 'news', 'nexus', 'Niasese', 'Pekingese', 'Piedmontese', 'pincers', 'Pistoiese', 'pliers', 'Portuguese', 'proceedings', 'rabies', 'research', 'rice', 'rhinoceros', 'salmon', 'Sarawakese', 'scissors', 'sea[- ]bass', 'series', 'Shavese', 'shears', 'siemens', 'species', 'swine', 'testes', 'trousers', 'trout', 'tuna', 'Vermontese', 'Wenchowese', 'whiting', 'wildebeest', 'Yengeese'];

const dt = require('./date');
const { createHash, randomUUID } = require('crypto');

class util extends dt {
    /**
     * merge multiple object to one
     * eg obj_merge({},{x:1},{y:2},{z:3},...);
     * @param {obj} target
     * @returns {object}
     */
    static obj_merge() {
        let target = {};
        Object.assign(target, arguments[0] || {});
        let sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for (const prop in source) {
                target[prop] = source[prop];
            }
        });
        return target;
    }

    /**
     * filter IPV4 Address from mixed IP string.
     * @param {string} mixed string containg ipv4+ipv6 IPs
     * @returns {string} string containing ipv4 Address.
     */
    static get_ipv4_addr(mixed) {
        let ipv4 = '';
        for (const v of (mixed || '').replace(',', ':').split(':')) {
            if (ipv4.length > 0) { continue; }
            let ip = (v || '').trim().split('.');
            if (ip.length === 4) {
                let f = true;
                ip.forEach(function (i) {
                    if (i < 0 || i > 255) { f = false; }
                });
                if (f) { ipv4 = v.trim(); }
            }
        }
        return ipv4;
    }

    /**
     * Return word in plural form.
     *
     * @param {string} word Word in singular
     * @return {string} Word in plural
     */
    static pluralize(word) {
        let cacheUninflected = '(?:' + Object.values(util.obj_merge(_plural.uninflected, _uninflected)).join('|') + ')';
        let cacheIrregular = '(?:' + Object.keys(_plural.irregular).join('|') + ')';
        let regs = (word || '').match(new RegExp("(.*?(?:\\b|_))(" + cacheIrregular + ")$", "i"));
        if (regs) {
            return regs[1] + regs[2].substring(0, 1) + _plural.irregular[regs[2].toLowerCase()].substring(1);
        }
        if ((word || '').match(new RegExp("/^(" + cacheUninflected + ")$", "i"))) {
            return word;
        }
        for (const rule in _plural.rules) {
            if (word.match(new RegExp(rule, "i"))) {
                return util.preg_replace(rule, _plural.rules[rule], word);
            }
        }
    }

    /**
     * Return word in singular form.
     *
     * @param {string} word Word in plural
     * @return {string} Word in singular
     */
    static singularize(word) {
        let cacheUninflected = '(?:' + Object.values(util.obj_merge(_singular.uninflected, _uninflected)).join('|') + ')';
        let cacheIrregular = '(?:' + Object.keys(_singular.irregular).join('|') + ')';
        let regs = (word || '').match(new RegExp("(.*?(?:\\b|_))(" + cacheIrregular + ")$", "i"));
        if (regs) {
            return regs[1] + regs[2].substring(0, 1) + _singular.irregular[regs[2].toLowerCase()].substring(1);
        }
        if ((word || '').match(new RegExp("/^(" + cacheUninflected + ")$", "i"))) {
            return word;
        }
        for (const rule in _singular.rules) {
            if (word.match(new RegExp(rule, "i"))) {
                return util.preg_replace(rule, _singular.rules[rule], word);
            }
        }
        return word;
    }

    /**
     * Returns the given camelCasedWord as an underscored_word.
     *
     * @param {string} camelCasedWord Camel-cased word to be "underscorized"
     * @return {string} Underscore-syntaxed version of the $camelCasedWord
     */
    static underscore(camelCasedWord) {
        let regs = camelCasedWord.match(/([A-Z])/g);
        let r_len = regs.length;
        for (let i = r_len - 1; i >= 0; i--) {
            if (regs[i] != undefined && regs[i]) {
                camelCasedWord = camelCasedWord.replace(regs[i], ' ' + regs[i]);
            }
        }
        return camelCasedWord.trim().replace(/ /g, '_').toLowerCase();
    }

    /**
     * Returns the given underscored_word_group as a Human Readable Word Group.
     * (Underscores are replaced by spaces and capitalized following words.)
     *
     * @param {string} lowerCaseAndUnderscoredWord String to be made more readable
     * @return {string} Human-readable string
     */
    static humanize(lowerCaseAndUnderscoredWord) {
        return (lowerCaseAndUnderscoredWord || '')
            .replace(/_/g, ' ')
            .split(' ')
            .map(w => { return w.charAt(0).toUpperCase() + w.slice(1); })
            .join(' ');
    }

    /**
     * Returns the given lower_case_and_underscored_word as a CamelCased word.
     *
     * @param {string} lowerCaseAndUnderscoredWord Word to camelize
     * @return {string} Camelized word. LikeThis.
     */
    static camelize(lowerCaseAndUnderscoredWord) {
        return util.humanize(lowerCaseAndUnderscoredWord).replace(/ /g, '');
    }

    /**
     * Format string similar to printf();
     * eg format('My name is ? ?.','Vinay', 'Kumar');// My name is Vinay Kumar.
     * @param {string} message, replacemen values...
     * @returns {string} formated String.
     */
    static format() {
        let message = arguments[0] || ``;
        let values = [].slice.call(arguments, 1);
        if (values == null || !Array.isArray(values) || values.length <= 0) {
            return message;
        }
        let chunkIndex = 0;
        let placeholdersRegex = /\?/g;
        let result = '';
        let valuesIndex = 0;
        let match;
        while (valuesIndex < values.length && (match = placeholdersRegex.exec(message))) {
            result += message.slice(chunkIndex, match.index) + (values[valuesIndex] || '');
            chunkIndex = placeholdersRegex.lastIndex;
            valuesIndex++;
        }
        if (chunkIndex === 0) {
            return message;
        }
        if (chunkIndex < message.length) {
            return result + message.slice(chunkIndex);
        }
        return result;
    };

    static preg_replace(rule, replacement, word) {
        let regs = word.match(new RegExp(rule, "i"));
        let r_len = regs.length;
        let replaced_word = word.substr(0, regs.index) + replacement;
        for (let i = r_len - 1; i > 0; i--) {
            replaced_word = replaced_word.replace('$' + i, regs[i] || '');
        }
        return replaced_word;
    }

    /**
     * Creates an associative array using `keyPath` as the path to build its keys, and optionally
     * `valuePath` as path to get the values. If `valuePath` is not specified, all values will be initialized
     * You can optionally group the values by what is obtained when following the path specified in `groupPath`.
     *
     * @param {array|Object} data Data array from where to extract keys and values
     * @param {string} keyPath keyPath A dot-separated string or array for formatting rules.
     * @param {string} valuePath valuePath A dot-separated string or array for formatting rules.
     * @param {string} groupPath groupPath A dot-separated string.
     * @return {Object} Combined Object
     */
    static combine(data, keyPath, valuePath, groupPath) {
        let out = {};
        if (typeof data != 'object' || !keyPath || !valuePath || typeof keyPath != 'string' || typeof valuePath != 'string') {
            return out;
        }
        let [pi1, pv1, pvv1] = keyPath.split('.');
        let [pi2, pv2, pvv2] = valuePath.split('.');
        if (['{n}', '{s}', '{*}'].indexOf(pi1) === -1) {
            return out;
        }
        if (!groupPath) {
            groupPath = pi1;
        }
        let [pi3, pv3, pvv3] = groupPath.split('.');
        for (const k in data) {
            let r = data[k];
            if (pi1 !== pi2) { continue; }
            if (pi2 !== pi3) { continue; }
            if (pi1 == '{n}' && isNaN(k)) { continue; }
            if (pi1 == '{s}' && !isNaN(k)) { continue; }
            if (pv1 && Object.hasOwnProperty.call(r, pv1)) {
                let v = r;
                if (pv2 && Object.hasOwnProperty.call(r, pv2)) {
                    v = pvv2 ? (r[pv2][pvv2] || null) : r[pv2];
                } else if (pv2 && !Object.hasOwnProperty.call(r, pv2)) {
                    v = null
                }
                if (pv3 && Object.hasOwnProperty.call(r, pv3)) {
                    if (!Object.hasOwnProperty.call(out, r[pv3])) {
                        out[pvv3 ? (r[pv3][pvv3] || null) : r[pv3]] = {};
                    }
                    out[pvv3 ? (r[pv3][pvv3] || null) : r[pv3]][pvv1 ? (r[pv1][pvv1] || null) : r[pv1]] = v;
                } else {
                    out[pvv1 ? (r[pv1][pvv1] || null) : r[pv1]] = v;
                }
            }
        }
        return out;
    }

    /**
     * Sorts given array object by key sortBy.
     *
     * @param {object|array} array Object to sort
     * @param {string} sortBy Sort by this key
     * @param {string} order Sort order asc/desc (ascending or descending).
     * @param {boolean} numeric_check Type of sorting to perform
     * @return {array|null} Sorted array, or null if not an array.
     */
    static sortByKey(array, sortBy, order = 'asc', numeric_check = false) {
        if (typeof array != 'object') {
            return null;
        }
        let iv = {};
        let sa = [];
        for (const key in array) {
            iv[key] = Object.hasOwnProperty.call(array[key], sortBy) ? array[key][sortBy] : '';
            if (numeric_check === true && typeof iv[key] == 'number') {
                iv[key] = Number(iv[key]) || 0;
            } else {
                numeric_check = false;
            }
            sa.push(iv[key]);
        }
        if (numeric_check === true) {
            sa.sort((a, b) => a - b);
        } else {
            sa.sort();
        }
        if (order !== 'asc') {
            sa.reverse();
        }
        let ordered_array = [];
        for (const k in iv) {
            let index = sa.indexOf(iv[k]);
            delete sa[index];
            ordered_array[index] = array[k];
        }
        return ordered_array;
    }

    /**
     * Convet a Array of Object containg id and parent_id as key in object into a Mapped Tree structure.
     * @param {Array} data Array of object containing id and parent_id in each row.
     * @param {Boolean} all (Optional) Flag to add All Node at top of tree.
     * @returns {Object} Object of mapped data with there children.
     */
    static mapTree(data, all = false) {
        let map = {}, node, roots = [], i;
        for (i = 0; i < data.length; i += 1) {
            map[data[i].id] = i;
            data[i].children = [];
        }
        for (i = 0; i < data.length; i += 1) {
            node = data[i];
            if (node.parent_id != "0") {
                if (data[map[node.parent_id]]) {
                    data[map[node.parent_id]].children.push(node);
                }
            } else {
                roots.push(node);
            }
        }
        if (all) {
            roots = [{
                id: 0,
                parent_id: -1,
                name: 'All',
                children: roots
            }];
        }
        return roots;
    }

    /**
     * Convert plan text to it's md5 string
     * @param {string} str plan text
     * @returns {string} md5 of string.
     */
    static md5(str) {
        const hash = createHash('MD5');
        hash.update((str || '').toString());
        hash.end();
        return hash.read().toString('hex');
    }

    /**
     * Convert plan text to it's SHA1 string
     * @param {string} str plan text
     * @returns {string} SHA1 of string.
     */
    static SHA1(str) {
        const hash = createHash('SHA1');
        hash.update((str || '').toString());
        hash.end();
        return hash.read().toString('hex');
    }

    /**
     * Returns a random unique string.
     * @returns {string} random unique string.
     */
    static uuid() {
        return randomUUID();
    }

    /**
     * Generate random string of desired length and type.
     * 
     * @param {Number} PasswdLen lenth of password
     * @param {Enum} Type type of character in password N|AN|AaN Default will include special chars (@_#!:+=)
     * @returns {string} random string of desired length and char type.
     */
    static generate_password(PasswdLen, Type = '') {
        const CharStr = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmanopqrstuvwxyz@_#!:+=';
        let CharLen = CharStr.length;
        if (Type.trim() === 'N') {
            CharLen = 10;
        } else if (Type.trim() === 'AN') {
            CharLen = 36;
        } else if (Type.trim() === 'AaN') {
            CharLen = 62;
        }
        let PasswdStr = "";
        while (PasswdStr.length < PasswdLen) {
            let rand = util.mt_rand(0, CharLen - 1);
            let RandChar = CharStr.substring(rand, rand + 1);
            if (Type.trim() !== 'N' && PasswdStr.indexOf(RandChar) !== -1) {
                continue;
            }
            PasswdStr += RandChar;
        }
        return PasswdStr;
    }

    /**
     * Get a random number between a given range.
     * @param {Number} min min range
     * @param {Number} max max range
     * @returns {Number} a random no.
     */
    static mt_rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
module.exports = util;