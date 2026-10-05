import * as admin from 'firebase-admin';

import { exampleFunction } from './functions/example/example.function';

admin.initializeApp();

// Export your actual Cloud Functions here
// Remove the example function when you add your real functions

export {
  exampleFunction
};