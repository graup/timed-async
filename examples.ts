/**
 * This file serves to type-check the examples from the Readme.
 */

import { ensureDelay } from './index';

async function simpleExample() {
  const functionOrPromise = async () => {};
  await ensureDelay(functionOrPromise, 500)
    .after(1500, () => {
        console.log('still running after 1500ms');
    })
    .onFast((time) => {
        console.log(`finished after ${time}, faster than 500ms (i.e. promise resolution will be delayed)`);
    });
}
simpleExample();


interface CustomType {
  value: string;
}
function setLoading(value: boolean): void {}
function setObjects(value: CustomType[]): void {}
function setError(value: Error): void {}
async function getObjects(): Promise<CustomType[]> {
  return [{ value: 'hello' }];
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
load();


async function expectedErrors() {
  // Type 'string' is not assignable to type 'Promise<unknown>'.ts(2345)
  ensureDelay(() => {
    return 'foo'
  });

  // Argument of type 'string' is not assignable to parameter of type 'Main<unknown>'.
  ensureDelay('foo');
}