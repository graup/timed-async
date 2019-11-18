"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadAndWait = loadAndWait;
exports.waitOrLoad = waitOrLoad;
exports.timedAsync = timedAsync;
const FAST_LOAD_TIME = 500; // miliseconds

const SLOW_LOAD_TIME = 1500; // miliseconds

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
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


function loadAndWait(minimumLoadTime = FAST_LOAD_TIME) {
  const startedLoading = +new Date();
  /**
   * @param {function} callbackIfFast function to call if operation finished in less than minimumLoadTime.
   * @return {Promise} promise that resolves when minimumLoadTime minus wait time has passed (possibly immediately).
   */

  return function waitMinimum(callbackIfFast) {
    return new Promise(resolve => {
      const loadDuration = new Date() - startedLoading;
      const waitTime = clamp(minimumLoadTime - loadDuration, 0, minimumLoadTime);

      if (waitTime > 0 && typeof callbackIfFast === 'function') {
        callbackIfFast();
      }

      setTimeout(resolve, waitTime);
    });
  };
}
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


function waitOrLoad(callbackIfSlow, maximumLoadTime = SLOW_LOAD_TIME) {
  const timeout = setTimeout(callbackIfSlow, maximumLoadTime);
  /**
   * Call this function after the operation has finished.
   * This cancels the timeout so that the previously registered, not yet executed callback is not called. 
   */

  return function loadingFinished() {
    clearTimeout(timeout);
  };
}
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


async function timedAsync(main, options = {}) {
  const waitMinimum = loadAndWait(options.fastTime || FAST_LOAD_TIME);
  let loadingFinished;

  if (typeof options.slow === 'function') {
    loadingFinished = waitOrLoad(options.slow, options.slowTime || SLOW_LOAD_TIME);
  }

  try {
    const promise = typeof main === 'function' ? main() : main;
    return await promise;
  } finally {
    if (typeof loadingFinished !== 'undefined') {
      loadingFinished();
    }

    await waitMinimum(options.fast);
  }
}

