declare function e(): Function;

declare namespace utilFun {
    /**
     * merge multiple object to one
     * eg obj_merge({},{x:1},{y:2},{z:3},...);
     * @param {obj} target
     * @returns {object}
     */
    export function obj_merge(): object;

    /**
     * filter IPV4 Address from mixed IP string.
     * @param {string} mixed string containg ipv4+ipv6 IPs
     * @returns {string} string containing ipv4 Address.
     */
    export function get_ipv4_addr(mixed: string): string;

    /**
     * Return word in plural form.
     *
     * @param {string} word Word in singular
     * @return {string} Word in plural
     */
    export function pluralize(word: string): string;

    /**
     * Return word in singular form.
     *
     * @param {string} word Word in plural
     * @return {string} Word in singular
     */
    export function singularize(word: string): string;

    /**
     * Returns the given camelCasedWord as an underscored_word.
     *
     * @param {string} camelCasedWord Camel-cased word to be "underscorized"
     * @return {string} Underscore-syntaxed version of the $camelCasedWord
     */
    export function underscore(camelCasedWord: string): string;

    /**
     * Returns the given underscored_word_group as a Human Readable Word Group.
     * (Underscores are replaced by spaces and capitalized following words.)
     *
     * @param {string} lowerCaseAndUnderscoredWord String to be made more readable
     * @return {string} Human-readable string
     */
    export function humanize(lowerCaseAndUnderscoredWord: string): string;

    /**
     * Returns the given lower_case_and_underscored_word as a CamelCased word.
     *
     * @param {string} lowerCaseAndUnderscoredWord Word to camelize
     * @return {string} Camelized word. LikeThis.
     */
    export function camelize(lowerCaseAndUnderscoredWord: string): string;

    /**
     * Format string similar to printf();
     * eg format('My name is ? ?.','Vinay', 'Kumar');// My name is Vinay Kumar.
     * @param {string} message, replacemen values...
     * @returns {string} formated String.
     */
    export function format(): string;

    /**
     * Gets an environment variable from available sources, and provides emulation
     * for unsupported or inconsistent environment variables.
     * Also exposes some additional custom environment information.
     *
     * @param {Request Object} req Node Express request object.
     * @param {string} key Environment variable name.
     * @return {string} Environment variable setting.
     */
    export function env(req: object, key: string): string;

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
    export function combine(data: object, keyPath: string, valuePath: string, groupPath: string): object;

    /**
     * Sorts given array object by key sortBy.
     *
     * @param {object|array} array Object to sort
     * @param {string} sortBy Sort by this key
     * @param {string} order Sort order asc/desc (ascending or descending).
     * @param {boolean} numeric_check Type of sorting to perform
     * @return {array|null} Sorted array, or null if not an array.
     */
    export function sortByKey(array: object, sortBy: string, order: string, numeric_check: boolean): object;

    /**
     * Convet a Array of Object containg id and parent_id as key in object into a Mapped Tree structure.
     * @param {Array} data Array of object containing id and parent_id in each row.
     * @param {Boolean} all (Optional) Flag to add All Node at top of tree.
     * @returns {Object} Object of mapped data with there children.
     */
    export function mapTree(data: object, all: boolean): object;

    /**
     * Convert plan text to it's md5 string
     * @param {string} str plan text
     * @returns {string} md5 of string.
     */
    export function md5(str: string): string;

    /**
     * Convert plan text to it's SHA1 string
     * @param {string} str plan text
     * @returns {string} SHA1 of string.
     */
    export function SHA1(str: string): string;

    /**
     * Returns a random unique string.
     * @returns {string} random unique string.
     */
    export function uuid(): string;

    /**
     * Generate random string of desired length and type.
     * 
     * @param {Number} PasswdLen lenth of password
     * @param {Enum} Type type of character in password N|AN|AaN Default will include special chars (@_#!:+=)
     * @returns {string} random string of desired length and char type.
     */
    export function generate_password(PasswdLen: number, Type: string): string;

    /**
     * Get a random number between a given range.
     * @param {Number} min min range
     * @param {Number} max max range
     * @returns {Number} a random no.
     */
    export function mt_rand(min: number, max: number): number;

    /**
     * Returns a System Timezone.
     *
     * @return Timezone in (+-)HH:MM
     */
    export function systemTimeZone(): string;

