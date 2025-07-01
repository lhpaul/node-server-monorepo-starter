import { wait } from '../time.utils';

describe(wait.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('should resolve after the specified milliseconds', async () => {
    const startTime = Date.now();
    const waitTime = 100;

    await Promise.all([
      wait(waitTime),
      jest.runAllTimers(),
    ]);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    expect(elapsedTime).toBe(waitTime);
  });

  it('should resolve immediately when wait time is 0', async () => {
    const startTime = Date.now();
    
    await Promise.all([
      wait(0),
      jest.runAllTimers(),
    ]);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    expect(elapsedTime).toBe(0);
  });
});