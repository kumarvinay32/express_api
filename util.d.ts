declare class util {
    /**
     * Merge multiple objects into one.
     * e.g. obj_merge({}, {x:1}, {y:2}, {z:3}, ...);
     */
    static obj_merge(...objects: object[]): object;

    /**
     * Filter IPv4 address from a mixed IP string (IPv4+IPv6).
     */
    static get_ipv4_addr(mixed: string): string;

    /**
     * Return word in plural form.
     */
    static pluralize(word: string): string;

    /**
     * Return word in singular form.
     */
    static singularize(word: string): string;

    /**
     * Return the given camelCasedWord as an underscored_word.
     */
    static underscore(camelCasedWord: string): string;

    /**
     * Return the given underscored_word_group as a Human Readable Word Group.
     */
    static humanize(lowerCaseAndUnderscoredWord: string): string;

    /**
     * Return the given lower_case_and_underscored_word as a CamelCased word.
     */
    static camelize(lowerCaseAndUnderscoredWord: string): string;

    /**
     * Format string similar to printf().
     * e.g. format('My name is ? ?.', 'Vinay', 'Kumar') → 'My name is Vinay Kumar.'
     */
    static format(message: string, ...values: any[]): string;

    /**
     * Gets an environment variable from the current request.
     * Added at runtime via req.util.env — available as util.env on the mounted instance.
     */
    static env(req: object, key: string): string;

    /**
     * Creates an associative array using keyPath as the path to build its keys,
     * and optionally valuePath as path to get the values.
     */
    static combine(data: object | any[], keyPath: string, valuePath: string, groupPath?: string): object;

    /**
     * Sort an array of objects by a given key.
     * @param order 'asc' | 'desc'
     */
    static sortByKey(array: object | any[], sortBy: string, order?: string, numeric_check?: boolean): any[] | null;

    /**
     * Convert a flat array of objects (with id and parent_id) into a mapped tree structure.
     * @param all Prepend an "All" root node when true.
     */
    static mapTree(data: any[], all?: boolean): object[];

    /**
     * Convert plain text to its MD5 hex string.
     */
    static md5(str: string): string;

    /**
     * Convert plain text to its SHA1 hex string.
     */
    static SHA1(str: string): string;

    /**
     * Returns a random UUID v4 string.
     */
    static uuid(): string;

    /**
     * Generate a random string of desired length and character set.
     * @param Type 'N' (numeric) | 'AN' (alphanumeric upper) | 'AaN' (alphanumeric) | '' (all + special chars)
     */
    static generate_password(PasswdLen: number, Type?: string): string;

    /**
     * Return a random integer between min and max (inclusive).
     */
    static mt_rand(min: number, max: number): number;

    /**
     * Return the system timezone offset as a string (+/-)HH:MM.
     */
    static systemTimeZone(): string;

    /**
     * Return a UNIX timestamp of the current time.
     * @param microsec Include microseconds when true.
     */
    static timestamp(IST?: boolean, microsec?: boolean): number;

    /**
     * Return the current time as a microtime float (seconds.microseconds).
     */
    static microtime(IST?: boolean): number;

    /**
     * Return the current date/time formatted with the given format string.
     * Defaults to 'Y-m-d H:i:s'.
     */
    static curdate(date_format_str?: string): string;

    /**
     * Return a formatted date string for the given timestamp.
     */
    static date_format(timestamp: any, date_format_str?: string): string;

    /**
     * Return a mapped date array for the given timestamp.
     */
    static date_obj_array(timestamp: any): object;

    /**
     * Validate and return a Date object for the given timestamp, or null if invalid.
     */
    static check_timestamp(timestamp: any): string | object;

    /**
     * Return a zero-padded two-digit string for a date chunk.
     */
    static _dd(d: number | string): string;

    /**
     * Add months to a date and return in the given format.
     */
    static add_month(timestamp: any, no_of_month: number, format?: string): string;

    /**
     * Add days to a date and return in the given format.
     */
    static add_date(timestamp: any, no_of_day: number, format?: string): string;

    /**
     * Add hours to a date and return in the given format.
     */
    static add_hours(timestamp: any, no_of_hours: number, format?: string): string;

    /**
     * Add minutes to a date and return in the given format.
     */
    static add_minutes(timestamp: any, no_of_minutes: number, format?: string): number;

    /**
     * Get the difference between two dates in the given unit.
     * @param diff_in 'Y' | 'M' | 'D' | 'H' | 'I' | 'S' — defaults to microseconds
     */
    static date_diff(from_date: Date | string, to_date: Date | string, diff_in?: string): number;

    /**
     * Get the difference between two dates as a human-readable string.
     */
    static date_diff_tostring(from_date: Date | string, to_date: Date | string): string;
}

export = util;
