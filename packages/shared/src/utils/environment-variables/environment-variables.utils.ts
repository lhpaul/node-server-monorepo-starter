import { APP_ENV_NOT_SET_ERROR_MESSAGE, ENV_VARIABLES_UTILS_CONSTANTS } from './environment-variables.utils.constants';

/* This function is used to get the environment variables for the project.
   For non secret variables, it relies on the environment variable APP_ENV to determine the value to return.
   For secret variables, it will return the value of the environment variable in process.env.
*/
export function getEnvironmentVariable(variableName: string): string | undefined {
  const appEnv = process.env.APP_ENV as string;
  if (!appEnv) {
    throw new Error(APP_ENV_NOT_SET_ERROR_MESSAGE);
  }
  const definedVariable = ENV_VARIABLES_UTILS_CONSTANTS[variableName]?.[appEnv];
  return definedVariable ?? process.env[variableName];
}