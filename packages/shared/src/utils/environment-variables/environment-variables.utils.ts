import { ENV_VARIABLES_UTILS_CONSTANTS } from './environment-variables.utils.constants';

/* This function is used to get the environment variables for the project.
   For non secret variables, it relies on the environment variable APP_ENV to determine the value to return.
   For secret variables, it will return the value of the environment variable in process.env.
*/
export function getEnvironmentVariable(variableName: string): string | undefined {
  const nonSecretVariable = ENV_VARIABLES_UTILS_CONSTANTS[variableName]?.[process.env.APP_ENV as string];
  return nonSecretVariable ?? process.env[variableName];
}