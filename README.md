# Time async operations

This is a very simple helper function to react to "slow" and "fast" asyncronous operations.
For example, when loading a remote API response, you might want to let the user know when loading is taking longer than expected.
Also, you might want to enforce a "minimum load time", so that users are not surprised actions happen faster than expected.

It's also good to simulate varying network load times during development.

Check out this [blog article that explains the code](https://medium.com/@graycoding/detect-slow-and-fast-asynchronous-operations-with-javascript-fb58b32006f6).

This helper lets you react to these timings:

    Started         Finished quickly     Minimum time passed
       |                   |                     |
       ------------------------------------------- Resolved
                           | 
                 Fast operation detected
    
    Started                                        Finished slowly
       |                                                  |
       ---------------------------------------------------- Resolved
                                                      |
                                          Slow operation detected

It acts as a mostly transparent decorator for promises.
Return values and exceptions are propagated as you would expect.

## Usage

    npm install timed-async

```js
import { ensureDelay } from 'timed-async';

/**
 * ensureDelay is a promise decorator that delays resolution of the promise
 * in case it would resolve faster than a specified minimum delay (500ms by default).
 * You can pass either a promise, or
 * a function that will be called and expected to return a promise.
 * Additional callbacks can be specified to react to slow or fast executions.
 */
await ensureDelay(functionOrPromise, 500)
    .after(1500, () => {
        console.log('still running after 1500ms');
    })
    .onFast((time) => {
        console.log(`finished after ${time}, faster than 500ms (i.e. promise resolution will be delayed)`);
    });

/**
 * It works well with common async patterns such as:
 */
async function getObjects(): Promise<CustomType[]> {
    // ...
}
async function load() {
    setLoading(true);
    try {
        const objects = await ensureDelay(getObjects());
        // const objects: CustomType[]
        setObjects(objects);
    } catch (e) {
        setError(e);
    } finally {
        setLoading(false);
    }
}
```

## Suggested minimum delay times

- Simple offline interactions: no delay
- Complex offline interactions (like opening a window): 100-500ms
  - Make sure this is actually perceived as complex. Don't add delays for no good reason!
- Simple online interactions (like fetching or saving data): 500-1000ms
- Complex online interactions (like running some analysis): 1000-1500ms

Anything larger than 1 or 2s should definitely be accompanied by a loading indicator (e.g. spinning circle).

Reference: [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)

## Contact

Twitter: [@graycoding](http://twitter.com/graycoding)