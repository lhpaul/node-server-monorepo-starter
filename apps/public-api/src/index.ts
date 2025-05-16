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
