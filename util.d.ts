export declare class util {
    constructor();
    /**
     * merge multiple object to one
     * eg obj_merge({},{x:1},{y:2},{z:3},...);
     * @param {obj} target
     * @returns {object}
     */
    obj_merge(...objects: [Object]): object;

    /**
     * filter IPV4 Address from mixed IP string.
     * @param {string} mixed string containg ipv4+ipv6 IPs
     * @returns {string} string containing ipv4 Address.
     */
    get_ipv4_addr(mixed: string): string;

    /**
     * Return word in plural form.
     *
     * @param {string} word Word in singular
     * @return {string} Word in plural
     */
    pluralize(word: string): string;

    /**
     * Return word in singular form.
     *
     * @param {string} word Word in plural
     * @return {string} Word in singular
     */
    singularize(word: string): string;

    /**
     * Returns the given camelCasedWord as an underscored_word.
     *
     * @param {string} camelCasedWord Camel-cased word to be "underscorized"
     * @return {string} Underscore-syntaxed version of the $camelCasedWord
     */
    underscore(camelCasedWord: string): string;

    /**
     * Returns the given underscored_word_group as a Human Readable Word Group.
     * (Underscores are replaced by spaces and capitalized following words.)
     *
     * @param {string} lowerCaseAndUnderscoredWord String to be made more readable
     * @return {string} Human-readable string
     */
    humanize(lowerCaseAndUnderscoredWord: string): string;

    /**
     * Returns the given lower_case_and_underscored_word as a CamelCased word.
     *
     * @param {string} lowerCaseAndUnderscoredWord Word to camelize
     * @return {string} Camelized word. LikeThis.
     */
    camelize(lowerCaseAndUnderscoredWord: string): string;

    /**
     * Format string similar to printf();
     * eg format('My name is ? ?.','Vinay', 'Kumar');// My name is Vinay Kumar.
     * @param {string} message, replacemen values...
     * @returns {string} formated String.
     */
    format(): string;

    /**
     * Gets an environment variable from available sources, and provides emulation
     * for unsupported or inconsistent environment variables.
     * Also exposes some additional custom environment information.
     *
     * @param {Request Object} req Node Express request object.
     * @param {string} key Environment variable name.
     * @return {string} Environment variable setting.
     */
    env(req: object, key: string): string;

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
    combine(data: object, keyPath: string, valuePath: string, groupPath: string): object;

    /**
     * Sorts given array object by key sortBy.
     *
     * @param {object|array} array Object to sort
     * @param {string} sortBy Sort by this key
     * @param {string} order Sort order asc/desc (ascending or descending).
     * @param {boolean} numeric_check Type of sorting to perform
     * @return {array|null} Sorted array, or null if not an array.
     */
    sortByKey(array: object, sortBy: string, order: string, numeric_check: boolean): object;

    /**
     * Convet a Array of Object containg id and parent_id as key in object into a Mapped Tree structure.
     * @param {Array} data Array of object containing id and parent_id in each row.
     * @param {Boolean} all (Optional) Flag to add All Node at top of tree.
     * @returns {Object} Object of mapped data with there children.
     */
    mapTree(data: object, all: boolean): object;

    /**
     * Convert plan text to it's md5 string
     * @param {string} str plan text
     * @returns {string} md5 of string.
     */
    md5(str: string): string;

    /**
     * Convert plan text to it's SHA1 string
     * @param {string} str plan text
     * @returns {string} SHA1 of string.
     */
    SHA1(str: string): string;

    /**
     * Returns a random unique string.
     * @returns {string} random unique string.
     */
    uuid(): string;

    /**
     * Generate random string of desired length and type.
     * 
     * @param {Number} PasswdLen lenth of password
     * @param {Enum} Type type of character in password N|AN|AaN Default will include special chars (@_#!:+=)
     * @returns {string} random string of desired length and char type.
     */
    generate_password(PasswdLen: number, Type: string): string;

    /**
     * Get a random number between a given range.
     * @param {Number} min min range
     * @param {Number} max max range
     * @returns {Number} a random no.
     */
    mt_rand(min: number, max: number): number;

    /**
     * Returns a System Timezone.
     *
     * @return Timezone in (+-)HH:MM
     */
    systemTimeZone(): string;

    /**
     * Returns a UNIX Timestamp of Current time.
     *
     * @param boolean microsec with/without Microsecond. Default is false
     * @return int UNIX Timestamp
     */
    timestamp(IST: boolean, microsec: boolean): number;

    /**
     * Returns a UNIX Timestamp of Current time.
     *
     * @return int UNIX Timestamp
     */
    microtime(IST: boolean): number;

    /**
     * Returns a nicely formatted Current date string for given Datetime format.
     *
     * @param string date_format_str The format to use. If null, `Y-m-d H:i:s` is used
     * @return string Formatted date string
     */
    curdate(date_format_str: string): string;

    /**
     * Returns a nicely formatted date string for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @param string|DateTimeZone $timezone Timezone string or DateTimeZone object
     * @param string date_format_str The format to use. If null, `Y-m-d H:i:s` is used
     * @return string|null Formatted date string
     */
    date_format(timestamp: any, date_format_str: string): string;

    /**
     * Returns a date Array for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @return Array|null Mapped date array.
     */
    date_obj_array(timestamp: any): object;

    /**
     * Validate and returns a  DateTime object for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @return DateTime object|null
     */
    check_timestamp(timestamp: any): string | object;

    /**
     * Returns Two digit string of date chunk.
     *
     * @param int|string d, Date Chunk
     * @return string Two digit string
     */
    _dd(d: number | string): string;

    /**
     * Add month on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of month to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding month.
     */
    add_month(timestamp: any, no_of_month: number, format: string): string;

    /**
     * Add Date on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding days.
     */
    add_date(timestamp: any, no_of_day: number, format: string): string;

    /**
     * Add Hours on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding hours.
     */
    add_hours(timestamp: any, no_of_hours: number, format: string): string;

    /**
     * Add Minuts on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding minuts.
     */
    add_minutes(timestamp: any, no_of_minutes: number, format: string): number;

    /**
     * Get diffrence between two days in desired unit.
     * @param {string|number|time object} date1 
     * @param {string|number|time object} date2 
     * @param {Char} diff_in time Unit Y|M|D|H|I|S default is microsecond
     * @returns {Number} diffrence in desired unit
     */
    date_diff(from_date: Date | string, to_date: Date | string, diff_in: string): number;

    /**
     * Get diffrence between two days in readable format.
     * @param {string|number|time object} date1 
     * @param {string|number|time object} date2 
     * @returns {string} readable diffrence of dates.
     */
    date_diff_tostring(from_date: Date | string, to_date: Date | string): string;

}

export = util;