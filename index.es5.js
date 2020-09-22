"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timedAsync = timedAsync;
exports.ensureDelay = exports.DelayedPromise = void 0;
const FAST_LOAD_TIME = 500; // miliseconds

const SLOW_LOAD_TIME = 1500; // miliseconds

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const promiseOrCall = promiseOrFunc => {
  return typeof promiseOrFunc === 'function' ? promiseOrFunc() : promiseOrFunc;
};

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
/**
 * A promise that is only resolved after a minimum amount of time has passed.
 * Can also attach slow and fast callbacks.
 */


class DelayedPromise extends Promise {
  minimumDelay = FAST_LOAD_TIME;
  slowCallbackTimeouts = [];
  fastCallbacks = [];
  /**
   * @param promiseOrFunc a promise to be awaited, or a function returning a promise.
   * @param minimumDelay minimum amount of time (in ms) to have passed before promise is returned.
   */

  constructor(promiseOrFunc, minimumDelay = FAST_LOAD_TIME) {
    super((resolve, reject) => {
      setTimeout(() => {
        // nextTick because this isn't available yet
        this.execute(promiseOrFunc).then(resolve).catch(reject);
      });
    });
    this.startedLoading = +new Date();
    this.minimumDelay = minimumDelay;
  }

  async execute(promiseOrFunc) {
    try {
      return await promiseOrCall(promiseOrFunc);
    } finally {
      const loadDuration = +new Date() - this.startedLoading;
      const extraWaitTime = clamp(this.minimumDelay - loadDuration, 0, this.minimumDelay);

      if (extraWaitTime > 0) {
        this.executeFastCallbacks(loadDuration);
      }

      await sleep(extraWaitTime);
      this.clearSlowCallbacks();
    }
  }

  static get [Symbol.species]() {
    return Promise;
  }

  get [Symbol.toStringTag]() {
    return 'DelayedPromise';
  }
  /**
   * Adds callback to be called in case execution was faster than the minimum delay.
   * Can be chained.
   * @param time 
   * @param callback 
   */


  onFast(callback) {
    this.fastCallbacks.push(callback);
    return this;
  }

  executeFastCallbacks(time) {
    for (const callback of this.fastCallbacks) {
      callback(time);
    }
  }
  /**
   * Adds callback to be called after time passed.
   * Callback gets cleared and is not executed if promise resolves before that.
   * This can be used to display text such as "Still loading, please wait a bit more."
   * Can be chained.
   * @param time time (in ms) after which this callback is executed
   * @param callback 
   */


  after(time, callback) {
    const timeout = setTimeout(() => {
      callback(time);
    }, time);
    this.slowCallbackTimeouts.push(timeout);
    return this;
  }

  clearSlowCallbacks() {
    for (const timeout of this.slowCallbackTimeouts) {
      clearTimeout(timeout);
    }
  }

}
/**
 * Factory to create a DelayedPromise.
 * @param promiseOrFunc a promise to be awaited, or a function returning a promise.
 * @param minimumDelay minimum amount of time (in ms) to have passed before promise is returned.
 */


exports.DelayedPromise = DelayedPromise;

const ensureDelay = (promiseOrFunc, minimumDelay = FAST_LOAD_TIME) => {
  return new DelayedPromise(promiseOrFunc, minimumDelay);
};

exports.ensureDelay = ensureDelay;

/**
 * Decorator to add "slow" and "fast" timing hooks to any async operation.
 * This returns the return value of the main function and also lets exceptions go through.
 * This is the legacy version of ensureDelay supported for backwards compatability.
 * 
 * @param {function|Promise} promiseOrFunc execution function to be timed, or promise to be awaited
 * @param {object} options
 * @param {function} options.slow function to be called when operation is slow
 * @param {number?} options.slowTime time after which the operation is considered slow. Default: 1500
 * @param {function} options.fast function to be called when operation is fast
 * @param {number?} options.fastTime time until which the operation is considered fast. Default: 500
 * @return {any} return value of main function
 */
function timedAsync(promiseOrFunc, options = {}) {
  const promise = new DelayedPromise(promiseOrFunc, options.fastTime || FAST_LOAD_TIME);
  if (options.fast) promise.onFast(options.fast);
  if (options.slow) promise.after(options.slowTime || SLOW_LOAD_TIME, options.slow);
  return promise;
}

