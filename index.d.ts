interface Options {
    slow?: () => void;
    slowTime?: number;
    fast?: () => void;
    fastTime?: number;
}
declare type Main<T> = Promise<T> | ((...args: any[]) => Promise<T>);
/**
 * Wait a minimum amount of time, even when an operation (such as an API response) finished very quickly.
 * Also good for testing, as production load times are usually slower than
 * in a development environment.
 *
 * Example:
 *     const waitMinimum = loadAndWait();
 *     (... do something that the user expects to take some time, e.g. loading data ...)
 *     await waitMinimum();
 *
 * @param {number} minimumLoadTime duration in ms, default 500
 * @return {loadAndWait~waitMinimum}
 */
declare function loadAndWait(minimumLoadTime?: number): ((callbackIfFast: () => void) => Promise<void>);
/**
 * Register a function to be called when an operation is considered slow.
 *
 * Example:
 *     const loadingFinished = waitOrLoad(() => {
 *         console.log('loading is slow');
 *     });
 *     (... do something that the user expects to take some time, e.g. loading data ...)
 *     loadingFinished();
 *
 * @param {function} callbackIfSlow function to call when operation is taking longer than maximumLoadTime.
 * @param {number} maximumLoadTime duration in ms, default 1500
 * @return {waitOrLoad~loadingFinished}
 */
declare function waitOrLoad(callbackIfSlow: () => void, maximumLoadTime?: number): () => void;
/**
 * Decorator to add "slow" and "fast" timing hooks to any async operation.
 * This returns the return value of the main function and also lets exceptions go through.
 *
 * @param {function|Promise} main execution function to be timed, or promise to be awaited
 * @param {object} options
 * @param {function} options.slow function to be called when operation is slow
 * @param {number?} options.slowTime time after which the operation is considered slow. Default: 1500
 * @param {function} options.fast function to be called when operation is fast
 * @param {number?} options.fastTime time until which the operation is considered fast. Default: 500
 * @return {any} return value of main function
 */
declare function timedAsync<T>(main: Main<T>, options?: Options): Promise<T>;
export { loadAndWait, waitOrLoad, timedAsync };
