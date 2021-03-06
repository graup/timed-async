declare type Main<T> = Promise<T> | ((...args: any[]) => Promise<T>);
declare type CallbackFunc = (time: number) => void;
export declare const sleep: (time: number) => Promise<void>;
/**
 * A promise that is only resolved after a minimum amount of time has passed.
 * Can also attach slow and fast callbacks.
 */
export declare class DelayedPromise<T> extends Promise<T> {
    startedLoading: number;
    minimumDelay: number;
    slowCallbackTimeouts: number[];
    fastCallbacks: CallbackFunc[];
    resolvedCallbacks: CallbackFunc[];
    /**
     * @param promiseOrFunc a promise to be awaited, or a function returning a promise.
     * @param minimumDelay minimum amount of time (in ms) to have passed before promise is returned (default: 500).
     */
    constructor(promiseOrFunc: Main<T>, minimumDelay?: number);
    private execute;
    static get [Symbol.species](): PromiseConstructor;
    get [Symbol.toStringTag](): string;
    private executeCallbacks;
    /**
     * Adds callback to be called in case original promise settled faster than the minimum delay.
     * Can be chained.
     * @param callback
     */
    onFast(callback: CallbackFunc): this;
    /**
     * Adds callback to be called after time passed.
     * Callback gets cleared and is not executed if promise resolves before that.
     * This can be used to display text such as "Still loading, please wait a bit more."
     * Can be chained.
     * @param time time (in ms) after which this callback is executed
     * @param callback
     */
    after(time: number, callback: CallbackFunc): this;
    private clearSlowCallbacks;
}
/**
 * Factory to create a DelayedPromise.
 * @param promiseOrFunc a promise to be awaited, or a function returning a promise.
 * @param minimumDelay minimum amount of time (in ms) to have passed before promise is returned (default: 500).
 */
export declare function ensureDelay<T>(promiseOrFunc: Main<T>, minimumDelay?: number): DelayedPromise<T>;
/**
 * Annotate promise result with duration.
 * @param promiseOrFunc a promise to be awaited, or a function returning a promise.
 */
export declare function time<T>(promiseOrFunc: Main<T>): Promise<[T, number]>;
interface Options {
    slow?: CallbackFunc;
    slowTime?: number;
    fast?: CallbackFunc;
    fastTime?: number;
}
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
export declare function timedAsync<T>(promiseOrFunc: Main<T>, options?: Options): DelayedPromise<T>;
export {};