    /**
     * Returns a UNIX Timestamp of Current time.
     *
     * @param boolean microsec with/without Microsecond. Default is false
     * @return int UNIX Timestamp
     */
    export function timestamp(IST: boolean, microsec: boolean): number;

    /**
     * Returns a UNIX Timestamp of Current time.
     *
     * @return int UNIX Timestamp
     */
    export function microtime(IST: boolean): number;

    /**
     * Returns a nicely formatted Current date string for given Datetime format.
     *
     * @param string date_format_str The format to use. If null, `Y-m-d H:i:s` is used
     * @return string Formatted date string
     */
    export function curdate(date_format_str: string): string;

    /**
     * Returns a nicely formatted date string for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @param string|DateTimeZone $timezone Timezone string or DateTimeZone object
     * @param string date_format_str The format to use. If null, `Y-m-d H:i:s` is used
     * @return string|null Formatted date string
     */
    export function date_format(timestamp: any, date_format_str: string): string;

    /**
     * Returns a date Array for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @return Array|null Mapped date array.
     */
    export function date_obj_array(timestamp: any): object;

    /**
     * Validate and returns a  DateTime object for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @return DateTime object|null
     */
    export function check_timestamp(timestamp: any): string | object;

    /**
     * Returns Two digit string of date chunk.
     *
     * @param int|string d, Date Chunk
     * @return string Two digit string
     */
    export function _dd(d: number | string): string;

    /**
     * Add month on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of month to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding month.
     */
    export function add_month(timestamp: any, no_of_month: number, format: string): string;

    /**
     * Add Date on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding days.
     */
    export function add_date(timestamp: any, no_of_day: number, format: string): string;

    /**
     * Add Hours on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding hours.
     */
    export function add_hours(timestamp: any, no_of_hours: number, format: string): string;

    /**
     * Add Minuts on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding minuts.
     */
    export function add_minutes(timestamp: any, no_of_minutes: number, format: string): number;

    /**
     * Get diffrence between two days in desired unit.
     * @param {string|number|time object} date1 
     * @param {string|number|time object} date2 
     * @param {Char} diff_in time Unit Y|M|D|H|I|S default is microsecond
     * @returns {Number} diffrence in desired unit
     */
    export function date_diff(from_date: Date | string, to_date: Date | string, diff_in: string): number;

    /**
     * Get diffrence between two days in readable format.
     * @param {string|number|time object} date1 
     * @param {string|number|time object} date2 
     * @returns {string} readable diffrence of dates.
     */
    export function date_diff_tostring(from_date: Date | string, to_date: Date | string): string;

}

/**
 * 
 * Function to execute peice of code as a thread. 
 * @param {String} activity Activity file name
 * @param {String} execFunction Function name defined on Activity class
 * @param {Object} payload payload to be passed over function
 * @param {Object} headers header to be passed over function
 * @param {Function} callback callback function containing error and response as parameter.
 */
declare function thread(activity: string, execFunction: string, payload: object, headers: object, callback: Function): Function;

declare namespace MySqlUtil {
    export function escapeId(...params: any): string;
    export function escape(...params: any): string;
    export function format(...params: any): string;
    export function raw(sql: string): object;
    export function querySync(sql: string, ...params: any): Promise<object>;
    export function beginTransactionSync(isolationLevel: string): typeof MySqlUtil;
    export function commitSync(): Promise<boolean>;
    export function rollbackSync(): Promise<boolean>;
    export function query(sql: string, params: any, callback: Function): void;
    export function beginTransaction(callback: Function): void;
    export function commit(callback: Function): void;
    export function rollback(callback: Function): void;
}

declare namespace mysqlResource {

    /**
     * get Mysql connection to perform desired operation.
     * @param db_name database name configured on appConfig.
     */
    export function getConnection(db_name: string | undefined): typeof MySqlUtil;

    /**
     * get Sequelize connection to perform desired operation.
     * @param db_name database name configured on appConfig.
     */
    export function dbConnection(db_name: string | undefined): object;

    /**
     * get Sequelize model object to export and perform operation.
     */
    var db: object;
}

declare namespace e {
    var util: typeof utilFun;
    var threads: typeof thread;
    var mysql: typeof mysqlResource;
}

export = e;
