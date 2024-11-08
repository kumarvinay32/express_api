'use strict';

const day_suffix = { 1: "st", 2: "nd", 3: "rd", 21: "st", 22: "nd", 23: "rd", 31: "st" };
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const days_name = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = { 1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec" };
const months_name = { 1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December" };

class date {
    /**
     * Returns a System Timezone.
     *
     * @return Timezone in (+-)HH:MM
     */
    static systemTimeZone() {
        let tzo = Number((new Date()).getTimezoneOffset());
        let tzs = '-';
        if (tzo <= 0) {
            tzs = '+';
            tzo *= -1;
        }
        return tzs + date._dd(Math.floor(tzo / 60)) + ":" + date._dd(tzo % 60);
    }

    /**
     * Returns a UNIX Timestamp of Current time.
     *
     * @param boolean microsec with/without Microsecond. Default is false
     * @return int UNIX Timestamp
     */
    static timestamp(IST = true, microsec = false) {
        let dt = new Date();
        if (IST) {
            dt.setMinutes(dt.getMinutes() + 330 + Number(dt.getTimezoneOffset()));
        }
        return microsec ? Number(dt / 1) : Math.round(dt / 1000);
    }

    /**
     * Returns a UNIX Timestamp of Current time.
     *
     * @return int UNIX Timestamp
     */
    static microtime(IST = true) {
        return date.timestamp(IST, true);
    }

    /**
     * Returns a nicely formatted Current date string for given Datetime format.
     *
     * @param string date_format_str The format to use. If null, `Y-m-d H:i:s` is used
     * @return string Formatted date string
     */
    static curdate(date_format_str) {
        return date.date_format(date.timestamp(), date_format_str);
    }

    /**
     * Returns a nicely formatted date string for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @param string|DateTimeZone $timezone Timezone string or DateTimeZone object
     * @param string date_format_str The format to use. If null, `Y-m-d H:i:s` is used
     * @return string|null Formatted date string
     */
    static date_format(timestamp, date_format_str) {
        if (date_format_str === undefined) {
            date_format_str = "Y-m-d H:i:s";
        }
        let dobj = date.date_obj_array(timestamp);
        if (!dobj) {
            return '';
        }
        let date_str = '';
        let skeep = false;
        date_format_str.toString().split("").forEach(fm => {
            if (fm == '\\') {
                skeep = true;
            } else {
                date_str += (!skeep && Object.hasOwnProperty.call(dobj, fm)) ? dobj[fm] : fm;
                skeep = false;
            }
        });
        return date_str;
    }

    /**
     * Returns a date Array for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @return Array|null Mapped date array.
     */
    static date_obj_array(timestamp) {
        if (timestamp === undefined) {
            timestamp = date.timestamp();
        }
        let dt = date.check_timestamp(timestamp);
        if (!dt) {
            return '';
        }
        let dobj = {};
        dobj['Y'] = dt.getFullYear();
        dobj['y'] = dt.getYear();
        dobj['n'] = dt.getMonth() + 1;
        dobj['m'] = date._dd(dobj.n);
        dobj['j'] = dt.getDate();
        dobj['d'] = date._dd(dobj.j);
        dobj['w'] = dt.getDay();
        dobj['N'] = dobj.w;
        dobj['D'] = days[dobj.w];
        dobj['l'] = days_name[dobj.w];
        dobj['S'] = day_suffix[dobj.j] || "th";
        dobj['M'] = months[dobj.n];
        dobj['F'] = months_name[dobj.n];
        dobj['G'] = dt.getHours();
        dobj['H'] = date._dd(dobj.G);
        dobj['i'] = date._dd(dt.getMinutes());
        dobj['s'] = date._dd(dt.getSeconds());
        dobj['g'] = dobj.G;
        dobj['t'] = date._dd(new Date(dobj.Y, dobj.n, 0).getDate());
        dobj['A'] = 'AM';
        dobj['a'] = 'am';
        if (dobj['g'] >= 12) {
            dobj['g'] %= 12;
            dobj['A'] = 'PM';
            dobj['a'] = 'pm';
        }
        if (dobj['g'] == 0) {
            dobj['g'] = 12;
        }
        if (dobj.N == 0) {
            dobj.N = 7;
        }
        if (dobj.y >= 100) {
            dobj.y -= 100;
        }
        let yfw = new Date(dobj.Y, 0, 4);
        dobj['W'] = 1 + Math.round(((dt.getTime() - yfw.getTime()) / 86400000 - 3 + (yfw.getDay() + 6) % 7) / 7);
        dobj['h'] = date._dd(dobj.g);
        dobj['TS'] = dt.getTime();
        return dobj;
    }

    /**
     * Validate and returns a  DateTime object for given Datetime string.
     *
     * @param int|string|DateTime timestamp, a valid string or DateTime object
     * @return DateTime object|null
     */
    static check_timestamp(timestamp) {
        if (!timestamp) {
            return '';
        }
        let dt;
        if (typeof timestamp === 'string') {
            if (timestamp.length == 10) {
                timestamp += ' 00:00:00';
            }
            dt = new Date(timestamp);
        } else if (typeof timestamp === 'object') {
            dt = new Date(timestamp);
        } else {
            dt = new Date(timestamp * 1000);
        }
        if (dt == "Invalid Date") {
            return '';
        }
        let Y = dt.getFullYear();
        if (Y.toString().length > 4) {
            dt = new Date(timestamp);
        }
        return dt;
    }

    /**
     * Returns Two digit string of date chunk.
     *
     * @param int|string d, Date Chunk
     * @return string Two digit string
     */
    static _dd(d) {
        return (d < 10 ? '0' : '') + d;
    }

    /**
     * Add month on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of month to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding month.
     */
    static add_month(timestamp, no_of_month = 1, format = 'Y-m-d') {
        let dt = date.check_timestamp(timestamp);
        if (!dt) {
            return '';
        }
        let m = dt.getMonth();
        dt.setMonth(m + parseInt(no_of_month));
        return date.date_format(dt, format);
    }

    /**
     * Add Date on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding days.
     */
    static add_date(timestamp, no_of_day = 1, format = 'Y-m-d') {
        let dt = date.check_timestamp(timestamp);
        if (!dt) {
            return '';
        }
        let d = dt.getDate();
        dt.setDate(d + parseInt(no_of_day));
        return date.date_format(dt, format);
    }

    /**
     * Add Hours on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding hours.
     */
    static add_hours(timestamp, no_of_hours = 1, format = 'Y-m-d H:i:s') {
        let dt = date.check_timestamp(timestamp);
        if (!dt) {
            return '';
        }
        let h = dt.getHours();
        dt.setHours(h + parseInt(no_of_hours));
        return date.date_format(dt, format);
    }

    /**
     * Add Minuts on given date
     * 
     * @param {string|number|time object} timestamp 
     * @param {Number} no_of_month no of days to be added
     * @param {*} format output format
     * @returns future or past date in desired format after adding minuts.
     */
    static add_minutes(timestamp, no_of_minutes = 1, format = 'Y-m-d H:i:s') {
        let dt = date.check_timestamp(timestamp);
        if (!dt) {
            return '';
        }
        let m = dt.getMinutes();
        dt.setMinutes(m + parseInt(no_of_minutes));
        return date.date_format(dt, format);
    }

    /**
     * Get diffrence between two days in desired unit.
     * @param {string|number|time object} date1 
     * @param {string|number|time object} date2 
     * @param {Char} diff_in time Unit Y|M|D|H|I|S default is microsecond
     * @returns {Number} diffrence in desired unit
     */
    static date_diff(date1, date2, diff_in) {
        if (diff_in === undefined) {
            diff_in = 'D';
        }
        let d1 = date.date_obj_array(date1);
        let d2 = date.date_obj_array(date2);
        let factor = 1;
        if (d1.TS < d2.TS) {
            factor = -1;
            let t = {};
            Object.assign(t, d1);
            Object.assign(d1, d2);
            Object.assign(d2, t);
        }
        let diff = (d1.TS - d2.TS);
        if (['Y', 'M'].includes(diff_in)) {
            let y = ((Number(d1.Y) || 0) - (Number(d2.Y) || 0));
            let m = ((Number(d1.n) || 0) - (Number(d2.n) || 0));
            let d = ((Number(d1.j) || 0) - (Number(d2.j) || 0));
            let h = ((Number(d1.G) || 0) - (Number(d2.G) || 0));
            let l = [1, 3, 5, 7, 8, 10, 12].includes(d2.n) ? 31 : [4, 6, 9, 11].includes(d2.n) ? 30 : d2.Y % 4 == 0 ? 29 : 28;
            if (h < 0) {
                d -= 1;
                h += 24;
            }
            if (d < 0) {
                m -= 1;
                d += l;
            }
            if (m < 0) {
                y -= 1;
                m += 12;
            }
            if (diff_in == 'Y') {
                diff = y + (m / 12) + (d / (l * 12));
            } else {
                diff = (y * 12) + m + (d / l) + (h / (24 * l));
            }
        } else {
            switch (diff_in) {
                case 'D':
                    diff /= 24;
                case 'H':
                    diff /= 60;
                case 'I':
                    diff /= 60;
                case 'S':
                default:
                    diff /= 1000;
            }
        }
        return Math.round(diff * factor * 1000) / 1000;
    }

    /**
     * Get diffrence between two days in readable format.
     * @param {string|number|time object} date1 
     * @param {string|number|time object} date2 
     * @returns {string} readable diffrence of dates.
     */
    static date_diff_tostring(date1, date2) {
        let d1 = date.date_obj_array(date1);
        let d2 = date.date_obj_array(date2);
        if (d1.TS < d2.TS) {
            let t = {};
            Object.assign(t, d1);
            Object.assign(d1, d2);
            Object.assign(d2, t);
        }
        let y = ((Number(d1.Y) || 0) - (Number(d2.Y) || 0));
        let m = ((Number(d1.n) || 0) - (Number(d2.n) || 0));
        let d = ((Number(d1.j) || 0) - (Number(d2.j) || 0));
        let h = ((Number(d1.G) || 0) - (Number(d2.G) || 0));
        let i = ((Number(d1.i) || 0) - (Number(d2.i) || 0));
        let s = ((Number(d1.s) || 0) - (Number(d2.s) || 0));
        let l = [1, 3, 5, 7, 8, 10, 12].includes(d2.n) ? 31 : [4, 6, 9, 11].includes(d2.n) ? 30 : d2.Y % 4 == 0 ? 29 : 28;
        if (s < 0) {
            i -= 1;
            s += 60;
        }
        if (i < 0) {
            h -= 1;
            i += 60;
        }
        if (h < 0) {
            d -= 1;
            h += 24;
        }
        if (d < 0) {
            m -= 1;
            d += l;
        }
        if (m < 0) {
            y -= 1;
            m += 12;
        }
        let out = '';
        if (y > 0) {
            out += ` ${y} Year${y > 1 ? 's' : ''}`;
        }
        if (m > 0) {
            out += ` ${m} Month${m > 1 ? 's' : ''}`;
        }
        if (d > 0) {
            out += ` ${d} Day${d > 1 ? 's' : ''}`;
        }
        if (h > 0) {
            out += ` ${h} Hour${h > 1 ? 's' : ''}`;
        }
        if (i > 0) {
            out += ` ${i} Minute${i > 1 ? 's' : ''}`;
        }
        if (s > 0) {
            out += ` ${s} Second${s > 1 ? 's' : ''}`;
        }
        return out.length > 1 ? out.slice(1) : '0 Second';
    }

}
module.exports = date;