/**
 * 
 * Function to execute peice of code as a thread. 
 * @param {String} activity Activity file name
 * @param {String} execFunction Function name defined on Activity class
 * @param {Object} payload payload to be passed over function
 * @param {Object} headers header to be passed over function
 * @param {Function} callback callback function containing error and response as parameter.
 */

export declare function threads(activity: string, execFunction: string, payload: object, headers: object, callback: Function): Function;

export = threads;
