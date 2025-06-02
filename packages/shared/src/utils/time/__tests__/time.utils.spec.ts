import { wait } from '../time.utils';

describe(wait.name, () => {
  it('should resolve after the specified milliseconds', async () => {
    const startTime = Date.now();
    const waitTime = 100;

    await wait(waitTime);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    // Allow for a small margin of error (±10ms) due to system timing variations
    expect(elapsedTime).toBeGreaterThanOrEqual(waitTime - 10);
    expect(elapsedTime).toBeLessThanOrEqual(waitTime + 10);
  });

  it('should resolve immediately when wait time is 0', async () => {
    const startTime = Date.now();
    
    await wait(0);
    
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    // Should be very close to 0, but allow for a small margin
    expect(elapsedTime).toBeLessThan(10);
  });
});
