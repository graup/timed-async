# Time async operations

This is a very simple helper function to react to "slow" and "fast" asyncronous operations.
For example, when loading a remote API response, you might want to let the user know when loading is taking longer than expected.
Also, you might want to enforce a minimum load time, so that users are not surprised actions happen faster than expected.

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