import { isConstructorDeclaration } from 'typescript';
/* eslint no-console: 0 */
import { timedAsync, ensureDelay } from './index';

const waitFor = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const someSlowTask = async () => {
  await waitFor(550);
  return 1;
};

const someSlowTaskException = async () => {
  await waitFor(550);
  throw new Error('expected error');
};

const someQuickTask = async () => {
  await waitFor(200);
  return 1;
};

const someQuickTaskException = async () => {
  await waitFor(200);
  throw new Error('expected error');
};

const someMediumTask = async () => {
  await waitFor(300);
  return 1;
};

const someMediumTaskException = async () => {
  await waitFor(300);
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
  let testResult;
  
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
}

test();