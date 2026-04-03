/**
 * Execute a piece of code as a child process thread.
 * @param activity Activity file name (inside src/activities/)
 * @param execFunction Function name defined on the Activity class
 * @param payload Payload passed to the function
 * @param headers Headers passed to the function
 * @param callback Callback receiving error and response
 * @param timeout Optional timeout in milliseconds. If the child process does not
 *   respond within this time it is killed and callback is called with an Error.
 *   Omit (or pass undefined) to let the process run until it finishes naturally.
 */
declare function threads(
    activity: string,
    execFunction: string,
    payload: object,
    headers: object,
    callback: (err: Error | null, result?: any) => void,
    timeout?: number
): void;

export = threads;
