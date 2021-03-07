/* eslint no-console: 0 */
import { timedAsync, ensureDelay, time, sleep } from './index';

const someSlowTask = async () => {
  await sleep(550);
  return 1;
};

const someSlowTaskException = async () => {
  await sleep(550);
  throw new Error('expected error');
};

const someQuickTask = async () => {
  await sleep(200);
  return 1;
};

const someQuickTaskException = async () => {
  await sleep(200);
  throw new Error('expected error');
};

const someMediumTask = async () => {
  await sleep(300);
  return 1;
};

const someMediumTaskException = async () => {
  await sleep(300);
  throw new Error('expected error');
};


async function testTimedAsync(fn, debugLabel, expected) {
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
      slowTime: 500,
      slow: () => {
        console.timeLog(debugLabel);
        console.timeStamp(debugLabel);
        state.wasSlow = true;
        if (!expected.wasSlow) {
          throw new Error('Unexpected slow callback');
        }
      },
      fastTime: 250,
      fast: () => {
        console.timeLog(debugLabel);
        console.timeStamp(debugLabel);
        state.wasFast = true;
        if (!expected.wasFast) {
          throw new Error('Unexpected fast callback');
        }
      }
    });
  } catch (e) {
    if (!expected.wasError) {
      console.error('Unexpected exception');
      throw e;
    }
    state.wasError = true;
  }
  console.timeEnd(debugLabel);
  console.timeStamp(debugLabel);
  assertDeepEqual(state, expected);
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
  await testTimedAsync(someSlowTask, 'slow', {
    result: 1,
    wasError: false,
    wasSlow: true,
    wasFast: false,
  });
  
  await testTimedAsync(someSlowTaskException, 'slow exception', {
    result: null,
    wasError: true,
    wasSlow: true,
    wasFast: false,
  });

  await testTimedAsync(someQuickTask, 'quick', {
    result: 1,
    wasError: false,
    wasSlow: false,
    wasFast: true,
  });

  // TODO check if changing API is ok here
  
  await testTimedAsync(someQuickTaskException, 'quick exception', {
    result: null,
    wasError: true,
    wasSlow: false,
    wasFast: true,
  });
  
  await testTimedAsync(someMediumTask, 'medium', {
    result: 1,
    wasError: false,
    wasSlow: false,
    wasFast: false,
  });
  
  await testTimedAsync(someMediumTaskException, 'medium exception', {
    result: null,
    wasError: true,
    wasSlow: false,
    wasFast: false,
  });
  
  // Test usage with promise instead of function
  await testTimedAsync(someQuickTask(), 'quick', {
    result: 1,
    wasError: false,
    wasSlow: false,
    wasFast: true,
  });

  // Test usage with new API
  let slowCallbackCalls = 0;
  await ensureDelay(someQuickTask(), 500)
    .after(300, () => slowCallbackCalls++)
    .after(400, () => slowCallbackCalls++);
  assertEqual(slowCallbackCalls, 2);

  // Test time() API
  const [result, t] = await time(someQuickTask());
  assertEqual(result, 1);
  console.assert(t >= 200, `time did not return correct time: ${t}`);
}

test();