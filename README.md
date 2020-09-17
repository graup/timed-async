# Time async operations

This is a very simple helper function to react to "slow" and "fast" asyncronous operations.
For example, when loading a remote API response, you might want to let the user know when loading is taking longer than expected.
Also, you might want to enforce a "minimum load time", so that users are not surprised actions happen faster than expected.

Check out this [blog article that explains the code](https://medium.com/@graycoding/detect-slow-and-fast-asynchronous-operations-with-javascript-fb58b32006f6).

This helper lets you react to these timings:

    Started         Finished quickly     Minimum time passed
       |                   |                     |
    --------------------------------------------------------
                           | 
                 Fast operation detected
    
    Started                    Finished slowly
       |                              |
    ------------------------------------------
                           |
                 Slow operation detected

It also properly handles exceptions and return values.

## Usage

    npm install timed-async

```js
import { timedAsync } from 'timed-async';

await timedAsync(functionOrPromise, {
    slowTime: 1500,
    slow: () => {
        console.log('still running after 1500ms');
    },
    fastTime: 500,
    fast: () => {
        console.log('finished faster than 500ms');
    }
});
// Delays returning of promise until at least fastTime has passed.
// Optionall calls the specified callbacks.
```

## Contact

Twitter: [@graycoding](http://twitter.com/graycoding)