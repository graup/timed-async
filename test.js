/* eslint no-console: 0 */
import { timedAsync } from './index';

const waitFor = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

const someSlowTask = async () => {
    await waitFor(1500);
    return 1;
};

const someSlowTaskException = async () => {
    await waitFor(1500);
    throw new Error();
};

const someQuickTask = async () => {
    await waitFor(300);
    return 1;
};

const someQuickTaskException = async () => {
    await waitFor(300);
    throw new Error();
};

const someMediumTask = async () => {
    await waitFor(700);
    return 1;
};

const someMediumTaskException = async () => {
    await waitFor(700);
    throw new Error();
};


async function testTimedAsync(fn, debugLabel) {
    const state = {
        wasSlow: false,
        wasFast: false,
        wasError: false,
        result: null
    };
    console.time(debugLabel);
    console.timeStamp(debugLabel);
    try {
        state.result = await timedAsync(fn, {
            slow: () => {
                console.timeLog(debugLabel);
                console.timeStamp(debugLabel);
                state.wasSlow = true;
            },
            fast: () => {
                console.timeLog(debugLabel);
                console.timeStamp(debugLabel);
                state.wasFast = true;
            }
        });
    } catch (e) {
        state.wasError = true;
    }
    console.timeEnd(debugLabel);
    console.timeStamp(debugLabel);
    return state;
}

function assertEqual(a, b, msg) {
    if (typeof msg === 'undefined') {
        msg = `Operation returned wrong result.
        Expected: ${b}
        Actual:   ${a}`;
    }
    console.assert(a === b, msg);
    if (a !== b) console.trace();
}
function assertDeepEqual(a, b) {
    for (const key of Object.keys(a)) {
        assertEqual(a[key], b[key], `Property ${key} does not match.
        Expected: ${b[key]}
        Actual:   ${a[key]}`);
    }
}

async function test () {
    let testResult;

    testResult = await testTimedAsync(someSlowTask, 'slow');
    console.log(testResult);
    assertDeepEqual(testResult, {
        result: 1,
        wasError: false,
        wasSlow: true,
        wasFast: false,
    });

    testResult = await testTimedAsync(someSlowTaskException, 'slow exception');
    console.log(testResult);
    assertDeepEqual(testResult, {
        result: null,
        wasError: true,
        wasSlow: true,
        wasFast: false,
    });

    testResult = await testTimedAsync(someQuickTask, 'quick');
    console.log(testResult);
    assertDeepEqual(testResult, {
        result: 1,
        wasError: false,
        wasSlow: false,
        wasFast: true,
    });

    testResult = await testTimedAsync(someQuickTaskException, 'quick exception');
    console.log(testResult);
    assertDeepEqual(testResult, {
        result: null,
        wasError: true,
        wasSlow: false,
        wasFast: true,
    });

    testResult = await testTimedAsync(someMediumTask, 'medium');
    console.log(testResult);
    assertDeepEqual(testResult, {
        result: 1,
        wasError: false,
        wasSlow: false,
        wasFast: false,
    });

    testResult = await testTimedAsync(someMediumTaskException, 'medium exception');
    console.log(testResult);
    assertDeepEqual(testResult, {
        result: null,
        wasError: true,
        wasSlow: false,
        wasFast: false,
    });

    // Test usage with promise instead of function
    testResult = await testTimedAsync(someQuickTask(), 'quick');
    console.log(testResult);
    assertDeepEqual(testResult, {
        result: 1,
        wasError: false,
        wasSlow: false,
        wasFast: true,
    });
}

test();