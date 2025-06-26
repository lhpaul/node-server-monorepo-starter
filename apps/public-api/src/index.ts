import { init, start } from './server';

const initServer = async () => {
  try {
    await init();
    await start();
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};
initServer();

// Little trick to make console.log colorized in development mode in order to facilitate the reading of the logs in the terminal
if (process.env.NODE_ENV !== 'production') {
  const log = console.log;
  console = { ...console };
  console.log = (...args: any[]) => {
    log('\x1b[36m%s\x1b[0m', '########################');
    log('\x1b[36m%s\x1b[0m', ...args);
    log('\x1b[36m%s\x1b[0m', '########################');
  };
}
